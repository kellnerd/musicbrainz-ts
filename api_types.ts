import type { ArtistType, Gender } from "./data/artist.ts";
import type { CollectableEntityType, EntityPlural } from "./data/entity.ts";
import type {
  DataQuality,
  ReleasePackaging,
  ReleaseStatus,
} from "./data/release.ts";
import type {
  ReleaseGroupPrimaryType,
  ReleaseGroupSecondaryType,
} from "./data/release_group.ts";

/** MusicBrainz ID, a UUID (usually v4). */
export type MBID = string;

/** ISO 3166-1 (two letter), 3166-2 or 3166-3 (three letter) code of a country. */
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

/** Include parameters can be specified to request more information from the API. */
export type IncludeParameter = string;

/**
 * Helper type to mark a property of an entity as optional sub-query.
 * The additional {@linkcode Data} from a sub-query is only present in API
 * responses if the {@linkcode RequiredInclude} parameter is specified.
 *
 * Types which are using this helper have to be unwrapped again before usage,
 * {@linkcode UnwrapProperties} or {@linkcode WithIncludes} will do this.
 */
export type SubQuery<Data, RequiredInclude extends IncludeParameter> = {
  readonly __inc__: RequiredInclude;
  readonly __data__: Data;
};

/**
 * Keys of all properties which are included in {@linkcode Entity} for the given
 * {@linkcode Include} parameters.
 */
export type AvailableKeys<
  Entity extends object,
  Include extends IncludeParameter,
> = {
  [Key in keyof Entity]:
    // Check if the value is a sub-query (or potentially undefined) and infer its include type.
    Exclude<Entity[Key], undefined> extends
      SubQuery<infer _Data, infer RequiredInclude>
      // Return key if the required include parameter is specified.
      ? RequiredInclude extends Include ? Key : never
      // Always return the key of regular properties.
      : Key;
}[keyof Entity];

/** Applies the sub-query data unwrapping for all objects from the given data. */
type UnwrapData<Data, Include extends IncludeParameter> =
  // Each item of a data array has to be unwrapped individually.
  Data extends Array<infer Item extends object> ? WithIncludes<Item, Include>[]
    : Data extends object ? WithIncludes<Data, Include>
    // Leave scalar values alone, there is nothing to unwrap.
    : Data;

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
 * Recursively unwraps the data of all {@linkcode SubQuery} properties for which
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
      SubQuery<infer Data, infer RequiredInclude>
      // Unwrap the sub-query if the required include parameter is specified.
      ? RequiredInclude extends Include ? UnwrapData<Data, Include> : never
      // Always unwrap regular properties to find nested sub-queries.
      : UnwrapData<Entity[Key], Include>;
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
      Exclude<Entity[Key], undefined> extends
        SubQuery<infer Data, infer RequiredInclude>
        // Return the includes of the sub-query and collect those from its data.
        ? (RequiredInclude | CollectSubQueryIncludes<Data>)
        // Collect includes from all regular child properties.
        : CollectSubQueryIncludes<Entity[Key]>;
  }[StringKeyOf<Entity>], // Lookup the collected include value of each property.
  undefined // Optional entity properties will add `undefined` to the type.
>;

/** Maps entity type names to their type definitions. */
export type EntityTypeMap = {
  area: Area;
  artist: Artist;
  collection: Collection;
  event: MusicEvent;
  genre: Genre;
  instrument: Instrument;
  label: Label;
  place: Place;
  recording: Recording;
  release: Release;
  "release-group": ReleaseGroup;
  series: Series;
  work: Work;
  url: Url;
};

/** Maps entity type names to their minimal type definitions (for sub-queries). */
export type MinimalEntityTypeMap = {
  area: MinimalArea;
  artist: MinimalArtist;
  collection: MinimalCollection;
  event: MinimalEvent;
  genre: Genre;
  instrument: Instrument;
  label: MinimalLabel;
  place: MinimalPlace;
  recording: MinimalRecording;
  release: MinimalRelease;
  "release-group": MinimalReleaseGroup;
  series: MinimalSeries;
  work: MinimalWork;
  url: Url;
};

