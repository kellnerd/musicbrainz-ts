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

export type EntityType = typeof entityTypes[number];

export type EntityPlural<T extends EntityType> =
  // Append a plural "s" to all entity types except "series".
  "series" extends T ? T
    : `${T}s`;
