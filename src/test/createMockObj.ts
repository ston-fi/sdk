type DeepPartialAny<T> = Partial<{
  [P in keyof T]: T[P] extends object ? DeepPartialAny<T[P]> : unknown;
}>;

export function createMockObj<T>(obj: DeepPartialAny<T> = {}): T {
  return {
    ...obj,
  } as T;
}
