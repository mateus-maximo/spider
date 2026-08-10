import { createReadStream, statSync } from 'node:fs'
import { createServer, type ServerResponse } from 'node:http'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const host = '127.0.0.1'
const port = 8080
const siteDirectory = fileURLToPath(new URL('.', import.meta.url))
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8']
])

function sendFile(response: ServerResponse, pathname: string): void {
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1)
  const filename = join(siteDirectory, relativePath)

  try {
    if (!statSync(filename).isFile()) {
      throw new Error('Not a file')
    }
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Not found\n')
    return
  }

  response.writeHead(200, {
    'content-type': contentTypes.get(extname(filename)) ?? 'application/octet-stream'
  })
  createReadStream(filename).pipe(response)
}

createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', `http://${host}:${port}`).pathname
  const delay = pathname === '/slow.html' ? 1_500 : 0
  const startedAt = new Date().toISOString()

  console.log(`${startedAt} START ${pathname}`)
  setTimeout(() => {
    sendFile(response, pathname)
    console.log(`${new Date().toISOString()} END   ${pathname}`)
  }, delay)
}).listen(port, host, () => {
  console.log(`Manual site running at http://${host}:${port}/`)
})
