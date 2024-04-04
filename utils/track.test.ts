import { assertEquals } from "@std/assert/assert_equals";
import { describe, it } from "@std/testing/bdd";
import {
  filterTrackRange,
  parseTrackRange,
  type TrackRange,
} from "@/utils/track.ts";

describe("parseTrackRange", () => {
  it("parses a numeric range", () => {
    assertEquals(parseTrackRange("7-13"), {
      medium: undefined,
      first: "7",
      last: "13",
      prefix: undefined,
    });
  });
  it("parses a medium number with a numeric range", () => {
    assertEquals(parseTrackRange("2:7-13"), {
      medium: 2,
      first: "7",
      last: "13",
      prefix: undefined,
    });
  });
  it("parses an alpha-numeric range", () => {
    assertEquals(parseTrackRange("A3-B7"), {
      medium: undefined,
      first: "A3",
      last: "B7",
      prefix: undefined,
    });
  });
  it("parses a medium number with an alpha-numeric range", () => {
    assertEquals(parseTrackRange("1:A3-B7"), {
      medium: 1,
      first: "A3",
      last: "B7",
      prefix: undefined,
    });
  });
  it("parses a single letter side numbering prefix", () => {
    assertEquals(parseTrackRange("C"), {
      medium: undefined,
      first: undefined,
      last: undefined,
      prefix: "C",
    });
  });
  it("parses a multiple letter side numbering prefix", () => {
    assertEquals(parseTrackRange("AA"), {
      medium: undefined,
      first: undefined,
      last: undefined,
      prefix: "AA",
    });
  });
  it("parses a side numbering prefix which ends with a hyphen", () => {
    assertEquals(parseTrackRange("Two-"), {
      medium: undefined,
      first: undefined,
      last: undefined,
      prefix: "Two-",
    });
  });
  it("parses a medium number with side numbering prefix", () => {
    assertEquals(parseTrackRange("2:A"), {
      medium: 2,
      first: undefined,
      last: undefined,
      prefix: "A",
    });
  });
  it("parses a medium number without track range (empty prefix)", () => {
    assertEquals(parseTrackRange("13:"), {
      medium: 13,
      first: undefined,
      last: undefined,
      prefix: "",
    });
  });
});

describe("filterTrackRange", () => {
  const trackTemplate = {
    id: "",
    length: null,
    position: 0,
    title: "",
  };

  function assertFilteredTrackRange(
    numbers: string[],
    expectedNumbers: string[],
    range: TrackRange,
  ) {
    assertEquals(
      filterTrackRange(
        numbers.map((number) => ({ ...trackTemplate, number })),
        range,
      ).map((track) => track.number),
      expectedNumbers,
    );
  }

  const trackNumbers = ["1", "2", "3", "4"];
  const vinylNumbers = ["A1", "A2", "A3", "B1", "B2", "B3"];

  it("keeps all tracks for an explicit full range", () => {
    assertFilteredTrackRange(trackNumbers, trackNumbers, {
      first: "1",
      last: "4",
    });
  });
  it("keeps only tracks within the given numeric range", () => {
    assertFilteredTrackRange(trackNumbers, ["2", "3"], {
      first: "2",
      last: "3",
    });
  });
  it("keeps only tracks within the given alpha-numeric range", () => {
    assertFilteredTrackRange(vinylNumbers, ["A3", "B1", "B2"], {
      first: "A3",
      last: "B2",
    });
  });
  it("keeps only tracks with the given side prefix", () => {
    assertFilteredTrackRange(vinylNumbers, ["B1", "B2", "B3"], {
      prefix: "B",
    });
  });
});
