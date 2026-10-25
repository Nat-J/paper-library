#!/usr/bin/env python3
"""Start or reuse this library's detached reader, then open its catalog."""
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.request import urlopen
import webbrowser

LIBRARY_ROOT = Path(__file__).resolve().parent.parent


def reader_status(address):
    try:
        with urlopen(address + 'api/status', timeout=1) as response:
            data = json.loads(response.read(65_536))
        if isinstance(data, dict):
            return data
    except (OSError, URLError, ValueError):
        pass
    return None


def check_library(status, root):
    if (status.get('app') != 'paper-library-reader'
            or status.get('library_root') != str(root.resolve())):
        raise RuntimeError('端口已被其他程序或旧版阅读服务占用。请关闭原来的服务后重新打开阅读器。')


def ensure_running(root=LIBRARY_ROOT, port=8787):
    address = f'http://127.0.0.1:{port}/'
    status = reader_status(address)
    if status is not None:
        check_library(status, root)
        return address
    if not (root / 'reader' / 'server.py').is_file():
        raise RuntimeError('找不到 reader/server.py。请将 Paper Library.app 留在完整的 paper-library 文件夹内。')
    data_dir = root / '.reader-data'
    data_dir.mkdir(mode=0o700, exist_ok=True)
    log_path = data_dir / 'reader.log'
    with os.fdopen(os.open(log_path, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o600), 'ab') as log:
        os.chmod(log_path, 0o600)
        process = subprocess.Popen([sys.executable, str(root / 'reader' / 'server.py'), '--port', str(port)],
            cwd=root, stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT,
            start_new_session=True, close_fds=True)
    try:
        deadline = time.monotonic() + 8
        while time.monotonic() < deadline:
            status = reader_status(address)
            if status is not None:
                check_library(status, root)
                return address
            if process.poll() is not None:
                raise RuntimeError('阅读服务未能启动。请检查端口是否被占用，详情见 .reader-data/reader.log。')
            time.sleep(0.1)
        raise RuntimeError('阅读服务启动超时。请检查 .reader-data/reader.log 后重试。')
    except Exception:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
        raise


def main():
    try:
        address = ensure_running()
        if not webbrowser.open(address, new=2):
            raise RuntimeError('服务已启动，但未能打开浏览器。请访问 ' + address)
    except (OSError, RuntimeError) as error:
        raise SystemExit(str(error)) from None


if __name__ == '__main__':
    main()
