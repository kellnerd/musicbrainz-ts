import type { ArtistType, Gender } from "./data/artist.ts";
import type { ReleasePackaging, ReleaseStatus } from "./data/release.ts";

/** MusicBrainz ID, a UUID (usually v4). */
export type MBID = string;

/** ISO 3166-1 (two letter) code of a country. */
export type IsoCountryCode = string;

/** ISO 639 (three letter) code of a language. */
export type IsoLanguageCode = string;

/** ISO (four letter) code of a script. */
export type IsoScriptCode = string;

/** ISO 8601 `YYYY-MM-DD` date, can be partial (`YYYY-MM-DD` or `YYYY`). */
export type IsoDate = string;

/**
 * Language and optional territory and/or variant, separated by underscores:
 * - ISO 639 (two or three letters) language code
 * - ISO 3166-1 country code
 */
export type Locale = string;

export interface DatePeriod {
  begin: IsoDate | null;
  end: IsoDate | null;
  ended: boolean;
}

/**
 * Include parameters can be specified to request more information from the API. */
type IncludeParameter = string;

/**
 * Helper type to mark a property of an entity as optional sub-query.
 * The additional {@linkcode Data} from a sub-query is only present in API
 * responses if the {@linkcode RequiredInclude} parameter is specified.
 */
type SubQuery<
  Data extends object | object[],
  RequiredInclude extends IncludeParameter,
> = {
  readonly __inc__: RequiredInclude;
  readonly __data__: Data;
};

/**
 * Keys of all properties which are included in {@linkcode Entity} for the given
 * {@linkcode Include} parameters.
 */
type AvailableKeys<Entity extends object, Include extends IncludeParameter> = {
  [Key in keyof Entity]:
    // Check if the value is a sub-query and infer its include type.
    Entity[Key] extends SubQuery<infer _Data, infer RequiredInclude>
      // Return key if the required include parameter is specified.
      ? RequiredInclude extends Include ? Key : never
      // Always return the key of regular properties.
      : Key;
}[keyof Entity];

/** Applies the sub-query data unwrapping for all objects from the given data. */
type UnwrapSubQuery<Data, Include extends IncludeParameter> =
  // Each item of a data array has to be unwrapped individually.
  Data extends Array<infer Item extends object> ? WithIncludes<Item, Include>[]
    : Data extends object ? WithIncludes<Data, Include>
    // Leave scalar values alone, there is nothing to unwrap.
    : Data;

/**
 * {@linkcode Entity} with additional information for the given include parameters.
 *
 * Recursively unwraps the data of all {@linkcode SubQuery} properties for which
 * the required {@linkcode Include} parameters have been specified and removes
 * all sub-queries for which this is not the case.
 *
 * - Pass `never` as {@linkcode Include} to omit all sub-queries.
 * - Pass {@linkcode IncludeParameter} to include all sub-queries.
 */
export type WithIncludes<
  Entity extends object,
  Include extends IncludeParameter,
> = {
  // Process all properties and check whether they should be available.
  [Key in AvailableKeys<Entity, Include>]:
    // Check if the value is a sub-query and infer its data and include type.
    Entity[Key] extends SubQuery<infer Data, infer RequiredInclude>
      // Unwrap the sub-query if the required include parameter is specified.
      ? RequiredInclude extends Include ? UnwrapSubQuery<Data, Include> : never
      // Always unwrap regular properties to find nested sub-queries.
      : UnwrapSubQuery<Entity[Key], Include>;
};

type StringKeyOf<T> = keyof T extends string ? keyof T : never;

/** Collects sub-query include parameters from all objects of the given data. */
type CollectSubQueryIncludes<Data> =
  // Collect includes of the items of a data array instead of the array itself.
  Data extends Array<infer Item extends object> ? CollectIncludes<Item>
    : Data extends object ? CollectIncludes<Data>
    // Leave scalar values alone, there is nothing to collect.
    : never;

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
      Entity[Key] extends SubQuery<infer Data, infer RequiredInclude>
        // Return the includes of the sub-query and collect those from its data.
        ? (RequiredInclude | CollectSubQueryIncludes<Data>)
        // Collect includes from all regular child properties.
        : CollectSubQueryIncludes<Entity[Key]>;
  }[StringKeyOf<Entity>], // Lookup the collected include value of each property.
  undefined // Optional entity properties will add `undefined` to the type.
