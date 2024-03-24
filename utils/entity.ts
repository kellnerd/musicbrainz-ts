import { assert } from "https://deno.land/std@0.210.0/assert/assert.ts";
import { validate } from "https://deno.land/std@0.210.0/uuid/mod.ts";

/** Throws an error if the given input is not a valid MBID. */
export function assertMbid(input: string): void {
  return assert(validate(input), `${input} is not a valid MBID`);
}
