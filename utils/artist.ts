/**
 * Artist utilities.
 *
 * @module
 */

import type { ArtistCredit } from "@/api_types.ts";

/** Combines the given artist credits into a string. */
export function joinArtistCredit<AC extends Omit<ArtistCredit, "artist">>(
  credits: AC[],
): string {
  return credits.flatMap((credit) => [credit.name, credit.joinphrase]).join("");
}
