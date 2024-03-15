export const artistTypeIds = {
  "Person": 1,
  "Group": 2,
  "Choir": 6,
  "Orchestra": 5,
  "Character": 4,
  "Other": 3,
};

export type ArtistType = keyof typeof artistTypeIds;

export const genderIds = {
  "Male": 1,
  "Female": 2,
  "Non-binary": 5,
  "Not applicable": 4,
  "Other": 3,
};

export type Gender = keyof typeof genderIds;