/** Properties which all entity types have in common. */
export interface EntityBase {
  /** MusicBrainz ID (MBID) of the entity. */
  id: MBID;
  // Aliases are always present unless a `$hide_aliases` flag is set by MBS.
  aliases?: SubQuery<Alias[], "aliases">;
  // Ratings are always present at the top-level (except for area, place, release and series).
  // They are only present in sub-queries if a `$force_ratings` flag is set by MBS.
  rating?: SubQuery<Rating[], "ratings">;
  "user-rating"?: SubQuery<UserRating[], "user-ratings">;
  // Tags and genres are always present unless a `$hide_tags_and_genres` flag is set by MBS.
  tags?: SubQuery<Tag[], "tags">;
  "user-tags"?: SubQuery<UserTag[], "user-tags">;
  genres?: SubQuery<GenreTag[], "genres">;
  "user-genres"?: SubQuery<GenreUserTag[], "user-genres">;
}

/** Properties which many entity types have in common. */
export interface MinimalEntity extends EntityBase {
  /** Name of the entity. */
  name: string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  type: string | null;
  "type-id": MBID | null;
}

/** Miscellaneous sub-query properties many entity types have in common. */
export interface MiscSubQueries {
  annotation: SubQuery<string | null, "annotation">;
}

export interface MinimalArea extends MinimalEntity {
  /** Sort name of the entity. */
  "sort-name": string;
  /** ISO 3166-1 country codes, for countries only. */
  "iso-3166-1-codes"?: IsoCountryCode[];
  "iso-3166-2-codes"?: IsoCountryCode[];
  "iso-3166-3-codes"?: IsoCountryCode[];
}

export interface Area extends MinimalArea, MiscSubQueries {
  "life-span": DatePeriod;
}

export interface MinimalArtist extends MinimalEntity {
  /** Sort name of the entity. */
  "sort-name": string;
  type: ArtistType | null; // override
}

export interface Artist extends MinimalArtist, MiscSubQueries {
  gender: Gender | null;
  "gender-id": MBID | null;
  area: MinimalArea | null;
  country: IsoCountryCode | null;
  "life-span": DatePeriod;
  "begin-area": MinimalArea | null;
  "end-area": MinimalArea | null;
  ipis: string[];
  isnis: string[];
  recordings: SubQuery<MinimalRecording[], "recordings">;
  releases: SubQuery<MinimalRelease[], "releases">;
  "release-groups": SubQuery<MinimalReleaseGroup[], "release-groups">;
  works: SubQuery<MinimalWork[], "works">;
}

export type MinimalCollection =
  & {
    id: MBID;
    name: string;
    editor: string;
    type: string;
    "type-id": MBID;
    "entity-type": CollectableEntityType;
  }
  & {
    [Key in `${CollectableEntityType}-count`]?: number;
  };

export type Collection =
  & MinimalCollection
  & {
    [Key in CollectableEntityType as EntityPlural<Key>]?:
      MinimalEntityTypeMap[Key][];
  };

export interface MinimalEvent extends MinimalEntity {
  time: string;
  setlist: string;
  cancelled: boolean;
}

export interface MusicEvent extends MinimalEvent, MiscSubQueries {
  "life-span": DatePeriod;
}

export interface Genre {
  // Does not extend EntityBase as no aliases can be included.
  /** MusicBrainz ID (MBID) of the entity. */
  id: MBID;
  /** Name of the corresponding tag (lower case). */
  name: string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
}

export interface Instrument extends MinimalEntity, MiscSubQueries {
  description: string;
}

export interface MinimalLabel extends MinimalEntity {
  /** Sort name of the entity. */
  "sort-name": string;
  "label-code": number | null;
}

export interface Label extends MinimalEntity, MiscSubQueries {
  country: IsoCountryCode | null;
  area: MinimalArea | null;
  "life-span": DatePeriod;
  ipis: string[];
  isnis: string[];
  releases: SubQuery<MinimalRelease[], "releases">;
}

