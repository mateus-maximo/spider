import path from 'node:path';
import fs from 'node:fs';
import superagent from 'superagent';

export type SpiderResultCallback = (err: Error | null, filename: string, downloaded: boolean) => void;
type SaveFileResultCallback = (err: Error | null) => void;
type DownloadResultCallback = (err: Error | null, content?: string) => void;

export function spider(url: URL, callback: SpiderResultCallback) {
  const filename = urlToFilename(url)

  fs.access(filename, (err) => {
    if (!err) {
      callback(null, filename, false)
      return
    }

    if (err.code === 'ENOENT') {
      download(url, filename, (err) => {
        if (err) {
          callback(err, filename, false)
          return
        }
        callback(null, filename, true)
      })
      return
    }

    callback(err, filename, false)
  })
}

function urlToFilename(url: URL): string {
  const siteDirectory = url.port
    ? `${url.hostname}_${url.port}`
    : url.hostname;
  const pathname = url.pathname.slice(1);

  if (pathname === '' || pathname.endsWith('/')) {
    return path.join('downloads', siteDirectory, pathname, 'index.html');
  }

  const filename = path.extname(pathname) ? pathname : `${pathname}.html`;
  return path.join('downloads', siteDirectory, filename);
}

function download(url: URL, filename: string, callback: DownloadResultCallback) {
  console.log(`Downloading ${url} to ${filename}`)
  superagent.get(url.href).accept('html').end((error, response) => {
    if (error) {
      callback(error)
      return
    }

    if (response.type != 'text/html') {
      callback(new Error(`Expected text/html but got ${response.type}`))
      return
    }

    saveFile(filename, response.text, (err) => {
      if (err) {
        callback(err)
        return
      }
      callback(null, response.text)
    })
  })
}

function saveFile(filename: string, content: string, callback: SaveFileResultCallback) {
  fs.mkdir(path.dirname(filename), { recursive: true }, (err) => {
    if (err) {
      callback(err)
      return
    }

    fs.writeFile(filename, content, (err) => {
      if (err) {
        callback(err)
        return
      }
      callback(null)
    })
  })
}
