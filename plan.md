# Sprint Plan: Node.js Design Patterns Web Spider

**Status:** planned
**Primary source:** *Node.js Design Patterns*, Third Edition (2020), Chapters 3-5
**Goal:** implement every spider version in TypeScript to learn callbacks, Promises, async/await, concurrency, and TypeScript.

## Scope decisions

- Follow the 2020 third-edition sequence as the authoritative implementation path.
- Translate the book's JavaScript examples into strict TypeScript without changing their control-flow behavior.
- Chapter 3 supplies callback discipline and Zalgo prerequisites. The spider itself is developed in Chapters 4 and 5.
- Keep every meaningful version runnable. Do not overwrite the previous version.
- Duplicate the small spider implementation between versions on purpose. Do not create a shared abstraction that hides the callback, Promise, or async/await mechanics.
- Validate each version manually against a small local website.
- Do not recursively crawl public websites while learning.
- Implement the code yourself from the book. Compare with the official repository only after each milestone works.

## Deliverables

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
manual-site/
```

Each runnable version should contain its own `spider.ts`, `spider-cli.ts`, and any queue implementation it needs. Utilities and their types can be copied when that makes the evolution easier to compare.

## Definition of done

- [ ] All 11 third-edition spider snapshots run independently.
- [ ] The lazy-task Promise queue does not start work before a concurrency slot is available.
- [ ] Each family demonstrates sequential, unlimited-parallel, and limited-parallel crawling where the book does.
- [ ] Manual runs cover recursion depth, caching, error propagation, duplicate links, and concurrency behavior.
- [ ] The CLI for every final family version reports success and failure correctly.
- [ ] `npm run typecheck` passes with strict TypeScript checking.
- [ ] A comparison document records execution order, error flow, concurrency, typing, and readability differences.
- [ ] The fourth-edition duplicate-race update remains separate from the 2020 versions.

## Sprint backlog

### 0. Establish the TypeScript project

- [x] Record the installed Node.js and npm versions.
- [x] Keep the project ESM-based with `"type": "module"`.
- [x] Configure strict TypeScript for modern Node.js ESM.
- [x] Keep `build` and `typecheck` scripts in `package.json`.
- [x] Add only the runtime dependencies needed by the book examples.
- [x] Add `.gitignore` entries for dependencies, build output, and downloaded crawl output.
- [x] Define small types for spider results, callbacks, options, and queued tasks only when each version needs them.
- [x] Run `npm run typecheck` after every implementation step.

### 1. Build the local practice website

- [x] Create a small static website under `manual-site/`.
- [x] Add an index page linking to two child pages.
- [x] Add nested links for checking crawl depth.
- [x] Add duplicate links that converge on the same page.
- [x] Add a deliberately slow route or page for observing concurrency.
- [x] Add a missing or failing route for observing error propagation.
- [x] Serve it locally and record the command and URL in the README.
- [x] Keep the site small enough that downloaded files and request order can be inspected by hand.

### 2. Learn the Chapter 3 prerequisites

- [x] Trace one error-first callback by hand: caller, asynchronous operation, callback invocation, and return to the event loop.
- [x] Define an explicit TypeScript type for an error-first callback.
- [x] Reproduce a function that sometimes calls back synchronously and sometimes asynchronously.
- [x] Fix the synchronous path with `process.nextTick()` and manually observe that both paths become asynchronous.
- [x] Explain why `return callback(error)` prevents fall-through but does not return the asynchronous result to the original caller.

**Checkpoint:** explain error-first callbacks, callback discipline, and why empty or base paths use `process.nextTick()`.

### 3. Callback spider, version 1: nested callbacks

- [x] Implement URL-to-filename mapping.
- [x] Check whether the destination file exists.
- [x] Download the page, create its directory, and write the file using nested error-first callbacks.
- [x] Return `(error, filename, downloaded)` through a typed final callback.
- [x] Type filesystem errors, the HTTP response boundary, and CLI arguments without using `any`.
- [x] Add a CLI accepting a URL and reporting downloaded versus already available.
- [x] Manually run a new download, a cached download, and a failing URL.
- [x] Trace the four nested callback levels before refactoring them.

### 4. Callback spider, version 1 refactor: callback discipline

- [x] Refactor `chapter-4/spider-callback-v1-single-page/` without changing behavior.
- [x] Extract `saveFile()` and `download()` without changing behavior.
- [x] Give each extracted function one explicit callback type.
- [x] Replace nested `else` branches with early returns and immediate error propagation.
- [x] Run the same manual scenarios against both callback v1 implementations.
- [x] Record which nesting and duplicated error handling disappeared.

### 5. Callback spider, version 2: sequential recursion

- [x] Copy the refactored version into `chapter-4/spider-callback-v2-sequential/`.
- [x] Read cached HTML so its links can still be followed.
- [x] Implement page-link extraction and the `nesting === 0` base case.
- [x] Implement `spiderLinks()` with recursive `iterate(index)` so one child finishes before the next starts.
- [x] Manually run depth 0, depth 1, an empty page, a cached parent page, and a failing child link.
- [x] Use logs or the browser server output to confirm child requests happen sequentially.
- [x] Confirm empty and base paths remain asynchronous.

### 6. Callback spider, version 3: unlimited parallel execution

- [x] Copy callback v2 into `chapter-4/spider-callback-v3-unlimited-parallel/`.
- [x] Replace sequential iteration with parallel dispatch over every link.
- [x] Track completed tasks and call the final callback only after all links finish.
- [x] Stop final success after the first error and ensure the final callback is called once.
- [x] Use slow local pages and timestamps to observe overlapping requests.
- [x] Use converging duplicate links to observe the third-edition race risk. Preserve that behavior in this version.

### 7. Callback spider, version 4: limited parallel execution

- [x] Copy callback v3 into `chapter-4/spider-callback-v4-limited-parallel/`.
- [x] Implement a typed callback `TaskQueue` with `concurrency`, `running`, `queue`, `pushTask()`, and `next()`.
- [x] Ensure queued tasks start later, never exceed the limit, and continue after completion.
- [x] Emit `empty` only when both running and queued counts reach zero.
- [x] Split scheduling from `spiderTask()` execution.
- [x] Add a `Set` before scheduling to prevent the same URL from being queued twice.
- [x] Feed discovered links back into the same queue.
- [x] Make the CLI finish from the queue's `empty` event and report queue errors.
- [x] Run with concurrency 1, 2, and 4 while observing timestamps and downloaded files.

**Checkpoint:** compare sequential iteration, unlimited parallel fan-out, and limited parallel scheduling without using Promises.

### 8. Promise spider, version 2: sequential Promise chain

- [ ] Rewrite callback v2 in `chapter-5/spider-promise-v2-sequential/` instead of wrapping the whole callback implementation in one Promise.
- [ ] Use Promise-returning filesystem and HTTP operations.
- [ ] Implement download as a `.then()` chain that passes content to the next step.
- [ ] Type each Promise fulfillment value.
- [ ] Handle only the expected missing-file error locally and rethrow other errors.
- [ ] Build sequential link traversal by extending a Promise chain one link at a time.
- [ ] Manually run success, failure, cached-page, and nesting scenarios.
- [ ] Finish the CLI through one `.then(...).catch(...)` chain.

### 9. Promise spider, version 3: unlimited parallel execution

- [ ] Copy Promise v2 into `chapter-5/spider-promise-v3-unlimited-parallel/`.
- [ ] Map links to spider Promises and join them with `Promise.all()`.
- [ ] Add a `Set` so duplicate URLs are ignored before asynchronous work begins.
- [ ] Use timestamps to observe overlapping requests.
- [ ] Run a failing child URL and observe how the returned Promise rejects.
- [ ] Record that `Promise.all()` waits for work that has already started. It does not start the mapped requests.

### 10. Promise spider, version 4: limited parallel lazy tasks

- [ ] Copy Promise v3 into `chapter-5/spider-promise-v4-limited-parallel-lazy-tasks/`.
- [ ] Implement generic `runTask<T>(task: () => Promise<T>): Promise<T>`.
- [ ] Store functions that create Promises, not already-running Promises.
- [ ] Invoke each task function only when a concurrency slot becomes available.
- [ ] Forward fulfillment and rejection to the Promise returned by `runTask()`.
- [ ] Start the next queued task after a running task settles.
- [ ] Move file-read and download work inside the lazy task function.
- [ ] Keep recursive link discovery outside the limited I/O task so nested work can enqueue safely.
- [ ] Run with concurrency 1 and 2, using logs to confirm when each task function actually starts.

**Checkpoint:** explain Promise eagerness, why a function returning a Promise is lazy, and why queuing already-created Promises cannot limit their start time.

### 11. Async/await spider, version 2: sequential execution

- [ ] Rewrite Promise v2 in `chapter-5/spider-async-await-v2-sequential/` using `async` functions and `await`.
- [ ] Use `try/catch` only around the file read so only `ENOENT` triggers a download.
- [ ] Traverse links with `for...of` plus `await` to preserve sequential behavior.
- [ ] Inspect inferred Promise return types and add explicit public return types where useful.
- [ ] Run the same manual scenarios used for Promise v2.
- [ ] Trace where rejections become thrown exceptions.

### 12. Async/await spider, version 3: unlimited parallel execution

- [ ] Copy async/await v2 into `chapter-5/spider-async-await-v3-unlimited-parallel/`.
- [ ] Start child spiders with `map()` and await them with `Promise.all()`.
- [ ] Add duplicate suppression before asynchronous work begins.
- [ ] Use timestamps to observe overlapping requests, completion waiting, and failure propagation.
- [ ] Compare this version with Promise v3 and separate syntax changes from control-flow changes.

### 13. Async/await spider, version 4: limited parallel producer-consumer queue

- [ ] Copy async/await v3 into `chapter-5/spider-async-await-v4-limited-parallel-producer-consumer/`.
- [ ] Implement typed task and sleeping-consumer queues.
- [ ] Spawn the configured number of async consumers.
- [ ] Make idle consumers await the next task without polling.
- [ ] Wrap each task so its fulfillment or rejection settles the Promise returned to the producer.
- [ ] Run file-read and download work through the queue.
- [ ] Recursively enqueue discovered links.
- [ ] Run with different concurrency values and inspect start times, completion, duplicate suppression, and errors.
- [ ] Explain why the consumers' infinite loops do not perform busy waiting.

**Checkpoint:** compare Promise chaining and async/await while showing that both rely on Promises and the same scheduling rules.

### 14. Fourth-edition update: remove the callback v3 duplicate race

- [ ] Keep the third-edition callback v3 unchanged.
- [ ] Create `edition-4-notes/callbacks-v3-no-race/` from callback v3.
- [ ] Move duplicate suppression before file existence, read, and download work.
- [ ] Ensure duplicate URLs complete asynchronously so callback timing stays consistent.
- [ ] Run the converging-links scenario and confirm the shared target downloads once.
- [ ] Record the fourth edition's other modernization choices without mixing them into the 2020 versions.

### 15. Final comparison and manual validation

- [ ] Run each final CLI family version against the local practice website.
- [ ] Run every saved manual scenario once against its relevant version.
- [ ] Run `npm run typecheck`, the production build, lint, and `git diff --check`.
- [ ] Update `README.md` with usage commands.
- [ ] Create a version matrix with: style, traversal, concurrency, duplicate protection, completion signal, error propagation, and important types.
- [ ] Capture one execution trace from callback v2/v3/v4, Promise v2/v3/v4, and async/await v2/v3/v4.
- [ ] Write a short retrospective answering:
  - [ ] Where does asynchronous work start in each version?
  - [ ] What represents completion?
  - [ ] How does an error reach the CLI?
  - [ ] Which versions can overload a server and why?
  - [ ] Which version makes accidental sequential execution easiest?
  - [ ] Where did TypeScript prevent a real mistake?

## Suggested implementation rhythm

For each spider version:

1. Read only the relevant book section.
2. Predict the execution order before coding.
3. Implement one small behavior.
4. Run the type checker.
5. Execute the relevant scenario manually and inspect logs and downloaded files.
6. Trace the exact callback, Promise, or await flow.
7. Compare with the official JavaScript example only after your TypeScript version works.
8. Commit that version before copying it forward.

## Source map

- Third-edition official examples: <https://github.com/PacktPublishing/Node.js-Design-Patterns-Third-Edition>
- Callback spider sequence: `04-asynchronous-control-flow-patterns-with-callbacks/`
- Promise and async/await sequence: `05-asynchronous-control-flow-patterns-with-promises-and-async-await/`
- Fourth-edition official examples: <https://github.com/PacktPublishing/Node.js-Design-Patterns-Fourth-Edition>
- Current fourth edition: <https://www.packtpub.com/en-us/product/nodejs-design-patterns-9781803238944>
