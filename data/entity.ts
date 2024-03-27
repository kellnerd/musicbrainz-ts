/**
 * Entity type names and categories.
 *
 * @module
 */

/** MusicBrainz core entity types which can be accessed via API. */
export const entityTypes = [
  "area",
  "artist",
  "collection",
  "event",
  "genre",
  "instrument",
  "label",
  "place",
  "recording",
  "release",
  "release-group",
  "series",
  "url",
  "work",
] as const;

/** MusicBrainz core entity type which can be accessed via API. */
export type EntityType = typeof entityTypes[number];

/** Plural form of the given entity type. */
export type EntityPlural<T extends EntityType> =
  // Append a plural "s" to all entity types except "series".
  T extends "series" ? T
    : `${T}s`;

/** Entity type which can be collected. */
export type CollectableEntityType = Exclude<
  EntityType,
  "collection" | "genre" | "url"
>;

/** Entity type which can have relationships. */
export type RelatableEntityType = Exclude<
  EntityType,
  "collection" | "genre"
>;
