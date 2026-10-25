#!/usr/bin/env python3
"""Build the macOS launcher with Apple's built-in AppleScript compiler."""
from pathlib import Path
import plistlib
import subprocess

root = Path(__file__).resolve().parent.parent
app = root / 'Paper Library.app'
subprocess.run(['/usr/bin/osacompile', '-o', str(app), str(root / 'reader/launcher.applescript')], check=True)
info_path = app / 'Contents/Info.plist'
with info_path.open('rb') as source:
    info = plistlib.load(source)
info.update(CFBundleIdentifier='io.paperlibrary.launcher', CFBundleDisplayName='Paper Library',
            CFBundleShortVersionString='1.0', LSUIElement=True)
with info_path.open('wb') as output:
    plistlib.dump(info, output)
subprocess.run(['/usr/bin/codesign', '--force', '--sign', '-', str(app)], check=True)
print('Built:', app)
