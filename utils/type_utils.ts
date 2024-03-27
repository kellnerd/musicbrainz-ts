/** Transforms a string type from kebab case to snake case. */
export type SnakeCase<KebabCase extends string> = KebabCase extends
  `${infer A}-${infer B}` ? `${A}_${SnakeCase<B>}` : KebabCase;

/** Restricts the given type to be a union type. */
export type UnionTypeOrNever<T, U extends T = T> = T extends unknown
  ? [U] extends [T] ? never : T
  : never;
