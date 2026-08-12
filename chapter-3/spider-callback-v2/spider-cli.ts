import { spider, type SpiderResultCallback } from './spider.js';

const spiderResultCallback: SpiderResultCallback = (err, filename, downloaded) => {
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

function main() {
  const nesting = Number(process.argv[3] ?? '1')

  if (!Number.isInteger(nesting) || nesting < 0) {
    console.error('Nesting must be a non-negative integer');
    process.exitCode = 1;
    return
  }

  try {
    const url = new URL(process.argv[2] ?? 'http://localhost:8080')
    spider(url, nesting, spiderResultCallback)
  } catch {
    console.error('Invalid URL');
    process.exitCode = 1;
  }
}

main();
