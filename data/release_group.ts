export const primaryTypeIds = {
  "Album": 1,
  "Single": 2,
  "EP": 3,
  "Broadcast": 12,
  "Other": 11,
};

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

/** Primary release group type. */
export type ReleaseGroupPrimaryType = keyof typeof primaryTypeIds;

/** Secondary release group type. */
export type ReleaseGroupSecondaryType = keyof typeof secondaryTypeIds;

/** Release group type (primary or secondary). */
export type ReleaseGroupType =
  | ReleaseGroupPrimaryType
  | ReleaseGroupSecondaryType;
