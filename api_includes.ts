import type {
  ArtistCredit,
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
  Includes extends IncludeParameter[],
  IncludeMap extends EntityIncludeMap<Includes[number]>,
> =
  & Entity
  & {
    [Include in Includes[number] as IncludeMap[Include]["key"]]:
      IncludeMap[Include]["type"];
  };

export const possibleReleaseIncludes = [
  "artists", // TODO
  "collections", // TODO
  "labels",
  "recordings",
  "release-groups", // TODO
  "artist-credits",
] as const;

export type ReleaseInclude = typeof possibleReleaseIncludes[number];

export const possibleTrackIncludes = [
  "artist-credits",
] as const;

export type TrackInclude = typeof possibleTrackIncludes[number];

interface ReleaseIncludeMap extends EntityIncludeMap<ReleaseInclude> {
  "artist-credits": { key: "artist-credit"; type: ArtistCredit[] };
  labels: { key: "label-info"; type: LabelInfo[] };
  recordings: { key: "media"; type: Medium[] };
}

interface TrackIncludeMap extends EntityIncludeMap<TrackInclude> {
  "artist-credits": { key: "artist-credit"; type: ArtistCredit[] };
}

export type ReleaseWith<Includes extends ReleaseInclude[] = []> =
  EntityWithIncludes<Release, Includes, ReleaseIncludeMap>;

export type TrackWith<Includes extends TrackInclude[] = []> =
  EntityWithIncludes<Track, Includes, TrackIncludeMap>;
