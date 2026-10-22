#!/usr/bin/env python3
"""Check static guide structure and local links, using the standard library."""
import argparse
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


class GuideParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.problems = []
        self.has_lang = False
        self.has_viewport = False
        self.in_title = False
        self.title = ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'html':
            self.has_lang = bool(attrs.get('lang'))
        if tag == 'meta' and attrs.get('name') == 'viewport':
            self.has_viewport = bool(attrs.get('content'))
        if tag == 'title':
            self.in_title = True
        for name in ('src', 'poster', 'href'):
            if attrs.get(name):
                self.links.append((tag, name, attrs[name]))
        for name in ('aria-controls', 'aria-describedby', 'aria-labelledby'):
            for target in attrs.get(name, '').split():
                self.links.append((tag, name, '#' + target))
        if tag == 'img' and 'alt' not in attrs:
            self.problems.append('Image is missing alt text')
        if tag == 'iframe' and not attrs.get('title'):
            self.problems.append('Iframe is missing an accessible title')

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def check(path):
    source = path.read_text(encoding='utf-8')
    parser = GuideParser()
    parser.feed(source)
    problems = list(parser.problems)
    if not parser.has_lang:
        problems.append('HTML language is missing')
    if not parser.has_viewport:
        problems.append('Viewport metadata is missing')
    if not parser.title.strip():
        problems.append('Page title is missing')
    for value, count in Counter(parser.ids).items():
        if count > 1:
            problems.append(f'Duplicate id: {value}')
    ids = set(parser.ids)
    remote_count = 0
    for tag, name, value in parser.links:
        url = urlsplit(value)
        if url.scheme in ('http', 'https') or url.netloc:
            remote_count += 1
            continue
        if url.scheme == 'file' or value.startswith(('/Users/', '/home/')):
            problems.append(f'Non-portable local path in {tag}[{name}]: {value}')
            continue
        if url.scheme in ('javascript', 'vbscript'):
            problems.append(f'Executable URL in {tag}[{name}]: {value}')
            continue
        if url.scheme:
            continue
        if not url.path and url.fragment and unquote(url.fragment) not in ids:
            problems.append(f'Broken fragment: {value}')
        if url.path:
            target = path.parent / unquote(url.path)
            if not target.exists():
                problems.append(f'Missing local file in {tag}[{name}]: {value}')
    if re.search(r'\{\{[A-Z_][A-Z0-9_ :.-]*\}\}', source):
        problems.append('Unresolved template placeholder')
    return sorted(set(problems)), len(ids), remote_count


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument('html', type=Path)
    path = args.parse_args().html.resolve()
    try:
        problems, ids, remote = check(path)
    except (OSError, UnicodeError, ValueError) as error:
        args.exit(2, f'Could not inspect guide: {error}\n')
    if problems:
        for problem in problems:
            print('ERROR:', problem)
        raise SystemExit(1)
    print(f'PASS: {ids} unique IDs; local links resolved; {remote} remote references (not fetched).')
    print('This checks static HTML only. Verify paper facts, rendering and interactions separately.')


if __name__ == '__main__':
    main()
