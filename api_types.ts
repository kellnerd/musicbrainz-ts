/**
 * Type definitions for MusicBrainz API results.
 *
 * @module
 */

import type {
  $SubQuery,
  CollectIncludes,
  IncludeParameter,
  PossibleRelTargetType,
  WithIncludes,
} from "./api_includes.ts";
import type { ArtistType, Gender } from "./data/artist.ts";
import type {
  CollectableEntityType,
  EntityPlural,
  RelatableEntityType,
} from "./data/entity.ts";
import type {
  DataQuality,
  ReleasePackaging,
  ReleaseStatus,
} from "./data/release.ts";
import type {
  ReleaseGroupPrimaryType,
  ReleaseGroupSecondaryType,
} from "./data/release_group.ts";
import type { SnakeCase } from "./utils/type_utils.ts";

/** MusicBrainz ID, a UUID (usually v4). */
export type MBID = string;

/** ISO 3166-1 (two letter), 3166-2 or 3166-3 (three letter) code of a country. */
export type IsoCountryCode = string;

/** ISO 639-3 (three letter) code of a language. */
export type IsoLanguageCode = string;

/** ISO 15924 (four letter) code of a script. */
export type IsoScriptCode = string;

/** ISO 8601 `YYYY-MM-DD` date, can be partial (`YYYY-MM` or `YYYY`). */
export type IsoDate =
  | `${number}-${number}-${number}`
  | `${number}-${number}`
  | `${number}`;

/**
 * Language and optional territory and/or variant, separated by underscores:
 * - ISO 639 (two or three letters) language code
 * - ISO 3166-1 country code
 */
export type Locale = string;

/**
 * Maps entity type names to their type definitions.
 *
 * Accepts any include parameters, but only passes the supported
 * include parameters to each entity type.
 */
export type EntityTypeMap<Include extends AnyInclude> = {
  area: Area<Include extends AreaInclude ? Include : never>;
  artist: Artist<Include extends ArtistInclude ? Include : never>;
  collection: Collection<Include extends CollectionInclude ? Include : never>;
  event: Event<Include extends EventInclude ? Include : never>;
  genre: Genre<Include extends GenreInclude ? Include : never>;
  instrument: Instrument<Include extends InstrumentInclude ? Include : never>;
  label: Label<Include extends LabelInclude ? Include : never>;
  place: Place<Include extends PlaceInclude ? Include : never>;
  recording: Recording<Include extends RecordingInclude ? Include : never>;
  release: Release<Include extends ReleaseInclude ? Include : never>;
  "release-group": ReleaseGroup<
    Include extends ReleaseGroupInclude ? Include : never
  >;
  series: Series<Include extends SeriesInclude ? Include : never>;
  work: Work<Include extends WorkInclude ? Include : never>;
  url: Url<Include extends UrlInclude ? Include : never>;
};

/** Maps entity type names to their possible include parameter value types. */
export type EntityIncludeMap = {
  area: AreaInclude;
  artist: ArtistInclude;
  collection: CollectionInclude;
  event: EventInclude;
  genre: GenreInclude;
  instrument: InstrumentInclude;
  label: LabelInclude;
  place: PlaceInclude;
  recording: RecordingInclude;
  release: ReleaseInclude;
  "release-group": ReleaseGroupInclude;
  series: SeriesInclude;
  work: WorkInclude;
  url: UrlInclude;
};

/** Maps entity type names to their minimal type definitions (for sub-queries). */
export type MinimalEntityTypeMap = {
  area: MinimalArea;
  artist: MinimalArtist;
  event: MinimalEvent;
  genre: $Genre;
  instrument: MinimalInstrument;
  label: MinimalLabel;
  place: MinimalPlace;
  recording: MinimalRecording;
  release: MinimalRelease;
  "release-group": MinimalReleaseGroup;
  series: MinimalSeries;
  work: MinimalWork;
  url: $Url;
};

/** Entity with an MBID. */
export interface EntityWithMbid {
  /** MusicBrainz ID (MBID) of the entity. */
  id: MBID;
}

