import type { SubQuery } from "./api_includes.ts";
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

/** MusicBrainz ID, a UUID (usually v4). */
export type MBID = string;

/** ISO 3166-1 (two letter), 3166-2 or 3166-3 (three letter) code of a country. */
export type IsoCountryCode = string;

/** ISO 639 (three letter) code of a language. */
export type IsoLanguageCode = string;

/** ISO (four letter) code of a script. */
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

/** Maps entity type names to their type definitions. */
export type EntityTypeMap = {
  area: Area;
  artist: Artist;
  collection: Collection;
  event: MusicEvent;
  genre: Genre;
  instrument: Instrument;
  label: Label;
  place: Place;
  recording: Recording;
  release: Release;
  "release-group": ReleaseGroup;
  series: Series;
  work: Work;
  url: Url;
};

/** Maps entity type names to their minimal type definitions (for sub-queries). */
export type MinimalEntityTypeMap = {
  area: MinimalArea;
  artist: MinimalArtist;
  collection: MinimalCollection;
  event: MinimalEvent;
  genre: Genre;
  instrument: MinimalInstrument;
  label: MinimalLabel;
  place: MinimalPlace;
  recording: MinimalRecording;
  release: MinimalRelease;
  "release-group": MinimalReleaseGroup;
  series: MinimalSeries;
  work: MinimalWork;
  url: Url;
};

/** Properties which all entity types have in common. */
export interface EntityBase {
  /** MusicBrainz ID (MBID) of the entity. */
  id: MBID;
  // Aliases are always present unless a `$hide_aliases` flag is set by MBS.
  aliases?: SubQuery<Alias[], "aliases">;
  // Ratings are always present at the top-level (except for area, place, release and series).
  // They are only present in sub-queries if a `$force_ratings` flag is set by MBS.
  rating?: SubQuery<Rating[], "ratings">;
  "user-rating"?: SubQuery<UserRating[], "user-ratings">;
  // Tags and genres are always present unless a `$hide_tags_and_genres` flag is set by MBS.
  tags?: SubQuery<Tag[], "tags">;
  "user-tags"?: SubQuery<UserTag[], "user-tags">;
  genres?: SubQuery<GenreTag[], "genres">;
  "user-genres"?: SubQuery<GenreUserTag[], "user-genres">;
}

/** Properties which many entity types have in common. */
export interface MinimalEntity extends EntityBase {
  /** Name of the entity. */
  name: string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  type: string | null;
  "type-id": MBID | null;
}

/** Miscellaneous sub-query properties many entity types have in common. */
export interface MiscSubQueries {
  annotation: SubQuery<string | null, "annotation">;
  relations: SubQuery<Relationship[], RelInclude>;
}

export interface MinimalArea extends MinimalEntity {
  /** Sort name of the entity. */
  "sort-name": string;
  /** ISO 3166-1 country codes, for countries only. */
  "iso-3166-1-codes"?: IsoCountryCode[];
  "iso-3166-2-codes"?: IsoCountryCode[];
  "iso-3166-3-codes"?: IsoCountryCode[];
}

export interface Area extends MinimalArea, MiscSubQueries {
  "life-span": DatePeriod;
}

export interface MinimalArtist extends MinimalEntity {
  /** Sort name of the entity. */
  "sort-name": string;
  type: ArtistType | null; // override
}

export interface Artist extends MinimalArtist, MiscSubQueries {
  gender: Gender | null;
  "gender-id": MBID | null;
  area: MinimalArea | null;
  country: IsoCountryCode | null;
  "life-span": DatePeriod;
  "begin-area": MinimalArea | null;
  /** @deprecated See [MBS-10826](https://tickets.metabrainz.org/browse/MBS-10826). */
  "begin_area"?: MinimalArea | null;
  "end-area": MinimalArea | null;
  /** @deprecated See [MBS-10826](https://tickets.metabrainz.org/browse/MBS-10826). */
  "end_area"?: MinimalArea | null;
  ipis: string[];
  isnis: string[];
  recordings: SubQuery<MinimalRecording[], "recordings">;
  releases: SubQuery<MinimalRelease[], "releases">;
  "release-groups": SubQuery<MinimalReleaseGroup[], "release-groups">;
  works: SubQuery<MinimalWork[], "works">;
}

export type MinimalCollection =
  & {
    id: MBID;
    name: string;
    editor: string;
    type: string;
    "type-id": MBID;
    "entity-type": CollectableEntityType;
  }
  & {
    [Key in `${CollectableEntityType}-count`]?: number;
  };

