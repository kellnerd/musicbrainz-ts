export const statusTypeIds = {
  "Official": 1,
  "Promotion": 2,
  "Bootleg": 3,
  "Pseudo-Release": 4,
  "Withdrawn": 5,
  "Cancelled": 6,
};

export const packagingTypeIds = {
  "Book": 9,
  "Box": 19,
  "Cardboard/Paper Sleeve": 4,
  "Cassette Case": 8,
  "Clamshell Case": 56,
  "Digibook": 17,
  "Digifile": 89,
  "Digipak": 3,
  "Discbox Slider": 13,
  "Fatbox": 10,
  "Gatefold Cover": 12,
  "Jewel Case": 1,
  "Keep Case": 6,
  "Longbox": 55,
  "Metal Tin": 54,
  "Plastic Sleeve": 18,
  "Slidepack": 20,
  "Slim Jewel Case": 2,
  "Snap Case": 11,
  "SnapPack": 21,
  "Super Jewel Box": 16,
  "Other": 5,
  "None": 7,
};

/** Status of a release. */
export type ReleaseStatus = keyof typeof statusTypeIds;

/** Packaging of a release. */
export type ReleasePackaging = keyof typeof packagingTypeIds;
