import type {
  Alias,
  Area,
  Artist,
  ArtistCredit,
  DiscId,
  LabelInfo,
  Medium,
  Release,
  Track,
} from "./api_types.ts";

/** Include parameter which requests more data about an entity. */
type IncludeParameter = string;

/** Maps an include parameter to the key and the type of the data which it includes. */
type EntityIncludeMap<Include extends IncludeParameter> = Record<
  Include,
  { key: string; type: unknown }
>;

/** Entity which includes data for the given include parameters. */
type EntityWithIncludes<
  Entity extends object,
  Includes extends IncludeParameter,
  IncludeMap extends EntityIncludeMap<Includes>,
> =
  & Entity
  & {
    // Map each possible value of Includes to its corresponding property key.
    [Include in Includes as IncludeMap[Include]["key"]]:
      // Map the include value to the type of the corresponding property value.
      IncludeMap[Include]["type"];
  };

export const miscIncludes = [
  "aliases",
] as const;

export const possibleAreaIncludes = [
  ...miscIncludes,
] as const;

export type AreaInclude = typeof possibleAreaIncludes[number];

export const possibleArtistIncludes = [
  "recordings", // TODO
  "releases", // TODO
  "release-groups", // TODO
  "works", // TODO
  ...miscIncludes,
] as const;

export type ArtistInclude = typeof possibleArtistIncludes[number];

export const possibleReleaseIncludes = [
  "artists", // TODO
  "collections", // TODO
  "labels",
  "recordings",
  "release-groups", // TODO
  "artist-credits",
  "discids",
  ...miscIncludes,
] as const;

export type ReleaseInclude = typeof possibleReleaseIncludes[number];

export const possibleMediumIncludes = [
  "discids",
] as const;

export type MediumInclude = typeof possibleMediumIncludes[number];

export const possibleTrackIncludes = [
  "artist-credits",
] as const;

export type TrackInclude = typeof possibleTrackIncludes[number];

interface AreaIncludeMap extends EntityIncludeMap<AreaInclude> {
  aliases: { key: "aliases"; type: Alias[] };
}

interface ArtistIncludeMap extends EntityIncludeMap<ArtistInclude> {
  aliases: { key: "aliases"; type: Alias[] };
}

interface ReleaseIncludeMap extends EntityIncludeMap<ReleaseInclude> {
  aliases: { key: "aliases"; type: Alias[] };
  "artist-credits": { key: "artist-credit"; type: ArtistCredit[] };
  labels: { key: "label-info"; type: LabelInfo[] };
  recordings: { key: "media"; type: Medium[] };
}

interface MediumIncludeMap extends EntityIncludeMap<MediumInclude> {
  "discids": { key: "discs"; type: DiscId[] };
}

interface TrackIncludeMap extends EntityIncludeMap<TrackInclude> {
  "artist-credits": { key: "artist-credit"; type: ArtistCredit[] };
}

export type AreaWith<Includes extends AreaInclude> = EntityWithIncludes<
  Area,
  Includes,
  AreaIncludeMap
>;

export type ArtistWith<Includes extends ArtistInclude> = EntityWithIncludes<
  Artist,
  Includes,
  ArtistIncludeMap
>;

export type ReleaseWith<Includes extends ReleaseInclude> = EntityWithIncludes<
  Release,
  Includes,
  ReleaseIncludeMap
>;

export type MediumWith<Includes extends MediumInclude> = EntityWithIncludes<
  Medium,
  Includes,
  MediumIncludeMap
>;

export type TrackWith<Includes extends TrackInclude> = EntityWithIncludes<
  Track,
  Includes,
  TrackIncludeMap
>;
