export const INJECT_TOKENS = "custom:inject_tokens";

/**
 * Parameter decorator to inject a registered container token (e.g. "drizzle").
 */
export function InjectToken(token: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const fn = propertyKey ? target.constructor : target;
    const existing: Record<number, string> =
      Reflect.getOwnMetadata(INJECT_TOKENS, fn) ?? {};
    existing[parameterIndex] = token;
    Reflect.defineMetadata(INJECT_TOKENS, existing, fn);

    if (propertyKey) {
      const methodExisting: Record<number, string> =
        Reflect.getOwnMetadata(INJECT_TOKENS, target, propertyKey) ?? {};
      methodExisting[parameterIndex] = token;
      Reflect.defineMetadata(
        INJECT_TOKENS,
        methodExisting,
        target,
        propertyKey,
      );
    }
  };
}

/**
 * Injects the Drizzle database instance from the application container.
 *
 * @param connection Optional container binding name (defaults to "drizzle").
 *
 * @example
 * export class UsersService {
 *   constructor(
 *     @InjectDrizzle()
 *     private readonly db: NodePgDatabase,
 *   ) {}
 * }
 */
export function InjectDrizzle(connection: string = "drizzle"): ParameterDecorator {
  return InjectToken(connection);
}
