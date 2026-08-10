# Spider

A learning project for practicing asynchronous programming patterns in Node.js while learning TypeScript.

This project follows the web spider application from *Node.js Design Patterns, Third Edition* by Mario Casciaro and Luciano Mammino. The book examples are written in JavaScript; this project reimplements them in TypeScript to practice both asynchronous control flow and static typing.

The goal is to implement each version presented in the book and understand how the same application changes when using:

- Error-first callbacks
- Sequential and parallel callback flows
- Promises
- Lazy Promise tasks
- Async/await
- Limited-concurrency task queues
- Typed callbacks, Promise results, and reusable task contracts

Each implementation is kept separately so the control flow, error propagation, and concurrency behavior can be compared directly.

## Learning goals

- Understand callback discipline and asynchronous error handling.
- Compare sequential, unlimited-parallel, and limited-parallel execution.
- Understand when Promise-based work starts and why task functions enable lazy execution.
- See how async/await changes syntax without replacing Promises.
- Practice controlling concurrency without blocking the Node.js event loop.
- Model callback signatures, queue tasks, errors, and spider options with TypeScript.
- Use strict type checking without hiding the asynchronous patterns behind abstractions.

## Setup

Initialize a Node.js project with TypeScript and a lightweight TypeScript runner:

```bash
npm init -y
npm install --save-dev typescript @types/node tsx
npx tsc --init
```

The project uses ESM, strict TypeScript checking, `tsx` for running `.ts` files directly during development, and `tsc --noEmit` for type checking.

## Project plan

See [plan.md](./plan.md) for the complete implementation sequence, tests, and learning checkpoints.

## Local practice website

Start the small local website used by the spider examples:

```bash
npm run manual-site
```

Open or crawl <http://127.0.0.1:8080/>. The site includes nested and duplicate
links, a response delayed by 1.5 seconds, and a missing page that returns 404.

## Source

This is an educational practice project based on Chapters 3, 4, and 5 of:

> Mario Casciaro and Luciano Mammino. *Node.js Design Patterns: Design and Implement Production-Grade Node.js Applications Using Proven Patterns and Techniques*. Third Edition, Packt Publishing, 2020.

The original book and example code belong to their respective authors and publisher. This repository contains independent TypeScript implementations created for study and practice.
