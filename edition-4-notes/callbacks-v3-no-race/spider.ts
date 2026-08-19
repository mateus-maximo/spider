import path from 'node:path';
import fs from 'node:fs';
import superagent from 'superagent';

export type SpiderResultCallback = (err: Error | null, filename: string, downloaded: boolean) => void;
type SaveFileResultCallback = (err: Error | null) => void;
type DownloadResultCallback = (err: Error | null, content?: string) => void;
type SpiderLinksResultCallback = (err: Error | null) => void;

const spidering = new Set<string>()

export function spider(url: URL, nesting: number, callback: SpiderResultCallback) {
  const filename = urlToFilename(url)

  if (spidering.has(url.href)) {
    process.nextTick(() => callback(null, filename, false))
    return
  }
  spidering.add(url.href)

  fs.access(filename, (err) => {
    if (!err) {
      fs.readFile(filename, 'utf8', (err, content) => {
        if (err) {
          callback(err, filename, false)
          return
        }
        spiderLinks(url, content, nesting, (err) => {
          if (err) {
            callback(err, filename, false)
            return
          }
          callback(null, filename, false)
        })
      })
      return
    }

    if (err.code === 'ENOENT') {
      download(url, filename, (err, content) => {
        if (err) {
          callback(err, filename, false)
          return
        }

        if (content === undefined) {
          callback(new Error('Content is undefined'), filename, false)
          return
        }

        spiderLinks(url, content, nesting, (err) => {
          if (err) {
            callback(err, filename, false)
            return
          }
          callback(null, filename, true)
        })
      })
      return
    }

    callback(err, filename, false)
  })
}

function spiderLinks(url: URL, content: string, nesting: number, callback: SpiderLinksResultCallback) {
  if (nesting === 0) {
    process.nextTick(() => callback(null))
    return
  }

  const links = content.match(/<a\s+href="([^"]*)"/g) ?? []

  let completed = 0
  let failed = false

  if (links.length === 0) {
    process.nextTick(() => callback(null))
    return
  }

  for (const link of links) {
    const nextUrl = new URL(link.slice(9, -1), url)

    spider(nextUrl, nesting - 1, (err) => {
      if (err) {
        if (!failed) {
          failed = true
          callback(err)
          return
        }
        return
      }
      completed++
      if (completed === links.length) {
        callback(null)
      }
    })
  }
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
