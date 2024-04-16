/**
 * Common type definitions for MusicBrainz.
 *
 * These types are not API specific but also used in other contexts, for example
 * for entity editor seeding.
 *
 * @module
 */

/** ISO 8601 `YYYY-MM-DD` date, can be partial (`YYYY-MM` or `YYYY`). */
export type IsoDate =
  | `${number}-${number}-${number}`
  | `${number}-${number}`
  | `${number}`;

/** ISO 3166-1 (two letter), 3166-2 or 3166-3 (three letter) code of a country. */
export type IsoCountryCode = string;

/** ISO 639-3 (three letter) code of a language. */
export type IsoLanguageCode = string;

/** ISO 15924 (four letter) code of a script. */
export type IsoScriptCode = string;

/**
 * Language and optional territory and/or variant, separated by underscores:
 * - ISO 639 (two or three letters) language code
 * - ISO 3166-1 country code
 */
export type Locale = string;

/** MusicBrainz ID, a UUID (usually v4). */
export type MBID = string;
