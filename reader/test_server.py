import http.client
import io
import json
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.parse import quote

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
        self.history = self.root / '.reader-data' / 'questions.sqlite3'
        self.history_patch = patch.object(server, 'HISTORY_PATH', self.history)
        self.root_patch.start()
        self.config_patch.start()
        self.history_patch.start()
        self.httpd = server.ThreadingHTTPServer(('127.0.0.1', 0), server.ReaderHandler)
        self.port = self.httpd.server_port
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.thread.join()
        self.config_patch.stop()
        self.history_patch.stop()
        self.root_patch.stop()
        self.temp.cleanup()

    def request(self, path, body=None, method=None, origin=None, host=None):
        connection = http.client.HTTPConnection('127.0.0.1', self.port, timeout=3)
        headers = {'Host': host or f'127.0.0.1:{self.port}'}
        if body is not None:
            if path == '/api/ask' and isinstance(body, dict):
                body = {'document': 'index.html', **body}
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
        self.assertEqual(payload['thinking'], {'type': 'disabled'})
        self.assertEqual(json.loads(raw)['note']['status'], 'answered')

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
        error = HTTPError('https://api.deepseek.com/chat/completions', 401, self.key, {}, io.BytesIO(self.key.encode()))
        with patch.object(server, 'urlopen', side_effect=error):
            status, raw = self.request('/api/ask', {'question': 'test'})
        self.assertEqual(status, 502)
        self.assertNotIn(self.key, raw.decode())
        self.assertIn('验证失败', json.loads(raw)['error'])

    def test_generic_compatible_api_uses_configured_endpoint_and_standard_fields(self):
        for base in ['https://example.com/v1/', 'https://example.com/v1/chat/completions']:
            self.config.write_text(json.dumps({'base_url': base, 'api_key': self.key, 'model': 'my-model'}))
            output = {'choices': [{'message': {'content': '通用接口回答'}}]}
            with patch.object(server, 'urlopen', return_value=io.BytesIO(json.dumps(output).encode())) as upstream:
                status, raw = self.request('/api/ask', {'question': 'test'})
            self.assertEqual(status, 200)
            request = upstream.call_args.args[0]
            self.assertEqual(request.full_url, 'https://example.com/v1/chat/completions')
            self.assertEqual(set(json.loads(request.data)), {'model', 'messages', 'stream'})
            self.assertEqual(json.loads(raw)['provider'], 'example.com')
            self.assertNotIn(self.key, raw.decode())

    def test_local_compatible_endpoint_can_omit_key(self):
        self.config.write_text(json.dumps({'base_url': 'http://127.0.0.1:1234/v1', 'model': 'local'}))
        output = {'choices': [{'message': {'content': 'local answer'}}]}
        with patch.object(server, 'urlopen', return_value=io.BytesIO(json.dumps(output).encode())) as upstream:
            self.assertEqual(self.request('/api/ask', {'question': 'test'})[0], 200)
        self.assertIsNone(upstream.call_args.args[0].get_header('Authorization'))

    def test_bad_config_addresses_are_rejected_without_echoing_secrets(self):
        for base in ['http://example.com/v1', 'https://user:' + self.key + '@example.com',
                     'https://example.com/?api_key=' + self.key, 'file:///tmp/model', 'https://[invalid']:
            self.config.write_text(json.dumps({'base_url': base, 'api_key': self.key}))
            with patch.object(server, 'urlopen') as upstream:
                status, raw = self.request('/api/ask', {'question': 'test'})
            self.assertEqual(status, 400, base)
            self.assertNotIn(self.key, raw.decode())
            upstream.assert_not_called()

    def test_notes_persist_with_anchors_without_key_or_chapter_context(self):
        anchor = {'scope_id': 'flow', 'start': 12, 'prefix': '公式', 'suffix': '进度'}
        def answer(data, config):
            pending = server.list_notes('index.html')
            self.assertEqual(pending[0]['status'], 'pending')
            return {'answer': '本地回答', 'model': config['model'], 'provider': config['provider']}
        with patch.object(server, 'ask_model', side_effect=answer):
            status, raw = self.request('/api/ask', {'question': 'τ 是什么？', 'selection': 'τ∈[0,1]',
                'context': 'PRIVATE-CHAPTER-CONTEXT', 'anchor': anchor})
        self.assertEqual(status, 200)
        saved = json.loads(raw)['note']
        self.assertEqual(saved['anchor'], anchor)
        self.config.write_text('{}')
        status, raw = self.request('/api/notes?document=index.html')
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(raw)['notes'], [saved])
        (self.root / 'other.html').write_text('<h1>other</h1>')
        self.assertEqual(json.loads(self.request('/api/notes?document=other.html')[1])['notes'], [])
        self.assertEqual(self.history.stat().st_mode & 0o777, 0o600)
        self.assertEqual(self.history.parent.stat().st_mode & 0o777, 0o700)
        self.assertNotIn(self.key.encode(), self.history.read_bytes())
        self.assertNotIn(b'PRIVATE-CHAPTER-CONTEXT', self.history.read_bytes())
        (self.root / 'alias.html').symlink_to(self.history)
        for path in ['/.reader-data/questions.sqlite3', '/alias.html']:
            self.assertEqual(self.request(path)[0], 404)

    def test_invalid_document_and_anchor_never_call_model(self):
        with patch.object(server, 'ask_model') as upstream:
            for document in ['../secret.html', '.git/index.html', 'https://example.com/', 'config.json', '\x00', '//[invalid']:
                self.assertEqual(self.request('/api/ask', {'question': 'test', 'document': document})[0], 400)
                encoded = quote(document, safe='')
                self.assertEqual(self.request('/api/notes?document=' + encoded)[0], 400)
            for anchor in [[], {'start': True}, {'start': -1}, {'prefix': 'x' * 161}]:
                self.assertEqual(self.request('/api/ask', {'question': 'test', 'anchor': anchor})[0], 400)
            upstream.assert_not_called()

    def test_failed_request_is_saved_with_safe_error(self):
        with patch.object(server, 'ask_model', side_effect=ValueError(self.key)):
            status, raw = self.request('/api/ask', {'question': 'test', 'selection': 'quote'})
        self.assertEqual(status, 502)
        self.assertNotIn(self.key, raw.decode())
        note = json.loads(self.request('/api/notes?document=index.html')[1])['notes'][0]
        self.assertEqual(note['status'], 'error')
        self.assertTrue(note['error'])
        self.assertEqual(note['question'], 'test')

    def test_storage_failure_does_not_send_question(self):
        with patch.object(server, 'create_note', side_effect=OSError), patch.object(server, 'ask_model') as upstream:
            self.assertEqual(self.request('/api/ask', {'question': 'test'})[0], 500)
            upstream.assert_not_called()

    def test_shutdown_requires_local_origin_and_waits_for_active_answer(self):
        self.assertEqual(self.request('/api/shutdown', {}, origin='https://example.com')[0], 403)
        self.assertEqual(self.request('/api/shutdown', {}, origin='null')[0], 403)
        self.assertEqual(self.request('/api/shutdown')[0], 404)
        self.assertEqual(self.request('/api/shutdown', {'unexpected': True})[0], 400)
        server.REQUEST_LOCK.acquire()
        try:
            self.assertEqual(self.request('/api/shutdown', {})[0], 409)
            self.assertFalse(getattr(self.httpd, 'stopping', False))
        finally:
            server.REQUEST_LOCK.release()
        stopped = threading.Event()
        with patch.object(self.httpd, 'shutdown', side_effect=stopped.set) as stop:
            status, raw = self.request('/api/shutdown', {})
            self.assertEqual(status, 200)
            self.assertTrue(json.loads(raw)['stopped'])
            self.assertTrue(self.httpd.stopping)
            self.assertTrue(stopped.wait(timeout=2))
            stop.assert_called_once()
            with patch.object(server, 'ask_model') as upstream:
                self.assertEqual(self.request('/api/ask', {'question':'test'})[0], 503)
                upstream.assert_not_called()

    def test_library_identity_is_available_even_with_invalid_config(self):
        self.config.write_text('not JSON')
        status, raw = self.request('/api/status')
        data = json.loads(raw)
        self.assertEqual(status, 200)
        self.assertEqual(data['library_root'], str(self.root.resolve()))
        self.assertFalse(data['configured'])


if __name__ == '__main__':
    unittest.main()