/** Properties which most entity types have in common. */
export interface MinimalEntity extends EntityWithMbid {
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  /**
   * Alias names of the entity.
   *
   * Always present unless a `$hide_aliases` flag is set by MBS.
   */
  aliases?: $SubQuery<Alias[], "aliases">;
  /**
   * Rating of the entity.
   *
   * Always present at the top-level, except for area, place, release and series.
   * They are only present in sub-queries if a `$force_ratings` flag is set by MBS.
   */
  rating?: $SubQuery<Rating, "ratings">;
  "user-rating"?: $SubQuery<UserRating, "user-ratings">;
  /**
   * Tags of the entity.
   *
   * Always present unless a `$hide_tags_and_genres` flag is set by MBS.
   */
  tags?: $SubQuery<Tag[], "tags">;
  "user-tags"?: $SubQuery<UserTag[], "user-tags">;
  /**
   * Genres of the entity.
   *
   * Always present unless a `$hide_tags_and_genres` flag is set by MBS.
   */
  genres?: $SubQuery<GenreTag[], "genres">;
  "user-genres"?: $SubQuery<GenreUserTag[], "user-genres">;
}

/** Entity which has a name and a sort name. */
export interface WithSortName {
  /** Name of the entity. */
  name: string;
  /** Sort name of the entity. */
  "sort-name": string;
}

/** Entity type can have a more specific subtype. */
export interface WithType<Type extends string = string> {
  /** Subtype of the entity. */
  type: Type | null;
  /** MBID of the entity's {@linkcode type}. */
  "type-id": MBID | null;
}

/** Entity type can have an annotation. */
export interface WithAnnotation {
  /** Annotation text of the entity. */
  annotation: $SubQuery<string | null, "annotation">;
}

/** Entity type can have relationships to other entities. */
export interface WithRels<
  Include extends IncludeParameter = IncludeParameter,
> {
  /** Relationships to other entities. */
  relations: $SubQuery<
    Relationship<PossibleRelTargetType<Include>>[],
    RelInclude
  >;
}

export interface MinimalArea extends MinimalEntity, WithSortName, WithType {
  /** ISO 3166-1 country codes, for countries only. */
  "iso-3166-1-codes"?: IsoCountryCode[];
  /** ISO 3166-2 codes for subdivisions of countries. */
  "iso-3166-2-codes"?: IsoCountryCode[];
  /** ISO 3166-3 historical country codes. */
  "iso-3166-3-codes"?: IsoCountryCode[];
}

export interface $Area<
  Include extends IncludeParameter = IncludeParameter,
> extends MinimalArea, WithAnnotation, WithRels<Include> {
  /** Date period of the area's existence. */
  "life-span": DatePeriod;
}

export interface MinimalArtist
  extends MinimalEntity, WithSortName, WithType<ArtistType> {}

export interface $Artist<
  Include extends IncludeParameter = IncludeParameter,
> extends MinimalArtist, WithAnnotation, WithRels<Include> {
  /** Gender the artist identifies with. */
  gender: Gender | null;
  /** MBID of the {@linkcode gender}. */
  "gender-id": MBID | null;
  /** Main area the artist identifies with. */
  area: MinimalArea | null;
  /** Country the artist identifies with, derived from {@linkcode area}. */
  country: IsoCountryCode | null;
  /** Date of birth and death for persons, period of existence for groups. */
  "life-span": DatePeriod;
  /** Place of birth for persons, place of formation for groups. */
  "begin-area": MinimalArea | null;
  /** @deprecated See [MBS-10826](https://tickets.metabrainz.org/browse/MBS-10826). */
  "begin_area"?: MinimalArea | null;
  /** Place of death for persons, place of dissolution for groups. */
  "end-area": MinimalArea | null;
  /** @deprecated See [MBS-10826](https://tickets.metabrainz.org/browse/MBS-10826). */
  "end_area"?: MinimalArea | null;
  /** Interested Parties Information (IPI) codes. */
  ipis: string[];
  /** International Standard Name Identifier (ISNI) codes. */
  isnis: string[];
  /** Recordings which are credited to this artist. */
  recordings: $SubQuery<MinimalRecording[], "recordings">;
  /** Releases which are credited to this artist. */
  releases: $SubQuery<MinimalRelease[], "releases">;
  /** Release groups which are credited to this artist. */
  "release-groups": $SubQuery<MinimalReleaseGroup[], "release-groups">;
  /** Works which were created or performed by this artist. */
  works: $SubQuery<MinimalWork[], "works">;
}

