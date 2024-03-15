import type { ArtistCredit, LabelInfo, Medium, Release } from "./api_types.ts";

export const possibleReleaseIncludes = [
  "artists",
  "labels",
  "recordings",
] as const;

export type ReleaseInclude = typeof possibleReleaseIncludes[number];

interface ReleaseIncludeMap extends Record<ReleaseInclude, [string, unknown]> {
  artists: ["artist-credit", ArtistCredit[]];
  labels: ["label-info", LabelInfo[]];
  recordings: ["media", Medium[]];
}

export type ReleaseWith<Includes extends ReleaseInclude[] = []> =
  & Release
  & {
    [Include in Includes[number] as ReleaseIncludeMap[Include][0]]:
      ReleaseIncludeMap[Include][1];
  };
