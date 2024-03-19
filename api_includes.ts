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

// TODO: Use values below once all include map types are complete
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

export const possibleAreaIncludes = [
  ...miscIncludes,
] as const;

export type AreaInclude = typeof possibleAreaIncludes[number];

export const possibleArtistIncludes = [
  "recordings", // TODO
  "releases", // TODO
  "release-groups", // TODO
  "works", // TODO
  ...miscIncludes,
  // Include only those releases where the artist appears on one of the tracks,
  // but not in the artist credit for the release itself.
  "various-artists",
] as const;

export type ArtistInclude = typeof possibleArtistIncludes[number];

export const possibleRecordingIncludes = [
  "artists", // TODO
  "releases", // TODO
  "release-groups", // TODO
  "isrcs", // TODO
  "artist-credits",
  ...miscIncludes,
] as const;

export type RecordingInclude = typeof possibleRecordingIncludes[number];

export const possibleReleaseIncludes = [
  "artists", // TODO
  "collections", // TODO
  "labels",
  "recordings",
  "release-groups", // TODO
  "artist-credits",
  "discids",
  ...miscIncludes,
] as const;

export type ReleaseInclude = typeof possibleReleaseIncludes[number];

export const possibleMediumIncludes = [
  "discids",
] as const;

export type MediumInclude = typeof possibleMediumIncludes[number];

export const possibleTrackIncludes = [
  "artist-credits",
] as const;

export type TrackInclude = typeof possibleTrackIncludes[number];
