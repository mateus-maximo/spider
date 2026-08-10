import path from 'node:path';
import fs from 'node:fs';
import superagent from 'superagent';

function main() {
  try {
    const url = new URL(process.argv[2] ?? 'http://localhost:8080')
    const filename = urlToFilename(url)

    fs.access(filename, (err) => {
      if (!err) {
        console.log(`${filename} was already downloaded`)
        return
      }

      if (err.code === 'ENOENT') {
        download(url, filename);
        return
      }

      console.error(err)
      process.exitCode = 1
    })

  } catch (e) {
    console.error('Invalid URL');
    process.exitCode = 1;
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

function download(url: URL, filename: string) {
  console.log(`Downloading ${url} to ${filename}`)
  superagent.get(url.href).accept('html').end((error, response) => {
    if (error) {
      console.error(error)
      return
    }

    fs.mkdir(path.dirname(filename), { recursive: true }, (err) => {
      if (err) {
        console.error(err)
        return
      }

      if (response.type != 'text/html') {
        console.log(`Skipping ${url} (not an HTML page)`);
        return
      }

      fs.writeFile(filename, response.text, (err) => {
        if (err) {
          console.error(err)
          return
        }
        console.log(`Downloaded ${url} to ${filename}`)
      })
    })
  })
}

main();
