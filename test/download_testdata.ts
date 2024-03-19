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
];

export function convertApiUrlToTestCase(
  url: string,
): [EntityType, MBID, string[]?] | undefined {
  const entity = extractEntityFromUrl(url);
  if (!entity) return;
  const inc = new URL(url).searchParams.getAll("inc");
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
  const outputPath = resolve(import.meta.dirname!, "./data/lookup.ts");
  const output = await Deno.open(outputPath, {
    write: true,
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
