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

/** Builds the plural form of the given entity type. */
export function entityPlural(type: EntityType): EntityPlural<EntityType> {
  return type === "series" ? type : `${type}s`;
}

export type EntityPlural<T extends EntityType> =
  // Append a plural "s" to all entity types except "series".
  T extends "series" ? T
    : `${T}s`;

export type SnakeCase<KebabCase extends string> = KebabCase extends
  `${infer A}-${infer B}` ? `${A}_${SnakeCase<B>}` : KebabCase;

export type CollectableEntityType = Exclude<
  EntityType,
  "collection" | "genre" | "url"
>;

export type RelatableEntityType = Exclude<
  EntityType,
  "collection" | "genre"
>;
