"""Download your inbox originals. Python 3 standard library only."""
import getpass
import hashlib
import http.cookiejar
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
import urllib.error

ORIGIN = 'https://golden-grain-photo-inbox.omarmachucabell.chatgpt.site'

def main():
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    def request(path, data=None):
        if not path.startswith('/') or path.startswith('//'):
            raise ValueError('Unexpected file URL')
        headers = {'Origin': ORIGIN}
        if data is not None:
            headers['Content-Type'] = 'application/json'
            data = json.dumps(data).encode()
        return opener.open(urllib.request.Request(ORIGIN + path, data=data, headers=headers), timeout=120)
    with request('/api/login', {'passcode': getpass.getpass('Uploader passcode: ')}) as response:
        json.load(response)
    folder = Path(__file__).resolve().parent / 'uploads'
    folder.mkdir(exist_ok=True)
    items, cursor, seen = [], None, set()
    while True:
        path = '/api/photos' + ('?' + urllib.parse.urlencode({'cursor': cursor}) if cursor else '')
        with request(path) as response:
            page = json.load(response)
        items.extend(page['items'])
        cursor = page.get('cursor')
        if not cursor:
            break
        if cursor in seen:
            raise ValueError('Repeated pagination cursor')
        seen.add(cursor)
    results = []
    for index, item in enumerate(items, 1):
        name = re.sub(r'[^\w. -]', '_', item['name']).strip(' .')[:150] or 'photo'
        prefix = hashlib.sha256(str(item['id']).encode()).hexdigest()[:16]
        target = folder / (prefix + '-' + name)
        try:
            if not target.exists() or target.stat().st_size != item['size']:
                temporary = target.with_name(target.name + '.partial')
                with request(item['src']) as response, temporary.open('wb') as output:
                    while True:
                        chunk = response.read(1024 * 1024)
                        if not chunk:
                            break
                        output.write(chunk)
                if temporary.stat().st_size != item['size']:
                    raise ValueError('Downloaded size did not match metadata')
                temporary.replace(target)
            results.append({**item, 'file': target.name, 'downloaded': True})
            print(f'{index}/{len(items)}: {name}')
        except (OSError, ValueError) as error:
            results.append({**item, 'downloaded': False, 'error': str(error)})
            print(f'Failed: {name}: {error}')
        (folder / 'manifest.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
    print(f"Saved {sum(r['downloaded'] for r in results)} of {len(items)} originals to {folder}")

if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError) as error:
        raise SystemExit(f'Download stopped: {error}. No server files were changed.')
