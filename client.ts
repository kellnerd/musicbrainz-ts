import { assert } from "https://deno.land/std@0.210.0/assert/assert.ts";
import { delay } from "https://deno.land/std@0.210.0/async/delay.ts";
import { validate } from "https://deno.land/std@0.210.0/uuid/mod.ts";
import type {
  Area,
  Artist,
  CollectIncludes,
  EntityBase,
  MBID,
  Recording,
  Release,
  WithIncludes,
} from "./api_types.ts";
import { ApiError, isError } from "./error.ts";
import type { EntityType } from "./data/entity.ts";

/** MusicBrainz API client configuration options. */
export interface ClientOptions {
  /**
   * Root URL of the MusicBrainz API.
   *
   * Useful to test with the beta server or a custom server.
   * @default "https://musicbrainz.org/ws/2/"
   */
  apiUrl?: string;
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
  }

  /** Performs a lookup request for the given entity. */
  lookup<Include extends CollectIncludes<Area> = never>(
    entityType: "area",
    mbid: MBID,
    inc?: Include[],
  ): Promise<WithIncludes<Area, Include>>;
  lookup<Include extends CollectIncludes<Artist> = never>(
    entityType: "artist",
    mbid: MBID,
    inc?: Include[],
  ): Promise<WithIncludes<Artist, Include>>;
  lookup<Include extends CollectIncludes<Recording> = never>(
    entityType: "recording",
    mbid: MBID,
    inc?: Include[],
  ): Promise<WithIncludes<Recording, Include>>;
  lookup<Include extends CollectIncludes<Release> = never>(
    entityType: "release",
    mbid: MBID,
    inc?: Include[],
  ): Promise<WithIncludes<Release, Include>>;
  lookup(
    entityType:
      | "event"
      | "collection"
      | "genre"
      | "instrument"
      | "label"
      | "place"
      | "release-group"
      | "series"
      | "url"
      | "work",
    mbid: MBID,
    inc?: string[],
  ): Promise<EntityBase>;
  lookup(entityType: EntityType, mbid: MBID, inc: string[] = []) {
    assert(validate(mbid), `${mbid} is not a valid MBID`);
    return this.get([entityType, mbid].join("/"), { inc: inc.join("+") });
  }

  /**
   * Fetches JSON data from the given `GET` endpoint.
   *
   * This method should only be directly called for unsupported endpoints.
   */
  // deno-lint-ignore no-explicit-any
  async get(endpoint: string, query?: Query<string | number>): Promise<any> {
    const endpointUrl = new URL(endpoint, this.apiBaseUrl);
    if (query) {
      const definedParams = Object.entries(query).filter(
        ([_key, value]) => value !== undefined,
      ) as string[][];
      // Hack above is needed to make TS accept query values of type `number`:
      // https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1568
      endpointUrl.search = new URLSearchParams(query as Query).toString();
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
    console.log("X-RateLimit-Remaining", remainingUnits);
    if (remainingUnits && parseInt(remainingUnits) === 0) {
      /** Unix time in seconds when the current time window expires. */
      const rateLimitReset = response.headers.get("X-RateLimit-Reset");
      if (rateLimitReset) {
        const rateLimitDelay = parseInt(rateLimitReset) * 1000 - Date.now();
        if (rateLimitDelay > 0) {
          console.log("Cool down", rateLimitDelay);
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

/** URL query parameters. */
export type Query<T extends string | number = string> = Record<string, T>;
