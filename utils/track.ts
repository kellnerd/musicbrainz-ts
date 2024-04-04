import type { MinimalTrack } from "@/api_types.ts";
import type { Unwrap } from "@/api_includes.ts";

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
   * Takes precedence over {@linkcode first} and {@linkcode last} track number.
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

/** Filter the given tracks using a range of track numbers. */
export function filterTrackRange<Track extends Unwrap<MinimalTrack>>(
  tracks: Track[],
  range: TrackRange,
): Track[] {
  const { prefix, first, last } = range;
  if (prefix) {
    return tracks.filter((track) => track.number.startsWith(prefix));
  } else if (first) {
    let inRange = false;
    return tracks.filter((track) => {
      if (inRange) {
        if (track.number === last) inRange = false;
        return true;
      } else {
        if (track.number === first) inRange = true;
        return inRange;
      }
    });
  } else {
    return tracks;
  }
}
