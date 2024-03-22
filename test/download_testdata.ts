import { resolve } from "https://deno.land/std@0.210.0/path/resolve.ts";
import { toPascalCase } from "https://deno.land/std@0.220.1/text/case.ts";
import type { MBID } from "@/api_types.ts";
import { MusicBrainzClient } from "@/client.ts";
import { extractEntityFromUrl, isDefined } from "@/utils.ts";
import { EntityType } from "@/data/entity.ts";

/**
 * Generates a TypeScript constant from the result of a MusicBrainz API lookup
 * request which is annotated with its expected type.
 */
export async function fetchTestdata(
  client: MusicBrainzClient,
  entityType: EntityType,
  mbid: MBID,
  includes?: string[],
): Promise<string> {
  const result = await client.lookup(entityType, mbid, includes);
  const identifier = [entityType, mbid, ...(includes ?? [])]
    .join("_")
    .replaceAll(/\W/g, "_");

  return `const _${identifier}: MB.WithIncludes<MB.${
    entityType === "event" ? "MusicEvent" : toPascalCase(entityType)
  }, ${includes?.map((inc) => `"${inc}"`).join(" | ") ?? "never"}> = ${
    JSON.stringify(result, null, 2)
  };\n`;
}

/** Necessary imports for the code which is generated by {@linkcode fetchTestdata}. */
export const testdataImports = 'import type * as MB from "@/api_types.ts";\n';

/** Test cases for MusicBrainz API lookup requests. */
export const lookupTestCases: Array<[EntityType, MBID, string[]?]> = [
  ["recording", "94ed318a-fd7d-4abc-8491-a35e39f51dca"],
  ["event", "6b3aa18f-ce72-4494-bc7e-47d93ff723c7", ["aliases"]],
  ["release", "742d6790-c5cb-463c-a105-5e76e44afec5", [
    "annotation",
    "discids",
  ]],
  ["release", "bbb829c1-6427-4dcb-96a0-c3932bdd789d", [
    "aliases",
    "artist-credits",
    "labels",
    "recordings",
  ]],
  ["release", "b50caad5-fe40-4c98-8947-f2a77ccc8a6c", [
    "recordings",
    "isrcs",
    "tags",
    "genres",
    "recording-level-rels",
    "work-rels",
  ]],
  // Empty medium without tracks.
  ["release", "a929130a-535c-4827-8663-f048e1a7ca0d", ["recordings"]],
  // Has no release-events.
  ["release", "8693def6-3680-461d-9132-271400007a48"],
  // Has a release event with no date, and another with no country.
  ["release", "065aa2d6-e38e-4caa-b883-ea2ebf2ddda8"],
  ["recording", "a8ccb91b-1a09-49d9-b96a-4eb13bd5c0f7", [
    "artists",
    "releases",
    "release-groups",
  ]],
  ["url", "73770827-4419-464f-a07e-d34231ed4391"],
  // "aliases" is allowed but does nothing for genres (yet)
  ["genre", "6d76ba14-94f3-4677-a153-9263f8d50f95", ["aliases"]],
  ["artist", "83d91898-7763-47d7-b03b-b92132375c47"],
];

export function convertApiUrlToTestCase(
  url: string,
): [EntityType, MBID, string[] | undefined] | undefined {
  const entity = extractEntityFromUrl(url);
  if (!entity) return;
  const inc = new URL(url).searchParams.get("inc")?.split(/[\s+]/);
  return [...entity, inc];
}

/**
 * Convert API URLs from CLI args into test cases and append them to the output file.
 * If no args are passed, recreate the whole output file from all hardcoded test cases.
 */
if (import.meta.main) {
  const client = new MusicBrainzClient();
  const encoder = new TextEncoder();
  const newTestCases = Deno.args.map(convertApiUrlToTestCase).filter(isDefined);
  const append = Boolean(newTestCases.length);

  const outputDir = resolve(import.meta.dirname!, "data/");
  await Deno.mkdir(outputDir, { recursive: true });
  const outputPath = resolve(outputDir, "lookup.ts");
  const output = await Deno.open(outputPath, {
    write: true,
    create: true,
    append,
    truncate: !append,
  });

  if (append) {
    for (const testCase of newTestCases) {
      console.log(testCase);
      const code = await fetchTestdata(client, ...testCase);
      await output.write(encoder.encode(code));
    }
  } else {
    await output.write(encoder.encode(testdataImports));
    for (const testCase of lookupTestCases) {
      const code = await fetchTestdata(client, ...testCase);
      await output.write(encoder.encode(code));
    }
  }

  output.close();
}
