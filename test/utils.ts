import { assertEquals } from "@std/assert/assert_equals";

/**
 * Returns a function which asserts whether the given function returns the
 * expected result for a set of given parameters.
 */
export function createFunctionAsserter<
  F extends (...params: any[]) => any,
>(func: F) {
  return (expectedResult: ReturnType<F>, ...params: Parameters<F>) =>
    assertEquals(func(...params), expectedResult);
}
