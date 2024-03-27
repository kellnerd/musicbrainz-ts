/**
 * Artist property values and their internal IDs.
 *
 * @module
 */

/** Artist type name to ID mapping. */
export const artistTypeIds = {
  "Person": 1,
  "Group": 2,
  "Choir": 6,
  "Orchestra": 5,
  "Character": 4,
  "Other": 3,
};

/** Type of an artist. */
export type ArtistType = keyof typeof artistTypeIds;

/** Gender name to ID mapping. */
export const genderIds = {
  "Male": 1,
  "Female": 2,
  "Non-binary": 5,
  "Not applicable": 4,
  "Other": 3,
};

/** Gender of an artist. */
export type Gender = keyof typeof genderIds;
