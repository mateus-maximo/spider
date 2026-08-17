import path from 'node:path';
import fs from 'node:fs/promises';
import superagent from 'superagent';

export type SpiderResult = {
  filename: string;
  downloaded: boolean;
}

const visitedUrls = new Set<string>()

export async function spider(url: URL, nesting: number): Promise<SpiderResult> {
  const filename = urlToFilename(url)

  if (visitedUrls.has(url.toString())) {
    return ({ filename, downloaded: false })
  }
  visitedUrls.add(url.toString())

  let content: string
  let downloaded: boolean = false

  try {
    content = await fs.readFile(filename, 'utf8')
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      throw error
    }
    content = await download(url, filename)
    downloaded = true
  }

  await spiderLinks(url, content, nesting)

  return ({ filename, downloaded })
}

async function spiderLinks(url: URL, content: string, nesting: number): Promise<void> {
  if (nesting === 0) {
    return
  }

  const links = content.match(/<a\s+href="([^"]*)"/g) ?? []

  const promises = links.map((link) => {
    const nextUrl = new URL(link.slice(9, -1), url)
    return spider(nextUrl, nesting - 1)
  })

  log(`WAIT ${url} for ${promises.length} child spiders`)

  try {
    await Promise.all(promises)
    log(`DONE ${url} child spiders completed`)
  } catch (error) {
    log(`FAIL ${url} child spider rejected`)
    throw error
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

async function download(url: URL, filename: string): Promise<string> {
  log(`START ${url}`)

  try {
    const response = await superagent.get(url.href).accept('html')

    if (response.type !== 'text/html') {
      throw new Error(`Expected text/html but got ${response.type}`)
    }

    await saveFile(filename, response.text)
    log(`FINISH ${url} -> ${filename}`)
    return response.text
  } catch (error) {
    log(`ERROR ${url}`)
    throw error
  }
}

async function saveFile(filename: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filename), { recursive: true })
  await fs.writeFile(filename, content)
}

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`)
}
