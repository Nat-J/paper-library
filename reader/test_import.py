import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import paper_import as importer

PDF = b'%PDF-1.4\nsynthetic test content\n%%EOF\n'
METADATA = {'slug':'example','year':2026,'title':'Example paper','title_zh':'中文测试论文',
            'summary':'用一张示意图解释方法。','tags':['示意','测试']}


class ImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / 'library'
        self.root.mkdir()
        skill = self.root / 'skills/paper-to-web/scripts'
        skill.mkdir(parents=True)
        (skill.parent / 'SKILL.md').write_text('test skill')
        shutil.copyfile(Path(__file__).parents[1] / 'skills/paper-to-web/scripts/check_guide.py',skill / 'check_guide.py')
        (self.root / 'index.html').write_text('<html><span id="paper-count">00 篇</span>' + importer.CATALOG_MARKER + '</html>')
        (self.root / '.gitignore').write_text('config.json\n.reader-data/\n')
        (self.root / 'config.json').write_text('PRIVATE-CREDENTIAL-FIXTURE')
        self.manager = importer.ImportManager(self.root)
        self.codex = patch.object(importer,'find_codex',return_value='/bin/false')
        self.codex.start()

    def tearDown(self):
        self.codex.stop()
        self.temp.cleanup()

    def upload(self):
        with patch.object(self.manager,'start_worker'):
            public = self.manager.upload(io.BytesIO(PDF),len(PDF),'paper.pdf')
        return self.manager.read(public['id'])

    def output(self, job):
        workspace = self.manager.directory / job['id'] / 'workspace'
        output = workspace / 'output'
        (output / 'assets').mkdir(parents=True)
        (workspace / 'reader').mkdir()
        for name in ['reader-ai.js','reader-service.js']:
            (workspace / 'reader' / name).write_text('// shared reader')
        (output / 'assets/paper.pdf').write_bytes(PDF)
        (output / 'SOURCES.md').write_text('PDF 第 1 页：测试主张与示意图。此文件为自动化测试夹具，没有实际实验结果。')
        (output / 'index.html').write_text('''<!doctype html><html lang="zh-CN"><head>
          <meta name="viewport" content="width=device-width"><title>中文测试导读</title></head><body>
          <h1>中文测试导读</h1><svg viewBox="0 0 100 100" aria-label="解释性示意"><rect width="80" height="80"/></svg>
          <a href="assets/paper.pdf">PDF</a><script src="../reader/reader-ai.js" defer></script>
          <script src="../reader/reader-service.js" defer></script></body></html>''')
        return output

    def git(self, *args):
        return subprocess.check_output(['git',*args],cwd=self.root,stderr=subprocess.DEVNULL).decode().strip()

    def init_git(self, remote=True):
        self.git('init','-q','-b','main'); self.git('config','user.name','Import Test')
        self.git('config','user.email','import@example.invalid'); self.git('add','.')
        self.git('commit','-qm','Initial catalog')
        if remote:
            bare = Path(self.temp.name) / 'remote.git'
            subprocess.run(['git','init','--bare','-q',str(bare)],check=True)
            self.git('remote','add','origin',str(bare)); self.git('push','-qu','origin','main')

    def test_upload_validation_lock_and_interrupted_recovery(self):
        for data,name,length in [(b'bad!!','x.pdf',5),(PDF,'x.txt',len(PDF)),(PDF,'x.pdf',importer.MAX_PDF+1)]:
            with self.assertRaises(importer.ImportErrorMessage):
                self.manager.upload(io.BytesIO(data),length,name)
        descriptor = self.manager.lock()
        try:
            self.assertTrue(self.manager.busy())
            with self.assertRaises(importer.ImportErrorMessage): self.upload()
        finally: os.close(descriptor)
        job = self.upload()
        self.assertEqual(job['stage'],'queued')
        status = self.manager.status()
        self.assertEqual(status['jobs'][0]['stage'],'interrupted')
        self.assertNotIn('sha256',status['jobs'][0])
        self.assertEqual((self.manager.directory / job['id'] / 'input.pdf').stat().st_mode & 0o777,0o600)

    def test_duplicate_pdf_is_not_generated_again(self):
        existing = self.root / '2024-existing/assets'
        existing.mkdir(parents=True); (existing / 'paper.pdf').write_bytes(PDF)
        (existing.parent / 'index.html').write_text('existing')
        with patch.object(self.manager,'start_worker') as start:
            job = self.manager.upload(io.BytesIO(PDF),len(PDF),'../other.pdf')
        self.assertEqual(job['stage'],'duplicate'); start.assert_not_called()
        self.assertEqual(job['filename'],'other.pdf')
        self.assertEqual(job['url'],'2024-existing/index.html')

    @unittest.skipUnless((importer.DEPENDENCIES / 'python/bin/python3').exists(),'Bundled PDF runtime unavailable')
    def test_malformed_pdf_does_not_call_generation_model(self):
        job = self.upload()
        with self.assertRaisesRegex(importer.ImportErrorMessage,'PDF 无法解析'):
            importer.generate(self.manager,job)
        self.assertFalse((self.manager.directory / job['id'] / 'generation.log').exists())

    def test_catalog_escapes_metadata_and_preserves_existing_entries(self):
        original = '<span id="paper-count">01 篇</span><article class="paper" id="old">keep</article><script src="reader/reader-service.js"></script>' + importer.CATALOG_MARKER
        result = importer.update_catalog(original,'2026-example',{**METADATA,'title_zh':'<img onerror=bad>'})
        self.assertIn('id="old">keep',result); self.assertIn('02 篇',result)
        self.assertIn('&lt;img onerror=bad&gt;',result); self.assertNotIn('<img onerror',result)

    def test_invalid_outputs_cannot_escape_or_replace_pdf(self):
        job = self.upload(); output = self.output(job)
        (output / 'assets/secret.html').symlink_to(self.root / 'config.json')
        with self.assertRaises(importer.ImportErrorMessage): importer.validate_output(self.manager,job,output,METADATA)
        (output / 'assets/secret.html').unlink(); (output / 'assets/paper.pdf').write_bytes(b'another paper')
        with self.assertRaises(importer.ImportErrorMessage): importer.validate_output(self.manager,job,output,METADATA)
        (output / 'assets/paper.pdf').write_bytes(PDF)
        with self.assertRaises(importer.ImportErrorMessage): importer.validate_output(self.manager,job,output,{**METADATA,'slug':'../config'})
        (output / 'index.html').write_text('<script src="https://example.com/external.js"></script>')
        with self.assertRaises(importer.ImportErrorMessage): importer.validate_output(self.manager,job,output,METADATA)

    def test_archive_commit_and_push_only_include_new_paper_and_catalog(self):
        self.init_git()
        (self.root / 'unrelated.txt').write_text('pending user change'); self.git('add','unrelated.txt')
        job = self.upload(); output = self.output(job)
        with patch.object(importer,'generate',return_value=(output,METADATA)):
            importer.run_job(self.manager,job)
        saved = self.manager.read(job['id'])
        self.assertEqual(saved['stage'],'done')
        self.assertEqual((self.root / saved['url']).is_file(),True)
        changed = self.git('show','--pretty=format:','--name-only','HEAD').splitlines()
        self.assertIn('index.html',changed); self.assertIn('2026-example/assets/paper.pdf',changed)
        self.assertNotIn('unrelated.txt',changed); self.assertNotIn('config.json',changed)
        self.assertTrue(all(not path.startswith('.reader-data/') for path in changed))
        self.assertIn('unrelated.txt',self.git('diff','--cached','--name-only'))
        self.assertEqual(self.git('rev-parse','HEAD'),self.git('ls-remote','origin','refs/heads/main').split()[0])

    def test_sync_failure_can_retry_without_regenerating(self):
        self.init_git(remote=False)
        job = self.upload(); output = self.output(job)
        with patch.object(importer,'generate',return_value=(output,METADATA)):
            importer.run_job(self.manager,job)
        saved = self.manager.read(job['id'])
        self.assertEqual(saved['stage'],'sync_failed'); self.assertTrue(saved['commit'])
        bare = Path(self.temp.name) / 'remote.git'; subprocess.run(['git','init','--bare','-q',str(bare)],check=True)
        self.git('remote','add','origin',str(bare))
        with patch.object(importer,'generate') as generate:
            importer.run_job(self.manager,saved,sync_only=True)
            generate.assert_not_called()
        self.assertEqual(self.manager.read(job['id'])['stage'],'done')


if __name__ == '__main__': unittest.main()
