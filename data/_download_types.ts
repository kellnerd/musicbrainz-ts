import type { EntityType } from "@/mod.ts";
import { resolve } from "@std/path/resolve";

interface TypeInfo {
  id: number;
  name: string;
  deprecated?: boolean;
  parent_id?: number | null;
  child_order?: number;
}

async function fetchTypes(typeName: string): Promise<TypeInfo[]> {
  const apiUrl = new URL(typeName, "https://musicbrainz.org/ws/js/type-info/");
  const response = await fetch(apiUrl);
  const result = await response.json();
  if (result.error) {
    throw new Error(`Failed to fetch '${typeName}' types: ${result.error}`);
  }
  return result[`${typeName}_list`];
}

function convertTypesToMap(types: TypeInfo[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const type of sortTypes(types)) {
    result[type.name] = type.id;
  }
  return result;
}

async function fetchTypeNameToIdMap(
  typeName: string,
  filter?: (item: TypeInfo) => boolean,
) {
  const types = await fetchTypes(typeName);
  return convertTypesToMap(filter ? types.filter(filter) : types);
}

function sortTypes(types: TypeInfo[]): TypeInfo[] {
  const firstType = types[0];
  if (firstType.parent_id === undefined) {
    return types.sort(compareTypes);
  }

  const typesByParentId = groupBy(types, (type) => type.parent_id);
  return getTypesByParentId(null);

  function getTypesByParentId(parentId: number | null): TypeInfo[] {
    const types = typesByParentId.get(parentId);
    if (!types) return [];
    return types
      .sort(compareTypes)
      .flatMap((type) => [type, ...getTypesByParentId(type.id)]);
  }
}

function compareTypes(typeA: TypeInfo, typeB: TypeInfo): number {
  if (typeA.child_order !== undefined && typeB.child_order !== undefined) {
    const diff = typeA.child_order - typeB.child_order;
    if (diff) return diff;
  }
  return typeA.name > typeB.name ? 1 : -1;
}

function groupBy<Item, Key>(
  list: Item[],
  getKey: (item: Item) => Key,
): Map<Key, Item[]> {
  return list.reduce((result, item) => {
    const key = getKey(item);
    let values = result.get(key);
    if (values === undefined) {
      values = [];
      result.set(key, values);
    }
    values.push(item);
    return result;
  }, new Map<Key, Item[]>());
}

async function updateModule(module: string, constants: [string, unknown][]) {
  const path = resolve(import.meta.dirname!, module);
  console.log(`Updating types in '${path}'`);

  let code = await Deno.readTextFile(path);
  for (const [name, value] of constants) {
    code = replaceConstant(code, name, value);
  }
  await Deno.writeTextFile(path, code);
}

function replaceConstant(code: string, name: string, value: unknown): string {
  return code.replace(
    new RegExp(`(?<=const ${name} = )[^;]+`),
    JSON.stringify(value, null, 2),
  );
}

if (import.meta.main) {
  await updateModule("artist.ts", [
    ["artistTypeIds", await fetchTypeNameToIdMap("artist_type")],
    ["genderIds", await fetchTypeNameToIdMap("gender")],
  ]);
  await updateModule("release.ts", [
    ["statusTypeIds", await fetchTypeNameToIdMap("release_status")],
    ["packagingTypeIds", await fetchTypeNameToIdMap("release_packaging")],
  ]);
  await updateModule("release_group.ts", [
    ["primaryTypeIds", await fetchTypeNameToIdMap("release_group_type")],
    [
      "secondaryTypeIds",
      await fetchTypeNameToIdMap("release_group_secondary_type"),
    ],
  ]);
}
