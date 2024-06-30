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

/** Recursively turns nullable properties into optional properties. */
export type OptionalNullable<T> = T extends object ?
    & {
      [K in keyof PickNullable<T>]?: OptionalNullable<Exclude<T[K], null>>;
    }
    & {
      [K in keyof PickNotNullable<T>]: OptionalNullable<T[K]>;
    }
  : T;

type PickNullable<T> = {
  [P in keyof T as null extends T[P] ? P : never]: T[P];
};

type PickNotNullable<T> = {
  [P in keyof T as null extends T[P] ? never : P]: T[P];
};