>;

/** Properties which all entity types have in common. */
export interface EntityBase {
  /** MusicBrainz ID (MBID) of the entity. */
  id: MBID;
  aliases: SubQuery<Alias[], "aliases">;
}

/** Properties which many entity types have in common. */
export interface MinimalEntity extends EntityBase {
  /** Name of the entity. */
  name: string;
  /** Sort name of the entity. */
  "sort-name": string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  type: string | null;
  "type-id": MBID | null;
}

export interface MinimalArea extends MinimalEntity {
  /** ISO 3166-1 country codes, for countries only. */
  "iso-3166-1-codes"?: IsoCountryCode[]; // null?
}

export interface Area extends MinimalArea {
  "life-span": DatePeriod;
}

export interface Artist extends MinimalEntity {
  type: ArtistType | null;
  gender: Gender | null;
  "gender-id": MBID | null;
  area: MinimalArea | null;
  country: IsoCountryCode;
  "life-span": DatePeriod;
  "begin-area": MinimalArea | null;
  "end-area": MinimalArea | null;
  ipis: string[];
  isnis: string[];
}

export interface Label extends MinimalEntity {
  "label-code": number | null;
}

export interface Recording extends EntityBase {
  title: string;
  "artist-credit": SubQuery<ArtistCredit[], "artist-credits">;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  /** Recording length in milliseconds (integer). */
  length: number;
  "first-release-date": IsoDate | null;
  video: boolean;
}

export interface Release extends EntityBase {
  /** Title of the release. */
  title: string;
  "artist-credit": SubQuery<ArtistCredit[], "artist-credits">;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  date: IsoDate; // null?
  country: IsoCountryCode; // null?
  /** Release dates and areas. */
  "release-events": ReleaseEvent[]; // null?
  /** Barcode of the release, can be empty. */
  barcode: string;
  "label-info": SubQuery<LabelInfo[], "labels">;
  packaging: ReleasePackaging | null;
  "packaging-id": MBID | null;
  status: ReleaseStatus; // null?
  "status-id": MBID; // null?
  /** Language and script of title and tracklist. */
  "text-representation": {
    language: IsoLanguageCode; // null?
    script: IsoScriptCode; // null?
  };
  media: SubQuery<Medium[], "recordings">;
  /** Data quality rating. */
  quality: DataQuality; // null?
  /** Amazon ASIN. */
  asin: string | null;
  "cover-art-archive": CoverArtArchiveInfo; // null?
}

// TODO: Type = "Search hint", "Legal name" etc. (depending on entity type)
export interface Alias<Type extends string = string> extends DatePeriod {
  name: string;
  "sort-name": string;
  type: Type | null;
  "type-id": MBID | null;
  locale: Locale | null;
  primary: boolean | null;
}

export interface ArtistCredit {
  name: string;
  artist: MinimalEntity;
  joinphrase: string;
}

export interface Medium {
  position: number;
  /** Medium title, can be empty. */
  title: string;
  "track-count": number;
  "track-offset": number;
  format: string; // null?
  "format-id": MBID; // null?
  tracks: Track[];
  discs: SubQuery<DiscId[], "discids">;
}

export interface DiscId {
  /** Base64 encoded disc ID. */
  id: string;
  /** Total number of sectors. */
  sectors: number;
  "offset-count": number;
  /** Offsets of the tracks in sectors. */
  offsets: number[];
}

export interface Track {
  id: MBID;
  position: number;
  number: string;
  title: string;
  "artist-credit": SubQuery<ArtistCredit[], "artist-credits">;
  /** Track length in milliseconds (integer). */
  length: number;
  recording: Recording;
}

export interface ReleaseEvent {
  date: IsoDate; // null?
  area: MinimalArea; // null?
}

export interface LabelInfo {
  label: Label;
  "catalog-number": string | null;
}

export interface CoverArtArchiveInfo {
  /** Number of available cover art images. */
  count: number;
  /** Release has artwork. */
  artwork: boolean;
  /** Release has front cover artwork. */
  front: boolean;
  /** Release has back cover artwork. */
  back: boolean;
  /** Cover art for this release has been disabled by a rights holder. */
  darkened: boolean;
}

/** TODO */
export type DataQuality = "normal" | "high";