export interface CollectionBase<
  ContentType extends CollectableEntityType,
> extends EntityWithMbid {
  /** Name of the collection. */
  name: string;
  /** Owner of the collection. */
  editor: string;
  /** Type of the collection. */
  type: string;
  /** MBID of the collection {@linkcode type}. */
  "type-id": MBID;
  /** Type of the collected entities. */
  "entity-type": SnakeCase<ContentType>;
}

export type MinimalCollectionTypeMap = {
  [ContentType in CollectableEntityType]:
    & {
      /** Number of collected entities in the collection. */
      [Key in `${ContentType}-count`]: number;
    }
    & CollectionBase<ContentType>;
};

export type MinimalCollection<
  ContentType extends CollectableEntityType = CollectableEntityType,
> = MinimalCollectionTypeMap[ContentType];

export type CollectionTypeMap = {
  [ContentType in CollectableEntityType]:
    & {
      /** Collected entities. */
      [Key in ContentType as EntityPlural<Key>]: MinimalEntityTypeMap[Key][];
    }
    & MinimalCollection<ContentType>;
};

export type CollectionWithContents<
  ContentType extends CollectableEntityType = CollectableEntityType,
> = WithIncludes<CollectionTypeMap[ContentType], never>;

export interface MinimalEvent extends MinimalEntity, WithType {
  /** Official (or descriptive) name of the event. */
  name: string;
  /** Start time of the event. */
  time: string;
  /**
   * List of songs performed, optionally including links to artists and works.
   *
   * [Documentation of the syntax](https://wiki.musicbrainz.org/Event/Setlist)
   */
  setlist: string;
  /** Indicates whether the event took place or not. */
  cancelled: boolean;
}

export interface $Event<
  Include extends IncludeParameter = IncludeParameter,
> extends MinimalEvent, WithAnnotation, WithRels<Include> {
  /** Indicates when the event started and finished. */
  "life-span": DatePeriod;
}

export interface $Genre extends EntityWithMbid {
  /** Name of the corresponding tag (lower case). */
  name: string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
}

export interface MinimalInstrument extends MinimalEntity, WithType {
  /** Name of the instrument. */
  name: string;
  /** Brief description of the main characteristics of the instrument. */
  description: string;
}

export interface $Instrument<
  Include extends IncludeParameter = IncludeParameter,
> extends MinimalInstrument, WithAnnotation, WithRels<Include> {}

export interface MinimalLabel extends MinimalEntity, WithSortName, WithType {
  /** Label code (LC) of the record label. */
  "label-code": number | null;
}

export interface $Label<
  Include extends IncludeParameter = IncludeParameter,
> extends MinimalLabel, WithAnnotation, WithRels<Include> {
  /** Area of origin. */
  area: MinimalArea | null;
  /** Country of origin, derived from {@linkcode area}. */
  country: IsoCountryCode | null;
  /** Date period of the labels existence. */
  "life-span": DatePeriod;
  /** Interested Parties Information (IPI) codes. */
  ipis: string[];
  /** International Standard Name Identifier (ISNI) codes. */
  isnis: string[];
  /** Releases which were released under this imprint/label. */
  releases: $SubQuery<MinimalRelease[], "releases">;
}

