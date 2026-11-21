import { NOMINATIM_RATE_LIMIT_MS } from './constants.ts';

/**
 * Concurrency-Safe Serialized Rate Limiter Queue.
 * Enforces a strict minimum delay between consecutive outgoing requests.
 *
 * Note: This in-memory FIFO queue applies to the single active Node.js server process.
 */
export class SerializedRateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private readonly minIntervalMs: number;
  private lastExecutionTime = 0;

  constructor(intervalMs: number = NOMINATIM_RATE_LIMIT_MS) {
    this.minIntervalMs = intervalMs;
  }

  /**
   * Enqueues an asynchronous task to run sequentially after the required interval.
   */
  public enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const elapsed = Date.now() - this.lastExecutionTime;
    if (elapsed < this.minIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minIntervalMs - elapsed));
    }

    const currentTask = this.queue.shift();
    if (currentTask) {
      this.lastExecutionTime = Date.now();
      try {
        await currentTask();
      } catch {
        // Errors handled in task wrapper promise
      }
    }

    this.isProcessing = false;
    if (this.queue.length > 0) {
      this.processNext();
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}

export const nominatimRateLimiter = new SerializedRateLimiter(NOMINATIM_RATE_LIMIT_MS);
