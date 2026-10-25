import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from urllib.request import Request, urlopen

import launcher


class LauncherTests(unittest.TestCase):
    def test_detached_service_reuse_and_clean_shutdown(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "a reader's library"
            (root / 'reader').mkdir(parents=True)
            shutil.copyfile(Path(__file__).with_name('server.py'), root / 'reader/server.py')
            shutil.copyfile(Path(__file__).with_name('paper_import.py'), root / 'reader/paper_import.py')
            (root / 'index.html').write_text('<h1>Test library</h1>')
            with socket.socket() as reservation:
                reservation.bind(('127.0.0.1', 0))
                port = reservation.getsockname()[1]
            real_popen = subprocess.Popen
            processes = []
            def spawn(*args, **kwargs):
                process = real_popen(*args, **kwargs)
                processes.append(process)
                return process
            try:
                with patch.object(launcher.subprocess, 'Popen', side_effect=spawn) as start:
                    address = launcher.ensure_running(root, port)
                    self.assertEqual(launcher.ensure_running(root, port), address)
                    self.assertEqual(start.call_count, 1)
                    self.assertTrue(start.call_args.kwargs['start_new_session'])
                    self.assertEqual(os.getsid(processes[0].pid), processes[0].pid)
                    with self.assertRaises(RuntimeError):
                        launcher.ensure_running(Path(directory) / 'other library', port)
                    self.assertEqual(start.call_count, 1)
                self.assertEqual((root / '.reader-data/reader.log').stat().st_mode & 0o777, 0o600)
                self.assertEqual((root / 'config.json').stat().st_mode & 0o777, 0o600)
                request = Request(address + 'api/shutdown', data=b'{}',
                    headers={'Content-Type':'application/json', 'Origin':address.rstrip('/')})
                with urlopen(request, timeout=3) as response:
                    self.assertTrue(json.load(response)['stopped'])
                self.assertEqual(processes[0].wait(timeout=5), 0)
                self.assertIsNone(launcher.reader_status(address))
            finally:
                for process in processes:
                    if process.poll() is None:
                        process.terminate()
                        process.wait(timeout=3)

    def test_unrelated_server_is_not_reused_or_killed(self):
        with patch.object(launcher, 'reader_status', return_value={'app':'another-app'}), \
                patch.object(launcher.subprocess, 'Popen') as start:
            with self.assertRaises(RuntimeError):
                launcher.ensure_running()
            start.assert_not_called()

    def test_failed_startup_reports_error_and_keeps_log_private(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'reader').mkdir()
            (root / 'reader/server.py').write_text('raise SystemExit(1)')
            with patch.object(launcher, 'reader_status', return_value=None), \
                    patch.object(launcher.subprocess, 'Popen') as start:
                start.return_value.poll.return_value = 1
                with self.assertRaisesRegex(RuntimeError, '未能启动'):
                    launcher.ensure_running(root)
                start.return_value.terminate.assert_not_called()
            self.assertEqual((root / '.reader-data/reader.log').stat().st_mode & 0o777, 0o600)


if __name__ == '__main__':
    unittest.main()
