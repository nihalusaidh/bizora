import {
  debounce,
  throttle,
  memoize,
} from "@/lib/perf";

describe("Performance Utils", () => {
  describe("debounce", () => {
    beforeEach(() => { jest.useFakeTimers(); });
    afterEach(() => { jest.useRealTimers(); });

    it("delays execution", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced();
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("cancels previous call", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced();
      debounced();
      debounced();
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("throttle", () => {
    beforeEach(() => { jest.useFakeTimers(); });
    afterEach(() => { jest.useRealTimers(); });

    it("limits execution", () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      throttled();
      throttled();
      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("memoize", () => {
    it("caches results", () => {
      const fn = jest.fn((x: number) => x * 2);
      const memoized = memoize(fn);
      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("handles different args", () => {
      const fn = jest.fn((x: number) => x * 2);
      const memoized = memoize(fn);
      expect(memoized(5)).toBe(10);
      expect(memoized(10)).toBe(20);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
