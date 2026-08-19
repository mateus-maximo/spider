# Spider

A TypeScript implementation of the web spider examples from *Node.js Design
Patterns, Third Edition*. The project compares callbacks, Promises,
async/await, unlimited concurrency, and limited-concurrency queues.

Each meaningful implementation remains in its own directory so its control
flow, completion signal, and error propagation can be inspected directly.

## Requirements

- Node.js 25 or newer
- npm

Install the dependencies:

```bash
npm ci
```

## Local practice website

Start the local website in one terminal:

```bash
npm run manual-site
```

The site runs at <http://127.0.0.1:8080/> and contains nested links, converging
duplicate links, a response delayed by 1.5 seconds, and a missing page that
returns 404.

Use another terminal to run a spider. Remove `downloads/127.0.0.1_8080/`
between fresh-download scenarios.

## Final versions

### Callback with limited concurrency

```bash
node --import tsx chapter-4/spider-callback-v4-limited-parallel/spider-cli.ts http://127.0.0.1:8080 2 4
```

Arguments: `URL nesting concurrency`.

### Promise with limited concurrency

```bash
node --import tsx chapter-5/spider-promise-v4-limited-parallel-lazy-tasks/spider-cli.ts http://127.0.0.1:8080 2 4
```

Arguments: `URL nesting concurrency`.

### Async/await with limited concurrency

```bash
node --import tsx chapter-5/spider-async-await-v4-limited-parallel-producer-consumer/spider-cli.ts http://127.0.0.1:8080 2 4
```

Arguments: `URL nesting concurrency`.

### Fourth-edition callback race fix

```bash
node --import tsx edition-4-notes/callbacks-v3-no-race/spider-cli.ts http://127.0.0.1:8080 2
```

This version keeps callback v3's unlimited concurrency while suppressing a URL
before asynchronous filesystem or network work starts. See the
[fourth-edition notes](./edition-4-notes/callbacks-v3-no-race/README.md).

## All implementations

| Version | Command arguments | Traversal and concurrency | Duplicate protection | Completion and errors | Important types |
| --- | --- | --- | --- | --- | --- |
| [`callback-v1-single-page`](./chapter-4/spider-callback-v1-single-page/) | `URL` | One page | Filesystem cache only | Final error-first callback | `SpiderResultCallback`, `DownloadResultCallback` |
| [`callback-v2-sequential`](./chapter-4/spider-callback-v2-sequential/) | `URL nesting` | Recursive, one child at a time | Filesystem cache only | Recursive final callbacks, first error propagates | `SpiderLinksResultCallback` |
| [`callback-v3-unlimited-parallel`](./chapter-4/spider-callback-v3-unlimited-parallel/) | `URL nesting` | All sibling spiders start immediately | None, intentionally preserves the duplicate race | Counts child callbacks, first error completes the parent | Error-first callback types |
| [`callback-v4-limited-parallel`](./chapter-4/spider-callback-v4-limited-parallel/) | `URL nesting concurrency` | Global callback task queue | URL `Set` before queueing | Queue `empty` and `error` events | `Task`, `TaskDoneCallback`, `TaskQueue` |
| [`promise-v2-sequential`](./chapter-5/spider-promise-v2-sequential/) | `URL nesting` | Recursive Promise chain, one child at a time | Filesystem cache only | Returned Promise fulfills or rejects | `Promise<SpiderResult>` |
| [`promise-v3-unlimited-parallel`](./chapter-5/spider-promise-v3-unlimited-parallel/) | `URL nesting` | Mapped child Promises joined by `Promise.all()` | URL `Set` before asynchronous work | Returned Promise, first rejection rejects the group | `Promise<SpiderResult>`, `Promise<void>[]` |
| [`promise-v4-limited-parallel`](./chapter-5/spider-promise-v4-limited-parallel-lazy-tasks/) | `URL nesting concurrency` | Lazy I/O tasks start when a slot is available | URL `Set` before asynchronous work | Producer Promise follows task fulfillment or rejection | `QueuedTask`, `runTask<T>()` |
| [`async-await-v2-sequential`](./chapter-5/spider-async-await-v2-sequential/) | `URL nesting` | `for...of` with `await` | Filesystem cache only | Async function return or thrown exception | `Promise<SpiderResult>` |
| [`async-await-v3-unlimited-parallel`](./chapter-5/spider-async-await-v3-unlimited-parallel/) | `URL nesting` | Mapped child spiders joined by `Promise.all()` | URL `Set` before asynchronous work | Awaited fulfillment or thrown rejection | `Promise<SpiderResult>` |
| [`async-await-v4-limited-parallel`](./chapter-5/spider-async-await-v4-limited-parallel-producer-consumer/) | `URL nesting concurrency` | Fixed number of sleeping consumers | URL `Set` before asynchronous work | Producer Promise follows queued task result | `Task<T>`, `QueuedTask`, `SleepingConsumer`, `TaskQueue` |
| [`callbacks-v3-no-race`](./edition-4-notes/callbacks-v3-no-race/) | `URL nesting` | Unlimited callback fan-out | `spidering` URL `Set` | Final error-first callback, duplicate path uses `process.nextTick()` | `SpiderResultCallback` |

## Chapter structure

```text
chapter-3/
  callback-exercises/
chapter-4/
  spider-callback-v1-single-page/
  spider-callback-v2-sequential/
  spider-callback-v3-unlimited-parallel/
  spider-callback-v4-limited-parallel/
chapter-5/
  spider-promise-v2-sequential/
  spider-promise-v3-unlimited-parallel/
  spider-promise-v4-limited-parallel-lazy-tasks/
  spider-async-await-v2-sequential/
  spider-async-await-v3-unlimited-parallel/
  spider-async-await-v4-limited-parallel-producer-consumer/
edition-4-notes/
  callbacks-v3-no-race/
```

Chapter 3 contains the callback-discipline prerequisites. The spider callback
implementations belong to Chapter 4. Promise and async/await implementations
belong to Chapter 5. Fourth-edition behavior remains separate from the 2020
third-edition snapshots.

## Validation

```bash
npm test
npm run typecheck
npm run build
git diff --check
```

The complete implementation and manual validation checklist is in
[`plan.md`](./plan.md).

## Source

This educational project is based on Chapters 3, 4, and 5 of:

> Mario Casciaro and Luciano Mammino. *Node.js Design Patterns: Design and
> Implement Production-Grade Node.js Applications Using Proven Patterns and
> Techniques*. Third Edition, Packt Publishing, 2020.

The original book and example code belong to their respective authors and
publisher. This repository contains independent TypeScript implementations for
study and practice.
