/** Error which was caused by a MusicBrainz API call. */
export class ApiError extends Error {
  /** HTTP status code which was returned by the API. */
  statusCode: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    Object.defineProperty(this, "name", {
      value: "ApiError",
      enumerable: false,
    });
    this.statusCode = statusCode ?? 500;
  }
}

/** Error response which is returned by the MusicBrainz `ws/2` JSON API. */
export interface ErrorResponse {
  /** Error message with a description. */
  error: string;
  /** Usage help message with link. */
  help?: string;
}

/** Checks whether the given JSON is an error response. */
// deno-lint-ignore no-explicit-any
export function isError(json: any): json is ErrorResponse {
  return typeof json.error === "string";
}
