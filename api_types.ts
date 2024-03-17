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
 * Optional sub-query which requests more information to be included.
 * Data is only present in API responses if the include parameter is specified.
 */
type SubQuery<Data, Include extends string> = {
  readonly __inc__: Include;
  readonly __data__: Data;
};

/** Object with additional information for the given include parameters. */
export type WithIncludes<T, Include extends string = never> =
  // Leave scalar values alone.
  T extends string | number | boolean | null ? T : {
    // Recursively obtain includes for all properties of the record or array.
    [Property in keyof T]: WithIncludes<
      // Detect values which are SubQuery wrappers.
      T[Property] extends SubQuery<infer Data, infer RequiredInclude>
        // Unwrap sub-query data if the required include parameter is given.
        ? RequiredInclude extends Include ? Data : undefined
        // Pass through normal values.
        : T[Property],
      Include
    >;
  };

/** Properties which all entity types have in common. */
export interface EntityBase {
  /** MusicBrainz ID (MBID) of the entity. */
  id: MBID;
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
  packaging: ReleasePackaging | null;
  "packaging-id": MBID | null;
  status: ReleaseStatus; // null?
  "status-id": MBID; // null?
  /** Language and script of title and tracklist. */
  "text-representation": {
    language: IsoLanguageCode; // null?
    script: IsoScriptCode; // null?
  };
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