export interface MinimalPlace extends MinimalEntity {
  address: string;
  area: MinimalArea | null;
  /** Coordinates of the place (floating point). */
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface Place extends MinimalPlace, MiscSubQueries {}

export interface MinimalRecording extends EntityBase {
  title: string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  /** Recording length in milliseconds (integer). */
  length: number;
  "first-release-date"?: IsoDate;
  video: boolean;
  "artist-credit": SubQuery<ArtistCredit[], "artist-credits">;
  isrcs: SubQuery<string[], "isrcs">;
}

export interface Recording extends MinimalRecording, MiscSubQueries {
  releases: SubQuery<MinimalRelease, "releases">;
}

interface CommonRelease extends EntityBase {
  /** Title of the release. */
  title: string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  date?: IsoDate; // null?
  country?: IsoCountryCode | null;
  /** Release dates and areas. */
  "release-events": ReleaseEvent[]; // null?
  /** Barcode of the release, can be empty (no barcode) or `null` (unset). */
  barcode: string | null;
  packaging: ReleasePackaging | null;
  "packaging-id": MBID | null;
  status: ReleaseStatus | null;
  "status-id": MBID | null;
  /** Language and script of title and tracklist. */
  "text-representation": {
    language: IsoLanguageCode | null;
    script: IsoScriptCode | null;
  };
  media: SubQuery<Medium[], "media" | "discids" | "recordings">;
  /** Data quality rating. */
  quality: DataQuality;
  "cover-art-archive"?: CoverArtArchiveInfo;
  "release-group": SubQuery<MinimalReleaseGroup, "release-groups">;
  collections: SubQuery<
    MinimalCollection[],
    "collections" | "user-collections"
  >;
}

export interface MinimalRelease extends CommonRelease {
  "artist-credit": SubQuery<ArtistCredit[], "artist-credits">;
}

export interface Release extends CommonRelease, MiscSubQueries {
  "artist-credit": SubQuery<ArtistCredit[], "artists" | "artist-credits">;
  "label-info": SubQuery<LabelInfo[], "labels">;
  /** Amazon ASIN. */
  asin: string | null;
}

export interface MinimalReleaseGroup extends EntityBase {
  title: string;
  disambiguation: string;
  "artist-credit": SubQuery<ArtistCredit[], "artists" | "artist-credits">;
  "primary-type": ReleaseGroupPrimaryType | null;
  "primary-type-id": MBID | null;
  "secondary-types": ReleaseGroupSecondaryType[];
  "secondary-type-ids": MBID[];
  "first-release-date": IsoDate | null; // null?
}

export interface ReleaseGroup extends EntityBase, MiscSubQueries {
  releases: SubQuery<MinimalRelease[], "releases">;
}

export type MinimalSeries = MinimalEntity;

export interface Series extends MinimalSeries, MiscSubQueries {}

export interface Url {
  // Does not extend EntityBase as no aliases can be included.
  id: MBID;
  resource: string;
}

export interface MinimalWork extends EntityBase {
  title: string;
  disambiguation: string;
  iswcs: string[];
  attributes: EntityAttribute[];
  languages: IsoLanguageCode[];
  /** @deprecated */
  language: IsoLanguageCode | null;
  type: string | null;
  "type-id": MBID | null;
}

export interface Work extends MinimalWork, MiscSubQueries {}

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
  artist: MinimalArtist;
  joinphrase: string;
}

export interface EntityAttribute {
  type: string;
  "type-id": MBID;
  value: string;
  "value-id"?: MBID;
}

export interface Medium {
  position: number;
  /** Medium title, can be empty. */
  title: string;
  "track-count": number;
  "track-offset": SubQuery<number, "recordings">;
  format: string | null;
  "format-id": MBID | null;
  pregap?: SubQuery<Track, "recordings">;
  tracks: SubQuery<Track[], "recordings">;
  "data-tracks"?: SubQuery<Track[], "recordings">;
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
  recording: SubQuery<MinimalRecording, "recordings">;
}

export interface ReleaseEvent {
  date: IsoDate; // null?
  area: MinimalArea | null; // null?
}

export interface LabelInfo {
  label: MinimalLabel | null;
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

export interface UserRating {
  /** Rating value in range 0 to 100. */
  value: number;
}

export interface Rating extends UserRating {
  /** Number of users which have rated the entity. */
  "votes-count": number;
}

export interface UserTag {
  /** Name of the tag (lower case). */
  name: string;
}

export interface Tag extends UserTag {
  /** Number of users which have used the tag for the entity. */
  count: number;
}

export type GenreUserTag = Genre;

export interface GenreTag extends GenreUserTag {
  /** Number of users which have used the genre tag for the entity. */
  count: number;
}
