import type { ReleasePackaging, ReleaseStatus } from "./data/release.ts";

/** MusicBrainz ID, a v4 UUID. */
export type MBID = string;

/** ISO 3166-1 (two letter) code of a country. */
export type IsoCountryCode = string;

/** ISO (three letter) code of a language. */
export type IsoLanguageCode = string;

/** ISO (four letter) code of a script. */
export type IsoScriptCode = string;

/** ISO 8601 `YYYY-MM-DD` date, can be partial (`YYYY-MM-DD` or `YYYY`). */
export type IsoDate = string;

/** Properties which all entity types have in common. */
export interface EntityBase {
  /** MusicBrainz ID (MBID) of the entity. */
  id: MBID;
}

export interface Area extends EntityBase {
  /** Name of the area. */
  name: string;
  /** Sort name of the area. */
  "sort-name": string;
	/** ISO 3166-1 country codes, for countries only. */
  "iso-3166-1-codes"?: IsoCountryCode[]; // null?
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  type: string | null;
  "type-id": MBID | null;
}

export interface Release extends EntityBase {
  /** Title of the release. */
  title: string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  date: IsoDate; // null?
  country: IsoCountryCode; // null?
	/** Release dates and areas. */
  "release-events": ReleaseEvent[]; // null?
  barcode: string | null;
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

export interface ReleaseEvent {
  date: IsoDate; // null?
  area: Area; // null?
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
