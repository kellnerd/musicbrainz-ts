/**
 * Release editor seeding helpers.
 *
 * @see https://musicbrainz.org/doc/Development/Release_Editor_Seeding
 *
 * @module
 */

import type {
  IsoCountryCode,
  IsoLanguageCode,
  IsoScriptCode,
  MBID,
  PartialDate,
} from "@/common_types.ts";
import type { ReleasePackaging, ReleaseStatus } from "@/data/release.ts";
import type { ReleaseGroupType } from "@/data/release_group.ts";

/**
 * Release editor seed.
 *
 * A flattened version of this object can be posted to the release editor.
 */
export interface ReleaseSeed {
  /** The name of the release. Non-empty string. Required. */
  name: string;
  /**
   * The MBID of an existing release group.
   *
   * Alternatively we can create a new release group which will have the name of
   * the release by listing its type(s).
   */
  release_group?: MBID;
  /**
   * The type(s) of the release group that will be created.
   *
   * This can be specified multiple times to select multiple secondary types,
   * though only one primary type should be specified (if you specify more than
   * one, only one will be set).
   */
  type?: ReleaseGroupType[];
  /** A disambiguation comment for the release. Non-empty string. */
  comment?: string;
  /** Text to place in the releases annotation (multi-line). */
  annotation?: string;
  /**
   * The barcode of the release.
   *
   * May be any valid barcode without whitespace.
   * To indicate there is no barcode, seed "none".
   */
  barcode?: string;
  /**
   * The language of the release.
   *
   * May be any valid ISO 639-3 code (for example: `eng`, `deu`, `jpn`).
   */
  language?: IsoLanguageCode;
  /**
   * The script of the text on the release.
   *
   * May be any valid ISO 15924 code (for example: `Latn`, `Cyrl`).
   */
  script?: IsoScriptCode;
  /** The status of the release, as defined by MusicBrainz. */
  status?: ReleaseStatus;
  /** The type of packaging of the release. */
  packaging?: ReleasePackaging;

  /**
   * A release can have zero, one or several release events.
   * Each release event is composed of a date and a country.
   * Any of the fields can be omitted or sent blank if unknown (so, you can
   * seed only the year and country, or only the month and day).
   */
  events?: ReleaseEventSeed[];

  /** Releases may be associated with multiple labels and catalog numbers. */
  labels?: ReleaseLabelSeed[];

  /** A release may be credited to multiple artists via an Artist Credit. */
  artist_credit?: ArtistCreditSeed;

  /** Tracklist data. */
  mediums?: MediumSeed[];

  /** You can seed a list of URLs to add as relationships to the release. */
  urls?: ReleaseUrlSeed[];

  /** Specify the content of the edit note (multi-line). */
  edit_note?: string;
  /**
   * A URI to redirect to after the release is submitted.
   *
   * The release's MBID will be added to this URI under the `release_mbid` query
   * parameter. E.g., if http://example.com/ is provided for this, the user will
   * be redirected to a URI like http://example.com/?release_mbid=4587fe99-db0e-4553-a56a-164dd38ab380.
   */
  redirect_uri?: string;
}

/** Release event of a release seed. */
export interface ReleaseEventSeed {
  /** The date of the release event. Each field is an integer. */
  date?: PartialDate;
  /**
   * The country of the release event.
   * May be any valid country ISO code (for example: `GB`, `US`, `FR`).
   */
  country?: IsoCountryCode;
}

/** Label and catalog number of a release seed. */
export interface ReleaseLabelSeed {
  /** The MBID of the label. */
  mbid?: MBID;
  /** The catalog number of this release, for the current label. */
  catalog_number?: string;
  /**
   * The name of the label (to prefill the field in order to search for the
   * label via the site interface).
   * If an MBID is present, this value is ignored.
   */
  name?: string;
}

/** Medium from a release seed. */
export interface MediumSeed {
  /**
   * Any valid medium format name.
   *
   * The possible values are the names of the medium formats, in English. */
  format?: string;
  /** The name of the medium (for example “Live & Unreleased”). */
  name?: string;
  track?: TrackSeed[];
}

/** Track from a release seed. */
export interface TrackSeed {
  /** The name of the track. */
  name?: string;
  /** The free-form track number. */
  number?: string;
  /**
   * The MBID of an existing recording in the database which should be
   * associated with the track.
   */
  recording?: MBID;
  /** The tracks duration, in MM:SS form or an integer as milliseconds. */
  length?: string | number;
  artist_credit?: ArtistCreditSeed;
}

/** Artist credit from a release seed. */
export type ArtistCreditSeed = {
  names: ArtistCreditNameSeed[];
};

/** Artist credit name element from a release seed. */
export interface ArtistCreditNameSeed {
  /**
   * The MBID of the artist.
   *
   * If omitted you will be able to either create the artist in the release
   * editor, or search MusicBrainz for this artist.
   */
  mbid?: MBID;
  /**
   * The name of the artist, as credited on the release.
   *
   * Optional, if omitted it will default to the artist’s current name.
   */
  name?: string;
  /**
   * The name of the artist as it is usually referred too (to prefill the
   * field in order to search for the artist via the site interface).
   * Unneeded if you already specified both credited name and MBID.
   */
  artist?: {
    name: string;
  };
  /**
   * An optional phrase to join this artist with the next artist.
   *
   * For example, you could use “ & ” to join “Calvin” with “Hobbes” to get the
   * final text “Calvin & Hobbes”.
   */
  join_phrase?: string;
}

/** URL from a release seed. */
export interface ReleaseUrlSeed {
  /** The URL to relate to. Non-empty string. */
  url: string;
  /**
   * The integer link type ID to use for the relationship.
   * Not required; if left blank, can be selected in the release editor.
   */
  link_type?: number;
}
