import { delay } from "@std/async/delay";
import type {
  AnyInclude,
  Area,
  AreaInclude,
  Artist,
  ArtistInclude,
  Collection,
  CollectionWithContents,
  EntityWithMbid,
  Event,
  EventInclude,
  Genre,
  Instrument,
  InstrumentInclude,
  Label,
  LabelInclude,
  MBID,
  Place,
  PlaceInclude,
  Recording,
  RecordingInclude,
  Release,
  ReleaseGroup,
  ReleaseGroupInclude,
  ReleaseInclude,
  Series,
  SeriesInclude,
  Url,
  UrlInclude,
  Work,
  WorkInclude,
} from "./api_types.ts";
import { ApiError, isError } from "./error.ts";
import type { CollectableEntityType, EntityType } from "./data/entity.ts";
import { assertMbid, entityPlural } from "./utils/entity.ts";
import type { UnionTypeOrNever } from "./utils/type_utils.ts";

/** MusicBrainz API client configuration options. */
export interface ClientOptions {
  /**
   * Root URL of the MusicBrainz API.
   *
   * Useful to test with the beta server or a custom server.
   * @default "https://musicbrainz.org/ws/2/"
   */
  apiUrl?: string;

  /**
   * User-Agent header to identify your application.
   * @example "MyAwesomeTagger/1.2.0 ( http://myawesometagger.example.com )"
   */
  userAgent?: string;
}

/**
 * MusicBrainz API client.
 *
 * @example
 * ```ts
 * const client = new MusicBrainzClient();
 * ```
 */
export class MusicBrainzClient {
  constructor(options: ClientOptions = {}) {
    this.apiBaseUrl = options.apiUrl ?? "https://musicbrainz.org/ws/2/";

    this.#headers = {
      "Accept": "application/json",
    };

    if (options.userAgent) {
      this.#headers["User-Agent"] = options.userAgent;
    }
  }

  /** Performs a lookup request for the given entity. */
  lookup<Include extends ReleaseInclude = never>(
    entityType: "release",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Release<Include>>;
  lookup<Include extends AreaInclude = never>(
    entityType: "area",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Area<Include>>;
  lookup<Include extends ArtistInclude = never>(
    entityType: "artist",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Artist<Include>>;
  lookup(
    entityType: "collection",
    mbid: MBID,
  ): Promise<Collection>;
  lookup<Include extends EventInclude = never>(
    entityType: "event",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Event<Include>>;
  lookup(
    entityType: "genre",
    mbid: MBID,
  ): Promise<Genre>;
  lookup<Include extends InstrumentInclude = never>(
    entityType: "instrument",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Instrument<Include>>;
  lookup<Include extends LabelInclude = never>(
    entityType: "label",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Label<Include>>;
  lookup<Include extends PlaceInclude = never>(
    entityType: "place",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Place<Include>>;
  lookup<Include extends RecordingInclude = never>(
    entityType: "recording",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Recording<Include>>;
  lookup<Include extends ReleaseGroupInclude = never>(
    entityType: "release-group",
    mbid: MBID,
    inc?: Include[],
  ): Promise<ReleaseGroup<Include>>;
  lookup<Include extends SeriesInclude = never>(
    entityType: "series",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Series<Include>>;
  lookup<Include extends UrlInclude = never>(
    entityType: "url",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Url<Include>>;
  lookup<Include extends WorkInclude = never>(
    entityType: "work",
    mbid: MBID,
    inc?: Include[],
  ): Promise<Work<Include>>;
  lookup<T extends EntityType>(
    entityType: UnionTypeOrNever<T>, // only accepts an undetermined type
    mbid: MBID,
    inc?: AnyInclude[],
  ): Promise<EntityWithMbid>;
  lookup(entityType: EntityType, mbid: MBID, inc: string[] = []) {
    assertMbid(mbid);
    return this.get([entityType, mbid].join("/"), { inc: inc.join("+") });
  }

  /** Looks up the collection with the given MBID, including its contents. */
  lookupCollectionContents<ContentType extends CollectableEntityType>(
    mbid: MBID,
    contentType: ContentType,
  ): Promise<CollectionWithContents<ContentType>> {
    assertMbid(mbid);
    return this.get(["collection", mbid, entityPlural(contentType)].join("/"));
  }

  /**
   * Fetches JSON data from the given `GET` endpoint.
   *
   * This method should only be directly called for unsupported endpoints.
   */
  async get(
    endpoint: string,
    query?: Record<string, string | number>,
    // deno-lint-ignore no-explicit-any
  ): Promise<any> {
    const endpointUrl = new URL(endpoint, this.apiBaseUrl);
    if (query) {
      const definedParams = Object.entries(query).filter(
        ([_key, value]) => value !== undefined,
      ) as string[][];
      // Hack above is needed to make TS accept query values of type `number`:
      // https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1568
      endpointUrl.search = new URLSearchParams(definedParams).toString();
    }

    const response = await this.#request(endpointUrl, {
      method: "GET",
      headers: this.#headers,
    });

    const data = await response.json();
    if (isError(data)) {
      throw new ApiError(data.error, response.status);
    } else {
      return data;
    }
  }

  /**
   * Sends the given JSON data to the given `POST` endpoint.
   *
   * This method should only be directly called for unsupported endpoints.
   */
  // deno-lint-ignore no-explicit-any
  async post(endpoint: string, json: any): Promise<any> {
    const endpointUrl = new URL(endpoint, this.apiBaseUrl);
    const response = await this.#request(endpointUrl, {
      method: "POST",
      headers: this.#headers,
      body: JSON.stringify(json),
    });

    const data = await response.json();
    if (isError(data)) {
      throw new ApiError(data.error, response.status);
    } else {
      return data;
    }
  }

  async #request(url: URL, init?: RequestInit): Promise<Response> {
    await this.#rateLimitDelay;

    const response = await fetch(url, init);

    /** Number of API usage units remaining in the current time window. */
    const remainingUnits = response.headers.get("X-RateLimit-Remaining");
    if (remainingUnits && parseInt(remainingUnits) === 0) {
      /** Unix time in seconds when the current time window expires. */
      const rateLimitReset = response.headers.get("X-RateLimit-Reset");
      if (rateLimitReset) {
        const rateLimitDelay = parseInt(rateLimitReset) * 1000 - Date.now();
        if (rateLimitDelay > 0) {
          this.#rateLimitDelay = delay(rateLimitDelay);
        }
      }
    }

    return response;
  }

  /** Base URL of the MusicBrainz API endpoints. */
  apiBaseUrl: string;
  #headers: HeadersInit;
  #rateLimitDelay = Promise.resolve();
}
