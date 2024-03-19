import { type EntityType, entityTypes } from "./data/entity.ts";
import type { MBID } from "./api_types.ts";

const entityUrlPattern = new RegExp(
  `(${entityTypes.join("|")})/([0-9a-f-]{36})(?:$|/|\\?)`,
);

/**
 * Extracts the entity type and MBID from a MusicBrainz URL.
 * The URL can be incomplete and have additional path components and query parameters.
 * @param url URL for a MusicBrainz entity.
 * @returns Type and ID.
 */
export function extractEntityFromUrl(
  url: string,
): [EntityType, MBID] | undefined {
  return url.match(entityUrlPattern)?.slice(1) as [EntityType, MBID];
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