export type Collection =
  & MinimalCollection
  & {
    [Key in CollectableEntityType as EntityPlural<Key>]?:
      MinimalEntityTypeMap[Key][];
  };

export interface MinimalEvent extends MinimalEntity {
  time: string;
  setlist: string;
  cancelled: boolean;
}

export interface MusicEvent extends MinimalEvent, MiscSubQueries {
  "life-span": DatePeriod;
}

export interface Genre {
  // Does not extend EntityBase as no aliases can be included.
  /** MusicBrainz ID (MBID) of the entity. */
  id: MBID;
  /** Name of the corresponding tag (lower case). */
  name: string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
}

export interface MinimalInstrument extends MinimalEntity {
  description: string;
}

export interface Instrument extends MinimalInstrument, MiscSubQueries {}

export interface MinimalLabel extends MinimalEntity {
  /** Sort name of the entity. */
  "sort-name": string;
  "label-code": number | null;
}

export interface Label extends MinimalEntity, MiscSubQueries {
  country: IsoCountryCode | null;
  area: MinimalArea | null;
  "life-span": DatePeriod;
  ipis: string[];
  isnis: string[];
  releases: SubQuery<MinimalRelease[], "releases">;
}

export interface MinimalPlace extends MinimalEntity {
  address: string;
  area: MinimalArea | null;
  /** Coordinates of the place (floating point). */
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface Place extends MinimalPlace, MiscSubQueries {}

export interface RecordingBase extends EntityBase {
  title: string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  /** Recording length in milliseconds (integer). */
  length: number;
  /**
   * Release date of the earliest release which contains the recording.
   * Missing for standalone recordings or if no release has a date.
   */
  "first-release-date"?: IsoDate;
  video: boolean;
  isrcs: SubQuery<string[], "isrcs">;
}

export interface MinimalRecording extends RecordingBase {
  "artist-credit": SubQuery<ArtistCredit[], "artist-credits">;
}

export interface Recording extends RecordingBase, MiscSubQueries {
  "artist-credit": SubQuery<ArtistCredit[], "artists" | "artist-credits">;
  releases: SubQuery<MinimalRelease[], "releases">;
}

export interface ReleaseBase extends EntityBase {
  /** Title of the release. */
  title: string;
  /** Disambiguation comment, can be empty. */
  disambiguation: string;
  date?: IsoDate;
  country?: IsoCountryCode | null;
  /** Release dates and areas. */
  "release-events"?: ReleaseEvent[];
  /** Barcode of the release, can be empty (no barcode) or `null` (unset). */
  barcode: string | null;
  packaging: ReleasePackaging | null;
  "packaging-id": MBID | null;
  status: ReleaseStatus | null;
  "status-id": MBID | null;
  /** Language and script of title and tracklist. */
  "text-representation": {
    language: IsoLanguageCode | null;
    script: IsoScriptCode | null;
  };
  media: SubQuery<Medium[], "media" | "discids" | "recordings">;
  /** Data quality rating. */
  quality: DataQuality;
  "cover-art-archive"?: CoverArtArchiveInfo;
  "release-group": SubQuery<MinimalReleaseGroup, "release-groups">;
  collections: SubQuery<
    MinimalCollection[],
    "collections" | "user-collections"
  >;
}

export interface MinimalRelease extends ReleaseBase {
  "artist-credit": SubQuery<ArtistCredit[], "artist-credits">;
}

export interface Release extends ReleaseBase, MiscSubQueries {
  "artist-credit": SubQuery<ArtistCredit[], "artists" | "artist-credits">;
  "label-info": SubQuery<LabelInfo[], "labels">;
  /** Amazon ASIN. */
  asin: string | null;
}

export interface ReleaseGroupBase extends EntityBase {
  title: string;
  disambiguation: string;
  "primary-type": ReleaseGroupPrimaryType | null;
  "primary-type-id": MBID | null;
  "secondary-types": ReleaseGroupSecondaryType[];
  "secondary-type-ids": MBID[];
  /**
   * Release date of the earliest release inside the release group.
   * Empty if no release has a date or if the release group contains no releases.
   */
  "first-release-date": IsoDate | "";
}

export interface MinimalReleaseGroup extends ReleaseGroupBase {
  "artist-credit":
    | SubQuery<ArtistCredit[], "artist-credits">
    | SubQuery<null, "artists">; // probably a bug in the MBS serializer
  releases: SubQuery<[], "releases">; // always empty for nested release groups
}

export interface ReleaseGroup extends ReleaseGroupBase, MiscSubQueries {
  "artist-credit": SubQuery<ArtistCredit[], "artists" | "artist-credits">;
  releases: SubQuery<MinimalRelease[], "releases">;
}

export type MinimalSeries = MinimalEntity;

export interface Series extends MinimalSeries, MiscSubQueries {}

export interface Url {
  // Does not extend EntityBase as no aliases can be included.
  id: MBID;
  resource: string;
}

export interface MinimalWork extends EntityBase {
  title: string;
  disambiguation: string;
  iswcs: string[];
  attributes: EntityAttribute[];
  languages: IsoLanguageCode[];
  /** @deprecated */
  language: IsoLanguageCode | null;
  type: string | null;
  "type-id": MBID | null;
}

export interface Work extends MinimalWork, MiscSubQueries {}

// TODO: Type = "Search hint", "Legal name" etc. (depending on entity type)
export interface Alias<Type extends string = string> extends DatePeriod {
  name: string;
  "sort-name": string;
  type: Type | null;
  "type-id": MBID | null;
  locale: Locale | null;
  primary: boolean | null;
}

export interface ArtistCredit {
  name: string;
  artist: MinimalArtist;
  joinphrase: string;
}

export interface DatePeriod {
  /** Begin date. */
  begin: IsoDate | null;
  /** End date. */
  end: IsoDate | null;
  /** Indicates whether the date period is ended. */
  ended: boolean;
}

export interface EntityAttribute {
  type: string;
  "type-id": MBID;
  value: string;
  "value-id"?: MBID;
}

export interface Medium {
  position: number;
  /** Medium title, can be empty. */
  title: string;
  "track-count": number;
  /** Position of the first loaded track minus one, missing for an empty medium. */
  "track-offset"?: SubQuery<number, "recordings">;
  format: string | null;
  "format-id": MBID | null;
  pregap?: SubQuery<Track, "recordings">;
  /** List of tracks, missing for an empty medium. */
  tracks?: SubQuery<Track[], "recordings">;
  "data-tracks"?: SubQuery<Track[], "recordings">;
  discs: SubQuery<DiscId[], "discids">;
}

export interface DiscId {
  /** Base64 encoded disc ID. */
  id: string;
  /** Total number of sectors. */
  sectors: number;
  "offset-count": number;
  /** Offsets of the tracks in sectors. */
  offsets: number[];
}

export interface Track {
  id: MBID;
  position: number;
  number: string;
  title: string;
  "artist-credit": SubQuery<ArtistCredit[], "artist-credits">;
  /** Track length in milliseconds (integer). */
  length: number;
  recording: SubQuery<MinimalRecording, "recordings">;
}

export interface ReleaseEvent {
  date: IsoDate | "";
  area: MinimalArea | null;
}

export interface LabelInfo {
  label: MinimalLabel | null;
  "catalog-number": string | null;
}

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

export interface UserRating {
  /** Rating value in range 0 to 100. */
  value: number;
}

export interface Rating extends UserRating {
  /** Number of users which have rated the entity. */
  "votes-count": number;
}

export interface UserTag {
  /** Name of the tag (lower case). */
  name: string;
}

export interface Tag extends UserTag {
  /** Number of users which have used the tag for the entity. */
  count: number;
}

export type GenreUserTag = Genre;

export interface GenreTag extends GenreUserTag {
  /** Number of users which have used the genre tag for the entity. */
  count: number;
}

export type Relationship<
  TargetType extends RelatableEntityType = RelatableEntityType,
> =
  & IfUnionType<
    TargetType,
    {
      /** Target entity, only the key which matches the value of target type is present. */
      [Key in TargetType]?: MinimalEntityTypeMap[Key];
    },
    {
      /** Target entity. */
      [Key in TargetType]: MinimalEntityTypeMap[Key];
    }
  >
  & {
    /** Type of the target entity. */
    "target-type": TargetType;
    /** Name of the relationship type. */
    type: string;
    /** MBID of the relationship type. */
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
  & DatePeriod;

export type RelationshipDirection = "backward" | "forward";

export type RelInclude = `${RelatableEntityType}-rels`;

type IfUnionType<T, True, False, U extends T = T> = T extends unknown
  ? [U] extends [T] ? False : True
  : False;

// The above entity types should not be used without this utility type.
// Reexport it here as long as there are no `EntityWith` type aliases for each entity type.
export type { WithIncludes } from "./api_includes.ts";
