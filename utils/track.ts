/** Range of track numbers. */
export interface TrackRange {
  /** Medium number/position. */
  medium?: number;
  /** Number of the first track in the range. */
  first?: string;
  /** Number of the last track in the range. */
  last?: string;
  /**
   * Prefix of the track numbers in the range
   * Mutually exclusive with {@linkcode first} and {@linkcode last} track number.
   */
  prefix?: string;
}

/** Parses a track number range or prefix, optionally preceded by medium number and colon. */
export function parseTrackRange(range: string): TrackRange {
  const trackRangePattern =
    /(?:(?<medium>\d+):)?(?:(?<first>[^-]+)-(?<last>[^-]+)|(?<prefix>.*))/;
  const rangeMatch = range.match(trackRangePattern)?.groups;
  if (rangeMatch) {
    return {
      medium: rangeMatch.medium ? parseInt(rangeMatch.medium) : undefined,
      first: rangeMatch.first,
      last: rangeMatch.last,
      prefix: rangeMatch.prefix,
    };
  } else {
    throw new TypeError("Invalid track range");
  }
}
