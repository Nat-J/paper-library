import http.client
import io
import json
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

import server


class ReaderTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / 'library'
        self.root.mkdir()
        (self.root / 'index.html').write_text('<h1>paper</h1>')
        self.config = self.root / 'config.json'
        self.key = 'test-key-NOT-A-REAL-CREDENTIAL'
        self.config.write_text(json.dumps({'api_key': self.key, 'model': 'deepseek-flash'}))
        self.root_patch = patch.object(server, 'LIBRARY_ROOT', self.root)
        self.config_patch = patch.object(server, 'CONFIG_PATH', self.config)
        self.root_patch.start()
        self.config_patch.start()
        self.httpd = server.ThreadingHTTPServer(('127.0.0.1', 0), server.ReaderHandler)
        self.port = self.httpd.server_port
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.thread.join()
        self.config_patch.stop()
        self.root_patch.stop()
        self.temp.cleanup()

    def request(self, path, body=None, method=None, origin=None, host=None):
        connection = http.client.HTTPConnection('127.0.0.1', self.port, timeout=3)
        headers = {'Host': host or f'127.0.0.1:{self.port}'}
        if body is not None:
            headers.update({'Content-Type': 'application/json',
                            'Origin': origin or f'http://127.0.0.1:{self.port}'})
        connection.request(method or ('POST' if body is not None else 'GET'), path,
                           json.dumps(body) if body is not None else None, headers)
        response = connection.getresponse()
        result = response.status, response.read()
        connection.close()
        return result

    def test_answer_round_trip_keeps_key_on_server(self):
        output = {'choices': [{'message': {'content': 'τ 是归一化积分进度。'}, 'finish_reason': 'stop'}]}
        with patch.object(server, 'urlopen', return_value=io.BytesIO(json.dumps(output).encode())) as upstream:
            status, raw = self.request('/api/ask', {'question': 'τ 是什么？', 'selection': 'τ∈[0,1]'})
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(raw)['answer'], 'τ 是归一化积分进度。')
        self.assertNotIn(self.key, raw.decode())
        request = upstream.call_args.args[0]
        self.assertEqual(request.full_url, 'https://api.deepseek.com/chat/completions')
        self.assertEqual(request.get_header('Authorization'), 'Bearer ' + self.key)
        payload = json.loads(request.data)
        self.assertEqual(payload['model'], 'deepseek-flash')
        self.assertEqual(json.loads(payload['messages'][1]['content'])['selection'], 'τ∈[0,1]')
        self.assertNotIn(self.key, request.data.decode())

    def test_private_files_and_head_are_not_served(self):
        (self.root / '.git').mkdir()
        (self.root / '.git' / 'config').write_text(self.key)
        for path in ['/config.json', '/%63onfig.json', '/.git/config', '/reader/server.py']:
            self.assertEqual(self.request(path)[0], 404, path)
        self.assertEqual(self.request('/config.json', method='HEAD')[0], 405)
        self.assertEqual(self.request('/')[0], 200)

    def test_status_has_no_credential(self):
        status, raw = self.request('/api/status')
        self.assertEqual(status, 200)
        self.assertTrue(json.loads(raw)['configured'])
        self.assertNotIn(self.key, raw.decode())
        self.assertNotIn('api_key', json.loads(raw))

    def test_foreign_origin_file_origin_and_host_are_rejected(self):
        with patch.object(server, 'urlopen') as upstream:
            for origin in ['https://example.com', 'null']:
                self.assertEqual(self.request('/api/ask', {'question': 'test'}, origin=origin)[0], 403)
            self.assertEqual(self.request('/', host='example.com')[0], 403)
            upstream.assert_not_called()

    def test_invalid_or_oversized_question_is_rejected(self):
        for body in [{}, [], {'question': 'x' * 4001}, {'question': 12}]:
            self.assertEqual(self.request('/api/ask', body)[0], 400)

    def test_missing_key_has_actionable_error(self):
        self.config.write_text(json.dumps({'api_key': '', 'model': 'deepseek-flash'}))
        status, raw = self.request('/api/ask', {'question': 'test'})
        self.assertEqual(status, 503)
        self.assertIn('config.json', json.loads(raw)['error'])

    def test_symlinks_cannot_expose_private_or_external_files(self):
        outside = Path(self.temp.name) / 'secret.html'
        outside.write_text(self.key)
        (self.root / 'escape.html').symlink_to(outside)
        (self.root / 'nested').mkdir()
        (self.root / 'nested' / 'index.html').symlink_to(outside)
        (self.root / 'hidden.html').symlink_to(self.config)
        for path in ['/escape.html', '/nested/', '/hidden.html']:
            self.assertEqual(self.request(path)[0], 404, path)

    def test_upstream_error_does_not_echo_key_or_response_body(self):
        error = HTTPError(server.ENDPOINT, 401, self.key, {}, io.BytesIO(self.key.encode()))
        with patch.object(server, 'urlopen', side_effect=error):
            status, raw = self.request('/api/ask', {'question': 'test'})
        self.assertEqual(status, 502)
        self.assertNotIn(self.key, raw.decode())
        self.assertIn('验证失败', json.loads(raw)['error'])


if __name__ == '__main__':
    unittest.main()
