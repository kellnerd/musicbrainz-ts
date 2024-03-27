/**
 * Release group property values and their internal IDs.
 *
 * @module
 */

/** Primary release group type name to ID mapping. */
export const primaryTypeIds = {
  "Album": 1,
  "Single": 2,
  "EP": 3,
  "Broadcast": 12,
  "Other": 11,
};

/** Secondary release group type name to ID mapping. */
export const secondaryTypeIds = {
  "Audio drama": 11,
  "Audiobook": 5,
  "Compilation": 1,
  "Demo": 10,
  "DJ-mix": 8,
  "Field recording": 12,
  "Interview": 4,
  "Live": 6,
  "Mixtape/Street": 9,
  "Remix": 7,
  "Soundtrack": 2,
  "Spokenword": 3,
};

/** Primary type of a release group. */
export type ReleaseGroupPrimaryType = keyof typeof primaryTypeIds;

/** Secondary type of a release group. */
export type ReleaseGroupSecondaryType = keyof typeof secondaryTypeIds;

/** Type of a release group (primary or secondary). */
export type ReleaseGroupType =
  | ReleaseGroupPrimaryType
  | ReleaseGroupSecondaryType;
