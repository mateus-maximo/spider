import path from 'node:path';
import fs from 'node:fs/promises';
import superagent from 'superagent';

export type SpiderResult = {
  filename: string;
  downloaded: boolean;
}

export function spider(url: URL, nesting: number): Promise<SpiderResult> {
  const filename = urlToFilename(url)

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

  function iterate(index: number): Promise<void> {
    const link = links[index]

    if (link === undefined) {
      return Promise.resolve()
    }

    const nextUrl = new URL(link.slice(9, -1), url)

    return spider(nextUrl, nesting - 1).then(() => iterate(index + 1))
  }

  return iterate(0)
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
  console.log(`Downloading ${url} to ${filename}`)

  return superagent.get(url.href).accept('html').then((response) => {
    if (response.type !== 'text/html') {
      throw new Error(`Expected text/html but got ${response.type}`)
    }

    return saveFile(filename, response.text).then(() => response.text)
  })
}

function saveFile(filename: string, content: string): Promise<void> {
  return fs.mkdir(path.dirname(filename), { recursive: true })
    .then(() => fs.writeFile(filename, content))
}
