/** Transforms a string type from kebab case to snake case. */
export type SnakeCase<KebabCase extends string> = KebabCase extends
  `${infer A}-${infer B}` ? `${A}_${SnakeCase<B>}` : KebabCase;
