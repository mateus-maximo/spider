import { spider, TaskQueue } from './spider.js';


function main() {
  const nesting = Number(process.argv[3] ?? '1')
  const concurrency = Number(process.argv[4] ?? '1')

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
    const queue = new TaskQueue(concurrency)
    console.log(`Spidering ${url.href} with nesting ${nesting} and concurrency ${concurrency}`)
    queue.on('empty', () => {
      console.log('Spidering complete')
    })
    queue.on('error', () => {
      console.error('Spider task completed with an error')
      process.exitCode = 1
    })
    spider(url, nesting, queue)
  } catch {
    console.error('Invalid URL');
    process.exitCode = 1;
  }
}

main();
