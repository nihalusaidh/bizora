export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function requestIdleCallbackCompat(
  callback: (deadline: IdleDeadline) => void,
  options?: { timeout?: number }
): number {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return (window as Window & { requestIdleCallback: (cb: (d: IdleDeadline) => void, opts?: { timeout?: number }) => number }).requestIdleCallback(callback, options);
  }
  return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 1) as unknown as number;
}

export function cancelIdleCallbackCompat(id: number): void {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map<string, unknown>();
  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
