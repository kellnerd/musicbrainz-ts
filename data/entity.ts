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
