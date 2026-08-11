import path from 'node:path';
import fs from 'node:fs';
import superagent from 'superagent';

type ResultCallback = (err: Error | null, filename: string, downloaded: boolean) => void;

function main() {
  try {
    const url = new URL(process.argv[2] ?? 'http://localhost:8080')
    spider(url, resultCallback)
  } catch (e) {
    console.error('Invalid URL');
    process.exitCode = 1;
  }
}

function resultCallback(err: Error | null, filename: string, downloaded: boolean) {
  if (err) {
    console.error(err)
    process.exitCode = 1
    return
  }

  if (downloaded) {
    console.log(`Downloaded ${filename}`)
  } else {
    console.log(`${filename} was already downloaded`)
  }
}

function spider(url: URL, callback: ResultCallback) {
  const filename = urlToFilename(url)

  fs.access(filename, (err) => {
    if (!err) {
      callback(null, filename, false)
      return
    }

    if (err.code === 'ENOENT') {
      download(url, filename, callback);
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

function download(url: URL, filename: string, callback: ResultCallback) {
  console.log(`Downloading ${url} to ${filename}`)
  superagent.get(url.href).accept('html').end((error, response) => {
    if (error) {
      callback(error, filename, false)
      return
    }

    fs.mkdir(path.dirname(filename), { recursive: true }, (err) => {
      if (err) {
        callback(err, filename, false)
        return
      }

      if (response.type != 'text/html') {
        callback(new Error(`Expected text/html but got ${response.type}`), filename, false)
        return
      }

      fs.writeFile(filename, response.text, (err) => {
        if (err) {
          callback(err, filename, false)
          return
        }
        callback(null, filename, true)
      })
    })
  })
}

main();
