# MusicBrainz

MusicBrainz API client which aims for fully typed results

## Example

```ts
import { MusicBrainzClient } from "@kellnerd/musicbrainz";

const client = new MusicBrainzClient();

// Lookup a group artist by MBID and include its artist relationships.
// Type of the result is affected by the specified include parameters.
const group = await client.lookup(
  "artist",
  "83d91898-7763-47d7-b03b-b92132375c47",
  ["artist-rels"],
);

// Find the members of the group from its relationships.
// Property `relations` only exists because a relationship include was specified.
const members = group.relations
  // Filter by type name (for illustration, ideally you should use "type-id").
  .filter((rel) => rel.type === "member of band")
  // Extract the target artist. The `artist` property is guaranteed to exist
  // and not optional because "artist-rels" is the only relationship include.
  .map((rel) => rel.artist);

console.log(members);
```