export interface MinimalPlace extends MinimalEntity, WithType {
  /** Official name of the place. */
  name: string;
  /** Address of the place (using the standard format for its country). */
  address: string;
  /** Area in which the place is located. */
  area: MinimalArea | null;
  /** Geographic coordinates of the place (floating point). */
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface $Place<
  Include extends IncludeParameter = IncludeParameter,
> extends MinimalPlace, WithAnnotation, WithRels<Include> {}

export interface RecordingBase extends MinimalEntity {
  /** Title of the recording. */
  title: string;
  /** Recording length in milliseconds (integer). */
  length: number | null;
  /**
   * Release date of the earliest release which contains the recording.
   * Missing for standalone recordings or if no release has a date.
   */
  "first-release-date"?: IsoDate;
  /** Indicates whether the recording is a video. */
  video: boolean;
  /** International Standard Recording Code (ISRC) codes. */
  isrcs: $SubQuery<string[], "isrcs">;
}

export interface MinimalRecording extends RecordingBase {
  /** The artist(s) that the recording is primarily credited to. */
  "artist-credit": $SubQuery<ArtistCredit[], "artist-credits">;
}

export interface MinimalRecordingWithRels extends MinimalRecording {
  /** Relationships to other entities. */
  relations: $SubQuery<Relationship[], "recording-level-rels">;
}

export interface $Recording<
  Include extends IncludeParameter = IncludeParameter,
> extends RecordingBase, WithAnnotation, WithRels<Include> {
  /** The artist(s) that the recording is primarily credited to. */
  "artist-credit": $SubQuery<ArtistCredit[], "artists" | "artist-credits">;
  /** Releases which feature this recording. */
  releases: $SubQuery<MinimalReleaseForRecording[], "releases">;
}

export interface ReleaseBase extends MinimalEntity {
  /** Title of the release. */
  title: string;
  /** Date from the earliest release event. */
  date?: IsoDate;
  /** Country from the earliest release event. */
  country?: IsoCountryCode | null;
  /** All release events with dates and countries. */
  "release-events"?: ReleaseEvent[];
  /** Barcode of the release, can be empty (no barcode) or `null` (unset). */
  barcode: string | null;
  /** Outermost physical packaging that the release is sold or distributed in. */
  packaging: ReleasePackaging | null;
  /** MBID of the {@linkcode packaging}. */
  "packaging-id": MBID | null;
  /** Status of the release. */
  status: ReleaseStatus | null;
  /** MBID of the {@linkcode status}. */
  "status-id": MBID | null;
  /** Language and script used for the tracklist. */
  "text-representation": {
    language: IsoLanguageCode | null;
    script: IsoScriptCode | null;
  };
  /** Data quality rating. */
  quality: DataQuality;
  /** Information about the available artwork in the CAA. */
  "cover-art-archive"?: CoverArtArchiveInfo;
}

export interface MinimalRelease extends ReleaseBase {
  /** The artist(s) that the release is primarily credited to. */
  "artist-credit": $SubQuery<ArtistCredit[], "artist-credits">;
  /** Media which the release includes. */
  media: $SubQuery<MinimalMedium[], "media" | "discids">;
}

export interface MinimalReleaseForRecording extends MinimalRelease {
  /** Media which the release includes. */
  media: $SubQuery<MinimalMediumWithTracks[], "media" | "discids">;
  /** Release group to which this release belongs. */
  "release-group": $SubQuery<MinimalReleaseGroup, "release-groups">;
}

export interface $Release<
  Include extends IncludeParameter = IncludeParameter,
> extends ReleaseBase, WithAnnotation, WithRels<Include> {
  /** The artist(s) that the release is primarily credited to. */
  "artist-credit": $SubQuery<ArtistCredit[], "artists" | "artist-credits">;
  /** Labels which issued this release and the catalog numbers. */
  "label-info": $SubQuery<LabelInfo[], "labels">;
  /** Media which the release includes. */
  media: $SubQuery<
    Medium<MinimalRecordingWithRels>[],
    "media" | "discids" | "recordings"
  >;
  /** Release group to which this release belongs. */
  "release-group": $SubQuery<MinimalReleaseGroupWithRels, "release-groups">;
  /** Collections which contain this release. */
  collections: $SubQuery<
    MinimalCollection<"release">[],
    "collections" | "user-collections"
  >;
  /** Amazon ASIN. */
  asin: string | null;
}

export interface ReleaseGroupBase extends MinimalEntity {
  /** Title of the release group. */
  title: string;
  /** Primary type of the release group. */
  "primary-type": ReleaseGroupPrimaryType | null;
  /** MBID of the {@linkcode primary-type}. */
  "primary-type-id": MBID | null;
  /** Secondary types of the release group. */
  "secondary-types": ReleaseGroupSecondaryType[];
  /** MBIDs of the {@linkcode secondary-types}. */
  "secondary-type-ids": MBID[];
  /**
   * Release date of the earliest release inside the release group.
   * Empty if no release has a date or if the release group contains no releases.
   */
  "first-release-date": IsoDate | "";
}

export interface MinimalReleaseGroup extends ReleaseGroupBase {
  /** The artist(s) that the release group is primarily credited to. */
  "artist-credit":
    | $SubQuery<ArtistCredit[], "artist-credits">
    | $SubQuery<null, "artists">; // probably a bug in the MBS serializer
  releases: $SubQuery<[], "releases">; // always empty for nested release groups
}

export interface MinimalReleaseGroupWithRels extends MinimalReleaseGroup {
  /** Relationships to other entities. */
  relations: $SubQuery<Relationship[], "release-group-level-rels">;
}

export interface $ReleaseGroup<
  Include extends IncludeParameter = IncludeParameter,
> extends ReleaseGroupBase, WithAnnotation, WithRels<Include> {
  /** The artist(s) that the release group is primarily credited to. */
  "artist-credit": $SubQuery<ArtistCredit[], "artists" | "artist-credits">;
  /** Releases which belong to this release group. */
  releases: $SubQuery<MinimalRelease[], "releases">;
}

export interface MinimalSeries extends MinimalEntity, WithType {
  /** Name of the series. */
  name: string;
}

export interface $Series<
  Include extends IncludeParameter = IncludeParameter,
> extends MinimalSeries, WithAnnotation, WithRels<Include> {}

export interface $Url<
  Include extends IncludeParameter = IncludeParameter,
> extends EntityWithMbid, WithRels<Include> {
  /** Underlying URL. */
  resource: string;
}

export interface MinimalWork extends MinimalEntity, WithType {
  /** Canonical title of the work, expressed in its original language. */
  title: string;
  /** International Standard Musical Work Code (ISWC) codes. */
  iswcs: string[];
  /** Other attributes of the work. */
  attributes: EntityAttribute[];
  /** Language(s) used in the lyrics for this work. */
  languages: IsoLanguageCode[];
  /** @deprecated */
  language: IsoLanguageCode | null;
}

export interface $Work<
  Include extends IncludeParameter = IncludeParameter,
> extends MinimalWork, WithAnnotation, WithRels<Include> {}

// TODO: Type = "Search hint", "Legal name" etc. (depending on entity type)
/** Alternative name (alias) of an entity. */
export interface Alias<Type extends string = string>
  extends DatePeriod, WithSortName, WithType<Type> {
  /** Locale of the name. */
  locale: Locale | null;
  /** Indicates a primary name for the given language. */
  primary: boolean | null;
}

/** Artist name as credited (on a release). */
export interface ArtistCredit {
  /** Credited name of the artist. */
  name: string;
  /** Associated artist. */
  artist: MinimalArtist;
  /** Join phrase between this artist and the next artist. */
  joinphrase: string;
}

/** Date period. */
export interface DatePeriod {
  /** Begin date. */
  begin: IsoDate | null;
  /** End date. */
  end: IsoDate | null;
  /** Indicates whether the date period is ended. */
  ended: boolean;
}

/** Dynamic attribute of an entity. */
export interface EntityAttribute {
  /** Name of the attribute type. */
  type: string;
  /** MBID of the attribute {@linkcode type}. */
  "type-id": MBID;
  /** Value of the attribute. */
  value: string;
  /** MBID of the attribute {@linkcode value} (if it is not free text). */
  "value-id"?: MBID;
}

export interface MinimalMedium {
  /** Position of the medium, numbering usually starts with one. */
  position: number;
  /** Medium title, can be empty. */
  title: string;
  /** Number of tracks on the medium. */
  "track-count": number;
  /** Name of the medium format. */
  format: string | null;
  /** MBID of the medium {@linkcode format}. */
  "format-id": MBID | null;
  /** Disc ID (for CD-based formats). */
  discs: $SubQuery<DiscId[], "discids">;
}

// TODO: Check recording which is used on a pregap/data track to see if these props can be present as well.
export interface MinimalMediumWithTracks extends MinimalMedium {
  /** Position of the first loaded track minus one. */
  "track-offset": number;
  pregap?: MinimalTrack;
  /** List of associated tracks. */
  tracks: MinimalTrack[];
  "data-tracks"?: MinimalTrack[];
}

/** Medium which is included in a release. */
export interface Medium<
  Recording extends MinimalRecording = MinimalRecording,
> extends MinimalMedium {
  /** Position of the first loaded track minus one, missing for an empty medium. */
  "track-offset"?: $SubQuery<number, "recordings">;
  /** Pregap track on a CD-based format. */
  pregap?: $SubQuery<Track<Recording>, "recordings">;
  /** List of tracks, missing for an empty medium. */
  tracks?: $SubQuery<Track<Recording>[], "recordings">;
  /** Data tracks on a CD-based format. */
  "data-tracks"?: $SubQuery<Track<Recording>[], "recordings">;
}

/** Disc ID and table of contents (TOC) for a CD-based medium format. */
export interface DiscId {
  /** Base64 encoded disc ID. */
  id: string;
  /** Total number of sectors. */
  sectors: number;
  /** Number of tracks/offsets in the TOC. */
  "offset-count": number;
  /** Offsets of the tracks (counted in sectors). */
  offsets: number[];
}

export interface MinimalTrack extends EntityWithMbid {
  /** Position of the track on the medium, numbering usually starts with one. */
  position: number;
  /** Track number, can follow vinyl style (letter prefix indicates side) or custom style. */
  number: string;
  /** Title of the track on the release. */
  title: string;
  /** The artist(s) that the track is primarily credited to. */
  "artist-credit": $SubQuery<ArtistCredit[], "artist-credits">;
  /** Track length in milliseconds (integer). */
  length: number | null;
}

/** Track on a release. */
export interface Track<
  Recording extends MinimalRecording = MinimalRecording,
> extends MinimalTrack {
  /** Associated recording of the track. */
  recording: $SubQuery<Recording, "recordings">;
}

/** Release event of a release. */
export interface ReleaseEvent {
  /** Release date. */
  date: IsoDate | "";
  /** Release country. */
  area: MinimalArea | null;
}

/** Release label and catalog number. */
export interface LabelInfo {
  /** Label/Imprint which issued the release. */
  label: MinimalLabel | null;
  /** Corresponding catalog number used by the {@linkcode label}. */
  "catalog-number": string | null;
}

/** Information about available artwork in the Cover Art Archive. */
export interface CoverArtArchiveInfo {
  /** Number of available cover art images. */
  count: number;
  /** Release has artwork. */
  artwork: boolean;
  /** Release has front cover artwork. */
  front: boolean;
  /** Release has back cover artwork. */
  back: boolean;
  /** Cover art for this release has been disabled by a rights holder. */
  darkened: boolean;
}

/** Rating by a single user. */
export interface UserRating {
  /** Rating value in range 0 to 100. */
  value: number;
}

/** Average rating. */
export interface Rating extends UserRating {
  /** Number of users which have rated the entity. */
  "votes-count": number;
}

/** Folksonomy tag. */
export interface UserTag {
  /** Name of the tag (lower case). */
  name: string;
}

/** Folksonomy tag with usage count. */
export interface Tag extends UserTag {
  /** Number of users which have used the tag for the entity. */
  count: number;
}

/** Genre tag. */
export type GenreUserTag = $Genre;

/** Genre tag with usage count. */
export interface GenreTag extends GenreUserTag {
  /** Number of users which have used the genre tag for the entity. */
  count: number;
}

/** Basic properties of a relationship. */
export interface RelationshipBase<TargetType extends RelatableEntityType> {
  /** Type of the target entity. */
  "target-type": SnakeCase<TargetType>;
  /** Name of the relationship type. */
  type: string;
  /** MBID of the relationship {@linkcode type}. */
  "type-id": MBID;
  /**
   * Direction of the relationship.
   * Important if source and target entity have the same type.
   */
  direction: RelationshipDirection;
  /** Order of the relationship if relationships of this type are orderable. */
  "ordering-key"?: number;
  /** Names of the relationship attributes. */
  attributes: string[];
  /** Maps attribute names to their optional value. */
  "attribute-values": Record<string, string>;
  /** Maps attribute names to their MBID. */
  "attribute-ids": Record<string, MBID>;
  /**
   * Maps attribute names to their optional credited name.
   * Only present if any of the attributes is creditable.
   */
  "attribute-credits"?: Record<string, string>;
  /** Credited name of the source entity, can be empty. */
  "source-credit": string;
  /** Credited name of the target entity, can be empty. */
  "target-credit": string;
}

export type RelationshipTypeMap = {
  [TargetType in RelatableEntityType]:
    & {
      /** Target entity. */
      [Key in TargetType as SnakeCase<Key>]: MinimalEntityTypeMap[Key];
    }
    & RelationshipBase<TargetType>
    & DatePeriod;
};

/** Relationship between a source entity and a target entity of the given type. */
export type Relationship<
  TargetType extends RelatableEntityType = RelatableEntityType,
> = RelationshipTypeMap[TargetType];

/** Direction of a relationship between two entities. */
export type RelationshipDirection = "backward" | "forward";

/** All possible include parameter values which affect included relationships. */
export type RelInclude = `${RelatableEntityType}-rels`;

/** All possible include parameter values for Area entities. */
export type AreaInclude = CollectIncludes<$Area>;

/** Area entity with additional data for the given include parameters. */
export type Area<Include extends AreaInclude = never> = WithIncludes<
  $Area<Include>,
  Include
>;

/** All possible include parameter values for Artist entities. */
export type ArtistInclude = CollectIncludes<$Artist> | "various-artists";

/** Artist entity with additional data for the given include parameters. */
export type Artist<Include extends ArtistInclude = never> = WithIncludes<
  $Artist<Include>,
  Include
>;

/** All possible include parameter values for Collection entities. */
export type CollectionInclude = CollectIncludes<MinimalCollection>;

/** Collection entity (does not support include parameters). */
export type Collection<Include extends CollectionInclude = never> =
  MinimalCollection;

/** All possible include parameter values for Event entities. */
export type EventInclude = CollectIncludes<$Event>;

/** Event entity with additional data for the given include parameters. */
export type Event<Include extends EventInclude = never> = WithIncludes<
  $Event<Include>,
  Include
>;

/** All possible include parameter values for Genre entities. */
export type GenreInclude = CollectIncludes<$Genre>;

/** Genre entity (does not support include parameters so far). */
export type Genre<Include extends GenreInclude = never> = $Genre;

/** All possible include parameter values for Instrument entities. */
export type InstrumentInclude = CollectIncludes<$Instrument>;

/** Instrument entity with additional data for the given include parameters. */
export type Instrument<Include extends InstrumentInclude = never> =
  WithIncludes<$Instrument<Include>, Include>;

/** All possible include parameter values for Label entities. */
export type LabelInclude = CollectIncludes<$Label>;

/** Label entity with additional data for the given include parameters. */
export type Label<Include extends LabelInclude = never> = WithIncludes<
  $Label<Include>,
  Include
>;

/** All possible include parameter values for Place entities. */
export type PlaceInclude = CollectIncludes<$Place>;

/** Place entity with additional data for the given include parameters. */
export type Place<Include extends PlaceInclude = never> = WithIncludes<
  $Place<Include>,
  Include
>;

/** All possible include parameter values for Recording entities. */
export type RecordingInclude = CollectIncludes<$Recording>;

/** Recording entity with additional data for the given include parameters. */
export type Recording<Include extends RecordingInclude = never> = WithIncludes<
  $Recording<Include>,
  Include
>;

/** All possible include parameter values for Release entities. */
export type ReleaseInclude = CollectIncludes<$Release>;

/** Release entity with additional data for the given include parameters. */
export type Release<Include extends ReleaseInclude = never> = WithIncludes<
  $Release<Include>,
  Include
>;

/** All possible include parameter values for ReleaseGroup entities. */
export type ReleaseGroupInclude = CollectIncludes<$ReleaseGroup>;

/** ReleaseGroup entity with additional data for the given include parameters. */
export type ReleaseGroup<Include extends ReleaseGroupInclude = never> =
  WithIncludes<$ReleaseGroup<Include>, Include>;

/** All possible include parameter values for Series entities. */
export type SeriesInclude = CollectIncludes<$Series>;

/** Series entity with additional data for the given include parameters. */
export type Series<Include extends SeriesInclude = never> = WithIncludes<
  $Series<Include>,
  Include
>;

/** All possible include parameter values for Work entities. */
export type WorkInclude = CollectIncludes<$Work>;

/** Work entity with additional data for the given include parameters. */
export type Work<Include extends WorkInclude = never> = WithIncludes<
  $Work<Include>,
  Include
>;

/** All possible include parameter values for Url entities. */
export type UrlInclude = CollectIncludes<$Url>;

/** Url entity with additional data for the given include parameters. */
export type Url<Include extends UrlInclude = never> = WithIncludes<
  $Url<Include>,
  Include
>;

/** All possible include parameter values for all entity types. */
export type AnyInclude = EntityIncludeMap[keyof EntityIncludeMap];
