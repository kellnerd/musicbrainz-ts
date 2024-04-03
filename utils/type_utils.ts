/** Transforms a string type from kebab case to snake case. */
export type SnakeCase<KebabCase extends string> = KebabCase extends
  `${infer A}-${infer B}` ? `${A}_${SnakeCase<B>}` : KebabCase;

/** Asserts that {@linkcode T} is `true`. */
export type Expect<T extends true> = T;

/** Asserts that {@linkcode T} is `false`. */
export type ExpectNot<T extends false> = T;

/** Resolves to `true` if {@linkcode X} and {@linkcode Y} are equal and to `false` if not. */
export type ToEqual<X, Y> = (<T>() => T extends X ? true : false) extends
  (<T>() => T extends Y ? true : false) ? true
  : false;
