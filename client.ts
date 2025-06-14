/**
 * [MusicBrainz] [API] client which aims for fully typed results.
 *
 * [MusicBrainz]: https://musicbrainz.org/
 * [API]: https://musicbrainz.org/doc/MusicBrainz_API
 *
 * @module
 */

import { delay } from "@std/async/delay";
import type {
  CollectionWithContents,
  EntityIncludeMap,
  EntityTypeMap,
  Url,
  UrlInclude,
} from "./api_types.ts";
import type { MBID } from "./common_types.ts";
import { ApiError, isError, RateLimitError } from "./error.ts";
import type { CollectableEntityType, EntityType } from "./data/entity.ts";
import type { ReleaseStatus } from "./data/release.ts";
import type { ReleaseGroupType } from "./data/release_group.ts";
import { assertMbid, entityPlural } from "./utils/entity.ts";

/** MusicBrainz API client configuration options. */
export interface ClientOptions {
  /**
   * Root URL of the MusicBrainz API.
   *
   * Useful to test with the beta server or a custom server.
   * @default "https://musicbrainz.org/ws/2/"
   */
  apiUrl?: URL | string;

  /** Information about your application, will be used to fill the user-agent. */
  app?: AppInfo;

  /**
   * Maximum number of queued requests (optional, defaults to no limit).
   *
   * Excess requests will be rejected immediately.
   */
  maxQueueSize?: number;
}

/** Information about the client application. */
export interface AppInfo {
  /** Name of the application. */
  name: string;
  /** Version of the application. */
  version: string;
  /** Contact URL or email for the application. */
  contact?: string;
}

/** Include options for a lookup request. */
export interface IncludeOptions<Include> {
  /** Include parameters to request additional data. */
  inc?: Include[];
}

/** Options for a lookup request. */
export interface LookupOptions<Include> extends IncludeOptions<Include> {
  /** Filter included releases by their status. */
  status?: Lowercase<ReleaseStatus>[];
  /** Filter included release groups (and their releases) by type. */
  type?: Lowercase<ReleaseGroupType>[];
}

/** Paging options for requests which return multiple results. */
export interface PagingOptions {
  /** Number of results per request (default is 25, maximum is 100). */
  limit?: number;
  /** Paging offset, to be used together with {@linkcode limit}. */
  offset?: number;
}

/** Options for a browse request. */
export interface BrowseOptions<Include>
  extends LookupOptions<Include>, PagingOptions {}

/**
 * MusicBrainz API client.
 *
 * @example Lookup an artist and its relationships
 * ```ts
 * const client = new MusicBrainzClient();
 *
 * // Lookup a group artist by MBID and include its artist relationships.
 * // Type of the result is affected by the specified include parameters.
 * const group = await client.lookup("artist",
 *   "83d91898-7763-47d7-b03b-b92132375c47", { inc: ["artist-rels"] });
 *
 * // Find the members of the group from its relationships.
 * // Property `relations` only exists because a relationship include was specified.
 * const members = group.relations
 *   // Filter by type name (for illustration, ideally you should use "type-id").
 *   .filter((rel) => rel.type === "member of band")
 *   // Extract the target artist. The `artist` property is guaranteed to exist
 *   // and not optional because "artist-rels" is the only relationship include.
 *   .map((rel) => rel.artist);
 * ```
 */
export class MusicBrainzClient {
  /**
   * Creates a new MusicBrainz API client using the given options.
   *
   * You should identify your application to avoid being blocked:
   * https://wiki.musicbrainz.org/MusicBrainz_API/Rate_Limiting
   *
   * @example
   * ```ts
   * const client = new MusicBrainzClient({
   *   app: {
   *     name: "ExampleApp",
   *     version: "1.2.3",
   *     contact: "http://example.com/app",
   *   },
   * });
   * ```
   */
  constructor(options: ClientOptions = {}) {
    this.apiBaseUrl = new URL(
      options.apiUrl ?? "https://musicbrainz.org/ws/2/",
    );
    this.#maxQueueSize = options.maxQueueSize ?? Infinity;

    this.#headers = {
      "Accept": "application/json",
    };

