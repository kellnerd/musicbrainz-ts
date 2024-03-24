import { assert } from "@std/assert/assert";
import { validate } from "@std/uuid";
import type { MBID } from "@/api_types.ts";
import {
  type EntityPlural,
  type EntityType,
  entityTypes,
} from "@/data/entity.ts";

/** Throws an error if the given input is not a valid MBID. */
export function assertMbid(input: string): void {
  return assert(validate(input), `${input} is not a valid MBID`);
}

/** Builds the plural form of the given entity type. */
export function entityPlural(type: EntityType): EntityPlural<EntityType> {
  return type === "series" ? type : `${type}s`;
}

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

const entityUrlPattern = new RegExp(
  `(${entityTypes.join("|")})/([0-9a-f-]{36})(?:$|/|\\?)`,
);
