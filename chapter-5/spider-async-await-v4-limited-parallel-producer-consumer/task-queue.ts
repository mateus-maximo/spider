export type Task<T> = () => Promise<T>

type QueuedTask = () => Promise<void>
type SleepingConsumer = (task: QueuedTask) => void

export class TaskQueue {
  private readonly taskQueue: QueuedTask[] = []
  private readonly consumerQueue: SleepingConsumer[] = []

  constructor(concurrency: number) {
    for (let consumerIndex = 0; consumerIndex < concurrency; consumerIndex++) {
      void this.consumer()
    }
  }

  runTask<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queuedTask: QueuedTask = async () => {
        try {
          resolve(await task())
        } catch (error) {
          reject(error)
        }
      }

      const sleepingConsumer = this.consumerQueue.shift()

      if (sleepingConsumer !== undefined) {
        sleepingConsumer(queuedTask)
        return
      }

      this.taskQueue.push(queuedTask)
    })
  }

  private async consumer(): Promise<void> {
    while (true) {
      const queuedTask = await this.getNextTask()
      await queuedTask()
    }
  }

  private getNextTask(): Promise<QueuedTask> {
    return new Promise((resolve) => {
      const queuedTask = this.taskQueue.shift()

      if (queuedTask !== undefined) {
        resolve(queuedTask)
        return
      }

      this.consumerQueue.push(resolve)
    })
  }
}
