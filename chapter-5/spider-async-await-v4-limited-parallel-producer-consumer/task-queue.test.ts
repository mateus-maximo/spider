import assert from 'node:assert/strict'
import test from 'node:test'
import { TaskQueue } from './task-queue.js'

test('starts queued work only when a consumer is available', async () => {
  let releaseFirstTask: () => void = () => undefined
  let secondTaskStarted = false
  const firstTaskGate = new Promise<void>((resolve) => {
    releaseFirstTask = resolve
  })
  const queue = new TaskQueue(1)

  const firstResult = queue.runTask(async () => {
    await firstTaskGate
    return 'first'
  })
  const secondResult = queue.runTask(async () => {
    secondTaskStarted = true
    return 'second'
  })

  await Promise.resolve()
  assert.equal(secondTaskStarted, false)

  releaseFirstTask()
  assert.equal(await firstResult, 'first')
  assert.equal(await secondResult, 'second')
})
