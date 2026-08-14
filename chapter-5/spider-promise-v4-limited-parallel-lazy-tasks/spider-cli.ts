import { spider } from './spider.js';

function main() {
  const nesting = Number(process.argv[3] ?? '1')
  const concurrency = Number(process.argv[4] ?? '2')

  if (!Number.isInteger(nesting) || nesting < 0) {
    console.error('Nesting must be a non-negative integer');
    process.exitCode = 1;
    return
  }

  if (!Number.isInteger(concurrency) || concurrency < 1) {
    console.error('Concurrency must be a positive integer');
    process.exitCode = 1;
    return
  }

  try {
    const url = new URL(process.argv[2] ?? 'http://localhost:8080')
    console.log(`Spidering ${url.href} with nesting ${nesting} and concurrency ${concurrency}`)
    spider(url, nesting, concurrency)
      .then((result) => {
        if (result.downloaded) {
          console.log(`Downloaded ${result.filename}`)
        } else {
          console.log(`${result.filename} was already downloaded`)
        }
      })
      .catch((error) => {
        console.error(error)
        process.exitCode = 1
      })
  } catch {
    console.error('Invalid URL');
    process.exitCode = 1;
  }
}

main();
