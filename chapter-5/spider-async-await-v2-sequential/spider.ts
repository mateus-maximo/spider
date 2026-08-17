import path from 'node:path';
import fs from 'node:fs/promises';
import superagent from 'superagent';

export type SpiderResult = {
  filename: string;
  downloaded: boolean;
}

export async function spider(url: URL, nesting: number): Promise<SpiderResult> {
  const filename = urlToFilename(url)

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

  for (const link of links) {
    const nextUrl = new URL(link.slice(9, -1), url)
    await spider(nextUrl, nesting - 1)
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
  console.log(`Downloading ${url} to ${filename}`)

  const response = await superagent.get(url.href).accept('html')

  if (response.type !== 'text/html') {
    throw new Error(`Expected text/html but got ${response.type}`)
  }

  await saveFile(filename, response.text)
  return response.text
}

async function saveFile(filename: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filename), { recursive: true })
  await fs.writeFile(filename, content)
}
