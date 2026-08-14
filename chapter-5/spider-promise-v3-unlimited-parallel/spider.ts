import path from 'node:path';
import fs from 'node:fs/promises';
import superagent from 'superagent';

export type SpiderResult = {
  filename: string;
  downloaded: boolean;
}

const visitedUrls = new Set<string>()

export function spider(url: URL, nesting: number): Promise<SpiderResult> {
  const filename = urlToFilename(url)

  if (visitedUrls.has(url.toString())) {
    return Promise.resolve({ filename, downloaded: false })
  }

  visitedUrls.add(url.toString())

  return fs.readFile(filename, 'utf8')
    .then((content) => ({ content, downloaded: false }))
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') {
        throw error
      }

      return download(url, filename)
        .then((content) => ({ content, downloaded: true }))
    })
    .then(({ content, downloaded }) => {
      return spiderLinks(url, content, nesting)
        .then(() => ({ filename, downloaded }))
    })
}

function spiderLinks(url: URL, content: string, nesting: number): Promise<void> {
  if (nesting === 0) {
    return Promise.resolve()
  }

  const links = content.match(/<a\s+href="([^"]*)"/g) ?? []

  const promises = links.map(link => {
    const nextUrl = new URL(link.slice(9, -1), url)
    return spider(nextUrl, nesting - 1)
  })

  return Promise.all(promises).then(() => undefined)
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

function download(url: URL, filename: string): Promise<string> {
  console.log(`[${new Date().toISOString()}] START ${url}`)

  return superagent.get(url.href).accept('html').then((response) => {
    if (response.type !== 'text/html') {
      throw new Error(`Expected text/html but got ${response.type}`)
    }

    return saveFile(filename, response.text).then(() => {
      console.log(`[${new Date().toISOString()}] FINISH ${url} -> ${filename}`)
      return response.text
    })
  })
}

function saveFile(filename: string, content: string): Promise<void> {
  return fs.mkdir(path.dirname(filename), { recursive: true })
    .then(() => fs.writeFile(filename, content))
}
