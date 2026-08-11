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
  try {
    const url = new URL(process.argv[2] ?? 'http://localhost:8080')
    spider(url, spiderResultCallback)
  } catch {
    console.error('Invalid URL');
    process.exitCode = 1;
  }
}

main();
