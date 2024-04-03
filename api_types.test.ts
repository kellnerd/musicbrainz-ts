import {
  AvailableKeys,
  CollectIncludes,
  WithIncludes,
} from "@/api_includes.ts";
import {
  $ReleaseGroup,
  Area,
  MinimalReleaseGroup,
  Recording,
  Relationship,
  ReleaseGroup,
} from "@/api_types.ts";
import { ReleaseGroupSecondaryType } from "@/data/release_group.ts";
import { Expect, ExpectNot, ToEqual } from "@/utils/type_utils.ts";

type WithAllIncludesToRemoveNoPropertyFrom<Entity extends object> = ToEqual<
  keyof Entity,
  AvailableKeys<Entity, string>
>;
type TestReleaseGroupWithAllIncludes = Expect<
  WithAllIncludesToRemoveNoPropertyFrom<$ReleaseGroup>
>;

type MinimalEntityMiscInclude =
  | "tags"
  | "user-tags"
  | "genres"
  | "user-genres"
  | "ratings"
  | "user-ratings";
type ReleaseGroupInclude =
  | "aliases"
  | "artist-credits"
  | "artists"
  | "releases"
  | MinimalEntityMiscInclude;
type TestMinimalReleaseGroupIncludeCollection = Expect<
  ToEqual<CollectIncludes<MinimalReleaseGroup>, ReleaseGroupInclude>
>;

type IncludesHaveNoEffectOnPrimitive = Expect<
  ToEqual<
    ReleaseGroup["disambiguation"],
    string
  >
>;

type IncludesHaveNoEffectOnPrimitiveArray = Expect<
  ToEqual<
    ReleaseGroup["secondary-types"],
    ReleaseGroupSecondaryType[]
  >
>;

type ActivatedInclude<RequiredInclude extends string, Include extends string> =
  ToEqual<RequiredInclude extends Include ? true : never, true>;
type TestNoIncludeGiven = ExpectNot<ActivatedInclude<"A", never>>;
type TestWrongIncludeGiven = ExpectNot<ActivatedInclude<"A", "X">>;
type TestExactMatchInclude = Expect<ActivatedInclude<"A", "A">>;
type TestExactMatchIncludeAndOthers = Expect<ActivatedInclude<"A", "A" | "X">>;
type TestAllPossibleIncludes = Expect<ActivatedInclude<"A", string>>;
type TestFullMatchInclude = Expect<ActivatedInclude<"A" | "B", "A" | "B">>;
type TestFullMatchIncludeAndOthers = Expect<
  ActivatedInclude<"A" | "B", "A" | "B" | "X">
>;
type TestPartialMatchInclude = Expect<ActivatedInclude<"A" | "B", "A">>;
type TestPartialMatchIncludeAndOthers = Expect<
  ActivatedInclude<"A" | "B", "A" | "X">
>;

type RecordingHasACForArtistsInclude = Recording<"artists">["artist-credit"];

type RecordingHasACForArtistCreditsInclude = Recording<
  "artist-credits"
>["artist-credit"];

type EntityRelsWithMixedTargetType = Area<
  "area-rels" | "url-rels"
>["relations"];
type RelsWithMixedTargetType = WithIncludes<
  Relationship<"area" | "url">,
  never
>[];
type TestRelsWithMixedTargetType = Expect<
  ToEqual<EntityRelsWithMixedTargetType, RelsWithMixedTargetType>
>;