    if (options.app) {
      const { name, version, contact } = options.app;
      let userAgent = `${name}/${version}`;
      if (contact) {
        userAgent += ` ( ${contact} )`;
      }
      this.#headers["User-Agent"] = userAgent;
    }
  }

  /** Performs a lookup request for the given entity. */
  lookup<
    Type extends EntityType,
    Include extends EntityIncludeMap[Type] = never,
  >(
    entityType: Type,
    mbid: MBID,
    options: LookupOptions<Include> = {},
  ): Promise<EntityTypeMap<Include>[Type]> {
    assertMbid(mbid);
    return this.get([entityType, mbid].join("/"), {
      inc: options.inc?.join("+"),
      status: options.status?.join("|"),
      type: options.type?.join("|"),
    });
  }

  /** Looks up the collection with the given MBID, including its contents. */
  lookupCollectionContents<ContentType extends CollectableEntityType>(
    mbid: MBID,
    contentType: ContentType,
  ): Promise<CollectionWithContents<ContentType>> {
    assertMbid(mbid);
    return this.get(["collection", mbid, entityPlural(contentType)].join("/"));
  }

  /** Looks up the "url" entity for the given URL resource. */
  lookupByUrl<Include extends UrlInclude = never>(
    resource: URL,
    options?: IncludeOptions<Include>,
  ): Promise<Url<Include>>;
  /** Looks up the "url" entities for the given URL resources. */
  lookupByUrl<Include extends UrlInclude = never>(
    resource: URL[],
    options?: IncludeOptions<Include>,
  ): Promise<Url<Include>[]>;
  async lookupByUrl<Include extends UrlInclude = never>(
    resource: URL | URL[],
    options: IncludeOptions<Include> = {},
  ): Promise<Url<Include> | Url<Include>[]> {
    const inputIsArray = Array.isArray(resource);
    if (!Array.isArray(resource)) {
      resource = [resource];
    } else if (resource.length === 0) {
      return [];
    }
    try {
      // Result can be either an `Url` object for a single requested resource, or
      // it contains an `urls` array when multiple resources were specified.
      const result: Url<Include> | UrlResults<Include> = await this.get("url", [
        ["inc", options.inc?.join("+")],
        ...resource.map<[string, string]>((url) => ["resource", url.href]),
      ]);
      if ("urls" in result) {
        return result.urls;
      } else {
        // Output an array if the input was an array.
        return inputIsArray ? [result] : result;
      }
    } catch (error) {
      // The API may return a Not Found error for a single requested resource.
      if (error instanceof ApiError && error.statusCode === 404) {
        // Output an empty array if the input was a (single-element-)array.
        if (inputIsArray) {
          return [];
        }
      }
      throw error;
    }
  }

  /**
   * Fetches JSON data from the given `GET` endpoint.
   *
   * This method should only be directly called for unsupported endpoints.
   */
  async get(
    endpoint: string,
    query?: Query<string | number | undefined>,
    // deno-lint-ignore no-explicit-any
  ): Promise<any> {
    const endpointUrl = new URL(endpoint, this.apiBaseUrl);
    if (query) {
      if (!Array.isArray(query)) {
        query = Object.entries(query);
      }
      const definedParams = query.filter(
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

  async #request(url: URL, init?: RequestInit): Promise<Response> {
    if (this.#queuedRequests >= this.#maxQueueSize) {
      throw new RateLimitError(
        "Too many requests queued, please wait and try again",
      );
    }

    this.#queuedRequests++;
    await this.#rateLimitDelay;

    let response: Response;
    try {
      response = await fetch(url, init);
    } finally {
      this.#queuedRequests--;
    }

    /** Number of API usage units remaining in the current time window. */
    const remainingUnits = response.headers.get("X-RateLimit-Remaining");
    if (remainingUnits) {
      if (parseInt(remainingUnits) === 0) {
        /** Unix time in seconds when the current time window expires. */
        const rateLimitReset = response.headers.get("X-RateLimit-Reset");
        if (rateLimitReset) {
          const rateLimitDelay = parseInt(rateLimitReset) * 1000 - Date.now();
          if (rateLimitDelay > 0) {
            this.#rateLimitDelay = delay(rateLimitDelay);
          }
        }
      }
    } else {
      // Fallback to strict rate limiting (1 req/s) if no header is present.
      this.#rateLimitDelay = delay(1000);
    }

    return response;
  }

  /** Base URL of the MusicBrainz API endpoints. */
  apiBaseUrl: URL;
  #headers: HeadersInit;
  #maxQueueSize: number;
  #queuedRequests = 0;
  #rateLimitDelay = Promise.resolve();
}

/** `URLSearchParams` compatible query parameters. */
export type Query<T extends string | number | undefined = string> =
  | Record<string, T>
  | Array<[string, T]>;

interface UrlResults<Include extends UrlInclude> {
  "urls": Url<Include>[];
  "url-count": number;
  "url-offset": number;
}
