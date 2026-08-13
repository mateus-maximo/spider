import path from 'node:path';
import fs from 'node:fs';
import superagent from 'superagent';
import { EventEmitter } from 'node:events';

export type SpiderResultCallback = (err: Error | null, filename: string, downloaded: boolean) => void;
type SaveFileResultCallback = (err: Error | null) => void;
type DownloadResultCallback = (err: Error | null, content?: string) => void;
type SpiderLinksResultCallback = (err: Error | null) => void;
export type Task = (done: TaskDoneCallback) => void;
export type TaskDoneCallback = (err: Error | null) => void;

const visitedUrls: Set<string> = new Set()

export function spider(url: URL, nesting: number, queue: TaskQueue) {
  if (visitedUrls.has(url.href)) {
    console.log(`[${new Date().toISOString()}] SKIP ${url.href}`)
    return
  }

  const task: Task = (done) => {
    console.log(`[${new Date().toISOString()}] START ${url.href}`)
    spiderTask(url, nesting, queue, (err) => {
      const result = err ? 'ERROR' : 'FINISH'
      console.log(`[${new Date().toISOString()}] ${result} ${url.href}`)
      done(err)
    })
  }

  visitedUrls.add(url.href)
  console.log(`[${new Date().toISOString()}] QUEUE ${url.href}`)
  queue.pushTask(task)
}

export function spiderTask(url: URL, nesting: number, queue: TaskQueue, callback: SpiderResultCallback) {
  const filename = urlToFilename(url)

  fs.access(filename, (err) => {
    if (!err) {
      fs.readFile(filename, 'utf8', (err, content) => {
        if (err) {
          callback(err, filename, false)
          return
        }

        spiderLinks(url, content, nesting, queue, (err) => {
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

        spiderLinks(url, content, nesting, queue, (err) => {
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

export class TaskQueue extends EventEmitter {
  private concurrency: number
  private running: number
  private queue: Task[]

  constructor(concurrency: number) {
    super()
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  pushTask(task: Task) {
    this.queue.push(task)
    this.next()
  }

  private next() {
    if (this.running === 0 && this.queue.length === 0) {
      this.emit('empty')
    }

    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()
      if (task) {
        this.running++
        console.log(`[${new Date().toISOString()}] ACTIVE ${this.running}/${this.concurrency}, waiting ${this.queue.length}`)
        task((err) => {
          if (err) {
            this.emit('error', err)
          }

          this.running--
          console.log(`[${new Date().toISOString()}] ACTIVE ${this.running}/${this.concurrency}, waiting ${this.queue.length}`)
          this.next()
        })
      }
    }
  }
}

function spiderLinks(url: URL, content: string, nesting: number, queue: TaskQueue, callback: SpiderLinksResultCallback) {
  if (nesting === 0) {
    process.nextTick(() => callback(null))
    return
  }

  const links = content.match(/<a\s+href="([^"]*)"/g) ?? []

  if (links.length === 0) {
    process.nextTick(() => callback(null))
    return
  }

  for (const link of links) {
    const nextUrl = new URL(link.slice(9, -1), url)

    spider(nextUrl, nesting - 1, queue)
  }

  callback(null)
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
