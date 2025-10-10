export class AbortedPromiseError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AbortedPromiseError";
  }
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const promiseWithSignal = async <T = unknown>(
  promise: Promise<T>,
  signal: AbortSignal,
  reason = new AbortedPromiseError("Aborted"),
) => {
  if (signal.aborted) {
    throw reason;
  }

  const result = await Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      signal.addEventListener("abort", () => reject(reason));
    }),
  ]);

  return result;
};
