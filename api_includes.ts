import type {
  Alias,
  Area,
  Artist,
  ArtistCredit,
  DiscId,
  LabelInfo,
  Medium,
  Recording,
  Release,
  Track,
} from "./api_types.ts";
import { type EntityType, entityTypes } from "./data/entity.ts";

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

/** Miscellaneous includes which can be used for (almost) all entity types. */
export const miscIncludes = [
  "aliases",
  "annotation",
  "tags",
  "genres",
  "ratings",
  // Tags/genres/ratings submitted by the specified user
  "user-tags",
  "user-genres",
  "user-ratings",
] as const;

// TODO: Filter genre (and maybe others?)
/** Load relationships between the requested entity and the specific entity type. */
export const relIncludes = entityTypes.map((type) => `${type}-rels`);

export type RelIncludes = `${EntityType}-rels`;

// TODO: Use values below once all include map types are complete
/** How much of the data about the linked entities should be included. */
export const subQueryIncludes = [
  // Disc IDs for all media
  "discids",
  // Media for all releases (number of tracks and format)
  "media",
  // ISRCs for all recordings
  "isrcs",
  "artist-credits",
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
  // Include only those releases where the artist appears on one of the tracks,
  // but not in the artist credit for the release itself.
  "various-artists",
] as const;

export type ArtistInclude = typeof possibleArtistIncludes[number];

export const possibleRecordingIncludes = [
  "artists", // TODO
  "releases", // TODO
  "release-groups", // TODO
  "isrcs", // TODO
  "artist-credits",
  ...miscIncludes,
] as const;

export type RecordingInclude = typeof possibleRecordingIncludes[number];

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

interface RecordingIncludeMap extends EntityIncludeMap<RecordingInclude> {
  aliases: { key: "aliases"; type: Alias[] };
  "artist-credits": { key: "artist-credit"; type: ArtistCredit[] };
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

export type RecordingWith<Includes extends RecordingInclude> =
  EntityWithIncludes<
    Recording,
    Includes,
    RecordingIncludeMap
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
