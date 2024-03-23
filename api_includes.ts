import type { RelatableEntityType } from "./data/entity.ts";

/** Include parameters can be specified to request more information from the API. */
export type IncludeParameter = string;

/**
 * Helper type to mark a property of an entity as optional sub-query.
 * The additional {@linkcode Data} from a sub-query is only present in API
 * responses if the {@linkcode RequiredInclude} parameter is specified.
 *
 * Types which are using this helper have to be unwrapped again before usage,
 * {@linkcode WithIncludes} or {@linkcode UnwrapProperties} will do this.
 */
export type $SubQuery<Data, RequiredInclude extends IncludeParameter> = {
  readonly __inc__: RequiredInclude;
  readonly __data__: Data;
};

/**
 * {@linkcode Entity} with additional information for the given include parameters.
 *
 * Recursively unwraps the data and removes unavailable properties.
 */
export type WithIncludes<
  Entity extends object,
  Include extends IncludeParameter,
> = Pick<
  UnwrapProperties<Entity, Include>,
  AvailableKeys<Entity, Include>
>;

/**
 * Keys of all properties which are included in {@linkcode Entity} for the given
 * {@linkcode Include} parameters.
 */
export type AvailableKeys<
  Entity extends object,
  Include extends IncludeParameter,
> = Exclude<
  {
    [Key in keyof Entity]:
      // Check if the value is a sub-query and infer its include type.
      // Exclude `undefined` from value to also detect optional sub-queries.
      Exclude<Entity[Key], undefined> extends
        $SubQuery<infer _Data, infer RequiredInclude>
        // Return key if the required include parameter is specified.
        ? RequiredInclude extends Include ? Key : never
        // Always return the key of regular properties.
        : Key;
  }[keyof Entity],
  // TS allows optional properties to be `undefined` by default, exclude it.
  undefined
>;

/**
 * Recursively unwraps the data of all {@linkcode $SubQuery} properties for which
 * the required {@linkcode Include} parameters have been specified and removes
 * all sub-queries (by replacing them with `never`) for which this is not the case.
 *
 * - Pass `never` as {@linkcode Include} to omit all sub-queries.
 * - Pass {@linkcode IncludeParameter} to include all sub-queries.
 */
export type UnwrapProperties<
  Entity extends object,
  Include extends IncludeParameter,
> = {
  // Process all properties (preserves optionality), keys still have to be filtered later.
  [Key in keyof Entity]:
    // Check if the value is a sub-query and infer its data and include type.
    Exclude<Entity[Key], undefined> extends
      $SubQuery<infer Data, infer RequiredInclude>
      // Unwrap the sub-query if the required include parameter is specified.
      ? RequiredInclude extends Include ? UnwrapData<Data, Include> : never
      // Always unwrap regular properties to find nested sub-queries.
      : UnwrapData<Entity[Key], Include>;
};

/** Applies the sub-query data unwrapping for all objects from the given data. */
type UnwrapData<Data, Include extends IncludeParameter> =
  // Skip empty arrays, they cause trouble when inferring their item type.
  Data extends never[] ? []
    // Each item of a data array has to be unwrapped individually (except primitives).
    : Data extends Array<infer Item>
    // Turn off distributivity to leave primitive union types alone.
      ? [Item] extends [string | number | undefined] ? Item[]
      : Item extends object ? WithIncludes<Item, Include>[]
      : Item[]
    : Data extends object ? WithIncludes<Data, Include>
    // Leave primitive values alone, there is nothing to unwrap.
    : Data;

/**
 * All possible include parameter values for the given {@linkcode Entity}.
 *
 * Recursively collects {@linkcode IncludeParameter} values which affect the
 * presence of sub-query properties from the given entity type and its children.
 */
export type CollectIncludes<Entity extends object> = Exclude<
  {
    [Key in keyof Entity]:
      // Check if the value is a sub-query and infer its data and include type.
      Exclude<Entity[Key], undefined> extends
        $SubQuery<infer Data, infer RequiredInclude>
        // Return the includes of the sub-query and collect those from its data.
        ? (RequiredInclude | CollectSubQueryIncludes<Data>)
        // Collect includes from all regular child properties.
        : CollectSubQueryIncludes<Entity[Key]>;
  }[StringKeyOf<Entity>], // Lookup the collected include value of each property.
  undefined // Optional entity properties will add `undefined` to the type.
>;

type StringKeyOf<T> = keyof T extends string ? keyof T : never;

/** Collects sub-query include parameters from all objects of the given data. */
type CollectSubQueryIncludes<Data> =
  // Collect includes of the items of a data array instead of the array itself.
  Data extends Array<infer Item extends object> ? CollectIncludes<Item>
    : Data extends object ? CollectIncludes<Data>
    // Leave scalar values alone, there is nothing to collect.
    : never;

/** Derives the possible relationship target entity types from the given include parameters. */
export type PossibleRelTargetType<Include extends IncludeParameter> =
  Include extends `${infer Type extends RelatableEntityType}-rels` ? Type
    : never;

/** Miscellaneous includes which can be used for (almost) all entity types. */
const miscIncludes = [
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

/** How much of the data about the linked entities should be included. */
const subQueryIncludes = [
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
