import { describe, it } from "@std/testing/bdd";
import { createFunctionAsserter } from "@/test/utils.ts";
import { joinArtistCredit } from "@/utils/artist.ts";

describe("joinArtistCredit", () => {
  const assertJoinArtistCredit = createFunctionAsserter(joinArtistCredit);

  it("returns empty string for empty AC", () => {
    assertJoinArtistCredit("", []);
  });
  it("returns artist name for a single artist", () => {
    assertJoinArtistCredit("John Doe", [{ name: "John Doe", joinphrase: "" }]);
  });
  it("returns artist name and trailing joinphrase for a single artist", () => {
    assertJoinArtistCredit("Jane and others", [{
      name: "Jane",
      joinphrase: " and others",
    }]);
  });
  it("joins two artists using a joinphrase", () => {
    assertJoinArtistCredit("Jane & John", [
      { name: "Jane", joinphrase: " & " },
      { name: "John", joinphrase: "" },
    ]);
  });
});
