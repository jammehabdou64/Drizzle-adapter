declare global {
  namespace Reflect {
    function defineMetadata(
      metadataKey: any,
      metadataValue: any,
      target: object,
      propertyKey?: string | symbol,
    ): void;
    function getOwnMetadata(
      metadataKey: any,
      target: object,
      propertyKey?: string | symbol,
    ): any;
  }

  var config: <T = string>(
    key: string,
    defaultValue?: string | number | boolean,
  ) => T;

  var app: <T = any>(
    obj?: string | (new (...args: any[]) => T),
  ) => T | undefined;
}

export {};
