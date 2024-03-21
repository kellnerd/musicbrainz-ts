import { type EntityType, entityTypes } from "./data/entity.ts";

/** Miscellaneous includes which can be used for (almost) all entity types. */
export const miscIncludes = [
  "aliases",
  "annotation",
  "tags",
  "genres",
  "ratings",
  // Tags/genres/ratings submitted by the specified user
  "user-tags",
  "user-genres",
  "user-ratings",
] as const;

// TODO: Filter genre (and maybe others?)
/** Load relationships between the requested entity and the specific entity type. */
export const relIncludes = entityTypes.map((type) => `${type}-rels`);

export type RelIncludes = `${EntityType}-rels`;

/** How much of the data about the linked entities should be included. */
export const subQueryIncludes = [
  // Disc IDs for all media
  "discids",
  // Media for all releases (number of tracks and format)
  "media",
  // ISRCs for all recordings
  "isrcs",
  "artist-credits",
] as const;

const morePossibleArtistIncludes = [
  // Include only those releases where the artist appears on one of the tracks,
  // but not in the artist credit for the release itself.
  "various-artists",
] as const;
