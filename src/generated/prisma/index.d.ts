
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Apartment
 * 
 */
export type Apartment = $Result.DefaultSelection<Prisma.$ApartmentPayload>
/**
 * Model ChecklistItem
 * 
 */
export type ChecklistItem = $Result.DefaultSelection<Prisma.$ChecklistItemPayload>
/**
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>
/**
 * Model Booking
 * 
 */
export type Booking = $Result.DefaultSelection<Prisma.$BookingPayload>
/**
 * Model CleaningTask
 * 
 */
export type CleaningTask = $Result.DefaultSelection<Prisma.$CleaningTaskPayload>
/**
 * Model MaintenanceTicket
 * 
 */
export type MaintenanceTicket = $Result.DefaultSelection<Prisma.$MaintenanceTicketPayload>
/**
 * Model AIAssistantMessage
 * 
 */
export type AIAssistantMessage = $Result.DefaultSelection<Prisma.$AIAssistantMessagePayload>
/**
 * Model Attachment
 * 
 */
export type Attachment = $Result.DefaultSelection<Prisma.$AttachmentPayload>
/**
 * Model ApartmentAttachment
 * 
 */
export type ApartmentAttachment = $Result.DefaultSelection<Prisma.$ApartmentAttachmentPayload>
/**
 * Model Message
 * 
 */
export type Message = $Result.DefaultSelection<Prisma.$MessagePayload>
/**
 * Model CleaningTaskMessage
 * 
 */
export type CleaningTaskMessage = $Result.DefaultSelection<Prisma.$CleaningTaskMessagePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  MANAGER: 'MANAGER',
  CLEANER: 'CLEANER',
  MAINTENANCE: 'MAINTENANCE'
};

export type Role = (typeof Role)[keyof typeof Role]


export const AIAssistantMessageRole: {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT'
};

export type AIAssistantMessageRole = (typeof AIAssistantMessageRole)[keyof typeof AIAssistantMessageRole]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type AIAssistantMessageRole = $Enums.AIAssistantMessageRole

export const AIAssistantMessageRole: typeof $Enums.AIAssistantMessageRole

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.apartment`: Exposes CRUD operations for the **Apartment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Apartments
    * const apartments = await prisma.apartment.findMany()
    * ```
    */
  get apartment(): Prisma.ApartmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.checklistItem`: Exposes CRUD operations for the **ChecklistItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChecklistItems
    * const checklistItems = await prisma.checklistItem.findMany()
    * ```
    */
  get checklistItem(): Prisma.ChecklistItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.booking`: Exposes CRUD operations for the **Booking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bookings
    * const bookings = await prisma.booking.findMany()
    * ```
    */
  get booking(): Prisma.BookingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cleaningTask`: Exposes CRUD operations for the **CleaningTask** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CleaningTasks
    * const cleaningTasks = await prisma.cleaningTask.findMany()
    * ```
    */
  get cleaningTask(): Prisma.CleaningTaskDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.maintenanceTicket`: Exposes CRUD operations for the **MaintenanceTicket** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MaintenanceTickets
    * const maintenanceTickets = await prisma.maintenanceTicket.findMany()
    * ```
    */
  get maintenanceTicket(): Prisma.MaintenanceTicketDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.aIAssistantMessage`: Exposes CRUD operations for the **AIAssistantMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AIAssistantMessages
    * const aIAssistantMessages = await prisma.aIAssistantMessage.findMany()
    * ```
    */
  get aIAssistantMessage(): Prisma.AIAssistantMessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.attachment`: Exposes CRUD operations for the **Attachment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Attachments
    * const attachments = await prisma.attachment.findMany()
    * ```
    */
  get attachment(): Prisma.AttachmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.apartmentAttachment`: Exposes CRUD operations for the **ApartmentAttachment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApartmentAttachments
    * const apartmentAttachments = await prisma.apartmentAttachment.findMany()
    * ```
    */
  get apartmentAttachment(): Prisma.ApartmentAttachmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.message`: Exposes CRUD operations for the **Message** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Messages
    * const messages = await prisma.message.findMany()
    * ```
    */
  get message(): Prisma.MessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cleaningTaskMessage`: Exposes CRUD operations for the **CleaningTaskMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CleaningTaskMessages
    * const cleaningTaskMessages = await prisma.cleaningTaskMessage.findMany()
    * ```
    */
  get cleaningTaskMessage(): Prisma.CleaningTaskMessageDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.7.0
   * Query Engine version: 75cbdc1eb7150937890ad5465d861175c6624711
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Apartment: 'Apartment',
    ChecklistItem: 'ChecklistItem',
    Notification: 'Notification',
    Booking: 'Booking',
    CleaningTask: 'CleaningTask',
    MaintenanceTicket: 'MaintenanceTicket',
    AIAssistantMessage: 'AIAssistantMessage',
    Attachment: 'Attachment',
    ApartmentAttachment: 'ApartmentAttachment',
    Message: 'Message',
    CleaningTaskMessage: 'CleaningTaskMessage'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "apartment" | "checklistItem" | "notification" | "booking" | "cleaningTask" | "maintenanceTicket" | "aIAssistantMessage" | "attachment" | "apartmentAttachment" | "message" | "cleaningTaskMessage"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Apartment: {
        payload: Prisma.$ApartmentPayload<ExtArgs>
        fields: Prisma.ApartmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApartmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApartmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>
          }
          findFirst: {
            args: Prisma.ApartmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApartmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>
          }
          findMany: {
            args: Prisma.ApartmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>[]
          }
          create: {
            args: Prisma.ApartmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>
          }
          createMany: {
            args: Prisma.ApartmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApartmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>[]
          }
          delete: {
            args: Prisma.ApartmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>
          }
          update: {
            args: Prisma.ApartmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>
          }
          deleteMany: {
            args: Prisma.ApartmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApartmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApartmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>[]
          }
          upsert: {
            args: Prisma.ApartmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>
          }
          aggregate: {
            args: Prisma.ApartmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApartment>
          }
          groupBy: {
            args: Prisma.ApartmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApartmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApartmentCountArgs<ExtArgs>
            result: $Utils.Optional<ApartmentCountAggregateOutputType> | number
          }
        }
      }
      ChecklistItem: {
        payload: Prisma.$ChecklistItemPayload<ExtArgs>
        fields: Prisma.ChecklistItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChecklistItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChecklistItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload>
          }
          findFirst: {
            args: Prisma.ChecklistItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChecklistItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload>
          }
          findMany: {
            args: Prisma.ChecklistItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload>[]
          }
          create: {
            args: Prisma.ChecklistItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload>
          }
          createMany: {
            args: Prisma.ChecklistItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChecklistItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload>[]
          }
          delete: {
            args: Prisma.ChecklistItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload>
          }
          update: {
            args: Prisma.ChecklistItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload>
          }
          deleteMany: {
            args: Prisma.ChecklistItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChecklistItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ChecklistItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload>[]
          }
          upsert: {
            args: Prisma.ChecklistItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChecklistItemPayload>
          }
          aggregate: {
            args: Prisma.ChecklistItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChecklistItem>
          }
          groupBy: {
            args: Prisma.ChecklistItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChecklistItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChecklistItemCountArgs<ExtArgs>
            result: $Utils.Optional<ChecklistItemCountAggregateOutputType> | number
          }
        }
      }
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NotificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
          }
        }
      }
      Booking: {
        payload: Prisma.$BookingPayload<ExtArgs>
        fields: Prisma.BookingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BookingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BookingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          findFirst: {
            args: Prisma.BookingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BookingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          findMany: {
            args: Prisma.BookingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>[]
          }
          create: {
            args: Prisma.BookingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          createMany: {
            args: Prisma.BookingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BookingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>[]
          }
          delete: {
            args: Prisma.BookingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          update: {
            args: Prisma.BookingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          deleteMany: {
            args: Prisma.BookingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BookingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BookingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>[]
          }
          upsert: {
            args: Prisma.BookingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          aggregate: {
            args: Prisma.BookingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBooking>
          }
          groupBy: {
            args: Prisma.BookingGroupByArgs<ExtArgs>
            result: $Utils.Optional<BookingGroupByOutputType>[]
          }
          count: {
            args: Prisma.BookingCountArgs<ExtArgs>
            result: $Utils.Optional<BookingCountAggregateOutputType> | number
          }
        }
      }
      CleaningTask: {
        payload: Prisma.$CleaningTaskPayload<ExtArgs>
        fields: Prisma.CleaningTaskFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CleaningTaskFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CleaningTaskFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload>
          }
          findFirst: {
            args: Prisma.CleaningTaskFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CleaningTaskFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload>
          }
          findMany: {
            args: Prisma.CleaningTaskFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload>[]
          }
          create: {
            args: Prisma.CleaningTaskCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload>
          }
          createMany: {
            args: Prisma.CleaningTaskCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CleaningTaskCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload>[]
          }
          delete: {
            args: Prisma.CleaningTaskDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload>
          }
          update: {
            args: Prisma.CleaningTaskUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload>
          }
          deleteMany: {
            args: Prisma.CleaningTaskDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CleaningTaskUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CleaningTaskUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload>[]
          }
          upsert: {
            args: Prisma.CleaningTaskUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskPayload>
          }
          aggregate: {
            args: Prisma.CleaningTaskAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCleaningTask>
          }
          groupBy: {
            args: Prisma.CleaningTaskGroupByArgs<ExtArgs>
            result: $Utils.Optional<CleaningTaskGroupByOutputType>[]
          }
          count: {
            args: Prisma.CleaningTaskCountArgs<ExtArgs>
            result: $Utils.Optional<CleaningTaskCountAggregateOutputType> | number
          }
        }
      }
      MaintenanceTicket: {
        payload: Prisma.$MaintenanceTicketPayload<ExtArgs>
        fields: Prisma.MaintenanceTicketFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MaintenanceTicketFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MaintenanceTicketFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload>
          }
          findFirst: {
            args: Prisma.MaintenanceTicketFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MaintenanceTicketFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload>
          }
          findMany: {
            args: Prisma.MaintenanceTicketFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload>[]
          }
          create: {
            args: Prisma.MaintenanceTicketCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload>
          }
          createMany: {
            args: Prisma.MaintenanceTicketCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MaintenanceTicketCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload>[]
          }
          delete: {
            args: Prisma.MaintenanceTicketDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload>
          }
          update: {
            args: Prisma.MaintenanceTicketUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload>
          }
          deleteMany: {
            args: Prisma.MaintenanceTicketDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MaintenanceTicketUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MaintenanceTicketUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload>[]
          }
          upsert: {
            args: Prisma.MaintenanceTicketUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaintenanceTicketPayload>
          }
          aggregate: {
            args: Prisma.MaintenanceTicketAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMaintenanceTicket>
          }
          groupBy: {
            args: Prisma.MaintenanceTicketGroupByArgs<ExtArgs>
            result: $Utils.Optional<MaintenanceTicketGroupByOutputType>[]
          }
          count: {
            args: Prisma.MaintenanceTicketCountArgs<ExtArgs>
            result: $Utils.Optional<MaintenanceTicketCountAggregateOutputType> | number
          }
        }
      }
      AIAssistantMessage: {
        payload: Prisma.$AIAssistantMessagePayload<ExtArgs>
        fields: Prisma.AIAssistantMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AIAssistantMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AIAssistantMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload>
          }
          findFirst: {
            args: Prisma.AIAssistantMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AIAssistantMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload>
          }
          findMany: {
            args: Prisma.AIAssistantMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload>[]
          }
          create: {
            args: Prisma.AIAssistantMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload>
          }
          createMany: {
            args: Prisma.AIAssistantMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AIAssistantMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload>[]
          }
          delete: {
            args: Prisma.AIAssistantMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload>
          }
          update: {
            args: Prisma.AIAssistantMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload>
          }
          deleteMany: {
            args: Prisma.AIAssistantMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AIAssistantMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AIAssistantMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload>[]
          }
          upsert: {
            args: Prisma.AIAssistantMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIAssistantMessagePayload>
          }
          aggregate: {
            args: Prisma.AIAssistantMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAIAssistantMessage>
          }
          groupBy: {
            args: Prisma.AIAssistantMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<AIAssistantMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.AIAssistantMessageCountArgs<ExtArgs>
            result: $Utils.Optional<AIAssistantMessageCountAggregateOutputType> | number
          }
        }
      }
      Attachment: {
        payload: Prisma.$AttachmentPayload<ExtArgs>
        fields: Prisma.AttachmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AttachmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AttachmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          findFirst: {
            args: Prisma.AttachmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AttachmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          findMany: {
            args: Prisma.AttachmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>[]
          }
          create: {
            args: Prisma.AttachmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          createMany: {
            args: Prisma.AttachmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AttachmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>[]
          }
          delete: {
            args: Prisma.AttachmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          update: {
            args: Prisma.AttachmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          deleteMany: {
            args: Prisma.AttachmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AttachmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AttachmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>[]
          }
          upsert: {
            args: Prisma.AttachmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          aggregate: {
            args: Prisma.AttachmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAttachment>
          }
          groupBy: {
            args: Prisma.AttachmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AttachmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AttachmentCountArgs<ExtArgs>
            result: $Utils.Optional<AttachmentCountAggregateOutputType> | number
          }
        }
      }
      ApartmentAttachment: {
        payload: Prisma.$ApartmentAttachmentPayload<ExtArgs>
        fields: Prisma.ApartmentAttachmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApartmentAttachmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApartmentAttachmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload>
          }
          findFirst: {
            args: Prisma.ApartmentAttachmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApartmentAttachmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload>
          }
          findMany: {
            args: Prisma.ApartmentAttachmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload>[]
          }
          create: {
            args: Prisma.ApartmentAttachmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload>
          }
          createMany: {
            args: Prisma.ApartmentAttachmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApartmentAttachmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload>[]
          }
          delete: {
            args: Prisma.ApartmentAttachmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload>
          }
          update: {
            args: Prisma.ApartmentAttachmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload>
          }
          deleteMany: {
            args: Prisma.ApartmentAttachmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApartmentAttachmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApartmentAttachmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload>[]
          }
          upsert: {
            args: Prisma.ApartmentAttachmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApartmentAttachmentPayload>
          }
          aggregate: {
            args: Prisma.ApartmentAttachmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApartmentAttachment>
          }
          groupBy: {
            args: Prisma.ApartmentAttachmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApartmentAttachmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApartmentAttachmentCountArgs<ExtArgs>
            result: $Utils.Optional<ApartmentAttachmentCountAggregateOutputType> | number
          }
        }
      }
      Message: {
        payload: Prisma.$MessagePayload<ExtArgs>
        fields: Prisma.MessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          findFirst: {
            args: Prisma.MessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          findMany: {
            args: Prisma.MessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          create: {
            args: Prisma.MessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          createMany: {
            args: Prisma.MessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          delete: {
            args: Prisma.MessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          update: {
            args: Prisma.MessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          deleteMany: {
            args: Prisma.MessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          upsert: {
            args: Prisma.MessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          aggregate: {
            args: Prisma.MessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMessage>
          }
          groupBy: {
            args: Prisma.MessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<MessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.MessageCountArgs<ExtArgs>
            result: $Utils.Optional<MessageCountAggregateOutputType> | number
          }
        }
      }
      CleaningTaskMessage: {
        payload: Prisma.$CleaningTaskMessagePayload<ExtArgs>
        fields: Prisma.CleaningTaskMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CleaningTaskMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CleaningTaskMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload>
          }
          findFirst: {
            args: Prisma.CleaningTaskMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CleaningTaskMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload>
          }
          findMany: {
            args: Prisma.CleaningTaskMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload>[]
          }
          create: {
            args: Prisma.CleaningTaskMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload>
          }
          createMany: {
            args: Prisma.CleaningTaskMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CleaningTaskMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload>[]
          }
          delete: {
            args: Prisma.CleaningTaskMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload>
          }
          update: {
            args: Prisma.CleaningTaskMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload>
          }
          deleteMany: {
            args: Prisma.CleaningTaskMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CleaningTaskMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CleaningTaskMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload>[]
          }
          upsert: {
            args: Prisma.CleaningTaskMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleaningTaskMessagePayload>
          }
          aggregate: {
            args: Prisma.CleaningTaskMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCleaningTaskMessage>
          }
          groupBy: {
            args: Prisma.CleaningTaskMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<CleaningTaskMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.CleaningTaskMessageCountArgs<ExtArgs>
            result: $Utils.Optional<CleaningTaskMessageCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    apartment?: ApartmentOmit
    checklistItem?: ChecklistItemOmit
    notification?: NotificationOmit
    booking?: BookingOmit
    cleaningTask?: CleaningTaskOmit
    maintenanceTicket?: MaintenanceTicketOmit
    aIAssistantMessage?: AIAssistantMessageOmit
    attachment?: AttachmentOmit
    apartmentAttachment?: ApartmentAttachmentOmit
    message?: MessageOmit
    cleaningTaskMessage?: CleaningTaskMessageOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    cleaningTasks: number
    maintenanceTickets: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cleaningTasks?: boolean | UserCountOutputTypeCountCleaningTasksArgs
    maintenanceTickets?: boolean | UserCountOutputTypeCountMaintenanceTicketsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCleaningTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleaningTaskWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMaintenanceTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MaintenanceTicketWhereInput
  }


  /**
   * Count Type ApartmentCountOutputType
   */

  export type ApartmentCountOutputType = {
    bookings: number
    checklistItems: number
    cleaningTasks: number
    maintenanceTickets: number
    notifications: number
    aiAssistantMessages: number
    apartmentAttachments: number
  }

  export type ApartmentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | ApartmentCountOutputTypeCountBookingsArgs
    checklistItems?: boolean | ApartmentCountOutputTypeCountChecklistItemsArgs
    cleaningTasks?: boolean | ApartmentCountOutputTypeCountCleaningTasksArgs
    maintenanceTickets?: boolean | ApartmentCountOutputTypeCountMaintenanceTicketsArgs
    notifications?: boolean | ApartmentCountOutputTypeCountNotificationsArgs
    aiAssistantMessages?: boolean | ApartmentCountOutputTypeCountAiAssistantMessagesArgs
    apartmentAttachments?: boolean | ApartmentCountOutputTypeCountApartmentAttachmentsArgs
  }

  // Custom InputTypes
  /**
   * ApartmentCountOutputType without action
   */
  export type ApartmentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentCountOutputType
     */
    select?: ApartmentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ApartmentCountOutputType without action
   */
  export type ApartmentCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }

  /**
   * ApartmentCountOutputType without action
   */
  export type ApartmentCountOutputTypeCountChecklistItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChecklistItemWhereInput
  }

  /**
   * ApartmentCountOutputType without action
   */
  export type ApartmentCountOutputTypeCountCleaningTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleaningTaskWhereInput
  }

  /**
   * ApartmentCountOutputType without action
   */
  export type ApartmentCountOutputTypeCountMaintenanceTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MaintenanceTicketWhereInput
  }

  /**
   * ApartmentCountOutputType without action
   */
  export type ApartmentCountOutputTypeCountNotificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
  }

  /**
   * ApartmentCountOutputType without action
   */
  export type ApartmentCountOutputTypeCountAiAssistantMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AIAssistantMessageWhereInput
  }

  /**
   * ApartmentCountOutputType without action
   */
  export type ApartmentCountOutputTypeCountApartmentAttachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApartmentAttachmentWhereInput
  }


  /**
   * Count Type CleaningTaskCountOutputType
   */

  export type CleaningTaskCountOutputType = {
    messages: number
    attachments: number
    aiAssistantMessages: number
  }

  export type CleaningTaskCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | CleaningTaskCountOutputTypeCountMessagesArgs
    attachments?: boolean | CleaningTaskCountOutputTypeCountAttachmentsArgs
    aiAssistantMessages?: boolean | CleaningTaskCountOutputTypeCountAiAssistantMessagesArgs
  }

  // Custom InputTypes
  /**
   * CleaningTaskCountOutputType without action
   */
  export type CleaningTaskCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskCountOutputType
     */
    select?: CleaningTaskCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CleaningTaskCountOutputType without action
   */
  export type CleaningTaskCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleaningTaskMessageWhereInput
  }

  /**
   * CleaningTaskCountOutputType without action
   */
  export type CleaningTaskCountOutputTypeCountAttachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttachmentWhereInput
  }

  /**
   * CleaningTaskCountOutputType without action
   */
  export type CleaningTaskCountOutputTypeCountAiAssistantMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AIAssistantMessageWhereInput
  }


  /**
   * Count Type MaintenanceTicketCountOutputType
   */

  export type MaintenanceTicketCountOutputType = {
    attachments: number
    messages: number
    aiAssistantMessages: number
  }

  export type MaintenanceTicketCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attachments?: boolean | MaintenanceTicketCountOutputTypeCountAttachmentsArgs
    messages?: boolean | MaintenanceTicketCountOutputTypeCountMessagesArgs
    aiAssistantMessages?: boolean | MaintenanceTicketCountOutputTypeCountAiAssistantMessagesArgs
  }

  // Custom InputTypes
  /**
   * MaintenanceTicketCountOutputType without action
   */
  export type MaintenanceTicketCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicketCountOutputType
     */
    select?: MaintenanceTicketCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MaintenanceTicketCountOutputType without action
   */
  export type MaintenanceTicketCountOutputTypeCountAttachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttachmentWhereInput
  }

  /**
   * MaintenanceTicketCountOutputType without action
   */
  export type MaintenanceTicketCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
  }

  /**
   * MaintenanceTicketCountOutputType without action
   */
  export type MaintenanceTicketCountOutputTypeCountAiAssistantMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AIAssistantMessageWhereInput
  }


  /**
   * Count Type AttachmentCountOutputType
   */

  export type AttachmentCountOutputType = {
    messages: number
    cleaningMessages: number
  }

  export type AttachmentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | AttachmentCountOutputTypeCountMessagesArgs
    cleaningMessages?: boolean | AttachmentCountOutputTypeCountCleaningMessagesArgs
  }

  // Custom InputTypes
  /**
   * AttachmentCountOutputType without action
   */
  export type AttachmentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttachmentCountOutputType
     */
    select?: AttachmentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AttachmentCountOutputType without action
   */
  export type AttachmentCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
  }

  /**
   * AttachmentCountOutputType without action
   */
  export type AttachmentCountOutputTypeCountCleaningMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleaningTaskMessageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    role: $Enums.Role | null
    createdAt: Date | null
    name: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    role: $Enums.Role | null
    createdAt: Date | null
    name: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    role: number
    createdAt: number
    name: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    role?: true
    createdAt?: true
    name?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    role?: true
    createdAt?: true
    name?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    role?: true
    createdAt?: true
    name?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    password: string
    role: $Enums.Role
    createdAt: Date
    name: string
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    name?: boolean
    cleaningTasks?: boolean | User$cleaningTasksArgs<ExtArgs>
    maintenanceTickets?: boolean | User$maintenanceTicketsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    name?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    name?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    name?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "role" | "createdAt" | "name", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cleaningTasks?: boolean | User$cleaningTasksArgs<ExtArgs>
    maintenanceTickets?: boolean | User$maintenanceTicketsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      cleaningTasks: Prisma.$CleaningTaskPayload<ExtArgs>[]
      maintenanceTickets: Prisma.$MaintenanceTicketPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string
      role: $Enums.Role
      createdAt: Date
      name: string
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cleaningTasks<T extends User$cleaningTasksArgs<ExtArgs> = {}>(args?: Subset<T, User$cleaningTasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    maintenanceTickets<T extends User$maintenanceTicketsArgs<ExtArgs> = {}>(args?: Subset<T, User$maintenanceTicketsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly name: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.cleaningTasks
   */
  export type User$cleaningTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    where?: CleaningTaskWhereInput
    orderBy?: CleaningTaskOrderByWithRelationInput | CleaningTaskOrderByWithRelationInput[]
    cursor?: CleaningTaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CleaningTaskScalarFieldEnum | CleaningTaskScalarFieldEnum[]
  }

  /**
   * User.maintenanceTickets
   */
  export type User$maintenanceTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    where?: MaintenanceTicketWhereInput
    orderBy?: MaintenanceTicketOrderByWithRelationInput | MaintenanceTicketOrderByWithRelationInput[]
    cursor?: MaintenanceTicketWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MaintenanceTicketScalarFieldEnum | MaintenanceTicketScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Apartment
   */

  export type AggregateApartment = {
    _count: ApartmentCountAggregateOutputType | null
    _avg: ApartmentAvgAggregateOutputType | null
    _sum: ApartmentSumAggregateOutputType | null
    _min: ApartmentMinAggregateOutputType | null
    _max: ApartmentMaxAggregateOutputType | null
  }

  export type ApartmentAvgAggregateOutputType = {
    latitude: number | null
    longitude: number | null
    squareMeters: number | null
    bedrooms: number | null
    bathrooms: number | null
    maxGuests: number | null
  }

  export type ApartmentSumAggregateOutputType = {
    latitude: number | null
    longitude: number | null
    squareMeters: number | null
    bedrooms: number | null
    bathrooms: number | null
    maxGuests: number | null
  }

  export type ApartmentMinAggregateOutputType = {
    id: string | null
    name: string | null
    apartmentCode: string | null
    address: string | null
    latitude: number | null
    longitude: number | null
    squareMeters: number | null
    bedrooms: number | null
    bathrooms: number | null
    maxGuests: number | null
    accessInstructions: string | null
    icalUrl: string | null
    lastSyncAt: Date | null
    createdAt: Date | null
  }

  export type ApartmentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    apartmentCode: string | null
    address: string | null
    latitude: number | null
    longitude: number | null
    squareMeters: number | null
    bedrooms: number | null
    bathrooms: number | null
    maxGuests: number | null
    accessInstructions: string | null
    icalUrl: string | null
    lastSyncAt: Date | null
    createdAt: Date | null
  }

  export type ApartmentCountAggregateOutputType = {
    id: number
    name: number
    apartmentCode: number
    address: number
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions: number
    icalUrl: number
    lastSyncAt: number
    technicalProfile: number
    createdAt: number
    _all: number
  }


  export type ApartmentAvgAggregateInputType = {
    latitude?: true
    longitude?: true
    squareMeters?: true
    bedrooms?: true
    bathrooms?: true
    maxGuests?: true
  }

  export type ApartmentSumAggregateInputType = {
    latitude?: true
    longitude?: true
    squareMeters?: true
    bedrooms?: true
    bathrooms?: true
    maxGuests?: true
  }

  export type ApartmentMinAggregateInputType = {
    id?: true
    name?: true
    apartmentCode?: true
    address?: true
    latitude?: true
    longitude?: true
    squareMeters?: true
    bedrooms?: true
    bathrooms?: true
    maxGuests?: true
    accessInstructions?: true
    icalUrl?: true
    lastSyncAt?: true
    createdAt?: true
  }

  export type ApartmentMaxAggregateInputType = {
    id?: true
    name?: true
    apartmentCode?: true
    address?: true
    latitude?: true
    longitude?: true
    squareMeters?: true
    bedrooms?: true
    bathrooms?: true
    maxGuests?: true
    accessInstructions?: true
    icalUrl?: true
    lastSyncAt?: true
    createdAt?: true
  }

  export type ApartmentCountAggregateInputType = {
    id?: true
    name?: true
    apartmentCode?: true
    address?: true
    latitude?: true
    longitude?: true
    squareMeters?: true
    bedrooms?: true
    bathrooms?: true
    maxGuests?: true
    accessInstructions?: true
    icalUrl?: true
    lastSyncAt?: true
    technicalProfile?: true
    createdAt?: true
    _all?: true
  }

  export type ApartmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Apartment to aggregate.
     */
    where?: ApartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apartments to fetch.
     */
    orderBy?: ApartmentOrderByWithRelationInput | ApartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apartments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apartments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Apartments
    **/
    _count?: true | ApartmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ApartmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ApartmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApartmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApartmentMaxAggregateInputType
  }

  export type GetApartmentAggregateType<T extends ApartmentAggregateArgs> = {
        [P in keyof T & keyof AggregateApartment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApartment[P]>
      : GetScalarType<T[P], AggregateApartment[P]>
  }




  export type ApartmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApartmentWhereInput
    orderBy?: ApartmentOrderByWithAggregationInput | ApartmentOrderByWithAggregationInput[]
    by: ApartmentScalarFieldEnum[] | ApartmentScalarFieldEnum
    having?: ApartmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApartmentCountAggregateInputType | true
    _avg?: ApartmentAvgAggregateInputType
    _sum?: ApartmentSumAggregateInputType
    _min?: ApartmentMinAggregateInputType
    _max?: ApartmentMaxAggregateInputType
  }

  export type ApartmentGroupByOutputType = {
    id: string
    name: string
    apartmentCode: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions: string | null
    icalUrl: string | null
    lastSyncAt: Date | null
    technicalProfile: JsonValue | null
    createdAt: Date
    _count: ApartmentCountAggregateOutputType | null
    _avg: ApartmentAvgAggregateOutputType | null
    _sum: ApartmentSumAggregateOutputType | null
    _min: ApartmentMinAggregateOutputType | null
    _max: ApartmentMaxAggregateOutputType | null
  }

  type GetApartmentGroupByPayload<T extends ApartmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApartmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApartmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApartmentGroupByOutputType[P]>
            : GetScalarType<T[P], ApartmentGroupByOutputType[P]>
        }
      >
    >


  export type ApartmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    apartmentCode?: boolean
    address?: boolean
    latitude?: boolean
    longitude?: boolean
    squareMeters?: boolean
    bedrooms?: boolean
    bathrooms?: boolean
    maxGuests?: boolean
    accessInstructions?: boolean
    icalUrl?: boolean
    lastSyncAt?: boolean
    technicalProfile?: boolean
    createdAt?: boolean
    bookings?: boolean | Apartment$bookingsArgs<ExtArgs>
    checklistItems?: boolean | Apartment$checklistItemsArgs<ExtArgs>
    cleaningTasks?: boolean | Apartment$cleaningTasksArgs<ExtArgs>
    maintenanceTickets?: boolean | Apartment$maintenanceTicketsArgs<ExtArgs>
    notifications?: boolean | Apartment$notificationsArgs<ExtArgs>
    aiAssistantMessages?: boolean | Apartment$aiAssistantMessagesArgs<ExtArgs>
    apartmentAttachments?: boolean | Apartment$apartmentAttachmentsArgs<ExtArgs>
    _count?: boolean | ApartmentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apartment"]>

  export type ApartmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    apartmentCode?: boolean
    address?: boolean
    latitude?: boolean
    longitude?: boolean
    squareMeters?: boolean
    bedrooms?: boolean
    bathrooms?: boolean
    maxGuests?: boolean
    accessInstructions?: boolean
    icalUrl?: boolean
    lastSyncAt?: boolean
    technicalProfile?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["apartment"]>

  export type ApartmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    apartmentCode?: boolean
    address?: boolean
    latitude?: boolean
    longitude?: boolean
    squareMeters?: boolean
    bedrooms?: boolean
    bathrooms?: boolean
    maxGuests?: boolean
    accessInstructions?: boolean
    icalUrl?: boolean
    lastSyncAt?: boolean
    technicalProfile?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["apartment"]>

  export type ApartmentSelectScalar = {
    id?: boolean
    name?: boolean
    apartmentCode?: boolean
    address?: boolean
    latitude?: boolean
    longitude?: boolean
    squareMeters?: boolean
    bedrooms?: boolean
    bathrooms?: boolean
    maxGuests?: boolean
    accessInstructions?: boolean
    icalUrl?: boolean
    lastSyncAt?: boolean
    technicalProfile?: boolean
    createdAt?: boolean
  }

  export type ApartmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "apartmentCode" | "address" | "latitude" | "longitude" | "squareMeters" | "bedrooms" | "bathrooms" | "maxGuests" | "accessInstructions" | "icalUrl" | "lastSyncAt" | "technicalProfile" | "createdAt", ExtArgs["result"]["apartment"]>
  export type ApartmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | Apartment$bookingsArgs<ExtArgs>
    checklistItems?: boolean | Apartment$checklistItemsArgs<ExtArgs>
    cleaningTasks?: boolean | Apartment$cleaningTasksArgs<ExtArgs>
    maintenanceTickets?: boolean | Apartment$maintenanceTicketsArgs<ExtArgs>
    notifications?: boolean | Apartment$notificationsArgs<ExtArgs>
    aiAssistantMessages?: boolean | Apartment$aiAssistantMessagesArgs<ExtArgs>
    apartmentAttachments?: boolean | Apartment$apartmentAttachmentsArgs<ExtArgs>
    _count?: boolean | ApartmentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ApartmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ApartmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ApartmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Apartment"
    objects: {
      bookings: Prisma.$BookingPayload<ExtArgs>[]
      checklistItems: Prisma.$ChecklistItemPayload<ExtArgs>[]
      cleaningTasks: Prisma.$CleaningTaskPayload<ExtArgs>[]
      maintenanceTickets: Prisma.$MaintenanceTicketPayload<ExtArgs>[]
      notifications: Prisma.$NotificationPayload<ExtArgs>[]
      aiAssistantMessages: Prisma.$AIAssistantMessagePayload<ExtArgs>[]
      apartmentAttachments: Prisma.$ApartmentAttachmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      apartmentCode: string | null
      address: string
      latitude: number
      longitude: number
      squareMeters: number
      bedrooms: number
      bathrooms: number
      maxGuests: number
      accessInstructions: string | null
      icalUrl: string | null
      lastSyncAt: Date | null
      technicalProfile: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["apartment"]>
    composites: {}
  }

  type ApartmentGetPayload<S extends boolean | null | undefined | ApartmentDefaultArgs> = $Result.GetResult<Prisma.$ApartmentPayload, S>

  type ApartmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApartmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApartmentCountAggregateInputType | true
    }

  export interface ApartmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Apartment'], meta: { name: 'Apartment' } }
    /**
     * Find zero or one Apartment that matches the filter.
     * @param {ApartmentFindUniqueArgs} args - Arguments to find a Apartment
     * @example
     * // Get one Apartment
     * const apartment = await prisma.apartment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApartmentFindUniqueArgs>(args: SelectSubset<T, ApartmentFindUniqueArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Apartment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApartmentFindUniqueOrThrowArgs} args - Arguments to find a Apartment
     * @example
     * // Get one Apartment
     * const apartment = await prisma.apartment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApartmentFindUniqueOrThrowArgs>(args: SelectSubset<T, ApartmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Apartment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentFindFirstArgs} args - Arguments to find a Apartment
     * @example
     * // Get one Apartment
     * const apartment = await prisma.apartment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApartmentFindFirstArgs>(args?: SelectSubset<T, ApartmentFindFirstArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Apartment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentFindFirstOrThrowArgs} args - Arguments to find a Apartment
     * @example
     * // Get one Apartment
     * const apartment = await prisma.apartment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApartmentFindFirstOrThrowArgs>(args?: SelectSubset<T, ApartmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Apartments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Apartments
     * const apartments = await prisma.apartment.findMany()
     * 
     * // Get first 10 Apartments
     * const apartments = await prisma.apartment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apartmentWithIdOnly = await prisma.apartment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApartmentFindManyArgs>(args?: SelectSubset<T, ApartmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Apartment.
     * @param {ApartmentCreateArgs} args - Arguments to create a Apartment.
     * @example
     * // Create one Apartment
     * const Apartment = await prisma.apartment.create({
     *   data: {
     *     // ... data to create a Apartment
     *   }
     * })
     * 
     */
    create<T extends ApartmentCreateArgs>(args: SelectSubset<T, ApartmentCreateArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Apartments.
     * @param {ApartmentCreateManyArgs} args - Arguments to create many Apartments.
     * @example
     * // Create many Apartments
     * const apartment = await prisma.apartment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApartmentCreateManyArgs>(args?: SelectSubset<T, ApartmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Apartments and returns the data saved in the database.
     * @param {ApartmentCreateManyAndReturnArgs} args - Arguments to create many Apartments.
     * @example
     * // Create many Apartments
     * const apartment = await prisma.apartment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Apartments and only return the `id`
     * const apartmentWithIdOnly = await prisma.apartment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApartmentCreateManyAndReturnArgs>(args?: SelectSubset<T, ApartmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Apartment.
     * @param {ApartmentDeleteArgs} args - Arguments to delete one Apartment.
     * @example
     * // Delete one Apartment
     * const Apartment = await prisma.apartment.delete({
     *   where: {
     *     // ... filter to delete one Apartment
     *   }
     * })
     * 
     */
    delete<T extends ApartmentDeleteArgs>(args: SelectSubset<T, ApartmentDeleteArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Apartment.
     * @param {ApartmentUpdateArgs} args - Arguments to update one Apartment.
     * @example
     * // Update one Apartment
     * const apartment = await prisma.apartment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApartmentUpdateArgs>(args: SelectSubset<T, ApartmentUpdateArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Apartments.
     * @param {ApartmentDeleteManyArgs} args - Arguments to filter Apartments to delete.
     * @example
     * // Delete a few Apartments
     * const { count } = await prisma.apartment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApartmentDeleteManyArgs>(args?: SelectSubset<T, ApartmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Apartments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Apartments
     * const apartment = await prisma.apartment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApartmentUpdateManyArgs>(args: SelectSubset<T, ApartmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Apartments and returns the data updated in the database.
     * @param {ApartmentUpdateManyAndReturnArgs} args - Arguments to update many Apartments.
     * @example
     * // Update many Apartments
     * const apartment = await prisma.apartment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Apartments and only return the `id`
     * const apartmentWithIdOnly = await prisma.apartment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApartmentUpdateManyAndReturnArgs>(args: SelectSubset<T, ApartmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Apartment.
     * @param {ApartmentUpsertArgs} args - Arguments to update or create a Apartment.
     * @example
     * // Update or create a Apartment
     * const apartment = await prisma.apartment.upsert({
     *   create: {
     *     // ... data to create a Apartment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Apartment we want to update
     *   }
     * })
     */
    upsert<T extends ApartmentUpsertArgs>(args: SelectSubset<T, ApartmentUpsertArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Apartments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentCountArgs} args - Arguments to filter Apartments to count.
     * @example
     * // Count the number of Apartments
     * const count = await prisma.apartment.count({
     *   where: {
     *     // ... the filter for the Apartments we want to count
     *   }
     * })
    **/
    count<T extends ApartmentCountArgs>(
      args?: Subset<T, ApartmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApartmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Apartment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApartmentAggregateArgs>(args: Subset<T, ApartmentAggregateArgs>): Prisma.PrismaPromise<GetApartmentAggregateType<T>>

    /**
     * Group by Apartment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApartmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApartmentGroupByArgs['orderBy'] }
        : { orderBy?: ApartmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApartmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApartmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Apartment model
   */
  readonly fields: ApartmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Apartment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApartmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bookings<T extends Apartment$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, Apartment$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    checklistItems<T extends Apartment$checklistItemsArgs<ExtArgs> = {}>(args?: Subset<T, Apartment$checklistItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cleaningTasks<T extends Apartment$cleaningTasksArgs<ExtArgs> = {}>(args?: Subset<T, Apartment$cleaningTasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    maintenanceTickets<T extends Apartment$maintenanceTicketsArgs<ExtArgs> = {}>(args?: Subset<T, Apartment$maintenanceTicketsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    notifications<T extends Apartment$notificationsArgs<ExtArgs> = {}>(args?: Subset<T, Apartment$notificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    aiAssistantMessages<T extends Apartment$aiAssistantMessagesArgs<ExtArgs> = {}>(args?: Subset<T, Apartment$aiAssistantMessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    apartmentAttachments<T extends Apartment$apartmentAttachmentsArgs<ExtArgs> = {}>(args?: Subset<T, Apartment$apartmentAttachmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Apartment model
   */
  interface ApartmentFieldRefs {
    readonly id: FieldRef<"Apartment", 'String'>
    readonly name: FieldRef<"Apartment", 'String'>
    readonly apartmentCode: FieldRef<"Apartment", 'String'>
    readonly address: FieldRef<"Apartment", 'String'>
    readonly latitude: FieldRef<"Apartment", 'Float'>
    readonly longitude: FieldRef<"Apartment", 'Float'>
    readonly squareMeters: FieldRef<"Apartment", 'Int'>
    readonly bedrooms: FieldRef<"Apartment", 'Int'>
    readonly bathrooms: FieldRef<"Apartment", 'Int'>
    readonly maxGuests: FieldRef<"Apartment", 'Int'>
    readonly accessInstructions: FieldRef<"Apartment", 'String'>
    readonly icalUrl: FieldRef<"Apartment", 'String'>
    readonly lastSyncAt: FieldRef<"Apartment", 'DateTime'>
    readonly technicalProfile: FieldRef<"Apartment", 'Json'>
    readonly createdAt: FieldRef<"Apartment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Apartment findUnique
   */
  export type ApartmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    /**
     * Filter, which Apartment to fetch.
     */
    where: ApartmentWhereUniqueInput
  }

  /**
   * Apartment findUniqueOrThrow
   */
  export type ApartmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    /**
     * Filter, which Apartment to fetch.
     */
    where: ApartmentWhereUniqueInput
  }

  /**
   * Apartment findFirst
   */
  export type ApartmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    /**
     * Filter, which Apartment to fetch.
     */
    where?: ApartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apartments to fetch.
     */
    orderBy?: ApartmentOrderByWithRelationInput | ApartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Apartments.
     */
    cursor?: ApartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apartments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apartments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Apartments.
     */
    distinct?: ApartmentScalarFieldEnum | ApartmentScalarFieldEnum[]
  }

  /**
   * Apartment findFirstOrThrow
   */
  export type ApartmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    /**
     * Filter, which Apartment to fetch.
     */
    where?: ApartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apartments to fetch.
     */
    orderBy?: ApartmentOrderByWithRelationInput | ApartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Apartments.
     */
    cursor?: ApartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apartments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apartments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Apartments.
     */
    distinct?: ApartmentScalarFieldEnum | ApartmentScalarFieldEnum[]
  }

  /**
   * Apartment findMany
   */
  export type ApartmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    /**
     * Filter, which Apartments to fetch.
     */
    where?: ApartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apartments to fetch.
     */
    orderBy?: ApartmentOrderByWithRelationInput | ApartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Apartments.
     */
    cursor?: ApartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apartments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apartments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Apartments.
     */
    distinct?: ApartmentScalarFieldEnum | ApartmentScalarFieldEnum[]
  }

  /**
   * Apartment create
   */
  export type ApartmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Apartment.
     */
    data: XOR<ApartmentCreateInput, ApartmentUncheckedCreateInput>
  }

  /**
   * Apartment createMany
   */
  export type ApartmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Apartments.
     */
    data: ApartmentCreateManyInput | ApartmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Apartment createManyAndReturn
   */
  export type ApartmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * The data used to create many Apartments.
     */
    data: ApartmentCreateManyInput | ApartmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Apartment update
   */
  export type ApartmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Apartment.
     */
    data: XOR<ApartmentUpdateInput, ApartmentUncheckedUpdateInput>
    /**
     * Choose, which Apartment to update.
     */
    where: ApartmentWhereUniqueInput
  }

  /**
   * Apartment updateMany
   */
  export type ApartmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Apartments.
     */
    data: XOR<ApartmentUpdateManyMutationInput, ApartmentUncheckedUpdateManyInput>
    /**
     * Filter which Apartments to update
     */
    where?: ApartmentWhereInput
    /**
     * Limit how many Apartments to update.
     */
    limit?: number
  }

  /**
   * Apartment updateManyAndReturn
   */
  export type ApartmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * The data used to update Apartments.
     */
    data: XOR<ApartmentUpdateManyMutationInput, ApartmentUncheckedUpdateManyInput>
    /**
     * Filter which Apartments to update
     */
    where?: ApartmentWhereInput
    /**
     * Limit how many Apartments to update.
     */
    limit?: number
  }

  /**
   * Apartment upsert
   */
  export type ApartmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Apartment to update in case it exists.
     */
    where: ApartmentWhereUniqueInput
    /**
     * In case the Apartment found by the `where` argument doesn't exist, create a new Apartment with this data.
     */
    create: XOR<ApartmentCreateInput, ApartmentUncheckedCreateInput>
    /**
     * In case the Apartment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApartmentUpdateInput, ApartmentUncheckedUpdateInput>
  }

  /**
   * Apartment delete
   */
  export type ApartmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    /**
     * Filter which Apartment to delete.
     */
    where: ApartmentWhereUniqueInput
  }

  /**
   * Apartment deleteMany
   */
  export type ApartmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Apartments to delete
     */
    where?: ApartmentWhereInput
    /**
     * Limit how many Apartments to delete.
     */
    limit?: number
  }

  /**
   * Apartment.bookings
   */
  export type Apartment$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Apartment.checklistItems
   */
  export type Apartment$checklistItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
    where?: ChecklistItemWhereInput
    orderBy?: ChecklistItemOrderByWithRelationInput | ChecklistItemOrderByWithRelationInput[]
    cursor?: ChecklistItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ChecklistItemScalarFieldEnum | ChecklistItemScalarFieldEnum[]
  }

  /**
   * Apartment.cleaningTasks
   */
  export type Apartment$cleaningTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    where?: CleaningTaskWhereInput
    orderBy?: CleaningTaskOrderByWithRelationInput | CleaningTaskOrderByWithRelationInput[]
    cursor?: CleaningTaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CleaningTaskScalarFieldEnum | CleaningTaskScalarFieldEnum[]
  }

  /**
   * Apartment.maintenanceTickets
   */
  export type Apartment$maintenanceTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    where?: MaintenanceTicketWhereInput
    orderBy?: MaintenanceTicketOrderByWithRelationInput | MaintenanceTicketOrderByWithRelationInput[]
    cursor?: MaintenanceTicketWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MaintenanceTicketScalarFieldEnum | MaintenanceTicketScalarFieldEnum[]
  }

  /**
   * Apartment.notifications
   */
  export type Apartment$notificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    cursor?: NotificationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Apartment.aiAssistantMessages
   */
  export type Apartment$aiAssistantMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    where?: AIAssistantMessageWhereInput
    orderBy?: AIAssistantMessageOrderByWithRelationInput | AIAssistantMessageOrderByWithRelationInput[]
    cursor?: AIAssistantMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AIAssistantMessageScalarFieldEnum | AIAssistantMessageScalarFieldEnum[]
  }

  /**
   * Apartment.apartmentAttachments
   */
  export type Apartment$apartmentAttachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
    where?: ApartmentAttachmentWhereInput
    orderBy?: ApartmentAttachmentOrderByWithRelationInput | ApartmentAttachmentOrderByWithRelationInput[]
    cursor?: ApartmentAttachmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApartmentAttachmentScalarFieldEnum | ApartmentAttachmentScalarFieldEnum[]
  }

  /**
   * Apartment without action
   */
  export type ApartmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
  }


  /**
   * Model ChecklistItem
   */

  export type AggregateChecklistItem = {
    _count: ChecklistItemCountAggregateOutputType | null
    _avg: ChecklistItemAvgAggregateOutputType | null
    _sum: ChecklistItemSumAggregateOutputType | null
    _min: ChecklistItemMinAggregateOutputType | null
    _max: ChecklistItemMaxAggregateOutputType | null
  }

  export type ChecklistItemAvgAggregateOutputType = {
    order: number | null
  }

  export type ChecklistItemSumAggregateOutputType = {
    order: number | null
  }

  export type ChecklistItemMinAggregateOutputType = {
    id: string | null
    apartmentId: string | null
    label: string | null
    required: boolean | null
    order: number | null
    createdAt: Date | null
    formula: string | null
    type: string | null
  }

  export type ChecklistItemMaxAggregateOutputType = {
    id: string | null
    apartmentId: string | null
    label: string | null
    required: boolean | null
    order: number | null
    createdAt: Date | null
    formula: string | null
    type: string | null
  }

  export type ChecklistItemCountAggregateOutputType = {
    id: number
    apartmentId: number
    label: number
    required: number
    order: number
    createdAt: number
    formula: number
    type: number
    _all: number
  }


  export type ChecklistItemAvgAggregateInputType = {
    order?: true
  }

  export type ChecklistItemSumAggregateInputType = {
    order?: true
  }

  export type ChecklistItemMinAggregateInputType = {
    id?: true
    apartmentId?: true
    label?: true
    required?: true
    order?: true
    createdAt?: true
    formula?: true
    type?: true
  }

  export type ChecklistItemMaxAggregateInputType = {
    id?: true
    apartmentId?: true
    label?: true
    required?: true
    order?: true
    createdAt?: true
    formula?: true
    type?: true
  }

  export type ChecklistItemCountAggregateInputType = {
    id?: true
    apartmentId?: true
    label?: true
    required?: true
    order?: true
    createdAt?: true
    formula?: true
    type?: true
    _all?: true
  }

  export type ChecklistItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChecklistItem to aggregate.
     */
    where?: ChecklistItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChecklistItems to fetch.
     */
    orderBy?: ChecklistItemOrderByWithRelationInput | ChecklistItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChecklistItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChecklistItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChecklistItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChecklistItems
    **/
    _count?: true | ChecklistItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ChecklistItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ChecklistItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChecklistItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChecklistItemMaxAggregateInputType
  }

  export type GetChecklistItemAggregateType<T extends ChecklistItemAggregateArgs> = {
        [P in keyof T & keyof AggregateChecklistItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChecklistItem[P]>
      : GetScalarType<T[P], AggregateChecklistItem[P]>
  }




  export type ChecklistItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChecklistItemWhereInput
    orderBy?: ChecklistItemOrderByWithAggregationInput | ChecklistItemOrderByWithAggregationInput[]
    by: ChecklistItemScalarFieldEnum[] | ChecklistItemScalarFieldEnum
    having?: ChecklistItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChecklistItemCountAggregateInputType | true
    _avg?: ChecklistItemAvgAggregateInputType
    _sum?: ChecklistItemSumAggregateInputType
    _min?: ChecklistItemMinAggregateInputType
    _max?: ChecklistItemMaxAggregateInputType
  }

  export type ChecklistItemGroupByOutputType = {
    id: string
    apartmentId: string
    label: string
    required: boolean
    order: number
    createdAt: Date
    formula: string | null
    type: string
    _count: ChecklistItemCountAggregateOutputType | null
    _avg: ChecklistItemAvgAggregateOutputType | null
    _sum: ChecklistItemSumAggregateOutputType | null
    _min: ChecklistItemMinAggregateOutputType | null
    _max: ChecklistItemMaxAggregateOutputType | null
  }

  type GetChecklistItemGroupByPayload<T extends ChecklistItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChecklistItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChecklistItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChecklistItemGroupByOutputType[P]>
            : GetScalarType<T[P], ChecklistItemGroupByOutputType[P]>
        }
      >
    >


  export type ChecklistItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    label?: boolean
    required?: boolean
    order?: boolean
    createdAt?: boolean
    formula?: boolean
    type?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["checklistItem"]>

  export type ChecklistItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    label?: boolean
    required?: boolean
    order?: boolean
    createdAt?: boolean
    formula?: boolean
    type?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["checklistItem"]>

  export type ChecklistItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    label?: boolean
    required?: boolean
    order?: boolean
    createdAt?: boolean
    formula?: boolean
    type?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["checklistItem"]>

  export type ChecklistItemSelectScalar = {
    id?: boolean
    apartmentId?: boolean
    label?: boolean
    required?: boolean
    order?: boolean
    createdAt?: boolean
    formula?: boolean
    type?: boolean
  }

  export type ChecklistItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "apartmentId" | "label" | "required" | "order" | "createdAt" | "formula" | "type", ExtArgs["result"]["checklistItem"]>
  export type ChecklistItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }
  export type ChecklistItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }
  export type ChecklistItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }

  export type $ChecklistItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChecklistItem"
    objects: {
      apartment: Prisma.$ApartmentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      apartmentId: string
      label: string
      required: boolean
      order: number
      createdAt: Date
      formula: string | null
      type: string
    }, ExtArgs["result"]["checklistItem"]>
    composites: {}
  }

  type ChecklistItemGetPayload<S extends boolean | null | undefined | ChecklistItemDefaultArgs> = $Result.GetResult<Prisma.$ChecklistItemPayload, S>

  type ChecklistItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ChecklistItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ChecklistItemCountAggregateInputType | true
    }

  export interface ChecklistItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChecklistItem'], meta: { name: 'ChecklistItem' } }
    /**
     * Find zero or one ChecklistItem that matches the filter.
     * @param {ChecklistItemFindUniqueArgs} args - Arguments to find a ChecklistItem
     * @example
     * // Get one ChecklistItem
     * const checklistItem = await prisma.checklistItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChecklistItemFindUniqueArgs>(args: SelectSubset<T, ChecklistItemFindUniqueArgs<ExtArgs>>): Prisma__ChecklistItemClient<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ChecklistItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChecklistItemFindUniqueOrThrowArgs} args - Arguments to find a ChecklistItem
     * @example
     * // Get one ChecklistItem
     * const checklistItem = await prisma.checklistItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChecklistItemFindUniqueOrThrowArgs>(args: SelectSubset<T, ChecklistItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChecklistItemClient<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChecklistItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChecklistItemFindFirstArgs} args - Arguments to find a ChecklistItem
     * @example
     * // Get one ChecklistItem
     * const checklistItem = await prisma.checklistItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChecklistItemFindFirstArgs>(args?: SelectSubset<T, ChecklistItemFindFirstArgs<ExtArgs>>): Prisma__ChecklistItemClient<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChecklistItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChecklistItemFindFirstOrThrowArgs} args - Arguments to find a ChecklistItem
     * @example
     * // Get one ChecklistItem
     * const checklistItem = await prisma.checklistItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChecklistItemFindFirstOrThrowArgs>(args?: SelectSubset<T, ChecklistItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChecklistItemClient<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ChecklistItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChecklistItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChecklistItems
     * const checklistItems = await prisma.checklistItem.findMany()
     * 
     * // Get first 10 ChecklistItems
     * const checklistItems = await prisma.checklistItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const checklistItemWithIdOnly = await prisma.checklistItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChecklistItemFindManyArgs>(args?: SelectSubset<T, ChecklistItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ChecklistItem.
     * @param {ChecklistItemCreateArgs} args - Arguments to create a ChecklistItem.
     * @example
     * // Create one ChecklistItem
     * const ChecklistItem = await prisma.checklistItem.create({
     *   data: {
     *     // ... data to create a ChecklistItem
     *   }
     * })
     * 
     */
    create<T extends ChecklistItemCreateArgs>(args: SelectSubset<T, ChecklistItemCreateArgs<ExtArgs>>): Prisma__ChecklistItemClient<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ChecklistItems.
     * @param {ChecklistItemCreateManyArgs} args - Arguments to create many ChecklistItems.
     * @example
     * // Create many ChecklistItems
     * const checklistItem = await prisma.checklistItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChecklistItemCreateManyArgs>(args?: SelectSubset<T, ChecklistItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ChecklistItems and returns the data saved in the database.
     * @param {ChecklistItemCreateManyAndReturnArgs} args - Arguments to create many ChecklistItems.
     * @example
     * // Create many ChecklistItems
     * const checklistItem = await prisma.checklistItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ChecklistItems and only return the `id`
     * const checklistItemWithIdOnly = await prisma.checklistItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChecklistItemCreateManyAndReturnArgs>(args?: SelectSubset<T, ChecklistItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ChecklistItem.
     * @param {ChecklistItemDeleteArgs} args - Arguments to delete one ChecklistItem.
     * @example
     * // Delete one ChecklistItem
     * const ChecklistItem = await prisma.checklistItem.delete({
     *   where: {
     *     // ... filter to delete one ChecklistItem
     *   }
     * })
     * 
     */
    delete<T extends ChecklistItemDeleteArgs>(args: SelectSubset<T, ChecklistItemDeleteArgs<ExtArgs>>): Prisma__ChecklistItemClient<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ChecklistItem.
     * @param {ChecklistItemUpdateArgs} args - Arguments to update one ChecklistItem.
     * @example
     * // Update one ChecklistItem
     * const checklistItem = await prisma.checklistItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChecklistItemUpdateArgs>(args: SelectSubset<T, ChecklistItemUpdateArgs<ExtArgs>>): Prisma__ChecklistItemClient<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ChecklistItems.
     * @param {ChecklistItemDeleteManyArgs} args - Arguments to filter ChecklistItems to delete.
     * @example
     * // Delete a few ChecklistItems
     * const { count } = await prisma.checklistItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChecklistItemDeleteManyArgs>(args?: SelectSubset<T, ChecklistItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChecklistItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChecklistItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChecklistItems
     * const checklistItem = await prisma.checklistItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChecklistItemUpdateManyArgs>(args: SelectSubset<T, ChecklistItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChecklistItems and returns the data updated in the database.
     * @param {ChecklistItemUpdateManyAndReturnArgs} args - Arguments to update many ChecklistItems.
     * @example
     * // Update many ChecklistItems
     * const checklistItem = await prisma.checklistItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ChecklistItems and only return the `id`
     * const checklistItemWithIdOnly = await prisma.checklistItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ChecklistItemUpdateManyAndReturnArgs>(args: SelectSubset<T, ChecklistItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ChecklistItem.
     * @param {ChecklistItemUpsertArgs} args - Arguments to update or create a ChecklistItem.
     * @example
     * // Update or create a ChecklistItem
     * const checklistItem = await prisma.checklistItem.upsert({
     *   create: {
     *     // ... data to create a ChecklistItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChecklistItem we want to update
     *   }
     * })
     */
    upsert<T extends ChecklistItemUpsertArgs>(args: SelectSubset<T, ChecklistItemUpsertArgs<ExtArgs>>): Prisma__ChecklistItemClient<$Result.GetResult<Prisma.$ChecklistItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ChecklistItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChecklistItemCountArgs} args - Arguments to filter ChecklistItems to count.
     * @example
     * // Count the number of ChecklistItems
     * const count = await prisma.checklistItem.count({
     *   where: {
     *     // ... the filter for the ChecklistItems we want to count
     *   }
     * })
    **/
    count<T extends ChecklistItemCountArgs>(
      args?: Subset<T, ChecklistItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChecklistItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChecklistItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChecklistItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChecklistItemAggregateArgs>(args: Subset<T, ChecklistItemAggregateArgs>): Prisma.PrismaPromise<GetChecklistItemAggregateType<T>>

    /**
     * Group by ChecklistItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChecklistItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChecklistItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChecklistItemGroupByArgs['orderBy'] }
        : { orderBy?: ChecklistItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChecklistItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChecklistItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChecklistItem model
   */
  readonly fields: ChecklistItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChecklistItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChecklistItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    apartment<T extends ApartmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApartmentDefaultArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChecklistItem model
   */
  interface ChecklistItemFieldRefs {
    readonly id: FieldRef<"ChecklistItem", 'String'>
    readonly apartmentId: FieldRef<"ChecklistItem", 'String'>
    readonly label: FieldRef<"ChecklistItem", 'String'>
    readonly required: FieldRef<"ChecklistItem", 'Boolean'>
    readonly order: FieldRef<"ChecklistItem", 'Int'>
    readonly createdAt: FieldRef<"ChecklistItem", 'DateTime'>
    readonly formula: FieldRef<"ChecklistItem", 'String'>
    readonly type: FieldRef<"ChecklistItem", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ChecklistItem findUnique
   */
  export type ChecklistItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
    /**
     * Filter, which ChecklistItem to fetch.
     */
    where: ChecklistItemWhereUniqueInput
  }

  /**
   * ChecklistItem findUniqueOrThrow
   */
  export type ChecklistItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
    /**
     * Filter, which ChecklistItem to fetch.
     */
    where: ChecklistItemWhereUniqueInput
  }

  /**
   * ChecklistItem findFirst
   */
  export type ChecklistItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
    /**
     * Filter, which ChecklistItem to fetch.
     */
    where?: ChecklistItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChecklistItems to fetch.
     */
    orderBy?: ChecklistItemOrderByWithRelationInput | ChecklistItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChecklistItems.
     */
    cursor?: ChecklistItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChecklistItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChecklistItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChecklistItems.
     */
    distinct?: ChecklistItemScalarFieldEnum | ChecklistItemScalarFieldEnum[]
  }

  /**
   * ChecklistItem findFirstOrThrow
   */
  export type ChecklistItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
    /**
     * Filter, which ChecklistItem to fetch.
     */
    where?: ChecklistItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChecklistItems to fetch.
     */
    orderBy?: ChecklistItemOrderByWithRelationInput | ChecklistItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChecklistItems.
     */
    cursor?: ChecklistItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChecklistItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChecklistItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChecklistItems.
     */
    distinct?: ChecklistItemScalarFieldEnum | ChecklistItemScalarFieldEnum[]
  }

  /**
   * ChecklistItem findMany
   */
  export type ChecklistItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
    /**
     * Filter, which ChecklistItems to fetch.
     */
    where?: ChecklistItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChecklistItems to fetch.
     */
    orderBy?: ChecklistItemOrderByWithRelationInput | ChecklistItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChecklistItems.
     */
    cursor?: ChecklistItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChecklistItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChecklistItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChecklistItems.
     */
    distinct?: ChecklistItemScalarFieldEnum | ChecklistItemScalarFieldEnum[]
  }

  /**
   * ChecklistItem create
   */
  export type ChecklistItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
    /**
     * The data needed to create a ChecklistItem.
     */
    data: XOR<ChecklistItemCreateInput, ChecklistItemUncheckedCreateInput>
  }

  /**
   * ChecklistItem createMany
   */
  export type ChecklistItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChecklistItems.
     */
    data: ChecklistItemCreateManyInput | ChecklistItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChecklistItem createManyAndReturn
   */
  export type ChecklistItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * The data used to create many ChecklistItems.
     */
    data: ChecklistItemCreateManyInput | ChecklistItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ChecklistItem update
   */
  export type ChecklistItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
    /**
     * The data needed to update a ChecklistItem.
     */
    data: XOR<ChecklistItemUpdateInput, ChecklistItemUncheckedUpdateInput>
    /**
     * Choose, which ChecklistItem to update.
     */
    where: ChecklistItemWhereUniqueInput
  }

  /**
   * ChecklistItem updateMany
   */
  export type ChecklistItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChecklistItems.
     */
    data: XOR<ChecklistItemUpdateManyMutationInput, ChecklistItemUncheckedUpdateManyInput>
    /**
     * Filter which ChecklistItems to update
     */
    where?: ChecklistItemWhereInput
    /**
     * Limit how many ChecklistItems to update.
     */
    limit?: number
  }

  /**
   * ChecklistItem updateManyAndReturn
   */
  export type ChecklistItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * The data used to update ChecklistItems.
     */
    data: XOR<ChecklistItemUpdateManyMutationInput, ChecklistItemUncheckedUpdateManyInput>
    /**
     * Filter which ChecklistItems to update
     */
    where?: ChecklistItemWhereInput
    /**
     * Limit how many ChecklistItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ChecklistItem upsert
   */
  export type ChecklistItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
    /**
     * The filter to search for the ChecklistItem to update in case it exists.
     */
    where: ChecklistItemWhereUniqueInput
    /**
     * In case the ChecklistItem found by the `where` argument doesn't exist, create a new ChecklistItem with this data.
     */
    create: XOR<ChecklistItemCreateInput, ChecklistItemUncheckedCreateInput>
    /**
     * In case the ChecklistItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChecklistItemUpdateInput, ChecklistItemUncheckedUpdateInput>
  }

  /**
   * ChecklistItem delete
   */
  export type ChecklistItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
    /**
     * Filter which ChecklistItem to delete.
     */
    where: ChecklistItemWhereUniqueInput
  }

  /**
   * ChecklistItem deleteMany
   */
  export type ChecklistItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChecklistItems to delete
     */
    where?: ChecklistItemWhereInput
    /**
     * Limit how many ChecklistItems to delete.
     */
    limit?: number
  }

  /**
   * ChecklistItem without action
   */
  export type ChecklistItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChecklistItem
     */
    select?: ChecklistItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChecklistItem
     */
    omit?: ChecklistItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChecklistItemInclude<ExtArgs> | null
  }


  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationMinAggregateOutputType = {
    id: string | null
    type: string | null
    title: string | null
    message: string | null
    isRead: boolean | null
    createdAt: Date | null
    apartmentId: string | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: string | null
    type: string | null
    title: string | null
    message: string | null
    isRead: boolean | null
    createdAt: Date | null
    apartmentId: string | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    type: number
    title: number
    message: number
    isRead: number
    createdAt: number
    apartmentId: number
    _all: number
  }


  export type NotificationMinAggregateInputType = {
    id?: true
    type?: true
    title?: true
    message?: true
    isRead?: true
    createdAt?: true
    apartmentId?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    type?: true
    title?: true
    message?: true
    isRead?: true
    createdAt?: true
    apartmentId?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    type?: true
    title?: true
    message?: true
    isRead?: true
    createdAt?: true
    apartmentId?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: string
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: Date
    apartmentId: string | null
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    apartmentId?: boolean
    apartment?: boolean | Notification$apartmentArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    apartmentId?: boolean
    apartment?: boolean | Notification$apartmentArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    apartmentId?: boolean
    apartment?: boolean | Notification$apartmentArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectScalar = {
    id?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    apartmentId?: boolean
  }

  export type NotificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "type" | "title" | "message" | "isRead" | "createdAt" | "apartmentId", ExtArgs["result"]["notification"]>
  export type NotificationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | Notification$apartmentArgs<ExtArgs>
  }
  export type NotificationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | Notification$apartmentArgs<ExtArgs>
  }
  export type NotificationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | Notification$apartmentArgs<ExtArgs>
  }

  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {
      apartment: Prisma.$ApartmentPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: string
      title: string
      message: string
      isRead: boolean
      createdAt: Date
      apartmentId: string | null
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notifications and returns the data saved in the database.
     * @param {NotificationCreateManyAndReturnArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications and returns the data updated in the database.
     * @param {NotificationUpdateManyAndReturnArgs} args - Arguments to update many Notifications.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NotificationUpdateManyAndReturnArgs>(args: SelectSubset<T, NotificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    apartment<T extends Notification$apartmentArgs<ExtArgs> = {}>(args?: Subset<T, Notification$apartmentArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Notification model
   */
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'String'>
    readonly type: FieldRef<"Notification", 'String'>
    readonly title: FieldRef<"Notification", 'String'>
    readonly message: FieldRef<"Notification", 'String'>
    readonly isRead: FieldRef<"Notification", 'Boolean'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
    readonly apartmentId: FieldRef<"Notification", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification createManyAndReturn
   */
  export type NotificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification updateManyAndReturn
   */
  export type NotificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to delete.
     */
    limit?: number
  }

  /**
   * Notification.apartment
   */
  export type Notification$apartmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    where?: ApartmentWhereInput
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
  }


  /**
   * Model Booking
   */

  export type AggregateBooking = {
    _count: BookingCountAggregateOutputType | null
    _avg: BookingAvgAggregateOutputType | null
    _sum: BookingSumAggregateOutputType | null
    _min: BookingMinAggregateOutputType | null
    _max: BookingMaxAggregateOutputType | null
  }

  export type BookingAvgAggregateOutputType = {
    totalGuests: number | null
  }

  export type BookingSumAggregateOutputType = {
    totalGuests: number | null
  }

  export type BookingMinAggregateOutputType = {
    id: string | null
    apartmentId: string | null
    guestName: string | null
    totalGuests: number | null
    checkInDate: Date | null
    checkOutDate: Date | null
    status: string | null
    externalId: string | null
    source: string | null
    createdAt: Date | null
  }

  export type BookingMaxAggregateOutputType = {
    id: string | null
    apartmentId: string | null
    guestName: string | null
    totalGuests: number | null
    checkInDate: Date | null
    checkOutDate: Date | null
    status: string | null
    externalId: string | null
    source: string | null
    createdAt: Date | null
  }

  export type BookingCountAggregateOutputType = {
    id: number
    apartmentId: number
    guestName: number
    totalGuests: number
    checkInDate: number
    checkOutDate: number
    status: number
    externalId: number
    source: number
    createdAt: number
    _all: number
  }


  export type BookingAvgAggregateInputType = {
    totalGuests?: true
  }

  export type BookingSumAggregateInputType = {
    totalGuests?: true
  }

  export type BookingMinAggregateInputType = {
    id?: true
    apartmentId?: true
    guestName?: true
    totalGuests?: true
    checkInDate?: true
    checkOutDate?: true
    status?: true
    externalId?: true
    source?: true
    createdAt?: true
  }

  export type BookingMaxAggregateInputType = {
    id?: true
    apartmentId?: true
    guestName?: true
    totalGuests?: true
    checkInDate?: true
    checkOutDate?: true
    status?: true
    externalId?: true
    source?: true
    createdAt?: true
  }

  export type BookingCountAggregateInputType = {
    id?: true
    apartmentId?: true
    guestName?: true
    totalGuests?: true
    checkInDate?: true
    checkOutDate?: true
    status?: true
    externalId?: true
    source?: true
    createdAt?: true
    _all?: true
  }

  export type BookingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Booking to aggregate.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bookings
    **/
    _count?: true | BookingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BookingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BookingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BookingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BookingMaxAggregateInputType
  }

  export type GetBookingAggregateType<T extends BookingAggregateArgs> = {
        [P in keyof T & keyof AggregateBooking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBooking[P]>
      : GetScalarType<T[P], AggregateBooking[P]>
  }




  export type BookingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithAggregationInput | BookingOrderByWithAggregationInput[]
    by: BookingScalarFieldEnum[] | BookingScalarFieldEnum
    having?: BookingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BookingCountAggregateInputType | true
    _avg?: BookingAvgAggregateInputType
    _sum?: BookingSumAggregateInputType
    _min?: BookingMinAggregateInputType
    _max?: BookingMaxAggregateInputType
  }

  export type BookingGroupByOutputType = {
    id: string
    apartmentId: string
    guestName: string | null
    totalGuests: number
    checkInDate: Date
    checkOutDate: Date
    status: string | null
    externalId: string | null
    source: string | null
    createdAt: Date
    _count: BookingCountAggregateOutputType | null
    _avg: BookingAvgAggregateOutputType | null
    _sum: BookingSumAggregateOutputType | null
    _min: BookingMinAggregateOutputType | null
    _max: BookingMaxAggregateOutputType | null
  }

  type GetBookingGroupByPayload<T extends BookingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BookingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BookingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BookingGroupByOutputType[P]>
            : GetScalarType<T[P], BookingGroupByOutputType[P]>
        }
      >
    >


  export type BookingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    guestName?: boolean
    totalGuests?: boolean
    checkInDate?: boolean
    checkOutDate?: boolean
    status?: boolean
    externalId?: boolean
    source?: boolean
    createdAt?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    cleaningTask?: boolean | Booking$cleaningTaskArgs<ExtArgs>
  }, ExtArgs["result"]["booking"]>

  export type BookingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    guestName?: boolean
    totalGuests?: boolean
    checkInDate?: boolean
    checkOutDate?: boolean
    status?: boolean
    externalId?: boolean
    source?: boolean
    createdAt?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["booking"]>

  export type BookingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    guestName?: boolean
    totalGuests?: boolean
    checkInDate?: boolean
    checkOutDate?: boolean
    status?: boolean
    externalId?: boolean
    source?: boolean
    createdAt?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["booking"]>

  export type BookingSelectScalar = {
    id?: boolean
    apartmentId?: boolean
    guestName?: boolean
    totalGuests?: boolean
    checkInDate?: boolean
    checkOutDate?: boolean
    status?: boolean
    externalId?: boolean
    source?: boolean
    createdAt?: boolean
  }

  export type BookingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "apartmentId" | "guestName" | "totalGuests" | "checkInDate" | "checkOutDate" | "status" | "externalId" | "source" | "createdAt", ExtArgs["result"]["booking"]>
  export type BookingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    cleaningTask?: boolean | Booking$cleaningTaskArgs<ExtArgs>
  }
  export type BookingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }
  export type BookingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }

  export type $BookingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Booking"
    objects: {
      apartment: Prisma.$ApartmentPayload<ExtArgs>
      cleaningTask: Prisma.$CleaningTaskPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      apartmentId: string
      guestName: string | null
      totalGuests: number
      checkInDate: Date
      checkOutDate: Date
      status: string | null
      externalId: string | null
      source: string | null
      createdAt: Date
    }, ExtArgs["result"]["booking"]>
    composites: {}
  }

  type BookingGetPayload<S extends boolean | null | undefined | BookingDefaultArgs> = $Result.GetResult<Prisma.$BookingPayload, S>

  type BookingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BookingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BookingCountAggregateInputType | true
    }

  export interface BookingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Booking'], meta: { name: 'Booking' } }
    /**
     * Find zero or one Booking that matches the filter.
     * @param {BookingFindUniqueArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BookingFindUniqueArgs>(args: SelectSubset<T, BookingFindUniqueArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Booking that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BookingFindUniqueOrThrowArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BookingFindUniqueOrThrowArgs>(args: SelectSubset<T, BookingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Booking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindFirstArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BookingFindFirstArgs>(args?: SelectSubset<T, BookingFindFirstArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Booking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindFirstOrThrowArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BookingFindFirstOrThrowArgs>(args?: SelectSubset<T, BookingFindFirstOrThrowArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Bookings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bookings
     * const bookings = await prisma.booking.findMany()
     * 
     * // Get first 10 Bookings
     * const bookings = await prisma.booking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bookingWithIdOnly = await prisma.booking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BookingFindManyArgs>(args?: SelectSubset<T, BookingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Booking.
     * @param {BookingCreateArgs} args - Arguments to create a Booking.
     * @example
     * // Create one Booking
     * const Booking = await prisma.booking.create({
     *   data: {
     *     // ... data to create a Booking
     *   }
     * })
     * 
     */
    create<T extends BookingCreateArgs>(args: SelectSubset<T, BookingCreateArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Bookings.
     * @param {BookingCreateManyArgs} args - Arguments to create many Bookings.
     * @example
     * // Create many Bookings
     * const booking = await prisma.booking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BookingCreateManyArgs>(args?: SelectSubset<T, BookingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Bookings and returns the data saved in the database.
     * @param {BookingCreateManyAndReturnArgs} args - Arguments to create many Bookings.
     * @example
     * // Create many Bookings
     * const booking = await prisma.booking.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Bookings and only return the `id`
     * const bookingWithIdOnly = await prisma.booking.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BookingCreateManyAndReturnArgs>(args?: SelectSubset<T, BookingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Booking.
     * @param {BookingDeleteArgs} args - Arguments to delete one Booking.
     * @example
     * // Delete one Booking
     * const Booking = await prisma.booking.delete({
     *   where: {
     *     // ... filter to delete one Booking
     *   }
     * })
     * 
     */
    delete<T extends BookingDeleteArgs>(args: SelectSubset<T, BookingDeleteArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Booking.
     * @param {BookingUpdateArgs} args - Arguments to update one Booking.
     * @example
     * // Update one Booking
     * const booking = await prisma.booking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BookingUpdateArgs>(args: SelectSubset<T, BookingUpdateArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Bookings.
     * @param {BookingDeleteManyArgs} args - Arguments to filter Bookings to delete.
     * @example
     * // Delete a few Bookings
     * const { count } = await prisma.booking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BookingDeleteManyArgs>(args?: SelectSubset<T, BookingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bookings
     * const booking = await prisma.booking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BookingUpdateManyArgs>(args: SelectSubset<T, BookingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bookings and returns the data updated in the database.
     * @param {BookingUpdateManyAndReturnArgs} args - Arguments to update many Bookings.
     * @example
     * // Update many Bookings
     * const booking = await prisma.booking.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Bookings and only return the `id`
     * const bookingWithIdOnly = await prisma.booking.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BookingUpdateManyAndReturnArgs>(args: SelectSubset<T, BookingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Booking.
     * @param {BookingUpsertArgs} args - Arguments to update or create a Booking.
     * @example
     * // Update or create a Booking
     * const booking = await prisma.booking.upsert({
     *   create: {
     *     // ... data to create a Booking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Booking we want to update
     *   }
     * })
     */
    upsert<T extends BookingUpsertArgs>(args: SelectSubset<T, BookingUpsertArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingCountArgs} args - Arguments to filter Bookings to count.
     * @example
     * // Count the number of Bookings
     * const count = await prisma.booking.count({
     *   where: {
     *     // ... the filter for the Bookings we want to count
     *   }
     * })
    **/
    count<T extends BookingCountArgs>(
      args?: Subset<T, BookingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BookingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Booking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BookingAggregateArgs>(args: Subset<T, BookingAggregateArgs>): Prisma.PrismaPromise<GetBookingAggregateType<T>>

    /**
     * Group by Booking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BookingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BookingGroupByArgs['orderBy'] }
        : { orderBy?: BookingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BookingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBookingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Booking model
   */
  readonly fields: BookingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Booking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BookingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    apartment<T extends ApartmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApartmentDefaultArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    cleaningTask<T extends Booking$cleaningTaskArgs<ExtArgs> = {}>(args?: Subset<T, Booking$cleaningTaskArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Booking model
   */
  interface BookingFieldRefs {
    readonly id: FieldRef<"Booking", 'String'>
    readonly apartmentId: FieldRef<"Booking", 'String'>
    readonly guestName: FieldRef<"Booking", 'String'>
    readonly totalGuests: FieldRef<"Booking", 'Int'>
    readonly checkInDate: FieldRef<"Booking", 'DateTime'>
    readonly checkOutDate: FieldRef<"Booking", 'DateTime'>
    readonly status: FieldRef<"Booking", 'String'>
    readonly externalId: FieldRef<"Booking", 'String'>
    readonly source: FieldRef<"Booking", 'String'>
    readonly createdAt: FieldRef<"Booking", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Booking findUnique
   */
  export type BookingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking findUniqueOrThrow
   */
  export type BookingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking findFirst
   */
  export type BookingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bookings.
     */
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking findFirstOrThrow
   */
  export type BookingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bookings.
     */
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking findMany
   */
  export type BookingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Bookings to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bookings.
     */
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking create
   */
  export type BookingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The data needed to create a Booking.
     */
    data: XOR<BookingCreateInput, BookingUncheckedCreateInput>
  }

  /**
   * Booking createMany
   */
  export type BookingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bookings.
     */
    data: BookingCreateManyInput | BookingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Booking createManyAndReturn
   */
  export type BookingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * The data used to create many Bookings.
     */
    data: BookingCreateManyInput | BookingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Booking update
   */
  export type BookingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The data needed to update a Booking.
     */
    data: XOR<BookingUpdateInput, BookingUncheckedUpdateInput>
    /**
     * Choose, which Booking to update.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking updateMany
   */
  export type BookingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bookings.
     */
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyInput>
    /**
     * Filter which Bookings to update
     */
    where?: BookingWhereInput
    /**
     * Limit how many Bookings to update.
     */
    limit?: number
  }

  /**
   * Booking updateManyAndReturn
   */
  export type BookingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * The data used to update Bookings.
     */
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyInput>
    /**
     * Filter which Bookings to update
     */
    where?: BookingWhereInput
    /**
     * Limit how many Bookings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Booking upsert
   */
  export type BookingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The filter to search for the Booking to update in case it exists.
     */
    where: BookingWhereUniqueInput
    /**
     * In case the Booking found by the `where` argument doesn't exist, create a new Booking with this data.
     */
    create: XOR<BookingCreateInput, BookingUncheckedCreateInput>
    /**
     * In case the Booking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BookingUpdateInput, BookingUncheckedUpdateInput>
  }

  /**
   * Booking delete
   */
  export type BookingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter which Booking to delete.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking deleteMany
   */
  export type BookingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bookings to delete
     */
    where?: BookingWhereInput
    /**
     * Limit how many Bookings to delete.
     */
    limit?: number
  }

  /**
   * Booking.cleaningTask
   */
  export type Booking$cleaningTaskArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    where?: CleaningTaskWhereInput
  }

  /**
   * Booking without action
   */
  export type BookingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
  }


  /**
   * Model CleaningTask
   */

  export type AggregateCleaningTask = {
    _count: CleaningTaskCountAggregateOutputType | null
    _min: CleaningTaskMinAggregateOutputType | null
    _max: CleaningTaskMaxAggregateOutputType | null
  }

  export type CleaningTaskMinAggregateOutputType = {
    id: string | null
    apartmentId: string | null
    date: Date | null
    status: string | null
    createdAt: Date | null
    assignedToId: string | null
    notes: string | null
    bookingId: string | null
  }

  export type CleaningTaskMaxAggregateOutputType = {
    id: string | null
    apartmentId: string | null
    date: Date | null
    status: string | null
    createdAt: Date | null
    assignedToId: string | null
    notes: string | null
    bookingId: string | null
  }

  export type CleaningTaskCountAggregateOutputType = {
    id: number
    apartmentId: number
    date: number
    status: number
    createdAt: number
    assignedToId: number
    notes: number
    bookingId: number
    checklistProgress: number
    _all: number
  }


  export type CleaningTaskMinAggregateInputType = {
    id?: true
    apartmentId?: true
    date?: true
    status?: true
    createdAt?: true
    assignedToId?: true
    notes?: true
    bookingId?: true
  }

  export type CleaningTaskMaxAggregateInputType = {
    id?: true
    apartmentId?: true
    date?: true
    status?: true
    createdAt?: true
    assignedToId?: true
    notes?: true
    bookingId?: true
  }

  export type CleaningTaskCountAggregateInputType = {
    id?: true
    apartmentId?: true
    date?: true
    status?: true
    createdAt?: true
    assignedToId?: true
    notes?: true
    bookingId?: true
    checklistProgress?: true
    _all?: true
  }

  export type CleaningTaskAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CleaningTask to aggregate.
     */
    where?: CleaningTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleaningTasks to fetch.
     */
    orderBy?: CleaningTaskOrderByWithRelationInput | CleaningTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CleaningTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleaningTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleaningTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CleaningTasks
    **/
    _count?: true | CleaningTaskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CleaningTaskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CleaningTaskMaxAggregateInputType
  }

  export type GetCleaningTaskAggregateType<T extends CleaningTaskAggregateArgs> = {
        [P in keyof T & keyof AggregateCleaningTask]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCleaningTask[P]>
      : GetScalarType<T[P], AggregateCleaningTask[P]>
  }




  export type CleaningTaskGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleaningTaskWhereInput
    orderBy?: CleaningTaskOrderByWithAggregationInput | CleaningTaskOrderByWithAggregationInput[]
    by: CleaningTaskScalarFieldEnum[] | CleaningTaskScalarFieldEnum
    having?: CleaningTaskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CleaningTaskCountAggregateInputType | true
    _min?: CleaningTaskMinAggregateInputType
    _max?: CleaningTaskMaxAggregateInputType
  }

  export type CleaningTaskGroupByOutputType = {
    id: string
    apartmentId: string
    date: Date
    status: string
    createdAt: Date
    assignedToId: string | null
    notes: string | null
    bookingId: string | null
    checklistProgress: JsonValue | null
    _count: CleaningTaskCountAggregateOutputType | null
    _min: CleaningTaskMinAggregateOutputType | null
    _max: CleaningTaskMaxAggregateOutputType | null
  }

  type GetCleaningTaskGroupByPayload<T extends CleaningTaskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CleaningTaskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CleaningTaskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CleaningTaskGroupByOutputType[P]>
            : GetScalarType<T[P], CleaningTaskGroupByOutputType[P]>
        }
      >
    >


  export type CleaningTaskSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    date?: boolean
    status?: boolean
    createdAt?: boolean
    assignedToId?: boolean
    notes?: boolean
    bookingId?: boolean
    checklistProgress?: boolean
    booking?: boolean | CleaningTask$bookingArgs<ExtArgs>
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | CleaningTask$assignedToArgs<ExtArgs>
    messages?: boolean | CleaningTask$messagesArgs<ExtArgs>
    attachments?: boolean | CleaningTask$attachmentsArgs<ExtArgs>
    aiAssistantMessages?: boolean | CleaningTask$aiAssistantMessagesArgs<ExtArgs>
    _count?: boolean | CleaningTaskCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cleaningTask"]>

  export type CleaningTaskSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    date?: boolean
    status?: boolean
    createdAt?: boolean
    assignedToId?: boolean
    notes?: boolean
    bookingId?: boolean
    checklistProgress?: boolean
    booking?: boolean | CleaningTask$bookingArgs<ExtArgs>
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | CleaningTask$assignedToArgs<ExtArgs>
  }, ExtArgs["result"]["cleaningTask"]>

  export type CleaningTaskSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    date?: boolean
    status?: boolean
    createdAt?: boolean
    assignedToId?: boolean
    notes?: boolean
    bookingId?: boolean
    checklistProgress?: boolean
    booking?: boolean | CleaningTask$bookingArgs<ExtArgs>
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | CleaningTask$assignedToArgs<ExtArgs>
  }, ExtArgs["result"]["cleaningTask"]>

  export type CleaningTaskSelectScalar = {
    id?: boolean
    apartmentId?: boolean
    date?: boolean
    status?: boolean
    createdAt?: boolean
    assignedToId?: boolean
    notes?: boolean
    bookingId?: boolean
    checklistProgress?: boolean
  }

  export type CleaningTaskOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "apartmentId" | "date" | "status" | "createdAt" | "assignedToId" | "notes" | "bookingId" | "checklistProgress", ExtArgs["result"]["cleaningTask"]>
  export type CleaningTaskInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | CleaningTask$bookingArgs<ExtArgs>
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | CleaningTask$assignedToArgs<ExtArgs>
    messages?: boolean | CleaningTask$messagesArgs<ExtArgs>
    attachments?: boolean | CleaningTask$attachmentsArgs<ExtArgs>
    aiAssistantMessages?: boolean | CleaningTask$aiAssistantMessagesArgs<ExtArgs>
    _count?: boolean | CleaningTaskCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CleaningTaskIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | CleaningTask$bookingArgs<ExtArgs>
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | CleaningTask$assignedToArgs<ExtArgs>
  }
  export type CleaningTaskIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | CleaningTask$bookingArgs<ExtArgs>
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | CleaningTask$assignedToArgs<ExtArgs>
  }

  export type $CleaningTaskPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CleaningTask"
    objects: {
      booking: Prisma.$BookingPayload<ExtArgs> | null
      apartment: Prisma.$ApartmentPayload<ExtArgs>
      assignedTo: Prisma.$UserPayload<ExtArgs> | null
      messages: Prisma.$CleaningTaskMessagePayload<ExtArgs>[]
      attachments: Prisma.$AttachmentPayload<ExtArgs>[]
      aiAssistantMessages: Prisma.$AIAssistantMessagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      apartmentId: string
      date: Date
      status: string
      createdAt: Date
      assignedToId: string | null
      notes: string | null
      bookingId: string | null
      checklistProgress: Prisma.JsonValue | null
    }, ExtArgs["result"]["cleaningTask"]>
    composites: {}
  }

  type CleaningTaskGetPayload<S extends boolean | null | undefined | CleaningTaskDefaultArgs> = $Result.GetResult<Prisma.$CleaningTaskPayload, S>

  type CleaningTaskCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CleaningTaskFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CleaningTaskCountAggregateInputType | true
    }

  export interface CleaningTaskDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CleaningTask'], meta: { name: 'CleaningTask' } }
    /**
     * Find zero or one CleaningTask that matches the filter.
     * @param {CleaningTaskFindUniqueArgs} args - Arguments to find a CleaningTask
     * @example
     * // Get one CleaningTask
     * const cleaningTask = await prisma.cleaningTask.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CleaningTaskFindUniqueArgs>(args: SelectSubset<T, CleaningTaskFindUniqueArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CleaningTask that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CleaningTaskFindUniqueOrThrowArgs} args - Arguments to find a CleaningTask
     * @example
     * // Get one CleaningTask
     * const cleaningTask = await prisma.cleaningTask.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CleaningTaskFindUniqueOrThrowArgs>(args: SelectSubset<T, CleaningTaskFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CleaningTask that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskFindFirstArgs} args - Arguments to find a CleaningTask
     * @example
     * // Get one CleaningTask
     * const cleaningTask = await prisma.cleaningTask.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CleaningTaskFindFirstArgs>(args?: SelectSubset<T, CleaningTaskFindFirstArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CleaningTask that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskFindFirstOrThrowArgs} args - Arguments to find a CleaningTask
     * @example
     * // Get one CleaningTask
     * const cleaningTask = await prisma.cleaningTask.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CleaningTaskFindFirstOrThrowArgs>(args?: SelectSubset<T, CleaningTaskFindFirstOrThrowArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CleaningTasks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CleaningTasks
     * const cleaningTasks = await prisma.cleaningTask.findMany()
     * 
     * // Get first 10 CleaningTasks
     * const cleaningTasks = await prisma.cleaningTask.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cleaningTaskWithIdOnly = await prisma.cleaningTask.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CleaningTaskFindManyArgs>(args?: SelectSubset<T, CleaningTaskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CleaningTask.
     * @param {CleaningTaskCreateArgs} args - Arguments to create a CleaningTask.
     * @example
     * // Create one CleaningTask
     * const CleaningTask = await prisma.cleaningTask.create({
     *   data: {
     *     // ... data to create a CleaningTask
     *   }
     * })
     * 
     */
    create<T extends CleaningTaskCreateArgs>(args: SelectSubset<T, CleaningTaskCreateArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CleaningTasks.
     * @param {CleaningTaskCreateManyArgs} args - Arguments to create many CleaningTasks.
     * @example
     * // Create many CleaningTasks
     * const cleaningTask = await prisma.cleaningTask.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CleaningTaskCreateManyArgs>(args?: SelectSubset<T, CleaningTaskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CleaningTasks and returns the data saved in the database.
     * @param {CleaningTaskCreateManyAndReturnArgs} args - Arguments to create many CleaningTasks.
     * @example
     * // Create many CleaningTasks
     * const cleaningTask = await prisma.cleaningTask.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CleaningTasks and only return the `id`
     * const cleaningTaskWithIdOnly = await prisma.cleaningTask.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CleaningTaskCreateManyAndReturnArgs>(args?: SelectSubset<T, CleaningTaskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CleaningTask.
     * @param {CleaningTaskDeleteArgs} args - Arguments to delete one CleaningTask.
     * @example
     * // Delete one CleaningTask
     * const CleaningTask = await prisma.cleaningTask.delete({
     *   where: {
     *     // ... filter to delete one CleaningTask
     *   }
     * })
     * 
     */
    delete<T extends CleaningTaskDeleteArgs>(args: SelectSubset<T, CleaningTaskDeleteArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CleaningTask.
     * @param {CleaningTaskUpdateArgs} args - Arguments to update one CleaningTask.
     * @example
     * // Update one CleaningTask
     * const cleaningTask = await prisma.cleaningTask.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CleaningTaskUpdateArgs>(args: SelectSubset<T, CleaningTaskUpdateArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CleaningTasks.
     * @param {CleaningTaskDeleteManyArgs} args - Arguments to filter CleaningTasks to delete.
     * @example
     * // Delete a few CleaningTasks
     * const { count } = await prisma.cleaningTask.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CleaningTaskDeleteManyArgs>(args?: SelectSubset<T, CleaningTaskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CleaningTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CleaningTasks
     * const cleaningTask = await prisma.cleaningTask.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CleaningTaskUpdateManyArgs>(args: SelectSubset<T, CleaningTaskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CleaningTasks and returns the data updated in the database.
     * @param {CleaningTaskUpdateManyAndReturnArgs} args - Arguments to update many CleaningTasks.
     * @example
     * // Update many CleaningTasks
     * const cleaningTask = await prisma.cleaningTask.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CleaningTasks and only return the `id`
     * const cleaningTaskWithIdOnly = await prisma.cleaningTask.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CleaningTaskUpdateManyAndReturnArgs>(args: SelectSubset<T, CleaningTaskUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CleaningTask.
     * @param {CleaningTaskUpsertArgs} args - Arguments to update or create a CleaningTask.
     * @example
     * // Update or create a CleaningTask
     * const cleaningTask = await prisma.cleaningTask.upsert({
     *   create: {
     *     // ... data to create a CleaningTask
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CleaningTask we want to update
     *   }
     * })
     */
    upsert<T extends CleaningTaskUpsertArgs>(args: SelectSubset<T, CleaningTaskUpsertArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CleaningTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskCountArgs} args - Arguments to filter CleaningTasks to count.
     * @example
     * // Count the number of CleaningTasks
     * const count = await prisma.cleaningTask.count({
     *   where: {
     *     // ... the filter for the CleaningTasks we want to count
     *   }
     * })
    **/
    count<T extends CleaningTaskCountArgs>(
      args?: Subset<T, CleaningTaskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CleaningTaskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CleaningTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CleaningTaskAggregateArgs>(args: Subset<T, CleaningTaskAggregateArgs>): Prisma.PrismaPromise<GetCleaningTaskAggregateType<T>>

    /**
     * Group by CleaningTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CleaningTaskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CleaningTaskGroupByArgs['orderBy'] }
        : { orderBy?: CleaningTaskGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CleaningTaskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCleaningTaskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CleaningTask model
   */
  readonly fields: CleaningTaskFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CleaningTask.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CleaningTaskClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    booking<T extends CleaningTask$bookingArgs<ExtArgs> = {}>(args?: Subset<T, CleaningTask$bookingArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    apartment<T extends ApartmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApartmentDefaultArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    assignedTo<T extends CleaningTask$assignedToArgs<ExtArgs> = {}>(args?: Subset<T, CleaningTask$assignedToArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    messages<T extends CleaningTask$messagesArgs<ExtArgs> = {}>(args?: Subset<T, CleaningTask$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    attachments<T extends CleaningTask$attachmentsArgs<ExtArgs> = {}>(args?: Subset<T, CleaningTask$attachmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    aiAssistantMessages<T extends CleaningTask$aiAssistantMessagesArgs<ExtArgs> = {}>(args?: Subset<T, CleaningTask$aiAssistantMessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CleaningTask model
   */
  interface CleaningTaskFieldRefs {
    readonly id: FieldRef<"CleaningTask", 'String'>
    readonly apartmentId: FieldRef<"CleaningTask", 'String'>
    readonly date: FieldRef<"CleaningTask", 'DateTime'>
    readonly status: FieldRef<"CleaningTask", 'String'>
    readonly createdAt: FieldRef<"CleaningTask", 'DateTime'>
    readonly assignedToId: FieldRef<"CleaningTask", 'String'>
    readonly notes: FieldRef<"CleaningTask", 'String'>
    readonly bookingId: FieldRef<"CleaningTask", 'String'>
    readonly checklistProgress: FieldRef<"CleaningTask", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * CleaningTask findUnique
   */
  export type CleaningTaskFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    /**
     * Filter, which CleaningTask to fetch.
     */
    where: CleaningTaskWhereUniqueInput
  }

  /**
   * CleaningTask findUniqueOrThrow
   */
  export type CleaningTaskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    /**
     * Filter, which CleaningTask to fetch.
     */
    where: CleaningTaskWhereUniqueInput
  }

  /**
   * CleaningTask findFirst
   */
  export type CleaningTaskFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    /**
     * Filter, which CleaningTask to fetch.
     */
    where?: CleaningTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleaningTasks to fetch.
     */
    orderBy?: CleaningTaskOrderByWithRelationInput | CleaningTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CleaningTasks.
     */
    cursor?: CleaningTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleaningTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleaningTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CleaningTasks.
     */
    distinct?: CleaningTaskScalarFieldEnum | CleaningTaskScalarFieldEnum[]
  }

  /**
   * CleaningTask findFirstOrThrow
   */
  export type CleaningTaskFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    /**
     * Filter, which CleaningTask to fetch.
     */
    where?: CleaningTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleaningTasks to fetch.
     */
    orderBy?: CleaningTaskOrderByWithRelationInput | CleaningTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CleaningTasks.
     */
    cursor?: CleaningTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleaningTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleaningTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CleaningTasks.
     */
    distinct?: CleaningTaskScalarFieldEnum | CleaningTaskScalarFieldEnum[]
  }

  /**
   * CleaningTask findMany
   */
  export type CleaningTaskFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    /**
     * Filter, which CleaningTasks to fetch.
     */
    where?: CleaningTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleaningTasks to fetch.
     */
    orderBy?: CleaningTaskOrderByWithRelationInput | CleaningTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CleaningTasks.
     */
    cursor?: CleaningTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleaningTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleaningTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CleaningTasks.
     */
    distinct?: CleaningTaskScalarFieldEnum | CleaningTaskScalarFieldEnum[]
  }

  /**
   * CleaningTask create
   */
  export type CleaningTaskCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    /**
     * The data needed to create a CleaningTask.
     */
    data: XOR<CleaningTaskCreateInput, CleaningTaskUncheckedCreateInput>
  }

  /**
   * CleaningTask createMany
   */
  export type CleaningTaskCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CleaningTasks.
     */
    data: CleaningTaskCreateManyInput | CleaningTaskCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CleaningTask createManyAndReturn
   */
  export type CleaningTaskCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * The data used to create many CleaningTasks.
     */
    data: CleaningTaskCreateManyInput | CleaningTaskCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CleaningTask update
   */
  export type CleaningTaskUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    /**
     * The data needed to update a CleaningTask.
     */
    data: XOR<CleaningTaskUpdateInput, CleaningTaskUncheckedUpdateInput>
    /**
     * Choose, which CleaningTask to update.
     */
    where: CleaningTaskWhereUniqueInput
  }

  /**
   * CleaningTask updateMany
   */
  export type CleaningTaskUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CleaningTasks.
     */
    data: XOR<CleaningTaskUpdateManyMutationInput, CleaningTaskUncheckedUpdateManyInput>
    /**
     * Filter which CleaningTasks to update
     */
    where?: CleaningTaskWhereInput
    /**
     * Limit how many CleaningTasks to update.
     */
    limit?: number
  }

  /**
   * CleaningTask updateManyAndReturn
   */
  export type CleaningTaskUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * The data used to update CleaningTasks.
     */
    data: XOR<CleaningTaskUpdateManyMutationInput, CleaningTaskUncheckedUpdateManyInput>
    /**
     * Filter which CleaningTasks to update
     */
    where?: CleaningTaskWhereInput
    /**
     * Limit how many CleaningTasks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CleaningTask upsert
   */
  export type CleaningTaskUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    /**
     * The filter to search for the CleaningTask to update in case it exists.
     */
    where: CleaningTaskWhereUniqueInput
    /**
     * In case the CleaningTask found by the `where` argument doesn't exist, create a new CleaningTask with this data.
     */
    create: XOR<CleaningTaskCreateInput, CleaningTaskUncheckedCreateInput>
    /**
     * In case the CleaningTask was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CleaningTaskUpdateInput, CleaningTaskUncheckedUpdateInput>
  }

  /**
   * CleaningTask delete
   */
  export type CleaningTaskDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    /**
     * Filter which CleaningTask to delete.
     */
    where: CleaningTaskWhereUniqueInput
  }

  /**
   * CleaningTask deleteMany
   */
  export type CleaningTaskDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CleaningTasks to delete
     */
    where?: CleaningTaskWhereInput
    /**
     * Limit how many CleaningTasks to delete.
     */
    limit?: number
  }

  /**
   * CleaningTask.booking
   */
  export type CleaningTask$bookingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
  }

  /**
   * CleaningTask.assignedTo
   */
  export type CleaningTask$assignedToArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * CleaningTask.messages
   */
  export type CleaningTask$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    where?: CleaningTaskMessageWhereInput
    orderBy?: CleaningTaskMessageOrderByWithRelationInput | CleaningTaskMessageOrderByWithRelationInput[]
    cursor?: CleaningTaskMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CleaningTaskMessageScalarFieldEnum | CleaningTaskMessageScalarFieldEnum[]
  }

  /**
   * CleaningTask.attachments
   */
  export type CleaningTask$attachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    where?: AttachmentWhereInput
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    cursor?: AttachmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * CleaningTask.aiAssistantMessages
   */
  export type CleaningTask$aiAssistantMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    where?: AIAssistantMessageWhereInput
    orderBy?: AIAssistantMessageOrderByWithRelationInput | AIAssistantMessageOrderByWithRelationInput[]
    cursor?: AIAssistantMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AIAssistantMessageScalarFieldEnum | AIAssistantMessageScalarFieldEnum[]
  }

  /**
   * CleaningTask without action
   */
  export type CleaningTaskDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
  }


  /**
   * Model MaintenanceTicket
   */

  export type AggregateMaintenanceTicket = {
    _count: MaintenanceTicketCountAggregateOutputType | null
    _min: MaintenanceTicketMinAggregateOutputType | null
    _max: MaintenanceTicketMaxAggregateOutputType | null
  }

  export type MaintenanceTicketMinAggregateOutputType = {
    id: string | null
    apartmentId: string | null
    title: string | null
    description: string | null
    status: string | null
    priority: string | null
    createdAt: Date | null
    assignedToId: string | null
    scheduledStart: Date | null
    scheduledEnd: Date | null
    startedAt: Date | null
    resolvedAt: Date | null
  }

  export type MaintenanceTicketMaxAggregateOutputType = {
    id: string | null
    apartmentId: string | null
    title: string | null
    description: string | null
    status: string | null
    priority: string | null
    createdAt: Date | null
    assignedToId: string | null
    scheduledStart: Date | null
    scheduledEnd: Date | null
    startedAt: Date | null
    resolvedAt: Date | null
  }

  export type MaintenanceTicketCountAggregateOutputType = {
    id: number
    apartmentId: number
    title: number
    description: number
    status: number
    priority: number
    createdAt: number
    assignedToId: number
    scheduledStart: number
    scheduledEnd: number
    startedAt: number
    resolvedAt: number
    _all: number
  }


  export type MaintenanceTicketMinAggregateInputType = {
    id?: true
    apartmentId?: true
    title?: true
    description?: true
    status?: true
    priority?: true
    createdAt?: true
    assignedToId?: true
    scheduledStart?: true
    scheduledEnd?: true
    startedAt?: true
    resolvedAt?: true
  }

  export type MaintenanceTicketMaxAggregateInputType = {
    id?: true
    apartmentId?: true
    title?: true
    description?: true
    status?: true
    priority?: true
    createdAt?: true
    assignedToId?: true
    scheduledStart?: true
    scheduledEnd?: true
    startedAt?: true
    resolvedAt?: true
  }

  export type MaintenanceTicketCountAggregateInputType = {
    id?: true
    apartmentId?: true
    title?: true
    description?: true
    status?: true
    priority?: true
    createdAt?: true
    assignedToId?: true
    scheduledStart?: true
    scheduledEnd?: true
    startedAt?: true
    resolvedAt?: true
    _all?: true
  }

  export type MaintenanceTicketAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MaintenanceTicket to aggregate.
     */
    where?: MaintenanceTicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MaintenanceTickets to fetch.
     */
    orderBy?: MaintenanceTicketOrderByWithRelationInput | MaintenanceTicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MaintenanceTicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MaintenanceTickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MaintenanceTickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MaintenanceTickets
    **/
    _count?: true | MaintenanceTicketCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MaintenanceTicketMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MaintenanceTicketMaxAggregateInputType
  }

  export type GetMaintenanceTicketAggregateType<T extends MaintenanceTicketAggregateArgs> = {
        [P in keyof T & keyof AggregateMaintenanceTicket]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMaintenanceTicket[P]>
      : GetScalarType<T[P], AggregateMaintenanceTicket[P]>
  }




  export type MaintenanceTicketGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MaintenanceTicketWhereInput
    orderBy?: MaintenanceTicketOrderByWithAggregationInput | MaintenanceTicketOrderByWithAggregationInput[]
    by: MaintenanceTicketScalarFieldEnum[] | MaintenanceTicketScalarFieldEnum
    having?: MaintenanceTicketScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MaintenanceTicketCountAggregateInputType | true
    _min?: MaintenanceTicketMinAggregateInputType
    _max?: MaintenanceTicketMaxAggregateInputType
  }

  export type MaintenanceTicketGroupByOutputType = {
    id: string
    apartmentId: string
    title: string
    description: string
    status: string
    priority: string
    createdAt: Date
    assignedToId: string | null
    scheduledStart: Date | null
    scheduledEnd: Date | null
    startedAt: Date | null
    resolvedAt: Date | null
    _count: MaintenanceTicketCountAggregateOutputType | null
    _min: MaintenanceTicketMinAggregateOutputType | null
    _max: MaintenanceTicketMaxAggregateOutputType | null
  }

  type GetMaintenanceTicketGroupByPayload<T extends MaintenanceTicketGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MaintenanceTicketGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MaintenanceTicketGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MaintenanceTicketGroupByOutputType[P]>
            : GetScalarType<T[P], MaintenanceTicketGroupByOutputType[P]>
        }
      >
    >


  export type MaintenanceTicketSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    priority?: boolean
    createdAt?: boolean
    assignedToId?: boolean
    scheduledStart?: boolean
    scheduledEnd?: boolean
    startedAt?: boolean
    resolvedAt?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | MaintenanceTicket$assignedToArgs<ExtArgs>
    attachments?: boolean | MaintenanceTicket$attachmentsArgs<ExtArgs>
    messages?: boolean | MaintenanceTicket$messagesArgs<ExtArgs>
    aiAssistantMessages?: boolean | MaintenanceTicket$aiAssistantMessagesArgs<ExtArgs>
    _count?: boolean | MaintenanceTicketCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["maintenanceTicket"]>

  export type MaintenanceTicketSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    priority?: boolean
    createdAt?: boolean
    assignedToId?: boolean
    scheduledStart?: boolean
    scheduledEnd?: boolean
    startedAt?: boolean
    resolvedAt?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | MaintenanceTicket$assignedToArgs<ExtArgs>
  }, ExtArgs["result"]["maintenanceTicket"]>

  export type MaintenanceTicketSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    priority?: boolean
    createdAt?: boolean
    assignedToId?: boolean
    scheduledStart?: boolean
    scheduledEnd?: boolean
    startedAt?: boolean
    resolvedAt?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | MaintenanceTicket$assignedToArgs<ExtArgs>
  }, ExtArgs["result"]["maintenanceTicket"]>

  export type MaintenanceTicketSelectScalar = {
    id?: boolean
    apartmentId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    priority?: boolean
    createdAt?: boolean
    assignedToId?: boolean
    scheduledStart?: boolean
    scheduledEnd?: boolean
    startedAt?: boolean
    resolvedAt?: boolean
  }

  export type MaintenanceTicketOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "apartmentId" | "title" | "description" | "status" | "priority" | "createdAt" | "assignedToId" | "scheduledStart" | "scheduledEnd" | "startedAt" | "resolvedAt", ExtArgs["result"]["maintenanceTicket"]>
  export type MaintenanceTicketInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | MaintenanceTicket$assignedToArgs<ExtArgs>
    attachments?: boolean | MaintenanceTicket$attachmentsArgs<ExtArgs>
    messages?: boolean | MaintenanceTicket$messagesArgs<ExtArgs>
    aiAssistantMessages?: boolean | MaintenanceTicket$aiAssistantMessagesArgs<ExtArgs>
    _count?: boolean | MaintenanceTicketCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MaintenanceTicketIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | MaintenanceTicket$assignedToArgs<ExtArgs>
  }
  export type MaintenanceTicketIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
    assignedTo?: boolean | MaintenanceTicket$assignedToArgs<ExtArgs>
  }

  export type $MaintenanceTicketPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MaintenanceTicket"
    objects: {
      apartment: Prisma.$ApartmentPayload<ExtArgs>
      assignedTo: Prisma.$UserPayload<ExtArgs> | null
      attachments: Prisma.$AttachmentPayload<ExtArgs>[]
      messages: Prisma.$MessagePayload<ExtArgs>[]
      aiAssistantMessages: Prisma.$AIAssistantMessagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      apartmentId: string
      title: string
      description: string
      status: string
      priority: string
      createdAt: Date
      assignedToId: string | null
      scheduledStart: Date | null
      scheduledEnd: Date | null
      startedAt: Date | null
      resolvedAt: Date | null
    }, ExtArgs["result"]["maintenanceTicket"]>
    composites: {}
  }

  type MaintenanceTicketGetPayload<S extends boolean | null | undefined | MaintenanceTicketDefaultArgs> = $Result.GetResult<Prisma.$MaintenanceTicketPayload, S>

  type MaintenanceTicketCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MaintenanceTicketFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MaintenanceTicketCountAggregateInputType | true
    }

  export interface MaintenanceTicketDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MaintenanceTicket'], meta: { name: 'MaintenanceTicket' } }
    /**
     * Find zero or one MaintenanceTicket that matches the filter.
     * @param {MaintenanceTicketFindUniqueArgs} args - Arguments to find a MaintenanceTicket
     * @example
     * // Get one MaintenanceTicket
     * const maintenanceTicket = await prisma.maintenanceTicket.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MaintenanceTicketFindUniqueArgs>(args: SelectSubset<T, MaintenanceTicketFindUniqueArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MaintenanceTicket that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MaintenanceTicketFindUniqueOrThrowArgs} args - Arguments to find a MaintenanceTicket
     * @example
     * // Get one MaintenanceTicket
     * const maintenanceTicket = await prisma.maintenanceTicket.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MaintenanceTicketFindUniqueOrThrowArgs>(args: SelectSubset<T, MaintenanceTicketFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MaintenanceTicket that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaintenanceTicketFindFirstArgs} args - Arguments to find a MaintenanceTicket
     * @example
     * // Get one MaintenanceTicket
     * const maintenanceTicket = await prisma.maintenanceTicket.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MaintenanceTicketFindFirstArgs>(args?: SelectSubset<T, MaintenanceTicketFindFirstArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MaintenanceTicket that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaintenanceTicketFindFirstOrThrowArgs} args - Arguments to find a MaintenanceTicket
     * @example
     * // Get one MaintenanceTicket
     * const maintenanceTicket = await prisma.maintenanceTicket.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MaintenanceTicketFindFirstOrThrowArgs>(args?: SelectSubset<T, MaintenanceTicketFindFirstOrThrowArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MaintenanceTickets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaintenanceTicketFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MaintenanceTickets
     * const maintenanceTickets = await prisma.maintenanceTicket.findMany()
     * 
     * // Get first 10 MaintenanceTickets
     * const maintenanceTickets = await prisma.maintenanceTicket.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const maintenanceTicketWithIdOnly = await prisma.maintenanceTicket.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MaintenanceTicketFindManyArgs>(args?: SelectSubset<T, MaintenanceTicketFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MaintenanceTicket.
     * @param {MaintenanceTicketCreateArgs} args - Arguments to create a MaintenanceTicket.
     * @example
     * // Create one MaintenanceTicket
     * const MaintenanceTicket = await prisma.maintenanceTicket.create({
     *   data: {
     *     // ... data to create a MaintenanceTicket
     *   }
     * })
     * 
     */
    create<T extends MaintenanceTicketCreateArgs>(args: SelectSubset<T, MaintenanceTicketCreateArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MaintenanceTickets.
     * @param {MaintenanceTicketCreateManyArgs} args - Arguments to create many MaintenanceTickets.
     * @example
     * // Create many MaintenanceTickets
     * const maintenanceTicket = await prisma.maintenanceTicket.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MaintenanceTicketCreateManyArgs>(args?: SelectSubset<T, MaintenanceTicketCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MaintenanceTickets and returns the data saved in the database.
     * @param {MaintenanceTicketCreateManyAndReturnArgs} args - Arguments to create many MaintenanceTickets.
     * @example
     * // Create many MaintenanceTickets
     * const maintenanceTicket = await prisma.maintenanceTicket.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MaintenanceTickets and only return the `id`
     * const maintenanceTicketWithIdOnly = await prisma.maintenanceTicket.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MaintenanceTicketCreateManyAndReturnArgs>(args?: SelectSubset<T, MaintenanceTicketCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MaintenanceTicket.
     * @param {MaintenanceTicketDeleteArgs} args - Arguments to delete one MaintenanceTicket.
     * @example
     * // Delete one MaintenanceTicket
     * const MaintenanceTicket = await prisma.maintenanceTicket.delete({
     *   where: {
     *     // ... filter to delete one MaintenanceTicket
     *   }
     * })
     * 
     */
    delete<T extends MaintenanceTicketDeleteArgs>(args: SelectSubset<T, MaintenanceTicketDeleteArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MaintenanceTicket.
     * @param {MaintenanceTicketUpdateArgs} args - Arguments to update one MaintenanceTicket.
     * @example
     * // Update one MaintenanceTicket
     * const maintenanceTicket = await prisma.maintenanceTicket.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MaintenanceTicketUpdateArgs>(args: SelectSubset<T, MaintenanceTicketUpdateArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MaintenanceTickets.
     * @param {MaintenanceTicketDeleteManyArgs} args - Arguments to filter MaintenanceTickets to delete.
     * @example
     * // Delete a few MaintenanceTickets
     * const { count } = await prisma.maintenanceTicket.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MaintenanceTicketDeleteManyArgs>(args?: SelectSubset<T, MaintenanceTicketDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MaintenanceTickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaintenanceTicketUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MaintenanceTickets
     * const maintenanceTicket = await prisma.maintenanceTicket.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MaintenanceTicketUpdateManyArgs>(args: SelectSubset<T, MaintenanceTicketUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MaintenanceTickets and returns the data updated in the database.
     * @param {MaintenanceTicketUpdateManyAndReturnArgs} args - Arguments to update many MaintenanceTickets.
     * @example
     * // Update many MaintenanceTickets
     * const maintenanceTicket = await prisma.maintenanceTicket.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MaintenanceTickets and only return the `id`
     * const maintenanceTicketWithIdOnly = await prisma.maintenanceTicket.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MaintenanceTicketUpdateManyAndReturnArgs>(args: SelectSubset<T, MaintenanceTicketUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MaintenanceTicket.
     * @param {MaintenanceTicketUpsertArgs} args - Arguments to update or create a MaintenanceTicket.
     * @example
     * // Update or create a MaintenanceTicket
     * const maintenanceTicket = await prisma.maintenanceTicket.upsert({
     *   create: {
     *     // ... data to create a MaintenanceTicket
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MaintenanceTicket we want to update
     *   }
     * })
     */
    upsert<T extends MaintenanceTicketUpsertArgs>(args: SelectSubset<T, MaintenanceTicketUpsertArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MaintenanceTickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaintenanceTicketCountArgs} args - Arguments to filter MaintenanceTickets to count.
     * @example
     * // Count the number of MaintenanceTickets
     * const count = await prisma.maintenanceTicket.count({
     *   where: {
     *     // ... the filter for the MaintenanceTickets we want to count
     *   }
     * })
    **/
    count<T extends MaintenanceTicketCountArgs>(
      args?: Subset<T, MaintenanceTicketCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MaintenanceTicketCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MaintenanceTicket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaintenanceTicketAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MaintenanceTicketAggregateArgs>(args: Subset<T, MaintenanceTicketAggregateArgs>): Prisma.PrismaPromise<GetMaintenanceTicketAggregateType<T>>

    /**
     * Group by MaintenanceTicket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaintenanceTicketGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MaintenanceTicketGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MaintenanceTicketGroupByArgs['orderBy'] }
        : { orderBy?: MaintenanceTicketGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MaintenanceTicketGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMaintenanceTicketGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MaintenanceTicket model
   */
  readonly fields: MaintenanceTicketFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MaintenanceTicket.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MaintenanceTicketClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    apartment<T extends ApartmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApartmentDefaultArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    assignedTo<T extends MaintenanceTicket$assignedToArgs<ExtArgs> = {}>(args?: Subset<T, MaintenanceTicket$assignedToArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    attachments<T extends MaintenanceTicket$attachmentsArgs<ExtArgs> = {}>(args?: Subset<T, MaintenanceTicket$attachmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    messages<T extends MaintenanceTicket$messagesArgs<ExtArgs> = {}>(args?: Subset<T, MaintenanceTicket$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    aiAssistantMessages<T extends MaintenanceTicket$aiAssistantMessagesArgs<ExtArgs> = {}>(args?: Subset<T, MaintenanceTicket$aiAssistantMessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MaintenanceTicket model
   */
  interface MaintenanceTicketFieldRefs {
    readonly id: FieldRef<"MaintenanceTicket", 'String'>
    readonly apartmentId: FieldRef<"MaintenanceTicket", 'String'>
    readonly title: FieldRef<"MaintenanceTicket", 'String'>
    readonly description: FieldRef<"MaintenanceTicket", 'String'>
    readonly status: FieldRef<"MaintenanceTicket", 'String'>
    readonly priority: FieldRef<"MaintenanceTicket", 'String'>
    readonly createdAt: FieldRef<"MaintenanceTicket", 'DateTime'>
    readonly assignedToId: FieldRef<"MaintenanceTicket", 'String'>
    readonly scheduledStart: FieldRef<"MaintenanceTicket", 'DateTime'>
    readonly scheduledEnd: FieldRef<"MaintenanceTicket", 'DateTime'>
    readonly startedAt: FieldRef<"MaintenanceTicket", 'DateTime'>
    readonly resolvedAt: FieldRef<"MaintenanceTicket", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MaintenanceTicket findUnique
   */
  export type MaintenanceTicketFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    /**
     * Filter, which MaintenanceTicket to fetch.
     */
    where: MaintenanceTicketWhereUniqueInput
  }

  /**
   * MaintenanceTicket findUniqueOrThrow
   */
  export type MaintenanceTicketFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    /**
     * Filter, which MaintenanceTicket to fetch.
     */
    where: MaintenanceTicketWhereUniqueInput
  }

  /**
   * MaintenanceTicket findFirst
   */
  export type MaintenanceTicketFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    /**
     * Filter, which MaintenanceTicket to fetch.
     */
    where?: MaintenanceTicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MaintenanceTickets to fetch.
     */
    orderBy?: MaintenanceTicketOrderByWithRelationInput | MaintenanceTicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MaintenanceTickets.
     */
    cursor?: MaintenanceTicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MaintenanceTickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MaintenanceTickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MaintenanceTickets.
     */
    distinct?: MaintenanceTicketScalarFieldEnum | MaintenanceTicketScalarFieldEnum[]
  }

  /**
   * MaintenanceTicket findFirstOrThrow
   */
  export type MaintenanceTicketFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    /**
     * Filter, which MaintenanceTicket to fetch.
     */
    where?: MaintenanceTicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MaintenanceTickets to fetch.
     */
    orderBy?: MaintenanceTicketOrderByWithRelationInput | MaintenanceTicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MaintenanceTickets.
     */
    cursor?: MaintenanceTicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MaintenanceTickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MaintenanceTickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MaintenanceTickets.
     */
    distinct?: MaintenanceTicketScalarFieldEnum | MaintenanceTicketScalarFieldEnum[]
  }

  /**
   * MaintenanceTicket findMany
   */
  export type MaintenanceTicketFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    /**
     * Filter, which MaintenanceTickets to fetch.
     */
    where?: MaintenanceTicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MaintenanceTickets to fetch.
     */
    orderBy?: MaintenanceTicketOrderByWithRelationInput | MaintenanceTicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MaintenanceTickets.
     */
    cursor?: MaintenanceTicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MaintenanceTickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MaintenanceTickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MaintenanceTickets.
     */
    distinct?: MaintenanceTicketScalarFieldEnum | MaintenanceTicketScalarFieldEnum[]
  }

  /**
   * MaintenanceTicket create
   */
  export type MaintenanceTicketCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    /**
     * The data needed to create a MaintenanceTicket.
     */
    data: XOR<MaintenanceTicketCreateInput, MaintenanceTicketUncheckedCreateInput>
  }

  /**
   * MaintenanceTicket createMany
   */
  export type MaintenanceTicketCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MaintenanceTickets.
     */
    data: MaintenanceTicketCreateManyInput | MaintenanceTicketCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MaintenanceTicket createManyAndReturn
   */
  export type MaintenanceTicketCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * The data used to create many MaintenanceTickets.
     */
    data: MaintenanceTicketCreateManyInput | MaintenanceTicketCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MaintenanceTicket update
   */
  export type MaintenanceTicketUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    /**
     * The data needed to update a MaintenanceTicket.
     */
    data: XOR<MaintenanceTicketUpdateInput, MaintenanceTicketUncheckedUpdateInput>
    /**
     * Choose, which MaintenanceTicket to update.
     */
    where: MaintenanceTicketWhereUniqueInput
  }

  /**
   * MaintenanceTicket updateMany
   */
  export type MaintenanceTicketUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MaintenanceTickets.
     */
    data: XOR<MaintenanceTicketUpdateManyMutationInput, MaintenanceTicketUncheckedUpdateManyInput>
    /**
     * Filter which MaintenanceTickets to update
     */
    where?: MaintenanceTicketWhereInput
    /**
     * Limit how many MaintenanceTickets to update.
     */
    limit?: number
  }

  /**
   * MaintenanceTicket updateManyAndReturn
   */
  export type MaintenanceTicketUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * The data used to update MaintenanceTickets.
     */
    data: XOR<MaintenanceTicketUpdateManyMutationInput, MaintenanceTicketUncheckedUpdateManyInput>
    /**
     * Filter which MaintenanceTickets to update
     */
    where?: MaintenanceTicketWhereInput
    /**
     * Limit how many MaintenanceTickets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MaintenanceTicket upsert
   */
  export type MaintenanceTicketUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    /**
     * The filter to search for the MaintenanceTicket to update in case it exists.
     */
    where: MaintenanceTicketWhereUniqueInput
    /**
     * In case the MaintenanceTicket found by the `where` argument doesn't exist, create a new MaintenanceTicket with this data.
     */
    create: XOR<MaintenanceTicketCreateInput, MaintenanceTicketUncheckedCreateInput>
    /**
     * In case the MaintenanceTicket was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MaintenanceTicketUpdateInput, MaintenanceTicketUncheckedUpdateInput>
  }

  /**
   * MaintenanceTicket delete
   */
  export type MaintenanceTicketDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    /**
     * Filter which MaintenanceTicket to delete.
     */
    where: MaintenanceTicketWhereUniqueInput
  }

  /**
   * MaintenanceTicket deleteMany
   */
  export type MaintenanceTicketDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MaintenanceTickets to delete
     */
    where?: MaintenanceTicketWhereInput
    /**
     * Limit how many MaintenanceTickets to delete.
     */
    limit?: number
  }

  /**
   * MaintenanceTicket.assignedTo
   */
  export type MaintenanceTicket$assignedToArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * MaintenanceTicket.attachments
   */
  export type MaintenanceTicket$attachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    where?: AttachmentWhereInput
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    cursor?: AttachmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * MaintenanceTicket.messages
   */
  export type MaintenanceTicket$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    cursor?: MessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * MaintenanceTicket.aiAssistantMessages
   */
  export type MaintenanceTicket$aiAssistantMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    where?: AIAssistantMessageWhereInput
    orderBy?: AIAssistantMessageOrderByWithRelationInput | AIAssistantMessageOrderByWithRelationInput[]
    cursor?: AIAssistantMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AIAssistantMessageScalarFieldEnum | AIAssistantMessageScalarFieldEnum[]
  }

  /**
   * MaintenanceTicket without action
   */
  export type MaintenanceTicketDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
  }


  /**
   * Model AIAssistantMessage
   */

  export type AggregateAIAssistantMessage = {
    _count: AIAssistantMessageCountAggregateOutputType | null
    _min: AIAssistantMessageMinAggregateOutputType | null
    _max: AIAssistantMessageMaxAggregateOutputType | null
  }

  export type AIAssistantMessageMinAggregateOutputType = {
    id: string | null
    role: $Enums.AIAssistantMessageRole | null
    content: string | null
    userRole: $Enums.Role | null
    apartmentId: string | null
    cleaningTaskId: string | null
    maintenanceTicketId: string | null
    createdAt: Date | null
  }

  export type AIAssistantMessageMaxAggregateOutputType = {
    id: string | null
    role: $Enums.AIAssistantMessageRole | null
    content: string | null
    userRole: $Enums.Role | null
    apartmentId: string | null
    cleaningTaskId: string | null
    maintenanceTicketId: string | null
    createdAt: Date | null
  }

  export type AIAssistantMessageCountAggregateOutputType = {
    id: number
    role: number
    content: number
    userRole: number
    apartmentId: number
    cleaningTaskId: number
    maintenanceTicketId: number
    createdAt: number
    _all: number
  }


  export type AIAssistantMessageMinAggregateInputType = {
    id?: true
    role?: true
    content?: true
    userRole?: true
    apartmentId?: true
    cleaningTaskId?: true
    maintenanceTicketId?: true
    createdAt?: true
  }

  export type AIAssistantMessageMaxAggregateInputType = {
    id?: true
    role?: true
    content?: true
    userRole?: true
    apartmentId?: true
    cleaningTaskId?: true
    maintenanceTicketId?: true
    createdAt?: true
  }

  export type AIAssistantMessageCountAggregateInputType = {
    id?: true
    role?: true
    content?: true
    userRole?: true
    apartmentId?: true
    cleaningTaskId?: true
    maintenanceTicketId?: true
    createdAt?: true
    _all?: true
  }

  export type AIAssistantMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AIAssistantMessage to aggregate.
     */
    where?: AIAssistantMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIAssistantMessages to fetch.
     */
    orderBy?: AIAssistantMessageOrderByWithRelationInput | AIAssistantMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AIAssistantMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIAssistantMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIAssistantMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AIAssistantMessages
    **/
    _count?: true | AIAssistantMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AIAssistantMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AIAssistantMessageMaxAggregateInputType
  }

  export type GetAIAssistantMessageAggregateType<T extends AIAssistantMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateAIAssistantMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAIAssistantMessage[P]>
      : GetScalarType<T[P], AggregateAIAssistantMessage[P]>
  }




  export type AIAssistantMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AIAssistantMessageWhereInput
    orderBy?: AIAssistantMessageOrderByWithAggregationInput | AIAssistantMessageOrderByWithAggregationInput[]
    by: AIAssistantMessageScalarFieldEnum[] | AIAssistantMessageScalarFieldEnum
    having?: AIAssistantMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AIAssistantMessageCountAggregateInputType | true
    _min?: AIAssistantMessageMinAggregateInputType
    _max?: AIAssistantMessageMaxAggregateInputType
  }

  export type AIAssistantMessageGroupByOutputType = {
    id: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    apartmentId: string | null
    cleaningTaskId: string | null
    maintenanceTicketId: string | null
    createdAt: Date
    _count: AIAssistantMessageCountAggregateOutputType | null
    _min: AIAssistantMessageMinAggregateOutputType | null
    _max: AIAssistantMessageMaxAggregateOutputType | null
  }

  type GetAIAssistantMessageGroupByPayload<T extends AIAssistantMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AIAssistantMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AIAssistantMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AIAssistantMessageGroupByOutputType[P]>
            : GetScalarType<T[P], AIAssistantMessageGroupByOutputType[P]>
        }
      >
    >


  export type AIAssistantMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    content?: boolean
    userRole?: boolean
    apartmentId?: boolean
    cleaningTaskId?: boolean
    maintenanceTicketId?: boolean
    createdAt?: boolean
    apartment?: boolean | AIAssistantMessage$apartmentArgs<ExtArgs>
    cleaningTask?: boolean | AIAssistantMessage$cleaningTaskArgs<ExtArgs>
    maintenanceTicket?: boolean | AIAssistantMessage$maintenanceTicketArgs<ExtArgs>
  }, ExtArgs["result"]["aIAssistantMessage"]>

  export type AIAssistantMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    content?: boolean
    userRole?: boolean
    apartmentId?: boolean
    cleaningTaskId?: boolean
    maintenanceTicketId?: boolean
    createdAt?: boolean
    apartment?: boolean | AIAssistantMessage$apartmentArgs<ExtArgs>
    cleaningTask?: boolean | AIAssistantMessage$cleaningTaskArgs<ExtArgs>
    maintenanceTicket?: boolean | AIAssistantMessage$maintenanceTicketArgs<ExtArgs>
  }, ExtArgs["result"]["aIAssistantMessage"]>

  export type AIAssistantMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    content?: boolean
    userRole?: boolean
    apartmentId?: boolean
    cleaningTaskId?: boolean
    maintenanceTicketId?: boolean
    createdAt?: boolean
    apartment?: boolean | AIAssistantMessage$apartmentArgs<ExtArgs>
    cleaningTask?: boolean | AIAssistantMessage$cleaningTaskArgs<ExtArgs>
    maintenanceTicket?: boolean | AIAssistantMessage$maintenanceTicketArgs<ExtArgs>
  }, ExtArgs["result"]["aIAssistantMessage"]>

  export type AIAssistantMessageSelectScalar = {
    id?: boolean
    role?: boolean
    content?: boolean
    userRole?: boolean
    apartmentId?: boolean
    cleaningTaskId?: boolean
    maintenanceTicketId?: boolean
    createdAt?: boolean
  }

  export type AIAssistantMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "role" | "content" | "userRole" | "apartmentId" | "cleaningTaskId" | "maintenanceTicketId" | "createdAt", ExtArgs["result"]["aIAssistantMessage"]>
  export type AIAssistantMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | AIAssistantMessage$apartmentArgs<ExtArgs>
    cleaningTask?: boolean | AIAssistantMessage$cleaningTaskArgs<ExtArgs>
    maintenanceTicket?: boolean | AIAssistantMessage$maintenanceTicketArgs<ExtArgs>
  }
  export type AIAssistantMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | AIAssistantMessage$apartmentArgs<ExtArgs>
    cleaningTask?: boolean | AIAssistantMessage$cleaningTaskArgs<ExtArgs>
    maintenanceTicket?: boolean | AIAssistantMessage$maintenanceTicketArgs<ExtArgs>
  }
  export type AIAssistantMessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | AIAssistantMessage$apartmentArgs<ExtArgs>
    cleaningTask?: boolean | AIAssistantMessage$cleaningTaskArgs<ExtArgs>
    maintenanceTicket?: boolean | AIAssistantMessage$maintenanceTicketArgs<ExtArgs>
  }

  export type $AIAssistantMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AIAssistantMessage"
    objects: {
      apartment: Prisma.$ApartmentPayload<ExtArgs> | null
      cleaningTask: Prisma.$CleaningTaskPayload<ExtArgs> | null
      maintenanceTicket: Prisma.$MaintenanceTicketPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      role: $Enums.AIAssistantMessageRole
      content: string
      userRole: $Enums.Role
      apartmentId: string | null
      cleaningTaskId: string | null
      maintenanceTicketId: string | null
      createdAt: Date
    }, ExtArgs["result"]["aIAssistantMessage"]>
    composites: {}
  }

  type AIAssistantMessageGetPayload<S extends boolean | null | undefined | AIAssistantMessageDefaultArgs> = $Result.GetResult<Prisma.$AIAssistantMessagePayload, S>

  type AIAssistantMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AIAssistantMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AIAssistantMessageCountAggregateInputType | true
    }

  export interface AIAssistantMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AIAssistantMessage'], meta: { name: 'AIAssistantMessage' } }
    /**
     * Find zero or one AIAssistantMessage that matches the filter.
     * @param {AIAssistantMessageFindUniqueArgs} args - Arguments to find a AIAssistantMessage
     * @example
     * // Get one AIAssistantMessage
     * const aIAssistantMessage = await prisma.aIAssistantMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AIAssistantMessageFindUniqueArgs>(args: SelectSubset<T, AIAssistantMessageFindUniqueArgs<ExtArgs>>): Prisma__AIAssistantMessageClient<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AIAssistantMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AIAssistantMessageFindUniqueOrThrowArgs} args - Arguments to find a AIAssistantMessage
     * @example
     * // Get one AIAssistantMessage
     * const aIAssistantMessage = await prisma.aIAssistantMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AIAssistantMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, AIAssistantMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AIAssistantMessageClient<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AIAssistantMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIAssistantMessageFindFirstArgs} args - Arguments to find a AIAssistantMessage
     * @example
     * // Get one AIAssistantMessage
     * const aIAssistantMessage = await prisma.aIAssistantMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AIAssistantMessageFindFirstArgs>(args?: SelectSubset<T, AIAssistantMessageFindFirstArgs<ExtArgs>>): Prisma__AIAssistantMessageClient<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AIAssistantMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIAssistantMessageFindFirstOrThrowArgs} args - Arguments to find a AIAssistantMessage
     * @example
     * // Get one AIAssistantMessage
     * const aIAssistantMessage = await prisma.aIAssistantMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AIAssistantMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, AIAssistantMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__AIAssistantMessageClient<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AIAssistantMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIAssistantMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AIAssistantMessages
     * const aIAssistantMessages = await prisma.aIAssistantMessage.findMany()
     * 
     * // Get first 10 AIAssistantMessages
     * const aIAssistantMessages = await prisma.aIAssistantMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const aIAssistantMessageWithIdOnly = await prisma.aIAssistantMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AIAssistantMessageFindManyArgs>(args?: SelectSubset<T, AIAssistantMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AIAssistantMessage.
     * @param {AIAssistantMessageCreateArgs} args - Arguments to create a AIAssistantMessage.
     * @example
     * // Create one AIAssistantMessage
     * const AIAssistantMessage = await prisma.aIAssistantMessage.create({
     *   data: {
     *     // ... data to create a AIAssistantMessage
     *   }
     * })
     * 
     */
    create<T extends AIAssistantMessageCreateArgs>(args: SelectSubset<T, AIAssistantMessageCreateArgs<ExtArgs>>): Prisma__AIAssistantMessageClient<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AIAssistantMessages.
     * @param {AIAssistantMessageCreateManyArgs} args - Arguments to create many AIAssistantMessages.
     * @example
     * // Create many AIAssistantMessages
     * const aIAssistantMessage = await prisma.aIAssistantMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AIAssistantMessageCreateManyArgs>(args?: SelectSubset<T, AIAssistantMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AIAssistantMessages and returns the data saved in the database.
     * @param {AIAssistantMessageCreateManyAndReturnArgs} args - Arguments to create many AIAssistantMessages.
     * @example
     * // Create many AIAssistantMessages
     * const aIAssistantMessage = await prisma.aIAssistantMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AIAssistantMessages and only return the `id`
     * const aIAssistantMessageWithIdOnly = await prisma.aIAssistantMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AIAssistantMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, AIAssistantMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AIAssistantMessage.
     * @param {AIAssistantMessageDeleteArgs} args - Arguments to delete one AIAssistantMessage.
     * @example
     * // Delete one AIAssistantMessage
     * const AIAssistantMessage = await prisma.aIAssistantMessage.delete({
     *   where: {
     *     // ... filter to delete one AIAssistantMessage
     *   }
     * })
     * 
     */
    delete<T extends AIAssistantMessageDeleteArgs>(args: SelectSubset<T, AIAssistantMessageDeleteArgs<ExtArgs>>): Prisma__AIAssistantMessageClient<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AIAssistantMessage.
     * @param {AIAssistantMessageUpdateArgs} args - Arguments to update one AIAssistantMessage.
     * @example
     * // Update one AIAssistantMessage
     * const aIAssistantMessage = await prisma.aIAssistantMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AIAssistantMessageUpdateArgs>(args: SelectSubset<T, AIAssistantMessageUpdateArgs<ExtArgs>>): Prisma__AIAssistantMessageClient<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AIAssistantMessages.
     * @param {AIAssistantMessageDeleteManyArgs} args - Arguments to filter AIAssistantMessages to delete.
     * @example
     * // Delete a few AIAssistantMessages
     * const { count } = await prisma.aIAssistantMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AIAssistantMessageDeleteManyArgs>(args?: SelectSubset<T, AIAssistantMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AIAssistantMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIAssistantMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AIAssistantMessages
     * const aIAssistantMessage = await prisma.aIAssistantMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AIAssistantMessageUpdateManyArgs>(args: SelectSubset<T, AIAssistantMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AIAssistantMessages and returns the data updated in the database.
     * @param {AIAssistantMessageUpdateManyAndReturnArgs} args - Arguments to update many AIAssistantMessages.
     * @example
     * // Update many AIAssistantMessages
     * const aIAssistantMessage = await prisma.aIAssistantMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AIAssistantMessages and only return the `id`
     * const aIAssistantMessageWithIdOnly = await prisma.aIAssistantMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AIAssistantMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, AIAssistantMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AIAssistantMessage.
     * @param {AIAssistantMessageUpsertArgs} args - Arguments to update or create a AIAssistantMessage.
     * @example
     * // Update or create a AIAssistantMessage
     * const aIAssistantMessage = await prisma.aIAssistantMessage.upsert({
     *   create: {
     *     // ... data to create a AIAssistantMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AIAssistantMessage we want to update
     *   }
     * })
     */
    upsert<T extends AIAssistantMessageUpsertArgs>(args: SelectSubset<T, AIAssistantMessageUpsertArgs<ExtArgs>>): Prisma__AIAssistantMessageClient<$Result.GetResult<Prisma.$AIAssistantMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AIAssistantMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIAssistantMessageCountArgs} args - Arguments to filter AIAssistantMessages to count.
     * @example
     * // Count the number of AIAssistantMessages
     * const count = await prisma.aIAssistantMessage.count({
     *   where: {
     *     // ... the filter for the AIAssistantMessages we want to count
     *   }
     * })
    **/
    count<T extends AIAssistantMessageCountArgs>(
      args?: Subset<T, AIAssistantMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AIAssistantMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AIAssistantMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIAssistantMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AIAssistantMessageAggregateArgs>(args: Subset<T, AIAssistantMessageAggregateArgs>): Prisma.PrismaPromise<GetAIAssistantMessageAggregateType<T>>

    /**
     * Group by AIAssistantMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIAssistantMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AIAssistantMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AIAssistantMessageGroupByArgs['orderBy'] }
        : { orderBy?: AIAssistantMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AIAssistantMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAIAssistantMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AIAssistantMessage model
   */
  readonly fields: AIAssistantMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AIAssistantMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AIAssistantMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    apartment<T extends AIAssistantMessage$apartmentArgs<ExtArgs> = {}>(args?: Subset<T, AIAssistantMessage$apartmentArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    cleaningTask<T extends AIAssistantMessage$cleaningTaskArgs<ExtArgs> = {}>(args?: Subset<T, AIAssistantMessage$cleaningTaskArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    maintenanceTicket<T extends AIAssistantMessage$maintenanceTicketArgs<ExtArgs> = {}>(args?: Subset<T, AIAssistantMessage$maintenanceTicketArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AIAssistantMessage model
   */
  interface AIAssistantMessageFieldRefs {
    readonly id: FieldRef<"AIAssistantMessage", 'String'>
    readonly role: FieldRef<"AIAssistantMessage", 'AIAssistantMessageRole'>
    readonly content: FieldRef<"AIAssistantMessage", 'String'>
    readonly userRole: FieldRef<"AIAssistantMessage", 'Role'>
    readonly apartmentId: FieldRef<"AIAssistantMessage", 'String'>
    readonly cleaningTaskId: FieldRef<"AIAssistantMessage", 'String'>
    readonly maintenanceTicketId: FieldRef<"AIAssistantMessage", 'String'>
    readonly createdAt: FieldRef<"AIAssistantMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AIAssistantMessage findUnique
   */
  export type AIAssistantMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    /**
     * Filter, which AIAssistantMessage to fetch.
     */
    where: AIAssistantMessageWhereUniqueInput
  }

  /**
   * AIAssistantMessage findUniqueOrThrow
   */
  export type AIAssistantMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    /**
     * Filter, which AIAssistantMessage to fetch.
     */
    where: AIAssistantMessageWhereUniqueInput
  }

  /**
   * AIAssistantMessage findFirst
   */
  export type AIAssistantMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    /**
     * Filter, which AIAssistantMessage to fetch.
     */
    where?: AIAssistantMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIAssistantMessages to fetch.
     */
    orderBy?: AIAssistantMessageOrderByWithRelationInput | AIAssistantMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AIAssistantMessages.
     */
    cursor?: AIAssistantMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIAssistantMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIAssistantMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AIAssistantMessages.
     */
    distinct?: AIAssistantMessageScalarFieldEnum | AIAssistantMessageScalarFieldEnum[]
  }

  /**
   * AIAssistantMessage findFirstOrThrow
   */
  export type AIAssistantMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    /**
     * Filter, which AIAssistantMessage to fetch.
     */
    where?: AIAssistantMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIAssistantMessages to fetch.
     */
    orderBy?: AIAssistantMessageOrderByWithRelationInput | AIAssistantMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AIAssistantMessages.
     */
    cursor?: AIAssistantMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIAssistantMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIAssistantMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AIAssistantMessages.
     */
    distinct?: AIAssistantMessageScalarFieldEnum | AIAssistantMessageScalarFieldEnum[]
  }

  /**
   * AIAssistantMessage findMany
   */
  export type AIAssistantMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    /**
     * Filter, which AIAssistantMessages to fetch.
     */
    where?: AIAssistantMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIAssistantMessages to fetch.
     */
    orderBy?: AIAssistantMessageOrderByWithRelationInput | AIAssistantMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AIAssistantMessages.
     */
    cursor?: AIAssistantMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIAssistantMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIAssistantMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AIAssistantMessages.
     */
    distinct?: AIAssistantMessageScalarFieldEnum | AIAssistantMessageScalarFieldEnum[]
  }

  /**
   * AIAssistantMessage create
   */
  export type AIAssistantMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a AIAssistantMessage.
     */
    data: XOR<AIAssistantMessageCreateInput, AIAssistantMessageUncheckedCreateInput>
  }

  /**
   * AIAssistantMessage createMany
   */
  export type AIAssistantMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AIAssistantMessages.
     */
    data: AIAssistantMessageCreateManyInput | AIAssistantMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AIAssistantMessage createManyAndReturn
   */
  export type AIAssistantMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * The data used to create many AIAssistantMessages.
     */
    data: AIAssistantMessageCreateManyInput | AIAssistantMessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AIAssistantMessage update
   */
  export type AIAssistantMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a AIAssistantMessage.
     */
    data: XOR<AIAssistantMessageUpdateInput, AIAssistantMessageUncheckedUpdateInput>
    /**
     * Choose, which AIAssistantMessage to update.
     */
    where: AIAssistantMessageWhereUniqueInput
  }

  /**
   * AIAssistantMessage updateMany
   */
  export type AIAssistantMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AIAssistantMessages.
     */
    data: XOR<AIAssistantMessageUpdateManyMutationInput, AIAssistantMessageUncheckedUpdateManyInput>
    /**
     * Filter which AIAssistantMessages to update
     */
    where?: AIAssistantMessageWhereInput
    /**
     * Limit how many AIAssistantMessages to update.
     */
    limit?: number
  }

  /**
   * AIAssistantMessage updateManyAndReturn
   */
  export type AIAssistantMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * The data used to update AIAssistantMessages.
     */
    data: XOR<AIAssistantMessageUpdateManyMutationInput, AIAssistantMessageUncheckedUpdateManyInput>
    /**
     * Filter which AIAssistantMessages to update
     */
    where?: AIAssistantMessageWhereInput
    /**
     * Limit how many AIAssistantMessages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AIAssistantMessage upsert
   */
  export type AIAssistantMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the AIAssistantMessage to update in case it exists.
     */
    where: AIAssistantMessageWhereUniqueInput
    /**
     * In case the AIAssistantMessage found by the `where` argument doesn't exist, create a new AIAssistantMessage with this data.
     */
    create: XOR<AIAssistantMessageCreateInput, AIAssistantMessageUncheckedCreateInput>
    /**
     * In case the AIAssistantMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AIAssistantMessageUpdateInput, AIAssistantMessageUncheckedUpdateInput>
  }

  /**
   * AIAssistantMessage delete
   */
  export type AIAssistantMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
    /**
     * Filter which AIAssistantMessage to delete.
     */
    where: AIAssistantMessageWhereUniqueInput
  }

  /**
   * AIAssistantMessage deleteMany
   */
  export type AIAssistantMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AIAssistantMessages to delete
     */
    where?: AIAssistantMessageWhereInput
    /**
     * Limit how many AIAssistantMessages to delete.
     */
    limit?: number
  }

  /**
   * AIAssistantMessage.apartment
   */
  export type AIAssistantMessage$apartmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Apartment
     */
    omit?: ApartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null
    where?: ApartmentWhereInput
  }

  /**
   * AIAssistantMessage.cleaningTask
   */
  export type AIAssistantMessage$cleaningTaskArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    where?: CleaningTaskWhereInput
  }

  /**
   * AIAssistantMessage.maintenanceTicket
   */
  export type AIAssistantMessage$maintenanceTicketArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    where?: MaintenanceTicketWhereInput
  }

  /**
   * AIAssistantMessage without action
   */
  export type AIAssistantMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIAssistantMessage
     */
    select?: AIAssistantMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIAssistantMessage
     */
    omit?: AIAssistantMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AIAssistantMessageInclude<ExtArgs> | null
  }


  /**
   * Model Attachment
   */

  export type AggregateAttachment = {
    _count: AttachmentCountAggregateOutputType | null
    _min: AttachmentMinAggregateOutputType | null
    _max: AttachmentMaxAggregateOutputType | null
  }

  export type AttachmentMinAggregateOutputType = {
    id: string | null
    url: string | null
    fileName: string | null
    fileType: string | null
    createdAt: Date | null
    maintenanceTicketId: string | null
    cleaningTaskId: string | null
  }

  export type AttachmentMaxAggregateOutputType = {
    id: string | null
    url: string | null
    fileName: string | null
    fileType: string | null
    createdAt: Date | null
    maintenanceTicketId: string | null
    cleaningTaskId: string | null
  }

  export type AttachmentCountAggregateOutputType = {
    id: number
    url: number
    fileName: number
    fileType: number
    createdAt: number
    maintenanceTicketId: number
    cleaningTaskId: number
    _all: number
  }


  export type AttachmentMinAggregateInputType = {
    id?: true
    url?: true
    fileName?: true
    fileType?: true
    createdAt?: true
    maintenanceTicketId?: true
    cleaningTaskId?: true
  }

  export type AttachmentMaxAggregateInputType = {
    id?: true
    url?: true
    fileName?: true
    fileType?: true
    createdAt?: true
    maintenanceTicketId?: true
    cleaningTaskId?: true
  }

  export type AttachmentCountAggregateInputType = {
    id?: true
    url?: true
    fileName?: true
    fileType?: true
    createdAt?: true
    maintenanceTicketId?: true
    cleaningTaskId?: true
    _all?: true
  }

  export type AttachmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attachment to aggregate.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Attachments
    **/
    _count?: true | AttachmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AttachmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AttachmentMaxAggregateInputType
  }

  export type GetAttachmentAggregateType<T extends AttachmentAggregateArgs> = {
        [P in keyof T & keyof AggregateAttachment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAttachment[P]>
      : GetScalarType<T[P], AggregateAttachment[P]>
  }




  export type AttachmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttachmentWhereInput
    orderBy?: AttachmentOrderByWithAggregationInput | AttachmentOrderByWithAggregationInput[]
    by: AttachmentScalarFieldEnum[] | AttachmentScalarFieldEnum
    having?: AttachmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AttachmentCountAggregateInputType | true
    _min?: AttachmentMinAggregateInputType
    _max?: AttachmentMaxAggregateInputType
  }

  export type AttachmentGroupByOutputType = {
    id: string
    url: string
    fileName: string
    fileType: string | null
    createdAt: Date
    maintenanceTicketId: string | null
    cleaningTaskId: string | null
    _count: AttachmentCountAggregateOutputType | null
    _min: AttachmentMinAggregateOutputType | null
    _max: AttachmentMaxAggregateOutputType | null
  }

  type GetAttachmentGroupByPayload<T extends AttachmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AttachmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AttachmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AttachmentGroupByOutputType[P]>
            : GetScalarType<T[P], AttachmentGroupByOutputType[P]>
        }
      >
    >


  export type AttachmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    fileName?: boolean
    fileType?: boolean
    createdAt?: boolean
    maintenanceTicketId?: boolean
    cleaningTaskId?: boolean
    maintenanceTicket?: boolean | Attachment$maintenanceTicketArgs<ExtArgs>
    cleaningTask?: boolean | Attachment$cleaningTaskArgs<ExtArgs>
    messages?: boolean | Attachment$messagesArgs<ExtArgs>
    cleaningMessages?: boolean | Attachment$cleaningMessagesArgs<ExtArgs>
    _count?: boolean | AttachmentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attachment"]>

  export type AttachmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    fileName?: boolean
    fileType?: boolean
    createdAt?: boolean
    maintenanceTicketId?: boolean
    cleaningTaskId?: boolean
    maintenanceTicket?: boolean | Attachment$maintenanceTicketArgs<ExtArgs>
    cleaningTask?: boolean | Attachment$cleaningTaskArgs<ExtArgs>
  }, ExtArgs["result"]["attachment"]>

  export type AttachmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    fileName?: boolean
    fileType?: boolean
    createdAt?: boolean
    maintenanceTicketId?: boolean
    cleaningTaskId?: boolean
    maintenanceTicket?: boolean | Attachment$maintenanceTicketArgs<ExtArgs>
    cleaningTask?: boolean | Attachment$cleaningTaskArgs<ExtArgs>
  }, ExtArgs["result"]["attachment"]>

  export type AttachmentSelectScalar = {
    id?: boolean
    url?: boolean
    fileName?: boolean
    fileType?: boolean
    createdAt?: boolean
    maintenanceTicketId?: boolean
    cleaningTaskId?: boolean
  }

  export type AttachmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "url" | "fileName" | "fileType" | "createdAt" | "maintenanceTicketId" | "cleaningTaskId", ExtArgs["result"]["attachment"]>
  export type AttachmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    maintenanceTicket?: boolean | Attachment$maintenanceTicketArgs<ExtArgs>
    cleaningTask?: boolean | Attachment$cleaningTaskArgs<ExtArgs>
    messages?: boolean | Attachment$messagesArgs<ExtArgs>
    cleaningMessages?: boolean | Attachment$cleaningMessagesArgs<ExtArgs>
    _count?: boolean | AttachmentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AttachmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    maintenanceTicket?: boolean | Attachment$maintenanceTicketArgs<ExtArgs>
    cleaningTask?: boolean | Attachment$cleaningTaskArgs<ExtArgs>
  }
  export type AttachmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    maintenanceTicket?: boolean | Attachment$maintenanceTicketArgs<ExtArgs>
    cleaningTask?: boolean | Attachment$cleaningTaskArgs<ExtArgs>
  }

  export type $AttachmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Attachment"
    objects: {
      maintenanceTicket: Prisma.$MaintenanceTicketPayload<ExtArgs> | null
      cleaningTask: Prisma.$CleaningTaskPayload<ExtArgs> | null
      messages: Prisma.$MessagePayload<ExtArgs>[]
      cleaningMessages: Prisma.$CleaningTaskMessagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      url: string
      fileName: string
      fileType: string | null
      createdAt: Date
      maintenanceTicketId: string | null
      cleaningTaskId: string | null
    }, ExtArgs["result"]["attachment"]>
    composites: {}
  }

  type AttachmentGetPayload<S extends boolean | null | undefined | AttachmentDefaultArgs> = $Result.GetResult<Prisma.$AttachmentPayload, S>

  type AttachmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AttachmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AttachmentCountAggregateInputType | true
    }

  export interface AttachmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Attachment'], meta: { name: 'Attachment' } }
    /**
     * Find zero or one Attachment that matches the filter.
     * @param {AttachmentFindUniqueArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttachmentFindUniqueArgs>(args: SelectSubset<T, AttachmentFindUniqueArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Attachment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AttachmentFindUniqueOrThrowArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttachmentFindUniqueOrThrowArgs>(args: SelectSubset<T, AttachmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attachment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentFindFirstArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttachmentFindFirstArgs>(args?: SelectSubset<T, AttachmentFindFirstArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attachment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentFindFirstOrThrowArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttachmentFindFirstOrThrowArgs>(args?: SelectSubset<T, AttachmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Attachments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Attachments
     * const attachments = await prisma.attachment.findMany()
     * 
     * // Get first 10 Attachments
     * const attachments = await prisma.attachment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const attachmentWithIdOnly = await prisma.attachment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AttachmentFindManyArgs>(args?: SelectSubset<T, AttachmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Attachment.
     * @param {AttachmentCreateArgs} args - Arguments to create a Attachment.
     * @example
     * // Create one Attachment
     * const Attachment = await prisma.attachment.create({
     *   data: {
     *     // ... data to create a Attachment
     *   }
     * })
     * 
     */
    create<T extends AttachmentCreateArgs>(args: SelectSubset<T, AttachmentCreateArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Attachments.
     * @param {AttachmentCreateManyArgs} args - Arguments to create many Attachments.
     * @example
     * // Create many Attachments
     * const attachment = await prisma.attachment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AttachmentCreateManyArgs>(args?: SelectSubset<T, AttachmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Attachments and returns the data saved in the database.
     * @param {AttachmentCreateManyAndReturnArgs} args - Arguments to create many Attachments.
     * @example
     * // Create many Attachments
     * const attachment = await prisma.attachment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Attachments and only return the `id`
     * const attachmentWithIdOnly = await prisma.attachment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AttachmentCreateManyAndReturnArgs>(args?: SelectSubset<T, AttachmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Attachment.
     * @param {AttachmentDeleteArgs} args - Arguments to delete one Attachment.
     * @example
     * // Delete one Attachment
     * const Attachment = await prisma.attachment.delete({
     *   where: {
     *     // ... filter to delete one Attachment
     *   }
     * })
     * 
     */
    delete<T extends AttachmentDeleteArgs>(args: SelectSubset<T, AttachmentDeleteArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Attachment.
     * @param {AttachmentUpdateArgs} args - Arguments to update one Attachment.
     * @example
     * // Update one Attachment
     * const attachment = await prisma.attachment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AttachmentUpdateArgs>(args: SelectSubset<T, AttachmentUpdateArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Attachments.
     * @param {AttachmentDeleteManyArgs} args - Arguments to filter Attachments to delete.
     * @example
     * // Delete a few Attachments
     * const { count } = await prisma.attachment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AttachmentDeleteManyArgs>(args?: SelectSubset<T, AttachmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Attachments
     * const attachment = await prisma.attachment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AttachmentUpdateManyArgs>(args: SelectSubset<T, AttachmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attachments and returns the data updated in the database.
     * @param {AttachmentUpdateManyAndReturnArgs} args - Arguments to update many Attachments.
     * @example
     * // Update many Attachments
     * const attachment = await prisma.attachment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Attachments and only return the `id`
     * const attachmentWithIdOnly = await prisma.attachment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AttachmentUpdateManyAndReturnArgs>(args: SelectSubset<T, AttachmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Attachment.
     * @param {AttachmentUpsertArgs} args - Arguments to update or create a Attachment.
     * @example
     * // Update or create a Attachment
     * const attachment = await prisma.attachment.upsert({
     *   create: {
     *     // ... data to create a Attachment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Attachment we want to update
     *   }
     * })
     */
    upsert<T extends AttachmentUpsertArgs>(args: SelectSubset<T, AttachmentUpsertArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Attachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentCountArgs} args - Arguments to filter Attachments to count.
     * @example
     * // Count the number of Attachments
     * const count = await prisma.attachment.count({
     *   where: {
     *     // ... the filter for the Attachments we want to count
     *   }
     * })
    **/
    count<T extends AttachmentCountArgs>(
      args?: Subset<T, AttachmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AttachmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Attachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AttachmentAggregateArgs>(args: Subset<T, AttachmentAggregateArgs>): Prisma.PrismaPromise<GetAttachmentAggregateType<T>>

    /**
     * Group by Attachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AttachmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AttachmentGroupByArgs['orderBy'] }
        : { orderBy?: AttachmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AttachmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttachmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Attachment model
   */
  readonly fields: AttachmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Attachment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AttachmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    maintenanceTicket<T extends Attachment$maintenanceTicketArgs<ExtArgs> = {}>(args?: Subset<T, Attachment$maintenanceTicketArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    cleaningTask<T extends Attachment$cleaningTaskArgs<ExtArgs> = {}>(args?: Subset<T, Attachment$cleaningTaskArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    messages<T extends Attachment$messagesArgs<ExtArgs> = {}>(args?: Subset<T, Attachment$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cleaningMessages<T extends Attachment$cleaningMessagesArgs<ExtArgs> = {}>(args?: Subset<T, Attachment$cleaningMessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Attachment model
   */
  interface AttachmentFieldRefs {
    readonly id: FieldRef<"Attachment", 'String'>
    readonly url: FieldRef<"Attachment", 'String'>
    readonly fileName: FieldRef<"Attachment", 'String'>
    readonly fileType: FieldRef<"Attachment", 'String'>
    readonly createdAt: FieldRef<"Attachment", 'DateTime'>
    readonly maintenanceTicketId: FieldRef<"Attachment", 'String'>
    readonly cleaningTaskId: FieldRef<"Attachment", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Attachment findUnique
   */
  export type AttachmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment findUniqueOrThrow
   */
  export type AttachmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment findFirst
   */
  export type AttachmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attachments.
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attachments.
     */
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Attachment findFirstOrThrow
   */
  export type AttachmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attachments.
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attachments.
     */
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Attachment findMany
   */
  export type AttachmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachments to fetch.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Attachments.
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attachments.
     */
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Attachment create
   */
  export type AttachmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Attachment.
     */
    data: XOR<AttachmentCreateInput, AttachmentUncheckedCreateInput>
  }

  /**
   * Attachment createMany
   */
  export type AttachmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Attachments.
     */
    data: AttachmentCreateManyInput | AttachmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Attachment createManyAndReturn
   */
  export type AttachmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * The data used to create many Attachments.
     */
    data: AttachmentCreateManyInput | AttachmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attachment update
   */
  export type AttachmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Attachment.
     */
    data: XOR<AttachmentUpdateInput, AttachmentUncheckedUpdateInput>
    /**
     * Choose, which Attachment to update.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment updateMany
   */
  export type AttachmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Attachments.
     */
    data: XOR<AttachmentUpdateManyMutationInput, AttachmentUncheckedUpdateManyInput>
    /**
     * Filter which Attachments to update
     */
    where?: AttachmentWhereInput
    /**
     * Limit how many Attachments to update.
     */
    limit?: number
  }

  /**
   * Attachment updateManyAndReturn
   */
  export type AttachmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * The data used to update Attachments.
     */
    data: XOR<AttachmentUpdateManyMutationInput, AttachmentUncheckedUpdateManyInput>
    /**
     * Filter which Attachments to update
     */
    where?: AttachmentWhereInput
    /**
     * Limit how many Attachments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attachment upsert
   */
  export type AttachmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Attachment to update in case it exists.
     */
    where: AttachmentWhereUniqueInput
    /**
     * In case the Attachment found by the `where` argument doesn't exist, create a new Attachment with this data.
     */
    create: XOR<AttachmentCreateInput, AttachmentUncheckedCreateInput>
    /**
     * In case the Attachment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AttachmentUpdateInput, AttachmentUncheckedUpdateInput>
  }

  /**
   * Attachment delete
   */
  export type AttachmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter which Attachment to delete.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment deleteMany
   */
  export type AttachmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attachments to delete
     */
    where?: AttachmentWhereInput
    /**
     * Limit how many Attachments to delete.
     */
    limit?: number
  }

  /**
   * Attachment.maintenanceTicket
   */
  export type Attachment$maintenanceTicketArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaintenanceTicket
     */
    select?: MaintenanceTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MaintenanceTicket
     */
    omit?: MaintenanceTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MaintenanceTicketInclude<ExtArgs> | null
    where?: MaintenanceTicketWhereInput
  }

  /**
   * Attachment.cleaningTask
   */
  export type Attachment$cleaningTaskArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTask
     */
    select?: CleaningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTask
     */
    omit?: CleaningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskInclude<ExtArgs> | null
    where?: CleaningTaskWhereInput
  }

  /**
   * Attachment.messages
   */
  export type Attachment$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    cursor?: MessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Attachment.cleaningMessages
   */
  export type Attachment$cleaningMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    where?: CleaningTaskMessageWhereInput
    orderBy?: CleaningTaskMessageOrderByWithRelationInput | CleaningTaskMessageOrderByWithRelationInput[]
    cursor?: CleaningTaskMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CleaningTaskMessageScalarFieldEnum | CleaningTaskMessageScalarFieldEnum[]
  }

  /**
   * Attachment without action
   */
  export type AttachmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
  }


  /**
   * Model ApartmentAttachment
   */

  export type AggregateApartmentAttachment = {
    _count: ApartmentAttachmentCountAggregateOutputType | null
    _avg: ApartmentAttachmentAvgAggregateOutputType | null
    _sum: ApartmentAttachmentSumAggregateOutputType | null
    _min: ApartmentAttachmentMinAggregateOutputType | null
    _max: ApartmentAttachmentMaxAggregateOutputType | null
  }

  export type ApartmentAttachmentAvgAggregateOutputType = {
    size: number | null
  }

  export type ApartmentAttachmentSumAggregateOutputType = {
    size: number | null
  }

  export type ApartmentAttachmentMinAggregateOutputType = {
    id: string | null
    apartmentId: string | null
    filename: string | null
    url: string | null
    mimeType: string | null
    size: number | null
    category: string | null
    extractedText: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ApartmentAttachmentMaxAggregateOutputType = {
    id: string | null
    apartmentId: string | null
    filename: string | null
    url: string | null
    mimeType: string | null
    size: number | null
    category: string | null
    extractedText: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ApartmentAttachmentCountAggregateOutputType = {
    id: number
    apartmentId: number
    filename: number
    url: number
    mimeType: number
    size: number
    category: number
    extractedText: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ApartmentAttachmentAvgAggregateInputType = {
    size?: true
  }

  export type ApartmentAttachmentSumAggregateInputType = {
    size?: true
  }

  export type ApartmentAttachmentMinAggregateInputType = {
    id?: true
    apartmentId?: true
    filename?: true
    url?: true
    mimeType?: true
    size?: true
    category?: true
    extractedText?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ApartmentAttachmentMaxAggregateInputType = {
    id?: true
    apartmentId?: true
    filename?: true
    url?: true
    mimeType?: true
    size?: true
    category?: true
    extractedText?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ApartmentAttachmentCountAggregateInputType = {
    id?: true
    apartmentId?: true
    filename?: true
    url?: true
    mimeType?: true
    size?: true
    category?: true
    extractedText?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ApartmentAttachmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApartmentAttachment to aggregate.
     */
    where?: ApartmentAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApartmentAttachments to fetch.
     */
    orderBy?: ApartmentAttachmentOrderByWithRelationInput | ApartmentAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApartmentAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApartmentAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApartmentAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApartmentAttachments
    **/
    _count?: true | ApartmentAttachmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ApartmentAttachmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ApartmentAttachmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApartmentAttachmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApartmentAttachmentMaxAggregateInputType
  }

  export type GetApartmentAttachmentAggregateType<T extends ApartmentAttachmentAggregateArgs> = {
        [P in keyof T & keyof AggregateApartmentAttachment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApartmentAttachment[P]>
      : GetScalarType<T[P], AggregateApartmentAttachment[P]>
  }




  export type ApartmentAttachmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApartmentAttachmentWhereInput
    orderBy?: ApartmentAttachmentOrderByWithAggregationInput | ApartmentAttachmentOrderByWithAggregationInput[]
    by: ApartmentAttachmentScalarFieldEnum[] | ApartmentAttachmentScalarFieldEnum
    having?: ApartmentAttachmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApartmentAttachmentCountAggregateInputType | true
    _avg?: ApartmentAttachmentAvgAggregateInputType
    _sum?: ApartmentAttachmentSumAggregateInputType
    _min?: ApartmentAttachmentMinAggregateInputType
    _max?: ApartmentAttachmentMaxAggregateInputType
  }

  export type ApartmentAttachmentGroupByOutputType = {
    id: string
    apartmentId: string
    filename: string
    url: string | null
    mimeType: string | null
    size: number | null
    category: string
    extractedText: string | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: ApartmentAttachmentCountAggregateOutputType | null
    _avg: ApartmentAttachmentAvgAggregateOutputType | null
    _sum: ApartmentAttachmentSumAggregateOutputType | null
    _min: ApartmentAttachmentMinAggregateOutputType | null
    _max: ApartmentAttachmentMaxAggregateOutputType | null
  }

  type GetApartmentAttachmentGroupByPayload<T extends ApartmentAttachmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApartmentAttachmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApartmentAttachmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApartmentAttachmentGroupByOutputType[P]>
            : GetScalarType<T[P], ApartmentAttachmentGroupByOutputType[P]>
        }
      >
    >


  export type ApartmentAttachmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    filename?: boolean
    url?: boolean
    mimeType?: boolean
    size?: boolean
    category?: boolean
    extractedText?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apartmentAttachment"]>

  export type ApartmentAttachmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    filename?: boolean
    url?: boolean
    mimeType?: boolean
    size?: boolean
    category?: boolean
    extractedText?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apartmentAttachment"]>

  export type ApartmentAttachmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    apartmentId?: boolean
    filename?: boolean
    url?: boolean
    mimeType?: boolean
    size?: boolean
    category?: boolean
    extractedText?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apartmentAttachment"]>

  export type ApartmentAttachmentSelectScalar = {
    id?: boolean
    apartmentId?: boolean
    filename?: boolean
    url?: boolean
    mimeType?: boolean
    size?: boolean
    category?: boolean
    extractedText?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ApartmentAttachmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "apartmentId" | "filename" | "url" | "mimeType" | "size" | "category" | "extractedText" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["apartmentAttachment"]>
  export type ApartmentAttachmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }
  export type ApartmentAttachmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }
  export type ApartmentAttachmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apartment?: boolean | ApartmentDefaultArgs<ExtArgs>
  }

  export type $ApartmentAttachmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApartmentAttachment"
    objects: {
      apartment: Prisma.$ApartmentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      apartmentId: string
      filename: string
      url: string | null
      mimeType: string | null
      size: number | null
      category: string
      extractedText: string | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["apartmentAttachment"]>
    composites: {}
  }

  type ApartmentAttachmentGetPayload<S extends boolean | null | undefined | ApartmentAttachmentDefaultArgs> = $Result.GetResult<Prisma.$ApartmentAttachmentPayload, S>

  type ApartmentAttachmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApartmentAttachmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApartmentAttachmentCountAggregateInputType | true
    }

  export interface ApartmentAttachmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApartmentAttachment'], meta: { name: 'ApartmentAttachment' } }
    /**
     * Find zero or one ApartmentAttachment that matches the filter.
     * @param {ApartmentAttachmentFindUniqueArgs} args - Arguments to find a ApartmentAttachment
     * @example
     * // Get one ApartmentAttachment
     * const apartmentAttachment = await prisma.apartmentAttachment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApartmentAttachmentFindUniqueArgs>(args: SelectSubset<T, ApartmentAttachmentFindUniqueArgs<ExtArgs>>): Prisma__ApartmentAttachmentClient<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApartmentAttachment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApartmentAttachmentFindUniqueOrThrowArgs} args - Arguments to find a ApartmentAttachment
     * @example
     * // Get one ApartmentAttachment
     * const apartmentAttachment = await prisma.apartmentAttachment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApartmentAttachmentFindUniqueOrThrowArgs>(args: SelectSubset<T, ApartmentAttachmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApartmentAttachmentClient<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApartmentAttachment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentAttachmentFindFirstArgs} args - Arguments to find a ApartmentAttachment
     * @example
     * // Get one ApartmentAttachment
     * const apartmentAttachment = await prisma.apartmentAttachment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApartmentAttachmentFindFirstArgs>(args?: SelectSubset<T, ApartmentAttachmentFindFirstArgs<ExtArgs>>): Prisma__ApartmentAttachmentClient<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApartmentAttachment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentAttachmentFindFirstOrThrowArgs} args - Arguments to find a ApartmentAttachment
     * @example
     * // Get one ApartmentAttachment
     * const apartmentAttachment = await prisma.apartmentAttachment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApartmentAttachmentFindFirstOrThrowArgs>(args?: SelectSubset<T, ApartmentAttachmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApartmentAttachmentClient<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApartmentAttachments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentAttachmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApartmentAttachments
     * const apartmentAttachments = await prisma.apartmentAttachment.findMany()
     * 
     * // Get first 10 ApartmentAttachments
     * const apartmentAttachments = await prisma.apartmentAttachment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apartmentAttachmentWithIdOnly = await prisma.apartmentAttachment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApartmentAttachmentFindManyArgs>(args?: SelectSubset<T, ApartmentAttachmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApartmentAttachment.
     * @param {ApartmentAttachmentCreateArgs} args - Arguments to create a ApartmentAttachment.
     * @example
     * // Create one ApartmentAttachment
     * const ApartmentAttachment = await prisma.apartmentAttachment.create({
     *   data: {
     *     // ... data to create a ApartmentAttachment
     *   }
     * })
     * 
     */
    create<T extends ApartmentAttachmentCreateArgs>(args: SelectSubset<T, ApartmentAttachmentCreateArgs<ExtArgs>>): Prisma__ApartmentAttachmentClient<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApartmentAttachments.
     * @param {ApartmentAttachmentCreateManyArgs} args - Arguments to create many ApartmentAttachments.
     * @example
     * // Create many ApartmentAttachments
     * const apartmentAttachment = await prisma.apartmentAttachment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApartmentAttachmentCreateManyArgs>(args?: SelectSubset<T, ApartmentAttachmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ApartmentAttachments and returns the data saved in the database.
     * @param {ApartmentAttachmentCreateManyAndReturnArgs} args - Arguments to create many ApartmentAttachments.
     * @example
     * // Create many ApartmentAttachments
     * const apartmentAttachment = await prisma.apartmentAttachment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ApartmentAttachments and only return the `id`
     * const apartmentAttachmentWithIdOnly = await prisma.apartmentAttachment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApartmentAttachmentCreateManyAndReturnArgs>(args?: SelectSubset<T, ApartmentAttachmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ApartmentAttachment.
     * @param {ApartmentAttachmentDeleteArgs} args - Arguments to delete one ApartmentAttachment.
     * @example
     * // Delete one ApartmentAttachment
     * const ApartmentAttachment = await prisma.apartmentAttachment.delete({
     *   where: {
     *     // ... filter to delete one ApartmentAttachment
     *   }
     * })
     * 
     */
    delete<T extends ApartmentAttachmentDeleteArgs>(args: SelectSubset<T, ApartmentAttachmentDeleteArgs<ExtArgs>>): Prisma__ApartmentAttachmentClient<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApartmentAttachment.
     * @param {ApartmentAttachmentUpdateArgs} args - Arguments to update one ApartmentAttachment.
     * @example
     * // Update one ApartmentAttachment
     * const apartmentAttachment = await prisma.apartmentAttachment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApartmentAttachmentUpdateArgs>(args: SelectSubset<T, ApartmentAttachmentUpdateArgs<ExtArgs>>): Prisma__ApartmentAttachmentClient<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApartmentAttachments.
     * @param {ApartmentAttachmentDeleteManyArgs} args - Arguments to filter ApartmentAttachments to delete.
     * @example
     * // Delete a few ApartmentAttachments
     * const { count } = await prisma.apartmentAttachment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApartmentAttachmentDeleteManyArgs>(args?: SelectSubset<T, ApartmentAttachmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApartmentAttachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentAttachmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApartmentAttachments
     * const apartmentAttachment = await prisma.apartmentAttachment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApartmentAttachmentUpdateManyArgs>(args: SelectSubset<T, ApartmentAttachmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApartmentAttachments and returns the data updated in the database.
     * @param {ApartmentAttachmentUpdateManyAndReturnArgs} args - Arguments to update many ApartmentAttachments.
     * @example
     * // Update many ApartmentAttachments
     * const apartmentAttachment = await prisma.apartmentAttachment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ApartmentAttachments and only return the `id`
     * const apartmentAttachmentWithIdOnly = await prisma.apartmentAttachment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApartmentAttachmentUpdateManyAndReturnArgs>(args: SelectSubset<T, ApartmentAttachmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ApartmentAttachment.
     * @param {ApartmentAttachmentUpsertArgs} args - Arguments to update or create a ApartmentAttachment.
     * @example
     * // Update or create a ApartmentAttachment
     * const apartmentAttachment = await prisma.apartmentAttachment.upsert({
     *   create: {
     *     // ... data to create a ApartmentAttachment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApartmentAttachment we want to update
     *   }
     * })
     */
    upsert<T extends ApartmentAttachmentUpsertArgs>(args: SelectSubset<T, ApartmentAttachmentUpsertArgs<ExtArgs>>): Prisma__ApartmentAttachmentClient<$Result.GetResult<Prisma.$ApartmentAttachmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApartmentAttachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentAttachmentCountArgs} args - Arguments to filter ApartmentAttachments to count.
     * @example
     * // Count the number of ApartmentAttachments
     * const count = await prisma.apartmentAttachment.count({
     *   where: {
     *     // ... the filter for the ApartmentAttachments we want to count
     *   }
     * })
    **/
    count<T extends ApartmentAttachmentCountArgs>(
      args?: Subset<T, ApartmentAttachmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApartmentAttachmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApartmentAttachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentAttachmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApartmentAttachmentAggregateArgs>(args: Subset<T, ApartmentAttachmentAggregateArgs>): Prisma.PrismaPromise<GetApartmentAttachmentAggregateType<T>>

    /**
     * Group by ApartmentAttachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentAttachmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApartmentAttachmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApartmentAttachmentGroupByArgs['orderBy'] }
        : { orderBy?: ApartmentAttachmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApartmentAttachmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApartmentAttachmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApartmentAttachment model
   */
  readonly fields: ApartmentAttachmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApartmentAttachment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApartmentAttachmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    apartment<T extends ApartmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApartmentDefaultArgs<ExtArgs>>): Prisma__ApartmentClient<$Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ApartmentAttachment model
   */
  interface ApartmentAttachmentFieldRefs {
    readonly id: FieldRef<"ApartmentAttachment", 'String'>
    readonly apartmentId: FieldRef<"ApartmentAttachment", 'String'>
    readonly filename: FieldRef<"ApartmentAttachment", 'String'>
    readonly url: FieldRef<"ApartmentAttachment", 'String'>
    readonly mimeType: FieldRef<"ApartmentAttachment", 'String'>
    readonly size: FieldRef<"ApartmentAttachment", 'Int'>
    readonly category: FieldRef<"ApartmentAttachment", 'String'>
    readonly extractedText: FieldRef<"ApartmentAttachment", 'String'>
    readonly notes: FieldRef<"ApartmentAttachment", 'String'>
    readonly createdAt: FieldRef<"ApartmentAttachment", 'DateTime'>
    readonly updatedAt: FieldRef<"ApartmentAttachment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ApartmentAttachment findUnique
   */
  export type ApartmentAttachmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which ApartmentAttachment to fetch.
     */
    where: ApartmentAttachmentWhereUniqueInput
  }

  /**
   * ApartmentAttachment findUniqueOrThrow
   */
  export type ApartmentAttachmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which ApartmentAttachment to fetch.
     */
    where: ApartmentAttachmentWhereUniqueInput
  }

  /**
   * ApartmentAttachment findFirst
   */
  export type ApartmentAttachmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which ApartmentAttachment to fetch.
     */
    where?: ApartmentAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApartmentAttachments to fetch.
     */
    orderBy?: ApartmentAttachmentOrderByWithRelationInput | ApartmentAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApartmentAttachments.
     */
    cursor?: ApartmentAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApartmentAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApartmentAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApartmentAttachments.
     */
    distinct?: ApartmentAttachmentScalarFieldEnum | ApartmentAttachmentScalarFieldEnum[]
  }

  /**
   * ApartmentAttachment findFirstOrThrow
   */
  export type ApartmentAttachmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which ApartmentAttachment to fetch.
     */
    where?: ApartmentAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApartmentAttachments to fetch.
     */
    orderBy?: ApartmentAttachmentOrderByWithRelationInput | ApartmentAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApartmentAttachments.
     */
    cursor?: ApartmentAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApartmentAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApartmentAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApartmentAttachments.
     */
    distinct?: ApartmentAttachmentScalarFieldEnum | ApartmentAttachmentScalarFieldEnum[]
  }

  /**
   * ApartmentAttachment findMany
   */
  export type ApartmentAttachmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which ApartmentAttachments to fetch.
     */
    where?: ApartmentAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApartmentAttachments to fetch.
     */
    orderBy?: ApartmentAttachmentOrderByWithRelationInput | ApartmentAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApartmentAttachments.
     */
    cursor?: ApartmentAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApartmentAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApartmentAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApartmentAttachments.
     */
    distinct?: ApartmentAttachmentScalarFieldEnum | ApartmentAttachmentScalarFieldEnum[]
  }

  /**
   * ApartmentAttachment create
   */
  export type ApartmentAttachmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
    /**
     * The data needed to create a ApartmentAttachment.
     */
    data: XOR<ApartmentAttachmentCreateInput, ApartmentAttachmentUncheckedCreateInput>
  }

  /**
   * ApartmentAttachment createMany
   */
  export type ApartmentAttachmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApartmentAttachments.
     */
    data: ApartmentAttachmentCreateManyInput | ApartmentAttachmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApartmentAttachment createManyAndReturn
   */
  export type ApartmentAttachmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * The data used to create many ApartmentAttachments.
     */
    data: ApartmentAttachmentCreateManyInput | ApartmentAttachmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApartmentAttachment update
   */
  export type ApartmentAttachmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
    /**
     * The data needed to update a ApartmentAttachment.
     */
    data: XOR<ApartmentAttachmentUpdateInput, ApartmentAttachmentUncheckedUpdateInput>
    /**
     * Choose, which ApartmentAttachment to update.
     */
    where: ApartmentAttachmentWhereUniqueInput
  }

  /**
   * ApartmentAttachment updateMany
   */
  export type ApartmentAttachmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApartmentAttachments.
     */
    data: XOR<ApartmentAttachmentUpdateManyMutationInput, ApartmentAttachmentUncheckedUpdateManyInput>
    /**
     * Filter which ApartmentAttachments to update
     */
    where?: ApartmentAttachmentWhereInput
    /**
     * Limit how many ApartmentAttachments to update.
     */
    limit?: number
  }

  /**
   * ApartmentAttachment updateManyAndReturn
   */
  export type ApartmentAttachmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * The data used to update ApartmentAttachments.
     */
    data: XOR<ApartmentAttachmentUpdateManyMutationInput, ApartmentAttachmentUncheckedUpdateManyInput>
    /**
     * Filter which ApartmentAttachments to update
     */
    where?: ApartmentAttachmentWhereInput
    /**
     * Limit how many ApartmentAttachments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApartmentAttachment upsert
   */
  export type ApartmentAttachmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
    /**
     * The filter to search for the ApartmentAttachment to update in case it exists.
     */
    where: ApartmentAttachmentWhereUniqueInput
    /**
     * In case the ApartmentAttachment found by the `where` argument doesn't exist, create a new ApartmentAttachment with this data.
     */
    create: XOR<ApartmentAttachmentCreateInput, ApartmentAttachmentUncheckedCreateInput>
    /**
     * In case the ApartmentAttachment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApartmentAttachmentUpdateInput, ApartmentAttachmentUncheckedUpdateInput>
  }

  /**
   * ApartmentAttachment delete
   */
  export type ApartmentAttachmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
    /**
     * Filter which ApartmentAttachment to delete.
     */
    where: ApartmentAttachmentWhereUniqueInput
  }

  /**
   * ApartmentAttachment deleteMany
   */
  export type ApartmentAttachmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApartmentAttachments to delete
     */
    where?: ApartmentAttachmentWhereInput
    /**
     * Limit how many ApartmentAttachments to delete.
     */
    limit?: number
  }

  /**
   * ApartmentAttachment without action
   */
  export type ApartmentAttachmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApartmentAttachment
     */
    select?: ApartmentAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApartmentAttachment
     */
    omit?: ApartmentAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentAttachmentInclude<ExtArgs> | null
  }


  /**
   * Model Message
   */

  export type AggregateMessage = {
    _count: MessageCountAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  export type MessageMinAggregateOutputType = {
    id: string | null
    text: string | null
    role: string | null
    senderName: string | null
    createdAt: Date | null
    maintenanceTicketId: string | null
    attachmentId: string | null
    readByManagerAt: Date | null
  }

  export type MessageMaxAggregateOutputType = {
    id: string | null
    text: string | null
    role: string | null
    senderName: string | null
    createdAt: Date | null
    maintenanceTicketId: string | null
    attachmentId: string | null
    readByManagerAt: Date | null
  }

  export type MessageCountAggregateOutputType = {
    id: number
    text: number
    role: number
    senderName: number
    createdAt: number
    maintenanceTicketId: number
    attachmentId: number
    readByManagerAt: number
    _all: number
  }


  export type MessageMinAggregateInputType = {
    id?: true
    text?: true
    role?: true
    senderName?: true
    createdAt?: true
    maintenanceTicketId?: true
    attachmentId?: true
    readByManagerAt?: true
  }

  export type MessageMaxAggregateInputType = {
    id?: true
    text?: true
    role?: true
    senderName?: true
    createdAt?: true
    maintenanceTicketId?: true
    attachmentId?: true
    readByManagerAt?: true
  }

  export type MessageCountAggregateInputType = {
    id?: true
    text?: true
    role?: true
    senderName?: true
    createdAt?: true
    maintenanceTicketId?: true
    attachmentId?: true
    readByManagerAt?: true
    _all?: true
  }

  export type MessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Message to aggregate.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Messages
    **/
    _count?: true | MessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MessageMaxAggregateInputType
  }

  export type GetMessageAggregateType<T extends MessageAggregateArgs> = {
        [P in keyof T & keyof AggregateMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMessage[P]>
      : GetScalarType<T[P], AggregateMessage[P]>
  }




  export type MessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithAggregationInput | MessageOrderByWithAggregationInput[]
    by: MessageScalarFieldEnum[] | MessageScalarFieldEnum
    having?: MessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MessageCountAggregateInputType | true
    _min?: MessageMinAggregateInputType
    _max?: MessageMaxAggregateInputType
  }

  export type MessageGroupByOutputType = {
    id: string
    text: string | null
    role: string
    senderName: string
    createdAt: Date
    maintenanceTicketId: string
    attachmentId: string | null
    readByManagerAt: Date | null
    _count: MessageCountAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  type GetMessageGroupByPayload<T extends MessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MessageGroupByOutputType[P]>
            : GetScalarType<T[P], MessageGroupByOutputType[P]>
        }
      >
    >


  export type MessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    text?: boolean
    role?: boolean
    senderName?: boolean
    createdAt?: boolean
    maintenanceTicketId?: boolean
    attachmentId?: boolean
    readByManagerAt?: boolean
    maintenanceTicket?: boolean | MaintenanceTicketDefaultArgs<ExtArgs>
    attachment?: boolean | Message$attachmentArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    text?: boolean
    role?: boolean
    senderName?: boolean
    createdAt?: boolean
    maintenanceTicketId?: boolean
    attachmentId?: boolean
    readByManagerAt?: boolean
    maintenanceTicket?: boolean | MaintenanceTicketDefaultArgs<ExtArgs>
    attachment?: boolean | Message$attachmentArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    text?: boolean
    role?: boolean
    senderName?: boolean
    createdAt?: boolean
    maintenanceTicketId?: boolean
    attachmentId?: boolean
    readByManagerAt?: boolean
    maintenanceTicket?: boolean | MaintenanceTicketDefaultArgs<ExtArgs>
    attachment?: boolean | Message$attachmentArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectScalar = {
    id?: boolean
    text?: boolean
    role?: boolean
    senderName?: boolean
    createdAt?: boolean
    maintenanceTicketId?: boolean
    attachmentId?: boolean
    readByManagerAt?: boolean
  }

  export type MessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "text" | "role" | "senderName" | "createdAt" | "maintenanceTicketId" | "attachmentId" | "readByManagerAt", ExtArgs["result"]["message"]>
  export type MessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    maintenanceTicket?: boolean | MaintenanceTicketDefaultArgs<ExtArgs>
    attachment?: boolean | Message$attachmentArgs<ExtArgs>
  }
  export type MessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    maintenanceTicket?: boolean | MaintenanceTicketDefaultArgs<ExtArgs>
    attachment?: boolean | Message$attachmentArgs<ExtArgs>
  }
  export type MessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    maintenanceTicket?: boolean | MaintenanceTicketDefaultArgs<ExtArgs>
    attachment?: boolean | Message$attachmentArgs<ExtArgs>
  }

  export type $MessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Message"
    objects: {
      maintenanceTicket: Prisma.$MaintenanceTicketPayload<ExtArgs>
      attachment: Prisma.$AttachmentPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      text: string | null
      role: string
      senderName: string
      createdAt: Date
      maintenanceTicketId: string
      attachmentId: string | null
      readByManagerAt: Date | null
    }, ExtArgs["result"]["message"]>
    composites: {}
  }

  type MessageGetPayload<S extends boolean | null | undefined | MessageDefaultArgs> = $Result.GetResult<Prisma.$MessagePayload, S>

  type MessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MessageCountAggregateInputType | true
    }

  export interface MessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Message'], meta: { name: 'Message' } }
    /**
     * Find zero or one Message that matches the filter.
     * @param {MessageFindUniqueArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MessageFindUniqueArgs>(args: SelectSubset<T, MessageFindUniqueArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Message that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MessageFindUniqueOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MessageFindUniqueOrThrowArgs>(args: SelectSubset<T, MessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Message that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MessageFindFirstArgs>(args?: SelectSubset<T, MessageFindFirstArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Message that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MessageFindFirstOrThrowArgs>(args?: SelectSubset<T, MessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Messages
     * const messages = await prisma.message.findMany()
     * 
     * // Get first 10 Messages
     * const messages = await prisma.message.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const messageWithIdOnly = await prisma.message.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MessageFindManyArgs>(args?: SelectSubset<T, MessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Message.
     * @param {MessageCreateArgs} args - Arguments to create a Message.
     * @example
     * // Create one Message
     * const Message = await prisma.message.create({
     *   data: {
     *     // ... data to create a Message
     *   }
     * })
     * 
     */
    create<T extends MessageCreateArgs>(args: SelectSubset<T, MessageCreateArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Messages.
     * @param {MessageCreateManyArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const message = await prisma.message.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MessageCreateManyArgs>(args?: SelectSubset<T, MessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Messages and returns the data saved in the database.
     * @param {MessageCreateManyAndReturnArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const message = await prisma.message.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Messages and only return the `id`
     * const messageWithIdOnly = await prisma.message.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MessageCreateManyAndReturnArgs>(args?: SelectSubset<T, MessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Message.
     * @param {MessageDeleteArgs} args - Arguments to delete one Message.
     * @example
     * // Delete one Message
     * const Message = await prisma.message.delete({
     *   where: {
     *     // ... filter to delete one Message
     *   }
     * })
     * 
     */
    delete<T extends MessageDeleteArgs>(args: SelectSubset<T, MessageDeleteArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Message.
     * @param {MessageUpdateArgs} args - Arguments to update one Message.
     * @example
     * // Update one Message
     * const message = await prisma.message.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MessageUpdateArgs>(args: SelectSubset<T, MessageUpdateArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Messages.
     * @param {MessageDeleteManyArgs} args - Arguments to filter Messages to delete.
     * @example
     * // Delete a few Messages
     * const { count } = await prisma.message.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MessageDeleteManyArgs>(args?: SelectSubset<T, MessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Messages
     * const message = await prisma.message.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MessageUpdateManyArgs>(args: SelectSubset<T, MessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages and returns the data updated in the database.
     * @param {MessageUpdateManyAndReturnArgs} args - Arguments to update many Messages.
     * @example
     * // Update many Messages
     * const message = await prisma.message.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Messages and only return the `id`
     * const messageWithIdOnly = await prisma.message.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MessageUpdateManyAndReturnArgs>(args: SelectSubset<T, MessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Message.
     * @param {MessageUpsertArgs} args - Arguments to update or create a Message.
     * @example
     * // Update or create a Message
     * const message = await prisma.message.upsert({
     *   create: {
     *     // ... data to create a Message
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Message we want to update
     *   }
     * })
     */
    upsert<T extends MessageUpsertArgs>(args: SelectSubset<T, MessageUpsertArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageCountArgs} args - Arguments to filter Messages to count.
     * @example
     * // Count the number of Messages
     * const count = await prisma.message.count({
     *   where: {
     *     // ... the filter for the Messages we want to count
     *   }
     * })
    **/
    count<T extends MessageCountArgs>(
      args?: Subset<T, MessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MessageAggregateArgs>(args: Subset<T, MessageAggregateArgs>): Prisma.PrismaPromise<GetMessageAggregateType<T>>

    /**
     * Group by Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MessageGroupByArgs['orderBy'] }
        : { orderBy?: MessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Message model
   */
  readonly fields: MessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Message.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    maintenanceTicket<T extends MaintenanceTicketDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MaintenanceTicketDefaultArgs<ExtArgs>>): Prisma__MaintenanceTicketClient<$Result.GetResult<Prisma.$MaintenanceTicketPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    attachment<T extends Message$attachmentArgs<ExtArgs> = {}>(args?: Subset<T, Message$attachmentArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Message model
   */
  interface MessageFieldRefs {
    readonly id: FieldRef<"Message", 'String'>
    readonly text: FieldRef<"Message", 'String'>
    readonly role: FieldRef<"Message", 'String'>
    readonly senderName: FieldRef<"Message", 'String'>
    readonly createdAt: FieldRef<"Message", 'DateTime'>
    readonly maintenanceTicketId: FieldRef<"Message", 'String'>
    readonly attachmentId: FieldRef<"Message", 'String'>
    readonly readByManagerAt: FieldRef<"Message", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Message findUnique
   */
  export type MessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message findUniqueOrThrow
   */
  export type MessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message findFirst
   */
  export type MessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message findFirstOrThrow
   */
  export type MessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message findMany
   */
  export type MessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Messages to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message create
   */
  export type MessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The data needed to create a Message.
     */
    data: XOR<MessageCreateInput, MessageUncheckedCreateInput>
  }

  /**
   * Message createMany
   */
  export type MessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Messages.
     */
    data: MessageCreateManyInput | MessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Message createManyAndReturn
   */
  export type MessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * The data used to create many Messages.
     */
    data: MessageCreateManyInput | MessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Message update
   */
  export type MessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The data needed to update a Message.
     */
    data: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
    /**
     * Choose, which Message to update.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message updateMany
   */
  export type MessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Messages.
     */
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyInput>
    /**
     * Filter which Messages to update
     */
    where?: MessageWhereInput
    /**
     * Limit how many Messages to update.
     */
    limit?: number
  }

  /**
   * Message updateManyAndReturn
   */
  export type MessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * The data used to update Messages.
     */
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyInput>
    /**
     * Filter which Messages to update
     */
    where?: MessageWhereInput
    /**
     * Limit how many Messages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Message upsert
   */
  export type MessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The filter to search for the Message to update in case it exists.
     */
    where: MessageWhereUniqueInput
    /**
     * In case the Message found by the `where` argument doesn't exist, create a new Message with this data.
     */
    create: XOR<MessageCreateInput, MessageUncheckedCreateInput>
    /**
     * In case the Message was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
  }

  /**
   * Message delete
   */
  export type MessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter which Message to delete.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message deleteMany
   */
  export type MessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Messages to delete
     */
    where?: MessageWhereInput
    /**
     * Limit how many Messages to delete.
     */
    limit?: number
  }

  /**
   * Message.attachment
   */
  export type Message$attachmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    where?: AttachmentWhereInput
  }

  /**
   * Message without action
   */
  export type MessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
  }


  /**
   * Model CleaningTaskMessage
   */

  export type AggregateCleaningTaskMessage = {
    _count: CleaningTaskMessageCountAggregateOutputType | null
    _min: CleaningTaskMessageMinAggregateOutputType | null
    _max: CleaningTaskMessageMaxAggregateOutputType | null
  }

  export type CleaningTaskMessageMinAggregateOutputType = {
    id: string | null
    text: string | null
    role: string | null
    senderName: string | null
    createdAt: Date | null
    cleaningTaskId: string | null
    attachmentId: string | null
    readByManagerAt: Date | null
  }

  export type CleaningTaskMessageMaxAggregateOutputType = {
    id: string | null
    text: string | null
    role: string | null
    senderName: string | null
    createdAt: Date | null
    cleaningTaskId: string | null
    attachmentId: string | null
    readByManagerAt: Date | null
  }

  export type CleaningTaskMessageCountAggregateOutputType = {
    id: number
    text: number
    role: number
    senderName: number
    createdAt: number
    cleaningTaskId: number
    attachmentId: number
    readByManagerAt: number
    _all: number
  }


  export type CleaningTaskMessageMinAggregateInputType = {
    id?: true
    text?: true
    role?: true
    senderName?: true
    createdAt?: true
    cleaningTaskId?: true
    attachmentId?: true
    readByManagerAt?: true
  }

  export type CleaningTaskMessageMaxAggregateInputType = {
    id?: true
    text?: true
    role?: true
    senderName?: true
    createdAt?: true
    cleaningTaskId?: true
    attachmentId?: true
    readByManagerAt?: true
  }

  export type CleaningTaskMessageCountAggregateInputType = {
    id?: true
    text?: true
    role?: true
    senderName?: true
    createdAt?: true
    cleaningTaskId?: true
    attachmentId?: true
    readByManagerAt?: true
    _all?: true
  }

  export type CleaningTaskMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CleaningTaskMessage to aggregate.
     */
    where?: CleaningTaskMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleaningTaskMessages to fetch.
     */
    orderBy?: CleaningTaskMessageOrderByWithRelationInput | CleaningTaskMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CleaningTaskMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleaningTaskMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleaningTaskMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CleaningTaskMessages
    **/
    _count?: true | CleaningTaskMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CleaningTaskMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CleaningTaskMessageMaxAggregateInputType
  }

  export type GetCleaningTaskMessageAggregateType<T extends CleaningTaskMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateCleaningTaskMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCleaningTaskMessage[P]>
      : GetScalarType<T[P], AggregateCleaningTaskMessage[P]>
  }




  export type CleaningTaskMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleaningTaskMessageWhereInput
    orderBy?: CleaningTaskMessageOrderByWithAggregationInput | CleaningTaskMessageOrderByWithAggregationInput[]
    by: CleaningTaskMessageScalarFieldEnum[] | CleaningTaskMessageScalarFieldEnum
    having?: CleaningTaskMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CleaningTaskMessageCountAggregateInputType | true
    _min?: CleaningTaskMessageMinAggregateInputType
    _max?: CleaningTaskMessageMaxAggregateInputType
  }

  export type CleaningTaskMessageGroupByOutputType = {
    id: string
    text: string | null
    role: string
    senderName: string
    createdAt: Date
    cleaningTaskId: string
    attachmentId: string | null
    readByManagerAt: Date | null
    _count: CleaningTaskMessageCountAggregateOutputType | null
    _min: CleaningTaskMessageMinAggregateOutputType | null
    _max: CleaningTaskMessageMaxAggregateOutputType | null
  }

  type GetCleaningTaskMessageGroupByPayload<T extends CleaningTaskMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CleaningTaskMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CleaningTaskMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CleaningTaskMessageGroupByOutputType[P]>
            : GetScalarType<T[P], CleaningTaskMessageGroupByOutputType[P]>
        }
      >
    >


  export type CleaningTaskMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    text?: boolean
    role?: boolean
    senderName?: boolean
    createdAt?: boolean
    cleaningTaskId?: boolean
    attachmentId?: boolean
    readByManagerAt?: boolean
    cleaningTask?: boolean | CleaningTaskDefaultArgs<ExtArgs>
    attachment?: boolean | CleaningTaskMessage$attachmentArgs<ExtArgs>
  }, ExtArgs["result"]["cleaningTaskMessage"]>

  export type CleaningTaskMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    text?: boolean
    role?: boolean
    senderName?: boolean
    createdAt?: boolean
    cleaningTaskId?: boolean
    attachmentId?: boolean
    readByManagerAt?: boolean
    cleaningTask?: boolean | CleaningTaskDefaultArgs<ExtArgs>
    attachment?: boolean | CleaningTaskMessage$attachmentArgs<ExtArgs>
  }, ExtArgs["result"]["cleaningTaskMessage"]>

  export type CleaningTaskMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    text?: boolean
    role?: boolean
    senderName?: boolean
    createdAt?: boolean
    cleaningTaskId?: boolean
    attachmentId?: boolean
    readByManagerAt?: boolean
    cleaningTask?: boolean | CleaningTaskDefaultArgs<ExtArgs>
    attachment?: boolean | CleaningTaskMessage$attachmentArgs<ExtArgs>
  }, ExtArgs["result"]["cleaningTaskMessage"]>

  export type CleaningTaskMessageSelectScalar = {
    id?: boolean
    text?: boolean
    role?: boolean
    senderName?: boolean
    createdAt?: boolean
    cleaningTaskId?: boolean
    attachmentId?: boolean
    readByManagerAt?: boolean
  }

  export type CleaningTaskMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "text" | "role" | "senderName" | "createdAt" | "cleaningTaskId" | "attachmentId" | "readByManagerAt", ExtArgs["result"]["cleaningTaskMessage"]>
  export type CleaningTaskMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cleaningTask?: boolean | CleaningTaskDefaultArgs<ExtArgs>
    attachment?: boolean | CleaningTaskMessage$attachmentArgs<ExtArgs>
  }
  export type CleaningTaskMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cleaningTask?: boolean | CleaningTaskDefaultArgs<ExtArgs>
    attachment?: boolean | CleaningTaskMessage$attachmentArgs<ExtArgs>
  }
  export type CleaningTaskMessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cleaningTask?: boolean | CleaningTaskDefaultArgs<ExtArgs>
    attachment?: boolean | CleaningTaskMessage$attachmentArgs<ExtArgs>
  }

  export type $CleaningTaskMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CleaningTaskMessage"
    objects: {
      cleaningTask: Prisma.$CleaningTaskPayload<ExtArgs>
      attachment: Prisma.$AttachmentPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      text: string | null
      role: string
      senderName: string
      createdAt: Date
      cleaningTaskId: string
      attachmentId: string | null
      readByManagerAt: Date | null
    }, ExtArgs["result"]["cleaningTaskMessage"]>
    composites: {}
  }

  type CleaningTaskMessageGetPayload<S extends boolean | null | undefined | CleaningTaskMessageDefaultArgs> = $Result.GetResult<Prisma.$CleaningTaskMessagePayload, S>

  type CleaningTaskMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CleaningTaskMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CleaningTaskMessageCountAggregateInputType | true
    }

  export interface CleaningTaskMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CleaningTaskMessage'], meta: { name: 'CleaningTaskMessage' } }
    /**
     * Find zero or one CleaningTaskMessage that matches the filter.
     * @param {CleaningTaskMessageFindUniqueArgs} args - Arguments to find a CleaningTaskMessage
     * @example
     * // Get one CleaningTaskMessage
     * const cleaningTaskMessage = await prisma.cleaningTaskMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CleaningTaskMessageFindUniqueArgs>(args: SelectSubset<T, CleaningTaskMessageFindUniqueArgs<ExtArgs>>): Prisma__CleaningTaskMessageClient<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CleaningTaskMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CleaningTaskMessageFindUniqueOrThrowArgs} args - Arguments to find a CleaningTaskMessage
     * @example
     * // Get one CleaningTaskMessage
     * const cleaningTaskMessage = await prisma.cleaningTaskMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CleaningTaskMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, CleaningTaskMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CleaningTaskMessageClient<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CleaningTaskMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskMessageFindFirstArgs} args - Arguments to find a CleaningTaskMessage
     * @example
     * // Get one CleaningTaskMessage
     * const cleaningTaskMessage = await prisma.cleaningTaskMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CleaningTaskMessageFindFirstArgs>(args?: SelectSubset<T, CleaningTaskMessageFindFirstArgs<ExtArgs>>): Prisma__CleaningTaskMessageClient<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CleaningTaskMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskMessageFindFirstOrThrowArgs} args - Arguments to find a CleaningTaskMessage
     * @example
     * // Get one CleaningTaskMessage
     * const cleaningTaskMessage = await prisma.cleaningTaskMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CleaningTaskMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, CleaningTaskMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__CleaningTaskMessageClient<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CleaningTaskMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CleaningTaskMessages
     * const cleaningTaskMessages = await prisma.cleaningTaskMessage.findMany()
     * 
     * // Get first 10 CleaningTaskMessages
     * const cleaningTaskMessages = await prisma.cleaningTaskMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cleaningTaskMessageWithIdOnly = await prisma.cleaningTaskMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CleaningTaskMessageFindManyArgs>(args?: SelectSubset<T, CleaningTaskMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CleaningTaskMessage.
     * @param {CleaningTaskMessageCreateArgs} args - Arguments to create a CleaningTaskMessage.
     * @example
     * // Create one CleaningTaskMessage
     * const CleaningTaskMessage = await prisma.cleaningTaskMessage.create({
     *   data: {
     *     // ... data to create a CleaningTaskMessage
     *   }
     * })
     * 
     */
    create<T extends CleaningTaskMessageCreateArgs>(args: SelectSubset<T, CleaningTaskMessageCreateArgs<ExtArgs>>): Prisma__CleaningTaskMessageClient<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CleaningTaskMessages.
     * @param {CleaningTaskMessageCreateManyArgs} args - Arguments to create many CleaningTaskMessages.
     * @example
     * // Create many CleaningTaskMessages
     * const cleaningTaskMessage = await prisma.cleaningTaskMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CleaningTaskMessageCreateManyArgs>(args?: SelectSubset<T, CleaningTaskMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CleaningTaskMessages and returns the data saved in the database.
     * @param {CleaningTaskMessageCreateManyAndReturnArgs} args - Arguments to create many CleaningTaskMessages.
     * @example
     * // Create many CleaningTaskMessages
     * const cleaningTaskMessage = await prisma.cleaningTaskMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CleaningTaskMessages and only return the `id`
     * const cleaningTaskMessageWithIdOnly = await prisma.cleaningTaskMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CleaningTaskMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, CleaningTaskMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CleaningTaskMessage.
     * @param {CleaningTaskMessageDeleteArgs} args - Arguments to delete one CleaningTaskMessage.
     * @example
     * // Delete one CleaningTaskMessage
     * const CleaningTaskMessage = await prisma.cleaningTaskMessage.delete({
     *   where: {
     *     // ... filter to delete one CleaningTaskMessage
     *   }
     * })
     * 
     */
    delete<T extends CleaningTaskMessageDeleteArgs>(args: SelectSubset<T, CleaningTaskMessageDeleteArgs<ExtArgs>>): Prisma__CleaningTaskMessageClient<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CleaningTaskMessage.
     * @param {CleaningTaskMessageUpdateArgs} args - Arguments to update one CleaningTaskMessage.
     * @example
     * // Update one CleaningTaskMessage
     * const cleaningTaskMessage = await prisma.cleaningTaskMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CleaningTaskMessageUpdateArgs>(args: SelectSubset<T, CleaningTaskMessageUpdateArgs<ExtArgs>>): Prisma__CleaningTaskMessageClient<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CleaningTaskMessages.
     * @param {CleaningTaskMessageDeleteManyArgs} args - Arguments to filter CleaningTaskMessages to delete.
     * @example
     * // Delete a few CleaningTaskMessages
     * const { count } = await prisma.cleaningTaskMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CleaningTaskMessageDeleteManyArgs>(args?: SelectSubset<T, CleaningTaskMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CleaningTaskMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CleaningTaskMessages
     * const cleaningTaskMessage = await prisma.cleaningTaskMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CleaningTaskMessageUpdateManyArgs>(args: SelectSubset<T, CleaningTaskMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CleaningTaskMessages and returns the data updated in the database.
     * @param {CleaningTaskMessageUpdateManyAndReturnArgs} args - Arguments to update many CleaningTaskMessages.
     * @example
     * // Update many CleaningTaskMessages
     * const cleaningTaskMessage = await prisma.cleaningTaskMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CleaningTaskMessages and only return the `id`
     * const cleaningTaskMessageWithIdOnly = await prisma.cleaningTaskMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CleaningTaskMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, CleaningTaskMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CleaningTaskMessage.
     * @param {CleaningTaskMessageUpsertArgs} args - Arguments to update or create a CleaningTaskMessage.
     * @example
     * // Update or create a CleaningTaskMessage
     * const cleaningTaskMessage = await prisma.cleaningTaskMessage.upsert({
     *   create: {
     *     // ... data to create a CleaningTaskMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CleaningTaskMessage we want to update
     *   }
     * })
     */
    upsert<T extends CleaningTaskMessageUpsertArgs>(args: SelectSubset<T, CleaningTaskMessageUpsertArgs<ExtArgs>>): Prisma__CleaningTaskMessageClient<$Result.GetResult<Prisma.$CleaningTaskMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CleaningTaskMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskMessageCountArgs} args - Arguments to filter CleaningTaskMessages to count.
     * @example
     * // Count the number of CleaningTaskMessages
     * const count = await prisma.cleaningTaskMessage.count({
     *   where: {
     *     // ... the filter for the CleaningTaskMessages we want to count
     *   }
     * })
    **/
    count<T extends CleaningTaskMessageCountArgs>(
      args?: Subset<T, CleaningTaskMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CleaningTaskMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CleaningTaskMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CleaningTaskMessageAggregateArgs>(args: Subset<T, CleaningTaskMessageAggregateArgs>): Prisma.PrismaPromise<GetCleaningTaskMessageAggregateType<T>>

    /**
     * Group by CleaningTaskMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleaningTaskMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CleaningTaskMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CleaningTaskMessageGroupByArgs['orderBy'] }
        : { orderBy?: CleaningTaskMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CleaningTaskMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCleaningTaskMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CleaningTaskMessage model
   */
  readonly fields: CleaningTaskMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CleaningTaskMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CleaningTaskMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cleaningTask<T extends CleaningTaskDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CleaningTaskDefaultArgs<ExtArgs>>): Prisma__CleaningTaskClient<$Result.GetResult<Prisma.$CleaningTaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    attachment<T extends CleaningTaskMessage$attachmentArgs<ExtArgs> = {}>(args?: Subset<T, CleaningTaskMessage$attachmentArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CleaningTaskMessage model
   */
  interface CleaningTaskMessageFieldRefs {
    readonly id: FieldRef<"CleaningTaskMessage", 'String'>
    readonly text: FieldRef<"CleaningTaskMessage", 'String'>
    readonly role: FieldRef<"CleaningTaskMessage", 'String'>
    readonly senderName: FieldRef<"CleaningTaskMessage", 'String'>
    readonly createdAt: FieldRef<"CleaningTaskMessage", 'DateTime'>
    readonly cleaningTaskId: FieldRef<"CleaningTaskMessage", 'String'>
    readonly attachmentId: FieldRef<"CleaningTaskMessage", 'String'>
    readonly readByManagerAt: FieldRef<"CleaningTaskMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CleaningTaskMessage findUnique
   */
  export type CleaningTaskMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    /**
     * Filter, which CleaningTaskMessage to fetch.
     */
    where: CleaningTaskMessageWhereUniqueInput
  }

  /**
   * CleaningTaskMessage findUniqueOrThrow
   */
  export type CleaningTaskMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    /**
     * Filter, which CleaningTaskMessage to fetch.
     */
    where: CleaningTaskMessageWhereUniqueInput
  }

  /**
   * CleaningTaskMessage findFirst
   */
  export type CleaningTaskMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    /**
     * Filter, which CleaningTaskMessage to fetch.
     */
    where?: CleaningTaskMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleaningTaskMessages to fetch.
     */
    orderBy?: CleaningTaskMessageOrderByWithRelationInput | CleaningTaskMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CleaningTaskMessages.
     */
    cursor?: CleaningTaskMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleaningTaskMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleaningTaskMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CleaningTaskMessages.
     */
    distinct?: CleaningTaskMessageScalarFieldEnum | CleaningTaskMessageScalarFieldEnum[]
  }

  /**
   * CleaningTaskMessage findFirstOrThrow
   */
  export type CleaningTaskMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    /**
     * Filter, which CleaningTaskMessage to fetch.
     */
    where?: CleaningTaskMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleaningTaskMessages to fetch.
     */
    orderBy?: CleaningTaskMessageOrderByWithRelationInput | CleaningTaskMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CleaningTaskMessages.
     */
    cursor?: CleaningTaskMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleaningTaskMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleaningTaskMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CleaningTaskMessages.
     */
    distinct?: CleaningTaskMessageScalarFieldEnum | CleaningTaskMessageScalarFieldEnum[]
  }

  /**
   * CleaningTaskMessage findMany
   */
  export type CleaningTaskMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    /**
     * Filter, which CleaningTaskMessages to fetch.
     */
    where?: CleaningTaskMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleaningTaskMessages to fetch.
     */
    orderBy?: CleaningTaskMessageOrderByWithRelationInput | CleaningTaskMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CleaningTaskMessages.
     */
    cursor?: CleaningTaskMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleaningTaskMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleaningTaskMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CleaningTaskMessages.
     */
    distinct?: CleaningTaskMessageScalarFieldEnum | CleaningTaskMessageScalarFieldEnum[]
  }

  /**
   * CleaningTaskMessage create
   */
  export type CleaningTaskMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a CleaningTaskMessage.
     */
    data: XOR<CleaningTaskMessageCreateInput, CleaningTaskMessageUncheckedCreateInput>
  }

  /**
   * CleaningTaskMessage createMany
   */
  export type CleaningTaskMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CleaningTaskMessages.
     */
    data: CleaningTaskMessageCreateManyInput | CleaningTaskMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CleaningTaskMessage createManyAndReturn
   */
  export type CleaningTaskMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * The data used to create many CleaningTaskMessages.
     */
    data: CleaningTaskMessageCreateManyInput | CleaningTaskMessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CleaningTaskMessage update
   */
  export type CleaningTaskMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a CleaningTaskMessage.
     */
    data: XOR<CleaningTaskMessageUpdateInput, CleaningTaskMessageUncheckedUpdateInput>
    /**
     * Choose, which CleaningTaskMessage to update.
     */
    where: CleaningTaskMessageWhereUniqueInput
  }

  /**
   * CleaningTaskMessage updateMany
   */
  export type CleaningTaskMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CleaningTaskMessages.
     */
    data: XOR<CleaningTaskMessageUpdateManyMutationInput, CleaningTaskMessageUncheckedUpdateManyInput>
    /**
     * Filter which CleaningTaskMessages to update
     */
    where?: CleaningTaskMessageWhereInput
    /**
     * Limit how many CleaningTaskMessages to update.
     */
    limit?: number
  }

  /**
   * CleaningTaskMessage updateManyAndReturn
   */
  export type CleaningTaskMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * The data used to update CleaningTaskMessages.
     */
    data: XOR<CleaningTaskMessageUpdateManyMutationInput, CleaningTaskMessageUncheckedUpdateManyInput>
    /**
     * Filter which CleaningTaskMessages to update
     */
    where?: CleaningTaskMessageWhereInput
    /**
     * Limit how many CleaningTaskMessages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CleaningTaskMessage upsert
   */
  export type CleaningTaskMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the CleaningTaskMessage to update in case it exists.
     */
    where: CleaningTaskMessageWhereUniqueInput
    /**
     * In case the CleaningTaskMessage found by the `where` argument doesn't exist, create a new CleaningTaskMessage with this data.
     */
    create: XOR<CleaningTaskMessageCreateInput, CleaningTaskMessageUncheckedCreateInput>
    /**
     * In case the CleaningTaskMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CleaningTaskMessageUpdateInput, CleaningTaskMessageUncheckedUpdateInput>
  }

  /**
   * CleaningTaskMessage delete
   */
  export type CleaningTaskMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
    /**
     * Filter which CleaningTaskMessage to delete.
     */
    where: CleaningTaskMessageWhereUniqueInput
  }

  /**
   * CleaningTaskMessage deleteMany
   */
  export type CleaningTaskMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CleaningTaskMessages to delete
     */
    where?: CleaningTaskMessageWhereInput
    /**
     * Limit how many CleaningTaskMessages to delete.
     */
    limit?: number
  }

  /**
   * CleaningTaskMessage.attachment
   */
  export type CleaningTaskMessage$attachmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    where?: AttachmentWhereInput
  }

  /**
   * CleaningTaskMessage without action
   */
  export type CleaningTaskMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleaningTaskMessage
     */
    select?: CleaningTaskMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleaningTaskMessage
     */
    omit?: CleaningTaskMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleaningTaskMessageInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    role: 'role',
    createdAt: 'createdAt',
    name: 'name'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ApartmentScalarFieldEnum: {
    id: 'id',
    name: 'name',
    apartmentCode: 'apartmentCode',
    address: 'address',
    latitude: 'latitude',
    longitude: 'longitude',
    squareMeters: 'squareMeters',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    maxGuests: 'maxGuests',
    accessInstructions: 'accessInstructions',
    icalUrl: 'icalUrl',
    lastSyncAt: 'lastSyncAt',
    technicalProfile: 'technicalProfile',
    createdAt: 'createdAt'
  };

  export type ApartmentScalarFieldEnum = (typeof ApartmentScalarFieldEnum)[keyof typeof ApartmentScalarFieldEnum]


  export const ChecklistItemScalarFieldEnum: {
    id: 'id',
    apartmentId: 'apartmentId',
    label: 'label',
    required: 'required',
    order: 'order',
    createdAt: 'createdAt',
    formula: 'formula',
    type: 'type'
  };

  export type ChecklistItemScalarFieldEnum = (typeof ChecklistItemScalarFieldEnum)[keyof typeof ChecklistItemScalarFieldEnum]


  export const NotificationScalarFieldEnum: {
    id: 'id',
    type: 'type',
    title: 'title',
    message: 'message',
    isRead: 'isRead',
    createdAt: 'createdAt',
    apartmentId: 'apartmentId'
  };

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


  export const BookingScalarFieldEnum: {
    id: 'id',
    apartmentId: 'apartmentId',
    guestName: 'guestName',
    totalGuests: 'totalGuests',
    checkInDate: 'checkInDate',
    checkOutDate: 'checkOutDate',
    status: 'status',
    externalId: 'externalId',
    source: 'source',
    createdAt: 'createdAt'
  };

  export type BookingScalarFieldEnum = (typeof BookingScalarFieldEnum)[keyof typeof BookingScalarFieldEnum]


  export const CleaningTaskScalarFieldEnum: {
    id: 'id',
    apartmentId: 'apartmentId',
    date: 'date',
    status: 'status',
    createdAt: 'createdAt',
    assignedToId: 'assignedToId',
    notes: 'notes',
    bookingId: 'bookingId',
    checklistProgress: 'checklistProgress'
  };

  export type CleaningTaskScalarFieldEnum = (typeof CleaningTaskScalarFieldEnum)[keyof typeof CleaningTaskScalarFieldEnum]


  export const MaintenanceTicketScalarFieldEnum: {
    id: 'id',
    apartmentId: 'apartmentId',
    title: 'title',
    description: 'description',
    status: 'status',
    priority: 'priority',
    createdAt: 'createdAt',
    assignedToId: 'assignedToId',
    scheduledStart: 'scheduledStart',
    scheduledEnd: 'scheduledEnd',
    startedAt: 'startedAt',
    resolvedAt: 'resolvedAt'
  };

  export type MaintenanceTicketScalarFieldEnum = (typeof MaintenanceTicketScalarFieldEnum)[keyof typeof MaintenanceTicketScalarFieldEnum]


  export const AIAssistantMessageScalarFieldEnum: {
    id: 'id',
    role: 'role',
    content: 'content',
    userRole: 'userRole',
    apartmentId: 'apartmentId',
    cleaningTaskId: 'cleaningTaskId',
    maintenanceTicketId: 'maintenanceTicketId',
    createdAt: 'createdAt'
  };

  export type AIAssistantMessageScalarFieldEnum = (typeof AIAssistantMessageScalarFieldEnum)[keyof typeof AIAssistantMessageScalarFieldEnum]


  export const AttachmentScalarFieldEnum: {
    id: 'id',
    url: 'url',
    fileName: 'fileName',
    fileType: 'fileType',
    createdAt: 'createdAt',
    maintenanceTicketId: 'maintenanceTicketId',
    cleaningTaskId: 'cleaningTaskId'
  };

  export type AttachmentScalarFieldEnum = (typeof AttachmentScalarFieldEnum)[keyof typeof AttachmentScalarFieldEnum]


  export const ApartmentAttachmentScalarFieldEnum: {
    id: 'id',
    apartmentId: 'apartmentId',
    filename: 'filename',
    url: 'url',
    mimeType: 'mimeType',
    size: 'size',
    category: 'category',
    extractedText: 'extractedText',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ApartmentAttachmentScalarFieldEnum = (typeof ApartmentAttachmentScalarFieldEnum)[keyof typeof ApartmentAttachmentScalarFieldEnum]


  export const MessageScalarFieldEnum: {
    id: 'id',
    text: 'text',
    role: 'role',
    senderName: 'senderName',
    createdAt: 'createdAt',
    maintenanceTicketId: 'maintenanceTicketId',
    attachmentId: 'attachmentId',
    readByManagerAt: 'readByManagerAt'
  };

  export type MessageScalarFieldEnum = (typeof MessageScalarFieldEnum)[keyof typeof MessageScalarFieldEnum]


  export const CleaningTaskMessageScalarFieldEnum: {
    id: 'id',
    text: 'text',
    role: 'role',
    senderName: 'senderName',
    createdAt: 'createdAt',
    cleaningTaskId: 'cleaningTaskId',
    attachmentId: 'attachmentId',
    readByManagerAt: 'readByManagerAt'
  };

  export type CleaningTaskMessageScalarFieldEnum = (typeof CleaningTaskMessageScalarFieldEnum)[keyof typeof CleaningTaskMessageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'AIAssistantMessageRole'
   */
  export type EnumAIAssistantMessageRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AIAssistantMessageRole'>
    


  /**
   * Reference to a field of type 'AIAssistantMessageRole[]'
   */
  export type ListEnumAIAssistantMessageRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AIAssistantMessageRole[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdAt?: DateTimeFilter<"User"> | Date | string
    name?: StringFilter<"User"> | string
    cleaningTasks?: CleaningTaskListRelationFilter
    maintenanceTickets?: MaintenanceTicketListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    name?: SortOrder
    cleaningTasks?: CleaningTaskOrderByRelationAggregateInput
    maintenanceTickets?: MaintenanceTicketOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdAt?: DateTimeFilter<"User"> | Date | string
    name?: StringFilter<"User"> | string
    cleaningTasks?: CleaningTaskListRelationFilter
    maintenanceTickets?: MaintenanceTicketListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    name?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    name?: StringWithAggregatesFilter<"User"> | string
  }

  export type ApartmentWhereInput = {
    AND?: ApartmentWhereInput | ApartmentWhereInput[]
    OR?: ApartmentWhereInput[]
    NOT?: ApartmentWhereInput | ApartmentWhereInput[]
    id?: StringFilter<"Apartment"> | string
    name?: StringFilter<"Apartment"> | string
    apartmentCode?: StringNullableFilter<"Apartment"> | string | null
    address?: StringFilter<"Apartment"> | string
    latitude?: FloatFilter<"Apartment"> | number
    longitude?: FloatFilter<"Apartment"> | number
    squareMeters?: IntFilter<"Apartment"> | number
    bedrooms?: IntFilter<"Apartment"> | number
    bathrooms?: IntFilter<"Apartment"> | number
    maxGuests?: IntFilter<"Apartment"> | number
    accessInstructions?: StringNullableFilter<"Apartment"> | string | null
    icalUrl?: StringNullableFilter<"Apartment"> | string | null
    lastSyncAt?: DateTimeNullableFilter<"Apartment"> | Date | string | null
    technicalProfile?: JsonNullableFilter<"Apartment">
    createdAt?: DateTimeFilter<"Apartment"> | Date | string
    bookings?: BookingListRelationFilter
    checklistItems?: ChecklistItemListRelationFilter
    cleaningTasks?: CleaningTaskListRelationFilter
    maintenanceTickets?: MaintenanceTicketListRelationFilter
    notifications?: NotificationListRelationFilter
    aiAssistantMessages?: AIAssistantMessageListRelationFilter
    apartmentAttachments?: ApartmentAttachmentListRelationFilter
  }

  export type ApartmentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    apartmentCode?: SortOrderInput | SortOrder
    address?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    squareMeters?: SortOrder
    bedrooms?: SortOrder
    bathrooms?: SortOrder
    maxGuests?: SortOrder
    accessInstructions?: SortOrderInput | SortOrder
    icalUrl?: SortOrderInput | SortOrder
    lastSyncAt?: SortOrderInput | SortOrder
    technicalProfile?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    bookings?: BookingOrderByRelationAggregateInput
    checklistItems?: ChecklistItemOrderByRelationAggregateInput
    cleaningTasks?: CleaningTaskOrderByRelationAggregateInput
    maintenanceTickets?: MaintenanceTicketOrderByRelationAggregateInput
    notifications?: NotificationOrderByRelationAggregateInput
    aiAssistantMessages?: AIAssistantMessageOrderByRelationAggregateInput
    apartmentAttachments?: ApartmentAttachmentOrderByRelationAggregateInput
  }

  export type ApartmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    apartmentCode?: string
    AND?: ApartmentWhereInput | ApartmentWhereInput[]
    OR?: ApartmentWhereInput[]
    NOT?: ApartmentWhereInput | ApartmentWhereInput[]
    name?: StringFilter<"Apartment"> | string
    address?: StringFilter<"Apartment"> | string
    latitude?: FloatFilter<"Apartment"> | number
    longitude?: FloatFilter<"Apartment"> | number
    squareMeters?: IntFilter<"Apartment"> | number
    bedrooms?: IntFilter<"Apartment"> | number
    bathrooms?: IntFilter<"Apartment"> | number
    maxGuests?: IntFilter<"Apartment"> | number
    accessInstructions?: StringNullableFilter<"Apartment"> | string | null
    icalUrl?: StringNullableFilter<"Apartment"> | string | null
    lastSyncAt?: DateTimeNullableFilter<"Apartment"> | Date | string | null
    technicalProfile?: JsonNullableFilter<"Apartment">
    createdAt?: DateTimeFilter<"Apartment"> | Date | string
    bookings?: BookingListRelationFilter
    checklistItems?: ChecklistItemListRelationFilter
    cleaningTasks?: CleaningTaskListRelationFilter
    maintenanceTickets?: MaintenanceTicketListRelationFilter
    notifications?: NotificationListRelationFilter
    aiAssistantMessages?: AIAssistantMessageListRelationFilter
    apartmentAttachments?: ApartmentAttachmentListRelationFilter
  }, "id" | "apartmentCode">

  export type ApartmentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    apartmentCode?: SortOrderInput | SortOrder
    address?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    squareMeters?: SortOrder
    bedrooms?: SortOrder
    bathrooms?: SortOrder
    maxGuests?: SortOrder
    accessInstructions?: SortOrderInput | SortOrder
    icalUrl?: SortOrderInput | SortOrder
    lastSyncAt?: SortOrderInput | SortOrder
    technicalProfile?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ApartmentCountOrderByAggregateInput
    _avg?: ApartmentAvgOrderByAggregateInput
    _max?: ApartmentMaxOrderByAggregateInput
    _min?: ApartmentMinOrderByAggregateInput
    _sum?: ApartmentSumOrderByAggregateInput
  }

  export type ApartmentScalarWhereWithAggregatesInput = {
    AND?: ApartmentScalarWhereWithAggregatesInput | ApartmentScalarWhereWithAggregatesInput[]
    OR?: ApartmentScalarWhereWithAggregatesInput[]
    NOT?: ApartmentScalarWhereWithAggregatesInput | ApartmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Apartment"> | string
    name?: StringWithAggregatesFilter<"Apartment"> | string
    apartmentCode?: StringNullableWithAggregatesFilter<"Apartment"> | string | null
    address?: StringWithAggregatesFilter<"Apartment"> | string
    latitude?: FloatWithAggregatesFilter<"Apartment"> | number
    longitude?: FloatWithAggregatesFilter<"Apartment"> | number
    squareMeters?: IntWithAggregatesFilter<"Apartment"> | number
    bedrooms?: IntWithAggregatesFilter<"Apartment"> | number
    bathrooms?: IntWithAggregatesFilter<"Apartment"> | number
    maxGuests?: IntWithAggregatesFilter<"Apartment"> | number
    accessInstructions?: StringNullableWithAggregatesFilter<"Apartment"> | string | null
    icalUrl?: StringNullableWithAggregatesFilter<"Apartment"> | string | null
    lastSyncAt?: DateTimeNullableWithAggregatesFilter<"Apartment"> | Date | string | null
    technicalProfile?: JsonNullableWithAggregatesFilter<"Apartment">
    createdAt?: DateTimeWithAggregatesFilter<"Apartment"> | Date | string
  }

  export type ChecklistItemWhereInput = {
    AND?: ChecklistItemWhereInput | ChecklistItemWhereInput[]
    OR?: ChecklistItemWhereInput[]
    NOT?: ChecklistItemWhereInput | ChecklistItemWhereInput[]
    id?: StringFilter<"ChecklistItem"> | string
    apartmentId?: StringFilter<"ChecklistItem"> | string
    label?: StringFilter<"ChecklistItem"> | string
    required?: BoolFilter<"ChecklistItem"> | boolean
    order?: IntFilter<"ChecklistItem"> | number
    createdAt?: DateTimeFilter<"ChecklistItem"> | Date | string
    formula?: StringNullableFilter<"ChecklistItem"> | string | null
    type?: StringFilter<"ChecklistItem"> | string
    apartment?: XOR<ApartmentScalarRelationFilter, ApartmentWhereInput>
  }

  export type ChecklistItemOrderByWithRelationInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    label?: SortOrder
    required?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    formula?: SortOrderInput | SortOrder
    type?: SortOrder
    apartment?: ApartmentOrderByWithRelationInput
  }

  export type ChecklistItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ChecklistItemWhereInput | ChecklistItemWhereInput[]
    OR?: ChecklistItemWhereInput[]
    NOT?: ChecklistItemWhereInput | ChecklistItemWhereInput[]
    apartmentId?: StringFilter<"ChecklistItem"> | string
    label?: StringFilter<"ChecklistItem"> | string
    required?: BoolFilter<"ChecklistItem"> | boolean
    order?: IntFilter<"ChecklistItem"> | number
    createdAt?: DateTimeFilter<"ChecklistItem"> | Date | string
    formula?: StringNullableFilter<"ChecklistItem"> | string | null
    type?: StringFilter<"ChecklistItem"> | string
    apartment?: XOR<ApartmentScalarRelationFilter, ApartmentWhereInput>
  }, "id">

  export type ChecklistItemOrderByWithAggregationInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    label?: SortOrder
    required?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    formula?: SortOrderInput | SortOrder
    type?: SortOrder
    _count?: ChecklistItemCountOrderByAggregateInput
    _avg?: ChecklistItemAvgOrderByAggregateInput
    _max?: ChecklistItemMaxOrderByAggregateInput
    _min?: ChecklistItemMinOrderByAggregateInput
    _sum?: ChecklistItemSumOrderByAggregateInput
  }

  export type ChecklistItemScalarWhereWithAggregatesInput = {
    AND?: ChecklistItemScalarWhereWithAggregatesInput | ChecklistItemScalarWhereWithAggregatesInput[]
    OR?: ChecklistItemScalarWhereWithAggregatesInput[]
    NOT?: ChecklistItemScalarWhereWithAggregatesInput | ChecklistItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChecklistItem"> | string
    apartmentId?: StringWithAggregatesFilter<"ChecklistItem"> | string
    label?: StringWithAggregatesFilter<"ChecklistItem"> | string
    required?: BoolWithAggregatesFilter<"ChecklistItem"> | boolean
    order?: IntWithAggregatesFilter<"ChecklistItem"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ChecklistItem"> | Date | string
    formula?: StringNullableWithAggregatesFilter<"ChecklistItem"> | string | null
    type?: StringWithAggregatesFilter<"ChecklistItem"> | string
  }

  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    apartmentId?: StringNullableFilter<"Notification"> | string | null
    apartment?: XOR<ApartmentNullableScalarRelationFilter, ApartmentWhereInput> | null
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    apartmentId?: SortOrderInput | SortOrder
    apartment?: ApartmentOrderByWithRelationInput
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    type?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    apartmentId?: StringNullableFilter<"Notification"> | string | null
    apartment?: XOR<ApartmentNullableScalarRelationFilter, ApartmentWhereInput> | null
  }, "id">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    apartmentId?: SortOrderInput | SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Notification"> | string
    type?: StringWithAggregatesFilter<"Notification"> | string
    title?: StringWithAggregatesFilter<"Notification"> | string
    message?: StringWithAggregatesFilter<"Notification"> | string
    isRead?: BoolWithAggregatesFilter<"Notification"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
    apartmentId?: StringNullableWithAggregatesFilter<"Notification"> | string | null
  }

  export type BookingWhereInput = {
    AND?: BookingWhereInput | BookingWhereInput[]
    OR?: BookingWhereInput[]
    NOT?: BookingWhereInput | BookingWhereInput[]
    id?: StringFilter<"Booking"> | string
    apartmentId?: StringFilter<"Booking"> | string
    guestName?: StringNullableFilter<"Booking"> | string | null
    totalGuests?: IntFilter<"Booking"> | number
    checkInDate?: DateTimeFilter<"Booking"> | Date | string
    checkOutDate?: DateTimeFilter<"Booking"> | Date | string
    status?: StringNullableFilter<"Booking"> | string | null
    externalId?: StringNullableFilter<"Booking"> | string | null
    source?: StringNullableFilter<"Booking"> | string | null
    createdAt?: DateTimeFilter<"Booking"> | Date | string
    apartment?: XOR<ApartmentScalarRelationFilter, ApartmentWhereInput>
    cleaningTask?: XOR<CleaningTaskNullableScalarRelationFilter, CleaningTaskWhereInput> | null
  }

  export type BookingOrderByWithRelationInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    guestName?: SortOrderInput | SortOrder
    totalGuests?: SortOrder
    checkInDate?: SortOrder
    checkOutDate?: SortOrder
    status?: SortOrderInput | SortOrder
    externalId?: SortOrderInput | SortOrder
    source?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    apartment?: ApartmentOrderByWithRelationInput
    cleaningTask?: CleaningTaskOrderByWithRelationInput
  }

  export type BookingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    externalId?: string
    AND?: BookingWhereInput | BookingWhereInput[]
    OR?: BookingWhereInput[]
    NOT?: BookingWhereInput | BookingWhereInput[]
    apartmentId?: StringFilter<"Booking"> | string
    guestName?: StringNullableFilter<"Booking"> | string | null
    totalGuests?: IntFilter<"Booking"> | number
    checkInDate?: DateTimeFilter<"Booking"> | Date | string
    checkOutDate?: DateTimeFilter<"Booking"> | Date | string
    status?: StringNullableFilter<"Booking"> | string | null
    source?: StringNullableFilter<"Booking"> | string | null
    createdAt?: DateTimeFilter<"Booking"> | Date | string
    apartment?: XOR<ApartmentScalarRelationFilter, ApartmentWhereInput>
    cleaningTask?: XOR<CleaningTaskNullableScalarRelationFilter, CleaningTaskWhereInput> | null
  }, "id" | "externalId">

  export type BookingOrderByWithAggregationInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    guestName?: SortOrderInput | SortOrder
    totalGuests?: SortOrder
    checkInDate?: SortOrder
    checkOutDate?: SortOrder
    status?: SortOrderInput | SortOrder
    externalId?: SortOrderInput | SortOrder
    source?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: BookingCountOrderByAggregateInput
    _avg?: BookingAvgOrderByAggregateInput
    _max?: BookingMaxOrderByAggregateInput
    _min?: BookingMinOrderByAggregateInput
    _sum?: BookingSumOrderByAggregateInput
  }

  export type BookingScalarWhereWithAggregatesInput = {
    AND?: BookingScalarWhereWithAggregatesInput | BookingScalarWhereWithAggregatesInput[]
    OR?: BookingScalarWhereWithAggregatesInput[]
    NOT?: BookingScalarWhereWithAggregatesInput | BookingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Booking"> | string
    apartmentId?: StringWithAggregatesFilter<"Booking"> | string
    guestName?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    totalGuests?: IntWithAggregatesFilter<"Booking"> | number
    checkInDate?: DateTimeWithAggregatesFilter<"Booking"> | Date | string
    checkOutDate?: DateTimeWithAggregatesFilter<"Booking"> | Date | string
    status?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    externalId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    source?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Booking"> | Date | string
  }

  export type CleaningTaskWhereInput = {
    AND?: CleaningTaskWhereInput | CleaningTaskWhereInput[]
    OR?: CleaningTaskWhereInput[]
    NOT?: CleaningTaskWhereInput | CleaningTaskWhereInput[]
    id?: StringFilter<"CleaningTask"> | string
    apartmentId?: StringFilter<"CleaningTask"> | string
    date?: DateTimeFilter<"CleaningTask"> | Date | string
    status?: StringFilter<"CleaningTask"> | string
    createdAt?: DateTimeFilter<"CleaningTask"> | Date | string
    assignedToId?: StringNullableFilter<"CleaningTask"> | string | null
    notes?: StringNullableFilter<"CleaningTask"> | string | null
    bookingId?: StringNullableFilter<"CleaningTask"> | string | null
    checklistProgress?: JsonNullableFilter<"CleaningTask">
    booking?: XOR<BookingNullableScalarRelationFilter, BookingWhereInput> | null
    apartment?: XOR<ApartmentScalarRelationFilter, ApartmentWhereInput>
    assignedTo?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    messages?: CleaningTaskMessageListRelationFilter
    attachments?: AttachmentListRelationFilter
    aiAssistantMessages?: AIAssistantMessageListRelationFilter
  }

  export type CleaningTaskOrderByWithRelationInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    date?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    assignedToId?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    bookingId?: SortOrderInput | SortOrder
    checklistProgress?: SortOrderInput | SortOrder
    booking?: BookingOrderByWithRelationInput
    apartment?: ApartmentOrderByWithRelationInput
    assignedTo?: UserOrderByWithRelationInput
    messages?: CleaningTaskMessageOrderByRelationAggregateInput
    attachments?: AttachmentOrderByRelationAggregateInput
    aiAssistantMessages?: AIAssistantMessageOrderByRelationAggregateInput
  }

  export type CleaningTaskWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    bookingId?: string
    AND?: CleaningTaskWhereInput | CleaningTaskWhereInput[]
    OR?: CleaningTaskWhereInput[]
    NOT?: CleaningTaskWhereInput | CleaningTaskWhereInput[]
    apartmentId?: StringFilter<"CleaningTask"> | string
    date?: DateTimeFilter<"CleaningTask"> | Date | string
    status?: StringFilter<"CleaningTask"> | string
    createdAt?: DateTimeFilter<"CleaningTask"> | Date | string
    assignedToId?: StringNullableFilter<"CleaningTask"> | string | null
    notes?: StringNullableFilter<"CleaningTask"> | string | null
    checklistProgress?: JsonNullableFilter<"CleaningTask">
    booking?: XOR<BookingNullableScalarRelationFilter, BookingWhereInput> | null
    apartment?: XOR<ApartmentScalarRelationFilter, ApartmentWhereInput>
    assignedTo?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    messages?: CleaningTaskMessageListRelationFilter
    attachments?: AttachmentListRelationFilter
    aiAssistantMessages?: AIAssistantMessageListRelationFilter
  }, "id" | "bookingId">

  export type CleaningTaskOrderByWithAggregationInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    date?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    assignedToId?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    bookingId?: SortOrderInput | SortOrder
    checklistProgress?: SortOrderInput | SortOrder
    _count?: CleaningTaskCountOrderByAggregateInput
    _max?: CleaningTaskMaxOrderByAggregateInput
    _min?: CleaningTaskMinOrderByAggregateInput
  }

  export type CleaningTaskScalarWhereWithAggregatesInput = {
    AND?: CleaningTaskScalarWhereWithAggregatesInput | CleaningTaskScalarWhereWithAggregatesInput[]
    OR?: CleaningTaskScalarWhereWithAggregatesInput[]
    NOT?: CleaningTaskScalarWhereWithAggregatesInput | CleaningTaskScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CleaningTask"> | string
    apartmentId?: StringWithAggregatesFilter<"CleaningTask"> | string
    date?: DateTimeWithAggregatesFilter<"CleaningTask"> | Date | string
    status?: StringWithAggregatesFilter<"CleaningTask"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CleaningTask"> | Date | string
    assignedToId?: StringNullableWithAggregatesFilter<"CleaningTask"> | string | null
    notes?: StringNullableWithAggregatesFilter<"CleaningTask"> | string | null
    bookingId?: StringNullableWithAggregatesFilter<"CleaningTask"> | string | null
    checklistProgress?: JsonNullableWithAggregatesFilter<"CleaningTask">
  }

  export type MaintenanceTicketWhereInput = {
    AND?: MaintenanceTicketWhereInput | MaintenanceTicketWhereInput[]
    OR?: MaintenanceTicketWhereInput[]
    NOT?: MaintenanceTicketWhereInput | MaintenanceTicketWhereInput[]
    id?: StringFilter<"MaintenanceTicket"> | string
    apartmentId?: StringFilter<"MaintenanceTicket"> | string
    title?: StringFilter<"MaintenanceTicket"> | string
    description?: StringFilter<"MaintenanceTicket"> | string
    status?: StringFilter<"MaintenanceTicket"> | string
    priority?: StringFilter<"MaintenanceTicket"> | string
    createdAt?: DateTimeFilter<"MaintenanceTicket"> | Date | string
    assignedToId?: StringNullableFilter<"MaintenanceTicket"> | string | null
    scheduledStart?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    scheduledEnd?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    startedAt?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    resolvedAt?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    apartment?: XOR<ApartmentScalarRelationFilter, ApartmentWhereInput>
    assignedTo?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    attachments?: AttachmentListRelationFilter
    messages?: MessageListRelationFilter
    aiAssistantMessages?: AIAssistantMessageListRelationFilter
  }

  export type MaintenanceTicketOrderByWithRelationInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    createdAt?: SortOrder
    assignedToId?: SortOrderInput | SortOrder
    scheduledStart?: SortOrderInput | SortOrder
    scheduledEnd?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    apartment?: ApartmentOrderByWithRelationInput
    assignedTo?: UserOrderByWithRelationInput
    attachments?: AttachmentOrderByRelationAggregateInput
    messages?: MessageOrderByRelationAggregateInput
    aiAssistantMessages?: AIAssistantMessageOrderByRelationAggregateInput
  }

  export type MaintenanceTicketWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MaintenanceTicketWhereInput | MaintenanceTicketWhereInput[]
    OR?: MaintenanceTicketWhereInput[]
    NOT?: MaintenanceTicketWhereInput | MaintenanceTicketWhereInput[]
    apartmentId?: StringFilter<"MaintenanceTicket"> | string
    title?: StringFilter<"MaintenanceTicket"> | string
    description?: StringFilter<"MaintenanceTicket"> | string
    status?: StringFilter<"MaintenanceTicket"> | string
    priority?: StringFilter<"MaintenanceTicket"> | string
    createdAt?: DateTimeFilter<"MaintenanceTicket"> | Date | string
    assignedToId?: StringNullableFilter<"MaintenanceTicket"> | string | null
    scheduledStart?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    scheduledEnd?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    startedAt?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    resolvedAt?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    apartment?: XOR<ApartmentScalarRelationFilter, ApartmentWhereInput>
    assignedTo?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    attachments?: AttachmentListRelationFilter
    messages?: MessageListRelationFilter
    aiAssistantMessages?: AIAssistantMessageListRelationFilter
  }, "id">

  export type MaintenanceTicketOrderByWithAggregationInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    createdAt?: SortOrder
    assignedToId?: SortOrderInput | SortOrder
    scheduledStart?: SortOrderInput | SortOrder
    scheduledEnd?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    _count?: MaintenanceTicketCountOrderByAggregateInput
    _max?: MaintenanceTicketMaxOrderByAggregateInput
    _min?: MaintenanceTicketMinOrderByAggregateInput
  }

  export type MaintenanceTicketScalarWhereWithAggregatesInput = {
    AND?: MaintenanceTicketScalarWhereWithAggregatesInput | MaintenanceTicketScalarWhereWithAggregatesInput[]
    OR?: MaintenanceTicketScalarWhereWithAggregatesInput[]
    NOT?: MaintenanceTicketScalarWhereWithAggregatesInput | MaintenanceTicketScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MaintenanceTicket"> | string
    apartmentId?: StringWithAggregatesFilter<"MaintenanceTicket"> | string
    title?: StringWithAggregatesFilter<"MaintenanceTicket"> | string
    description?: StringWithAggregatesFilter<"MaintenanceTicket"> | string
    status?: StringWithAggregatesFilter<"MaintenanceTicket"> | string
    priority?: StringWithAggregatesFilter<"MaintenanceTicket"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MaintenanceTicket"> | Date | string
    assignedToId?: StringNullableWithAggregatesFilter<"MaintenanceTicket"> | string | null
    scheduledStart?: DateTimeNullableWithAggregatesFilter<"MaintenanceTicket"> | Date | string | null
    scheduledEnd?: DateTimeNullableWithAggregatesFilter<"MaintenanceTicket"> | Date | string | null
    startedAt?: DateTimeNullableWithAggregatesFilter<"MaintenanceTicket"> | Date | string | null
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"MaintenanceTicket"> | Date | string | null
  }

  export type AIAssistantMessageWhereInput = {
    AND?: AIAssistantMessageWhereInput | AIAssistantMessageWhereInput[]
    OR?: AIAssistantMessageWhereInput[]
    NOT?: AIAssistantMessageWhereInput | AIAssistantMessageWhereInput[]
    id?: StringFilter<"AIAssistantMessage"> | string
    role?: EnumAIAssistantMessageRoleFilter<"AIAssistantMessage"> | $Enums.AIAssistantMessageRole
    content?: StringFilter<"AIAssistantMessage"> | string
    userRole?: EnumRoleFilter<"AIAssistantMessage"> | $Enums.Role
    apartmentId?: StringNullableFilter<"AIAssistantMessage"> | string | null
    cleaningTaskId?: StringNullableFilter<"AIAssistantMessage"> | string | null
    maintenanceTicketId?: StringNullableFilter<"AIAssistantMessage"> | string | null
    createdAt?: DateTimeFilter<"AIAssistantMessage"> | Date | string
    apartment?: XOR<ApartmentNullableScalarRelationFilter, ApartmentWhereInput> | null
    cleaningTask?: XOR<CleaningTaskNullableScalarRelationFilter, CleaningTaskWhereInput> | null
    maintenanceTicket?: XOR<MaintenanceTicketNullableScalarRelationFilter, MaintenanceTicketWhereInput> | null
  }

  export type AIAssistantMessageOrderByWithRelationInput = {
    id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    userRole?: SortOrder
    apartmentId?: SortOrderInput | SortOrder
    cleaningTaskId?: SortOrderInput | SortOrder
    maintenanceTicketId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    apartment?: ApartmentOrderByWithRelationInput
    cleaningTask?: CleaningTaskOrderByWithRelationInput
    maintenanceTicket?: MaintenanceTicketOrderByWithRelationInput
  }

  export type AIAssistantMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AIAssistantMessageWhereInput | AIAssistantMessageWhereInput[]
    OR?: AIAssistantMessageWhereInput[]
    NOT?: AIAssistantMessageWhereInput | AIAssistantMessageWhereInput[]
    role?: EnumAIAssistantMessageRoleFilter<"AIAssistantMessage"> | $Enums.AIAssistantMessageRole
    content?: StringFilter<"AIAssistantMessage"> | string
    userRole?: EnumRoleFilter<"AIAssistantMessage"> | $Enums.Role
    apartmentId?: StringNullableFilter<"AIAssistantMessage"> | string | null
    cleaningTaskId?: StringNullableFilter<"AIAssistantMessage"> | string | null
    maintenanceTicketId?: StringNullableFilter<"AIAssistantMessage"> | string | null
    createdAt?: DateTimeFilter<"AIAssistantMessage"> | Date | string
    apartment?: XOR<ApartmentNullableScalarRelationFilter, ApartmentWhereInput> | null
    cleaningTask?: XOR<CleaningTaskNullableScalarRelationFilter, CleaningTaskWhereInput> | null
    maintenanceTicket?: XOR<MaintenanceTicketNullableScalarRelationFilter, MaintenanceTicketWhereInput> | null
  }, "id">

  export type AIAssistantMessageOrderByWithAggregationInput = {
    id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    userRole?: SortOrder
    apartmentId?: SortOrderInput | SortOrder
    cleaningTaskId?: SortOrderInput | SortOrder
    maintenanceTicketId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AIAssistantMessageCountOrderByAggregateInput
    _max?: AIAssistantMessageMaxOrderByAggregateInput
    _min?: AIAssistantMessageMinOrderByAggregateInput
  }

  export type AIAssistantMessageScalarWhereWithAggregatesInput = {
    AND?: AIAssistantMessageScalarWhereWithAggregatesInput | AIAssistantMessageScalarWhereWithAggregatesInput[]
    OR?: AIAssistantMessageScalarWhereWithAggregatesInput[]
    NOT?: AIAssistantMessageScalarWhereWithAggregatesInput | AIAssistantMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AIAssistantMessage"> | string
    role?: EnumAIAssistantMessageRoleWithAggregatesFilter<"AIAssistantMessage"> | $Enums.AIAssistantMessageRole
    content?: StringWithAggregatesFilter<"AIAssistantMessage"> | string
    userRole?: EnumRoleWithAggregatesFilter<"AIAssistantMessage"> | $Enums.Role
    apartmentId?: StringNullableWithAggregatesFilter<"AIAssistantMessage"> | string | null
    cleaningTaskId?: StringNullableWithAggregatesFilter<"AIAssistantMessage"> | string | null
    maintenanceTicketId?: StringNullableWithAggregatesFilter<"AIAssistantMessage"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AIAssistantMessage"> | Date | string
  }

  export type AttachmentWhereInput = {
    AND?: AttachmentWhereInput | AttachmentWhereInput[]
    OR?: AttachmentWhereInput[]
    NOT?: AttachmentWhereInput | AttachmentWhereInput[]
    id?: StringFilter<"Attachment"> | string
    url?: StringFilter<"Attachment"> | string
    fileName?: StringFilter<"Attachment"> | string
    fileType?: StringNullableFilter<"Attachment"> | string | null
    createdAt?: DateTimeFilter<"Attachment"> | Date | string
    maintenanceTicketId?: StringNullableFilter<"Attachment"> | string | null
    cleaningTaskId?: StringNullableFilter<"Attachment"> | string | null
    maintenanceTicket?: XOR<MaintenanceTicketNullableScalarRelationFilter, MaintenanceTicketWhereInput> | null
    cleaningTask?: XOR<CleaningTaskNullableScalarRelationFilter, CleaningTaskWhereInput> | null
    messages?: MessageListRelationFilter
    cleaningMessages?: CleaningTaskMessageListRelationFilter
  }

  export type AttachmentOrderByWithRelationInput = {
    id?: SortOrder
    url?: SortOrder
    fileName?: SortOrder
    fileType?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    maintenanceTicketId?: SortOrderInput | SortOrder
    cleaningTaskId?: SortOrderInput | SortOrder
    maintenanceTicket?: MaintenanceTicketOrderByWithRelationInput
    cleaningTask?: CleaningTaskOrderByWithRelationInput
    messages?: MessageOrderByRelationAggregateInput
    cleaningMessages?: CleaningTaskMessageOrderByRelationAggregateInput
  }

  export type AttachmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AttachmentWhereInput | AttachmentWhereInput[]
    OR?: AttachmentWhereInput[]
    NOT?: AttachmentWhereInput | AttachmentWhereInput[]
    url?: StringFilter<"Attachment"> | string
    fileName?: StringFilter<"Attachment"> | string
    fileType?: StringNullableFilter<"Attachment"> | string | null
    createdAt?: DateTimeFilter<"Attachment"> | Date | string
    maintenanceTicketId?: StringNullableFilter<"Attachment"> | string | null
    cleaningTaskId?: StringNullableFilter<"Attachment"> | string | null
    maintenanceTicket?: XOR<MaintenanceTicketNullableScalarRelationFilter, MaintenanceTicketWhereInput> | null
    cleaningTask?: XOR<CleaningTaskNullableScalarRelationFilter, CleaningTaskWhereInput> | null
    messages?: MessageListRelationFilter
    cleaningMessages?: CleaningTaskMessageListRelationFilter
  }, "id">

  export type AttachmentOrderByWithAggregationInput = {
    id?: SortOrder
    url?: SortOrder
    fileName?: SortOrder
    fileType?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    maintenanceTicketId?: SortOrderInput | SortOrder
    cleaningTaskId?: SortOrderInput | SortOrder
    _count?: AttachmentCountOrderByAggregateInput
    _max?: AttachmentMaxOrderByAggregateInput
    _min?: AttachmentMinOrderByAggregateInput
  }

  export type AttachmentScalarWhereWithAggregatesInput = {
    AND?: AttachmentScalarWhereWithAggregatesInput | AttachmentScalarWhereWithAggregatesInput[]
    OR?: AttachmentScalarWhereWithAggregatesInput[]
    NOT?: AttachmentScalarWhereWithAggregatesInput | AttachmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Attachment"> | string
    url?: StringWithAggregatesFilter<"Attachment"> | string
    fileName?: StringWithAggregatesFilter<"Attachment"> | string
    fileType?: StringNullableWithAggregatesFilter<"Attachment"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Attachment"> | Date | string
    maintenanceTicketId?: StringNullableWithAggregatesFilter<"Attachment"> | string | null
    cleaningTaskId?: StringNullableWithAggregatesFilter<"Attachment"> | string | null
  }

  export type ApartmentAttachmentWhereInput = {
    AND?: ApartmentAttachmentWhereInput | ApartmentAttachmentWhereInput[]
    OR?: ApartmentAttachmentWhereInput[]
    NOT?: ApartmentAttachmentWhereInput | ApartmentAttachmentWhereInput[]
    id?: StringFilter<"ApartmentAttachment"> | string
    apartmentId?: StringFilter<"ApartmentAttachment"> | string
    filename?: StringFilter<"ApartmentAttachment"> | string
    url?: StringNullableFilter<"ApartmentAttachment"> | string | null
    mimeType?: StringNullableFilter<"ApartmentAttachment"> | string | null
    size?: IntNullableFilter<"ApartmentAttachment"> | number | null
    category?: StringFilter<"ApartmentAttachment"> | string
    extractedText?: StringNullableFilter<"ApartmentAttachment"> | string | null
    notes?: StringNullableFilter<"ApartmentAttachment"> | string | null
    createdAt?: DateTimeFilter<"ApartmentAttachment"> | Date | string
    updatedAt?: DateTimeFilter<"ApartmentAttachment"> | Date | string
    apartment?: XOR<ApartmentScalarRelationFilter, ApartmentWhereInput>
  }

  export type ApartmentAttachmentOrderByWithRelationInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    filename?: SortOrder
    url?: SortOrderInput | SortOrder
    mimeType?: SortOrderInput | SortOrder
    size?: SortOrderInput | SortOrder
    category?: SortOrder
    extractedText?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    apartment?: ApartmentOrderByWithRelationInput
  }

  export type ApartmentAttachmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ApartmentAttachmentWhereInput | ApartmentAttachmentWhereInput[]
    OR?: ApartmentAttachmentWhereInput[]
    NOT?: ApartmentAttachmentWhereInput | ApartmentAttachmentWhereInput[]
    apartmentId?: StringFilter<"ApartmentAttachment"> | string
    filename?: StringFilter<"ApartmentAttachment"> | string
    url?: StringNullableFilter<"ApartmentAttachment"> | string | null
    mimeType?: StringNullableFilter<"ApartmentAttachment"> | string | null
    size?: IntNullableFilter<"ApartmentAttachment"> | number | null
    category?: StringFilter<"ApartmentAttachment"> | string
    extractedText?: StringNullableFilter<"ApartmentAttachment"> | string | null
    notes?: StringNullableFilter<"ApartmentAttachment"> | string | null
    createdAt?: DateTimeFilter<"ApartmentAttachment"> | Date | string
    updatedAt?: DateTimeFilter<"ApartmentAttachment"> | Date | string
    apartment?: XOR<ApartmentScalarRelationFilter, ApartmentWhereInput>
  }, "id">

  export type ApartmentAttachmentOrderByWithAggregationInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    filename?: SortOrder
    url?: SortOrderInput | SortOrder
    mimeType?: SortOrderInput | SortOrder
    size?: SortOrderInput | SortOrder
    category?: SortOrder
    extractedText?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ApartmentAttachmentCountOrderByAggregateInput
    _avg?: ApartmentAttachmentAvgOrderByAggregateInput
    _max?: ApartmentAttachmentMaxOrderByAggregateInput
    _min?: ApartmentAttachmentMinOrderByAggregateInput
    _sum?: ApartmentAttachmentSumOrderByAggregateInput
  }

  export type ApartmentAttachmentScalarWhereWithAggregatesInput = {
    AND?: ApartmentAttachmentScalarWhereWithAggregatesInput | ApartmentAttachmentScalarWhereWithAggregatesInput[]
    OR?: ApartmentAttachmentScalarWhereWithAggregatesInput[]
    NOT?: ApartmentAttachmentScalarWhereWithAggregatesInput | ApartmentAttachmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApartmentAttachment"> | string
    apartmentId?: StringWithAggregatesFilter<"ApartmentAttachment"> | string
    filename?: StringWithAggregatesFilter<"ApartmentAttachment"> | string
    url?: StringNullableWithAggregatesFilter<"ApartmentAttachment"> | string | null
    mimeType?: StringNullableWithAggregatesFilter<"ApartmentAttachment"> | string | null
    size?: IntNullableWithAggregatesFilter<"ApartmentAttachment"> | number | null
    category?: StringWithAggregatesFilter<"ApartmentAttachment"> | string
    extractedText?: StringNullableWithAggregatesFilter<"ApartmentAttachment"> | string | null
    notes?: StringNullableWithAggregatesFilter<"ApartmentAttachment"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ApartmentAttachment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ApartmentAttachment"> | Date | string
  }

  export type MessageWhereInput = {
    AND?: MessageWhereInput | MessageWhereInput[]
    OR?: MessageWhereInput[]
    NOT?: MessageWhereInput | MessageWhereInput[]
    id?: StringFilter<"Message"> | string
    text?: StringNullableFilter<"Message"> | string | null
    role?: StringFilter<"Message"> | string
    senderName?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    maintenanceTicketId?: StringFilter<"Message"> | string
    attachmentId?: StringNullableFilter<"Message"> | string | null
    readByManagerAt?: DateTimeNullableFilter<"Message"> | Date | string | null
    maintenanceTicket?: XOR<MaintenanceTicketScalarRelationFilter, MaintenanceTicketWhereInput>
    attachment?: XOR<AttachmentNullableScalarRelationFilter, AttachmentWhereInput> | null
  }

  export type MessageOrderByWithRelationInput = {
    id?: SortOrder
    text?: SortOrderInput | SortOrder
    role?: SortOrder
    senderName?: SortOrder
    createdAt?: SortOrder
    maintenanceTicketId?: SortOrder
    attachmentId?: SortOrderInput | SortOrder
    readByManagerAt?: SortOrderInput | SortOrder
    maintenanceTicket?: MaintenanceTicketOrderByWithRelationInput
    attachment?: AttachmentOrderByWithRelationInput
  }

  export type MessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MessageWhereInput | MessageWhereInput[]
    OR?: MessageWhereInput[]
    NOT?: MessageWhereInput | MessageWhereInput[]
    text?: StringNullableFilter<"Message"> | string | null
    role?: StringFilter<"Message"> | string
    senderName?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    maintenanceTicketId?: StringFilter<"Message"> | string
    attachmentId?: StringNullableFilter<"Message"> | string | null
    readByManagerAt?: DateTimeNullableFilter<"Message"> | Date | string | null
    maintenanceTicket?: XOR<MaintenanceTicketScalarRelationFilter, MaintenanceTicketWhereInput>
    attachment?: XOR<AttachmentNullableScalarRelationFilter, AttachmentWhereInput> | null
  }, "id">

  export type MessageOrderByWithAggregationInput = {
    id?: SortOrder
    text?: SortOrderInput | SortOrder
    role?: SortOrder
    senderName?: SortOrder
    createdAt?: SortOrder
    maintenanceTicketId?: SortOrder
    attachmentId?: SortOrderInput | SortOrder
    readByManagerAt?: SortOrderInput | SortOrder
    _count?: MessageCountOrderByAggregateInput
    _max?: MessageMaxOrderByAggregateInput
    _min?: MessageMinOrderByAggregateInput
  }

  export type MessageScalarWhereWithAggregatesInput = {
    AND?: MessageScalarWhereWithAggregatesInput | MessageScalarWhereWithAggregatesInput[]
    OR?: MessageScalarWhereWithAggregatesInput[]
    NOT?: MessageScalarWhereWithAggregatesInput | MessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Message"> | string
    text?: StringNullableWithAggregatesFilter<"Message"> | string | null
    role?: StringWithAggregatesFilter<"Message"> | string
    senderName?: StringWithAggregatesFilter<"Message"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Message"> | Date | string
    maintenanceTicketId?: StringWithAggregatesFilter<"Message"> | string
    attachmentId?: StringNullableWithAggregatesFilter<"Message"> | string | null
    readByManagerAt?: DateTimeNullableWithAggregatesFilter<"Message"> | Date | string | null
  }

  export type CleaningTaskMessageWhereInput = {
    AND?: CleaningTaskMessageWhereInput | CleaningTaskMessageWhereInput[]
    OR?: CleaningTaskMessageWhereInput[]
    NOT?: CleaningTaskMessageWhereInput | CleaningTaskMessageWhereInput[]
    id?: StringFilter<"CleaningTaskMessage"> | string
    text?: StringNullableFilter<"CleaningTaskMessage"> | string | null
    role?: StringFilter<"CleaningTaskMessage"> | string
    senderName?: StringFilter<"CleaningTaskMessage"> | string
    createdAt?: DateTimeFilter<"CleaningTaskMessage"> | Date | string
    cleaningTaskId?: StringFilter<"CleaningTaskMessage"> | string
    attachmentId?: StringNullableFilter<"CleaningTaskMessage"> | string | null
    readByManagerAt?: DateTimeNullableFilter<"CleaningTaskMessage"> | Date | string | null
    cleaningTask?: XOR<CleaningTaskScalarRelationFilter, CleaningTaskWhereInput>
    attachment?: XOR<AttachmentNullableScalarRelationFilter, AttachmentWhereInput> | null
  }

  export type CleaningTaskMessageOrderByWithRelationInput = {
    id?: SortOrder
    text?: SortOrderInput | SortOrder
    role?: SortOrder
    senderName?: SortOrder
    createdAt?: SortOrder
    cleaningTaskId?: SortOrder
    attachmentId?: SortOrderInput | SortOrder
    readByManagerAt?: SortOrderInput | SortOrder
    cleaningTask?: CleaningTaskOrderByWithRelationInput
    attachment?: AttachmentOrderByWithRelationInput
  }

  export type CleaningTaskMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CleaningTaskMessageWhereInput | CleaningTaskMessageWhereInput[]
    OR?: CleaningTaskMessageWhereInput[]
    NOT?: CleaningTaskMessageWhereInput | CleaningTaskMessageWhereInput[]
    text?: StringNullableFilter<"CleaningTaskMessage"> | string | null
    role?: StringFilter<"CleaningTaskMessage"> | string
    senderName?: StringFilter<"CleaningTaskMessage"> | string
    createdAt?: DateTimeFilter<"CleaningTaskMessage"> | Date | string
    cleaningTaskId?: StringFilter<"CleaningTaskMessage"> | string
    attachmentId?: StringNullableFilter<"CleaningTaskMessage"> | string | null
    readByManagerAt?: DateTimeNullableFilter<"CleaningTaskMessage"> | Date | string | null
    cleaningTask?: XOR<CleaningTaskScalarRelationFilter, CleaningTaskWhereInput>
    attachment?: XOR<AttachmentNullableScalarRelationFilter, AttachmentWhereInput> | null
  }, "id">

  export type CleaningTaskMessageOrderByWithAggregationInput = {
    id?: SortOrder
    text?: SortOrderInput | SortOrder
    role?: SortOrder
    senderName?: SortOrder
    createdAt?: SortOrder
    cleaningTaskId?: SortOrder
    attachmentId?: SortOrderInput | SortOrder
    readByManagerAt?: SortOrderInput | SortOrder
    _count?: CleaningTaskMessageCountOrderByAggregateInput
    _max?: CleaningTaskMessageMaxOrderByAggregateInput
    _min?: CleaningTaskMessageMinOrderByAggregateInput
  }

  export type CleaningTaskMessageScalarWhereWithAggregatesInput = {
    AND?: CleaningTaskMessageScalarWhereWithAggregatesInput | CleaningTaskMessageScalarWhereWithAggregatesInput[]
    OR?: CleaningTaskMessageScalarWhereWithAggregatesInput[]
    NOT?: CleaningTaskMessageScalarWhereWithAggregatesInput | CleaningTaskMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CleaningTaskMessage"> | string
    text?: StringNullableWithAggregatesFilter<"CleaningTaskMessage"> | string | null
    role?: StringWithAggregatesFilter<"CleaningTaskMessage"> | string
    senderName?: StringWithAggregatesFilter<"CleaningTaskMessage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CleaningTaskMessage"> | Date | string
    cleaningTaskId?: StringWithAggregatesFilter<"CleaningTaskMessage"> | string
    attachmentId?: StringNullableWithAggregatesFilter<"CleaningTaskMessage"> | string | null
    readByManagerAt?: DateTimeNullableWithAggregatesFilter<"CleaningTaskMessage"> | Date | string | null
  }

  export type UserCreateInput = {
    id?: string
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    name: string
    cleaningTasks?: CleaningTaskCreateNestedManyWithoutAssignedToInput
    maintenanceTickets?: MaintenanceTicketCreateNestedManyWithoutAssignedToInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    name: string
    cleaningTasks?: CleaningTaskUncheckedCreateNestedManyWithoutAssignedToInput
    maintenanceTickets?: MaintenanceTicketUncheckedCreateNestedManyWithoutAssignedToInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    cleaningTasks?: CleaningTaskUpdateManyWithoutAssignedToNestedInput
    maintenanceTickets?: MaintenanceTicketUpdateManyWithoutAssignedToNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    cleaningTasks?: CleaningTaskUncheckedUpdateManyWithoutAssignedToNestedInput
    maintenanceTickets?: MaintenanceTicketUncheckedUpdateManyWithoutAssignedToNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    name: string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ApartmentCreateInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketCreateNestedManyWithoutApartmentInput
    notifications?: NotificationCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentUncheckedCreateInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemUncheckedCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskUncheckedCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketUncheckedCreateNestedManyWithoutApartmentInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentUncheckedCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUncheckedUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUncheckedUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUncheckedUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUncheckedUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentCreateManyInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ApartmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApartmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChecklistItemCreateInput = {
    id?: string
    label: string
    required?: boolean
    order?: number
    createdAt?: Date | string
    formula?: string | null
    type?: string
    apartment: ApartmentCreateNestedOneWithoutChecklistItemsInput
  }

  export type ChecklistItemUncheckedCreateInput = {
    id?: string
    apartmentId: string
    label: string
    required?: boolean
    order?: number
    createdAt?: Date | string
    formula?: string | null
    type?: string
  }

  export type ChecklistItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    required?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    apartment?: ApartmentUpdateOneRequiredWithoutChecklistItemsNestedInput
  }

  export type ChecklistItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    required?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
  }

  export type ChecklistItemCreateManyInput = {
    id?: string
    apartmentId: string
    label: string
    required?: boolean
    order?: number
    createdAt?: Date | string
    formula?: string | null
    type?: string
  }

  export type ChecklistItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    required?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
  }

  export type ChecklistItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    required?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
  }

  export type NotificationCreateInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    apartment?: ApartmentCreateNestedOneWithoutNotificationsInput
  }

  export type NotificationUncheckedCreateInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    apartmentId?: string | null
  }

  export type NotificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apartment?: ApartmentUpdateOneWithoutNotificationsNestedInput
  }

  export type NotificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apartmentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NotificationCreateManyInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    apartmentId?: string | null
  }

  export type NotificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apartmentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingCreateInput = {
    id?: string
    guestName?: string | null
    totalGuests: number
    checkInDate: Date | string
    checkOutDate: Date | string
    status?: string | null
    externalId?: string | null
    source?: string | null
    createdAt?: Date | string
    apartment: ApartmentCreateNestedOneWithoutBookingsInput
    cleaningTask?: CleaningTaskCreateNestedOneWithoutBookingInput
  }

  export type BookingUncheckedCreateInput = {
    id?: string
    apartmentId: string
    guestName?: string | null
    totalGuests: number
    checkInDate: Date | string
    checkOutDate: Date | string
    status?: string | null
    externalId?: string | null
    source?: string | null
    createdAt?: Date | string
    cleaningTask?: CleaningTaskUncheckedCreateNestedOneWithoutBookingInput
  }

  export type BookingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    guestName?: NullableStringFieldUpdateOperationsInput | string | null
    totalGuests?: IntFieldUpdateOperationsInput | number
    checkInDate?: DateTimeFieldUpdateOperationsInput | Date | string
    checkOutDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apartment?: ApartmentUpdateOneRequiredWithoutBookingsNestedInput
    cleaningTask?: CleaningTaskUpdateOneWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    guestName?: NullableStringFieldUpdateOperationsInput | string | null
    totalGuests?: IntFieldUpdateOperationsInput | number
    checkInDate?: DateTimeFieldUpdateOperationsInput | Date | string
    checkOutDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTask?: CleaningTaskUncheckedUpdateOneWithoutBookingNestedInput
  }

  export type BookingCreateManyInput = {
    id?: string
    apartmentId: string
    guestName?: string | null
    totalGuests: number
    checkInDate: Date | string
    checkOutDate: Date | string
    status?: string | null
    externalId?: string | null
    source?: string | null
    createdAt?: Date | string
  }

  export type BookingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    guestName?: NullableStringFieldUpdateOperationsInput | string | null
    totalGuests?: IntFieldUpdateOperationsInput | number
    checkInDate?: DateTimeFieldUpdateOperationsInput | Date | string
    checkOutDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    guestName?: NullableStringFieldUpdateOperationsInput | string | null
    totalGuests?: IntFieldUpdateOperationsInput | number
    checkInDate?: DateTimeFieldUpdateOperationsInput | Date | string
    checkOutDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CleaningTaskCreateInput = {
    id?: string
    date: Date | string
    status: string
    createdAt?: Date | string
    notes?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingCreateNestedOneWithoutCleaningTaskInput
    apartment: ApartmentCreateNestedOneWithoutCleaningTasksInput
    assignedTo?: UserCreateNestedOneWithoutCleaningTasksInput
    messages?: CleaningTaskMessageCreateNestedManyWithoutCleaningTaskInput
    attachments?: AttachmentCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskUncheckedCreateInput = {
    id?: string
    apartmentId: string
    date: Date | string
    status: string
    createdAt?: Date | string
    assignedToId?: string | null
    notes?: string | null
    bookingId?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingUpdateOneWithoutCleaningTaskNestedInput
    apartment?: ApartmentUpdateOneRequiredWithoutCleaningTasksNestedInput
    assignedTo?: UserUpdateOneWithoutCleaningTasksNestedInput
    messages?: CleaningTaskMessageUpdateManyWithoutCleaningTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutCleaningTaskNestedInput
  }

  export type CleaningTaskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    bookingId?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
  }

  export type CleaningTaskCreateManyInput = {
    id?: string
    apartmentId: string
    date: Date | string
    status: string
    createdAt?: Date | string
    assignedToId?: string | null
    notes?: string | null
    bookingId?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
  }

  export type CleaningTaskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
  }

  export type CleaningTaskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    bookingId?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MaintenanceTicketCreateInput = {
    id?: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    apartment: ApartmentCreateNestedOneWithoutMaintenanceTicketsInput
    assignedTo?: UserCreateNestedOneWithoutMaintenanceTicketsInput
    attachments?: AttachmentCreateNestedManyWithoutMaintenanceTicketInput
    messages?: MessageCreateNestedManyWithoutMaintenanceTicketInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketUncheckedCreateInput = {
    id?: string
    apartmentId: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    assignedToId?: string | null
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    attachments?: AttachmentUncheckedCreateNestedManyWithoutMaintenanceTicketInput
    messages?: MessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    apartment?: ApartmentUpdateOneRequiredWithoutMaintenanceTicketsNestedInput
    assignedTo?: UserUpdateOneWithoutMaintenanceTicketsNestedInput
    attachments?: AttachmentUpdateManyWithoutMaintenanceTicketNestedInput
    messages?: MessageUpdateManyWithoutMaintenanceTicketNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type MaintenanceTicketUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attachments?: AttachmentUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
    messages?: MessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type MaintenanceTicketCreateManyInput = {
    id?: string
    apartmentId: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    assignedToId?: string | null
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
  }

  export type MaintenanceTicketUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MaintenanceTicketUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AIAssistantMessageCreateInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    createdAt?: Date | string
    apartment?: ApartmentCreateNestedOneWithoutAiAssistantMessagesInput
    cleaningTask?: CleaningTaskCreateNestedOneWithoutAiAssistantMessagesInput
    maintenanceTicket?: MaintenanceTicketCreateNestedOneWithoutAiAssistantMessagesInput
  }

  export type AIAssistantMessageUncheckedCreateInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    apartmentId?: string | null
    cleaningTaskId?: string | null
    maintenanceTicketId?: string | null
    createdAt?: Date | string
  }

  export type AIAssistantMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apartment?: ApartmentUpdateOneWithoutAiAssistantMessagesNestedInput
    cleaningTask?: CleaningTaskUpdateOneWithoutAiAssistantMessagesNestedInput
    maintenanceTicket?: MaintenanceTicketUpdateOneWithoutAiAssistantMessagesNestedInput
  }

  export type AIAssistantMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    apartmentId?: NullableStringFieldUpdateOperationsInput | string | null
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIAssistantMessageCreateManyInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    apartmentId?: string | null
    cleaningTaskId?: string | null
    maintenanceTicketId?: string | null
    createdAt?: Date | string
  }

  export type AIAssistantMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIAssistantMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    apartmentId?: NullableStringFieldUpdateOperationsInput | string | null
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentCreateInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    maintenanceTicket?: MaintenanceTicketCreateNestedOneWithoutAttachmentsInput
    cleaningTask?: CleaningTaskCreateNestedOneWithoutAttachmentsInput
    messages?: MessageCreateNestedManyWithoutAttachmentInput
    cleaningMessages?: CleaningTaskMessageCreateNestedManyWithoutAttachmentInput
  }

  export type AttachmentUncheckedCreateInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    maintenanceTicketId?: string | null
    cleaningTaskId?: string | null
    messages?: MessageUncheckedCreateNestedManyWithoutAttachmentInput
    cleaningMessages?: CleaningTaskMessageUncheckedCreateNestedManyWithoutAttachmentInput
  }

  export type AttachmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicket?: MaintenanceTicketUpdateOneWithoutAttachmentsNestedInput
    cleaningTask?: CleaningTaskUpdateOneWithoutAttachmentsNestedInput
    messages?: MessageUpdateManyWithoutAttachmentNestedInput
    cleaningMessages?: CleaningTaskMessageUpdateManyWithoutAttachmentNestedInput
  }

  export type AttachmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
    messages?: MessageUncheckedUpdateManyWithoutAttachmentNestedInput
    cleaningMessages?: CleaningTaskMessageUncheckedUpdateManyWithoutAttachmentNestedInput
  }

  export type AttachmentCreateManyInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    maintenanceTicketId?: string | null
    cleaningTaskId?: string | null
  }

  export type AttachmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApartmentAttachmentCreateInput = {
    id?: string
    filename: string
    url?: string | null
    mimeType?: string | null
    size?: number | null
    category?: string
    extractedText?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    apartment: ApartmentCreateNestedOneWithoutApartmentAttachmentsInput
  }

  export type ApartmentAttachmentUncheckedCreateInput = {
    id?: string
    apartmentId: string
    filename: string
    url?: string | null
    mimeType?: string | null
    size?: number | null
    category?: string
    extractedText?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApartmentAttachmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apartment?: ApartmentUpdateOneRequiredWithoutApartmentAttachmentsNestedInput
  }

  export type ApartmentAttachmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApartmentAttachmentCreateManyInput = {
    id?: string
    apartmentId: string
    filename: string
    url?: string | null
    mimeType?: string | null
    size?: number | null
    category?: string
    extractedText?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApartmentAttachmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApartmentAttachmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageCreateInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    readByManagerAt?: Date | string | null
    maintenanceTicket: MaintenanceTicketCreateNestedOneWithoutMessagesInput
    attachment?: AttachmentCreateNestedOneWithoutMessagesInput
  }

  export type MessageUncheckedCreateInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    maintenanceTicketId: string
    attachmentId?: string | null
    readByManagerAt?: Date | string | null
  }

  export type MessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maintenanceTicket?: MaintenanceTicketUpdateOneRequiredWithoutMessagesNestedInput
    attachment?: AttachmentUpdateOneWithoutMessagesNestedInput
  }

  export type MessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicketId?: StringFieldUpdateOperationsInput | string
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageCreateManyInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    maintenanceTicketId: string
    attachmentId?: string | null
    readByManagerAt?: Date | string | null
  }

  export type MessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicketId?: StringFieldUpdateOperationsInput | string
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CleaningTaskMessageCreateInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    readByManagerAt?: Date | string | null
    cleaningTask: CleaningTaskCreateNestedOneWithoutMessagesInput
    attachment?: AttachmentCreateNestedOneWithoutCleaningMessagesInput
  }

  export type CleaningTaskMessageUncheckedCreateInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    cleaningTaskId: string
    attachmentId?: string | null
    readByManagerAt?: Date | string | null
  }

  export type CleaningTaskMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cleaningTask?: CleaningTaskUpdateOneRequiredWithoutMessagesNestedInput
    attachment?: AttachmentUpdateOneWithoutCleaningMessagesNestedInput
  }

  export type CleaningTaskMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTaskId?: StringFieldUpdateOperationsInput | string
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CleaningTaskMessageCreateManyInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    cleaningTaskId: string
    attachmentId?: string | null
    readByManagerAt?: Date | string | null
  }

  export type CleaningTaskMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CleaningTaskMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTaskId?: StringFieldUpdateOperationsInput | string
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CleaningTaskListRelationFilter = {
    every?: CleaningTaskWhereInput
    some?: CleaningTaskWhereInput
    none?: CleaningTaskWhereInput
  }

  export type MaintenanceTicketListRelationFilter = {
    every?: MaintenanceTicketWhereInput
    some?: MaintenanceTicketWhereInput
    none?: MaintenanceTicketWhereInput
  }

  export type CleaningTaskOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MaintenanceTicketOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    name?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    name?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    name?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BookingListRelationFilter = {
    every?: BookingWhereInput
    some?: BookingWhereInput
    none?: BookingWhereInput
  }

  export type ChecklistItemListRelationFilter = {
    every?: ChecklistItemWhereInput
    some?: ChecklistItemWhereInput
    none?: ChecklistItemWhereInput
  }

  export type NotificationListRelationFilter = {
    every?: NotificationWhereInput
    some?: NotificationWhereInput
    none?: NotificationWhereInput
  }

  export type AIAssistantMessageListRelationFilter = {
    every?: AIAssistantMessageWhereInput
    some?: AIAssistantMessageWhereInput
    none?: AIAssistantMessageWhereInput
  }

  export type ApartmentAttachmentListRelationFilter = {
    every?: ApartmentAttachmentWhereInput
    some?: ApartmentAttachmentWhereInput
    none?: ApartmentAttachmentWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BookingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChecklistItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type NotificationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AIAssistantMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ApartmentAttachmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ApartmentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    apartmentCode?: SortOrder
    address?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    squareMeters?: SortOrder
    bedrooms?: SortOrder
    bathrooms?: SortOrder
    maxGuests?: SortOrder
    accessInstructions?: SortOrder
    icalUrl?: SortOrder
    lastSyncAt?: SortOrder
    technicalProfile?: SortOrder
    createdAt?: SortOrder
  }

  export type ApartmentAvgOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
    squareMeters?: SortOrder
    bedrooms?: SortOrder
    bathrooms?: SortOrder
    maxGuests?: SortOrder
  }

  export type ApartmentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    apartmentCode?: SortOrder
    address?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    squareMeters?: SortOrder
    bedrooms?: SortOrder
    bathrooms?: SortOrder
    maxGuests?: SortOrder
    accessInstructions?: SortOrder
    icalUrl?: SortOrder
    lastSyncAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ApartmentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    apartmentCode?: SortOrder
    address?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    squareMeters?: SortOrder
    bedrooms?: SortOrder
    bathrooms?: SortOrder
    maxGuests?: SortOrder
    accessInstructions?: SortOrder
    icalUrl?: SortOrder
    lastSyncAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ApartmentSumOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
    squareMeters?: SortOrder
    bedrooms?: SortOrder
    bathrooms?: SortOrder
    maxGuests?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ApartmentScalarRelationFilter = {
    is?: ApartmentWhereInput
    isNot?: ApartmentWhereInput
  }

  export type ChecklistItemCountOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    label?: SortOrder
    required?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    formula?: SortOrder
    type?: SortOrder
  }

  export type ChecklistItemAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type ChecklistItemMaxOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    label?: SortOrder
    required?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    formula?: SortOrder
    type?: SortOrder
  }

  export type ChecklistItemMinOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    label?: SortOrder
    required?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    formula?: SortOrder
    type?: SortOrder
  }

  export type ChecklistItemSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ApartmentNullableScalarRelationFilter = {
    is?: ApartmentWhereInput | null
    isNot?: ApartmentWhereInput | null
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    apartmentId?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    apartmentId?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    apartmentId?: SortOrder
  }

  export type CleaningTaskNullableScalarRelationFilter = {
    is?: CleaningTaskWhereInput | null
    isNot?: CleaningTaskWhereInput | null
  }

  export type BookingCountOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    guestName?: SortOrder
    totalGuests?: SortOrder
    checkInDate?: SortOrder
    checkOutDate?: SortOrder
    status?: SortOrder
    externalId?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
  }

  export type BookingAvgOrderByAggregateInput = {
    totalGuests?: SortOrder
  }

  export type BookingMaxOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    guestName?: SortOrder
    totalGuests?: SortOrder
    checkInDate?: SortOrder
    checkOutDate?: SortOrder
    status?: SortOrder
    externalId?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
  }

  export type BookingMinOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    guestName?: SortOrder
    totalGuests?: SortOrder
    checkInDate?: SortOrder
    checkOutDate?: SortOrder
    status?: SortOrder
    externalId?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
  }

  export type BookingSumOrderByAggregateInput = {
    totalGuests?: SortOrder
  }

  export type BookingNullableScalarRelationFilter = {
    is?: BookingWhereInput | null
    isNot?: BookingWhereInput | null
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type CleaningTaskMessageListRelationFilter = {
    every?: CleaningTaskMessageWhereInput
    some?: CleaningTaskMessageWhereInput
    none?: CleaningTaskMessageWhereInput
  }

  export type AttachmentListRelationFilter = {
    every?: AttachmentWhereInput
    some?: AttachmentWhereInput
    none?: AttachmentWhereInput
  }

  export type CleaningTaskMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AttachmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CleaningTaskCountOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    date?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    assignedToId?: SortOrder
    notes?: SortOrder
    bookingId?: SortOrder
    checklistProgress?: SortOrder
  }

  export type CleaningTaskMaxOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    date?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    assignedToId?: SortOrder
    notes?: SortOrder
    bookingId?: SortOrder
  }

  export type CleaningTaskMinOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    date?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    assignedToId?: SortOrder
    notes?: SortOrder
    bookingId?: SortOrder
  }

  export type MessageListRelationFilter = {
    every?: MessageWhereInput
    some?: MessageWhereInput
    none?: MessageWhereInput
  }

  export type MessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MaintenanceTicketCountOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    createdAt?: SortOrder
    assignedToId?: SortOrder
    scheduledStart?: SortOrder
    scheduledEnd?: SortOrder
    startedAt?: SortOrder
    resolvedAt?: SortOrder
  }

  export type MaintenanceTicketMaxOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    createdAt?: SortOrder
    assignedToId?: SortOrder
    scheduledStart?: SortOrder
    scheduledEnd?: SortOrder
    startedAt?: SortOrder
    resolvedAt?: SortOrder
  }

  export type MaintenanceTicketMinOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    createdAt?: SortOrder
    assignedToId?: SortOrder
    scheduledStart?: SortOrder
    scheduledEnd?: SortOrder
    startedAt?: SortOrder
    resolvedAt?: SortOrder
  }

  export type EnumAIAssistantMessageRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.AIAssistantMessageRole | EnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AIAssistantMessageRole[] | ListEnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AIAssistantMessageRole[] | ListEnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAIAssistantMessageRoleFilter<$PrismaModel> | $Enums.AIAssistantMessageRole
  }

  export type MaintenanceTicketNullableScalarRelationFilter = {
    is?: MaintenanceTicketWhereInput | null
    isNot?: MaintenanceTicketWhereInput | null
  }

  export type AIAssistantMessageCountOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    userRole?: SortOrder
    apartmentId?: SortOrder
    cleaningTaskId?: SortOrder
    maintenanceTicketId?: SortOrder
    createdAt?: SortOrder
  }

  export type AIAssistantMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    userRole?: SortOrder
    apartmentId?: SortOrder
    cleaningTaskId?: SortOrder
    maintenanceTicketId?: SortOrder
    createdAt?: SortOrder
  }

  export type AIAssistantMessageMinOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    userRole?: SortOrder
    apartmentId?: SortOrder
    cleaningTaskId?: SortOrder
    maintenanceTicketId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumAIAssistantMessageRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AIAssistantMessageRole | EnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AIAssistantMessageRole[] | ListEnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AIAssistantMessageRole[] | ListEnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAIAssistantMessageRoleWithAggregatesFilter<$PrismaModel> | $Enums.AIAssistantMessageRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAIAssistantMessageRoleFilter<$PrismaModel>
    _max?: NestedEnumAIAssistantMessageRoleFilter<$PrismaModel>
  }

  export type AttachmentCountOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    fileName?: SortOrder
    fileType?: SortOrder
    createdAt?: SortOrder
    maintenanceTicketId?: SortOrder
    cleaningTaskId?: SortOrder
  }

  export type AttachmentMaxOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    fileName?: SortOrder
    fileType?: SortOrder
    createdAt?: SortOrder
    maintenanceTicketId?: SortOrder
    cleaningTaskId?: SortOrder
  }

  export type AttachmentMinOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    fileName?: SortOrder
    fileType?: SortOrder
    createdAt?: SortOrder
    maintenanceTicketId?: SortOrder
    cleaningTaskId?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type ApartmentAttachmentCountOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    filename?: SortOrder
    url?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    category?: SortOrder
    extractedText?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApartmentAttachmentAvgOrderByAggregateInput = {
    size?: SortOrder
  }

  export type ApartmentAttachmentMaxOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    filename?: SortOrder
    url?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    category?: SortOrder
    extractedText?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApartmentAttachmentMinOrderByAggregateInput = {
    id?: SortOrder
    apartmentId?: SortOrder
    filename?: SortOrder
    url?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    category?: SortOrder
    extractedText?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApartmentAttachmentSumOrderByAggregateInput = {
    size?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type MaintenanceTicketScalarRelationFilter = {
    is?: MaintenanceTicketWhereInput
    isNot?: MaintenanceTicketWhereInput
  }

  export type AttachmentNullableScalarRelationFilter = {
    is?: AttachmentWhereInput | null
    isNot?: AttachmentWhereInput | null
  }

  export type MessageCountOrderByAggregateInput = {
    id?: SortOrder
    text?: SortOrder
    role?: SortOrder
    senderName?: SortOrder
    createdAt?: SortOrder
    maintenanceTicketId?: SortOrder
    attachmentId?: SortOrder
    readByManagerAt?: SortOrder
  }

  export type MessageMaxOrderByAggregateInput = {
    id?: SortOrder
    text?: SortOrder
    role?: SortOrder
    senderName?: SortOrder
    createdAt?: SortOrder
    maintenanceTicketId?: SortOrder
    attachmentId?: SortOrder
    readByManagerAt?: SortOrder
  }

  export type MessageMinOrderByAggregateInput = {
    id?: SortOrder
    text?: SortOrder
    role?: SortOrder
    senderName?: SortOrder
    createdAt?: SortOrder
    maintenanceTicketId?: SortOrder
    attachmentId?: SortOrder
    readByManagerAt?: SortOrder
  }

  export type CleaningTaskScalarRelationFilter = {
    is?: CleaningTaskWhereInput
    isNot?: CleaningTaskWhereInput
  }

  export type CleaningTaskMessageCountOrderByAggregateInput = {
    id?: SortOrder
    text?: SortOrder
    role?: SortOrder
    senderName?: SortOrder
    createdAt?: SortOrder
    cleaningTaskId?: SortOrder
    attachmentId?: SortOrder
    readByManagerAt?: SortOrder
  }

  export type CleaningTaskMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    text?: SortOrder
    role?: SortOrder
    senderName?: SortOrder
    createdAt?: SortOrder
    cleaningTaskId?: SortOrder
    attachmentId?: SortOrder
    readByManagerAt?: SortOrder
  }

  export type CleaningTaskMessageMinOrderByAggregateInput = {
    id?: SortOrder
    text?: SortOrder
    role?: SortOrder
    senderName?: SortOrder
    createdAt?: SortOrder
    cleaningTaskId?: SortOrder
    attachmentId?: SortOrder
    readByManagerAt?: SortOrder
  }

  export type CleaningTaskCreateNestedManyWithoutAssignedToInput = {
    create?: XOR<CleaningTaskCreateWithoutAssignedToInput, CleaningTaskUncheckedCreateWithoutAssignedToInput> | CleaningTaskCreateWithoutAssignedToInput[] | CleaningTaskUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutAssignedToInput | CleaningTaskCreateOrConnectWithoutAssignedToInput[]
    createMany?: CleaningTaskCreateManyAssignedToInputEnvelope
    connect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
  }

  export type MaintenanceTicketCreateNestedManyWithoutAssignedToInput = {
    create?: XOR<MaintenanceTicketCreateWithoutAssignedToInput, MaintenanceTicketUncheckedCreateWithoutAssignedToInput> | MaintenanceTicketCreateWithoutAssignedToInput[] | MaintenanceTicketUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutAssignedToInput | MaintenanceTicketCreateOrConnectWithoutAssignedToInput[]
    createMany?: MaintenanceTicketCreateManyAssignedToInputEnvelope
    connect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
  }

  export type CleaningTaskUncheckedCreateNestedManyWithoutAssignedToInput = {
    create?: XOR<CleaningTaskCreateWithoutAssignedToInput, CleaningTaskUncheckedCreateWithoutAssignedToInput> | CleaningTaskCreateWithoutAssignedToInput[] | CleaningTaskUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutAssignedToInput | CleaningTaskCreateOrConnectWithoutAssignedToInput[]
    createMany?: CleaningTaskCreateManyAssignedToInputEnvelope
    connect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
  }

  export type MaintenanceTicketUncheckedCreateNestedManyWithoutAssignedToInput = {
    create?: XOR<MaintenanceTicketCreateWithoutAssignedToInput, MaintenanceTicketUncheckedCreateWithoutAssignedToInput> | MaintenanceTicketCreateWithoutAssignedToInput[] | MaintenanceTicketUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutAssignedToInput | MaintenanceTicketCreateOrConnectWithoutAssignedToInput[]
    createMany?: MaintenanceTicketCreateManyAssignedToInputEnvelope
    connect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CleaningTaskUpdateManyWithoutAssignedToNestedInput = {
    create?: XOR<CleaningTaskCreateWithoutAssignedToInput, CleaningTaskUncheckedCreateWithoutAssignedToInput> | CleaningTaskCreateWithoutAssignedToInput[] | CleaningTaskUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutAssignedToInput | CleaningTaskCreateOrConnectWithoutAssignedToInput[]
    upsert?: CleaningTaskUpsertWithWhereUniqueWithoutAssignedToInput | CleaningTaskUpsertWithWhereUniqueWithoutAssignedToInput[]
    createMany?: CleaningTaskCreateManyAssignedToInputEnvelope
    set?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    disconnect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    delete?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    connect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    update?: CleaningTaskUpdateWithWhereUniqueWithoutAssignedToInput | CleaningTaskUpdateWithWhereUniqueWithoutAssignedToInput[]
    updateMany?: CleaningTaskUpdateManyWithWhereWithoutAssignedToInput | CleaningTaskUpdateManyWithWhereWithoutAssignedToInput[]
    deleteMany?: CleaningTaskScalarWhereInput | CleaningTaskScalarWhereInput[]
  }

  export type MaintenanceTicketUpdateManyWithoutAssignedToNestedInput = {
    create?: XOR<MaintenanceTicketCreateWithoutAssignedToInput, MaintenanceTicketUncheckedCreateWithoutAssignedToInput> | MaintenanceTicketCreateWithoutAssignedToInput[] | MaintenanceTicketUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutAssignedToInput | MaintenanceTicketCreateOrConnectWithoutAssignedToInput[]
    upsert?: MaintenanceTicketUpsertWithWhereUniqueWithoutAssignedToInput | MaintenanceTicketUpsertWithWhereUniqueWithoutAssignedToInput[]
    createMany?: MaintenanceTicketCreateManyAssignedToInputEnvelope
    set?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    disconnect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    delete?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    connect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    update?: MaintenanceTicketUpdateWithWhereUniqueWithoutAssignedToInput | MaintenanceTicketUpdateWithWhereUniqueWithoutAssignedToInput[]
    updateMany?: MaintenanceTicketUpdateManyWithWhereWithoutAssignedToInput | MaintenanceTicketUpdateManyWithWhereWithoutAssignedToInput[]
    deleteMany?: MaintenanceTicketScalarWhereInput | MaintenanceTicketScalarWhereInput[]
  }

  export type CleaningTaskUncheckedUpdateManyWithoutAssignedToNestedInput = {
    create?: XOR<CleaningTaskCreateWithoutAssignedToInput, CleaningTaskUncheckedCreateWithoutAssignedToInput> | CleaningTaskCreateWithoutAssignedToInput[] | CleaningTaskUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutAssignedToInput | CleaningTaskCreateOrConnectWithoutAssignedToInput[]
    upsert?: CleaningTaskUpsertWithWhereUniqueWithoutAssignedToInput | CleaningTaskUpsertWithWhereUniqueWithoutAssignedToInput[]
    createMany?: CleaningTaskCreateManyAssignedToInputEnvelope
    set?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    disconnect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    delete?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    connect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    update?: CleaningTaskUpdateWithWhereUniqueWithoutAssignedToInput | CleaningTaskUpdateWithWhereUniqueWithoutAssignedToInput[]
    updateMany?: CleaningTaskUpdateManyWithWhereWithoutAssignedToInput | CleaningTaskUpdateManyWithWhereWithoutAssignedToInput[]
    deleteMany?: CleaningTaskScalarWhereInput | CleaningTaskScalarWhereInput[]
  }

  export type MaintenanceTicketUncheckedUpdateManyWithoutAssignedToNestedInput = {
    create?: XOR<MaintenanceTicketCreateWithoutAssignedToInput, MaintenanceTicketUncheckedCreateWithoutAssignedToInput> | MaintenanceTicketCreateWithoutAssignedToInput[] | MaintenanceTicketUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutAssignedToInput | MaintenanceTicketCreateOrConnectWithoutAssignedToInput[]
    upsert?: MaintenanceTicketUpsertWithWhereUniqueWithoutAssignedToInput | MaintenanceTicketUpsertWithWhereUniqueWithoutAssignedToInput[]
    createMany?: MaintenanceTicketCreateManyAssignedToInputEnvelope
    set?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    disconnect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    delete?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    connect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    update?: MaintenanceTicketUpdateWithWhereUniqueWithoutAssignedToInput | MaintenanceTicketUpdateWithWhereUniqueWithoutAssignedToInput[]
    updateMany?: MaintenanceTicketUpdateManyWithWhereWithoutAssignedToInput | MaintenanceTicketUpdateManyWithWhereWithoutAssignedToInput[]
    deleteMany?: MaintenanceTicketScalarWhereInput | MaintenanceTicketScalarWhereInput[]
  }

  export type BookingCreateNestedManyWithoutApartmentInput = {
    create?: XOR<BookingCreateWithoutApartmentInput, BookingUncheckedCreateWithoutApartmentInput> | BookingCreateWithoutApartmentInput[] | BookingUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutApartmentInput | BookingCreateOrConnectWithoutApartmentInput[]
    createMany?: BookingCreateManyApartmentInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type ChecklistItemCreateNestedManyWithoutApartmentInput = {
    create?: XOR<ChecklistItemCreateWithoutApartmentInput, ChecklistItemUncheckedCreateWithoutApartmentInput> | ChecklistItemCreateWithoutApartmentInput[] | ChecklistItemUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: ChecklistItemCreateOrConnectWithoutApartmentInput | ChecklistItemCreateOrConnectWithoutApartmentInput[]
    createMany?: ChecklistItemCreateManyApartmentInputEnvelope
    connect?: ChecklistItemWhereUniqueInput | ChecklistItemWhereUniqueInput[]
  }

  export type CleaningTaskCreateNestedManyWithoutApartmentInput = {
    create?: XOR<CleaningTaskCreateWithoutApartmentInput, CleaningTaskUncheckedCreateWithoutApartmentInput> | CleaningTaskCreateWithoutApartmentInput[] | CleaningTaskUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutApartmentInput | CleaningTaskCreateOrConnectWithoutApartmentInput[]
    createMany?: CleaningTaskCreateManyApartmentInputEnvelope
    connect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
  }

  export type MaintenanceTicketCreateNestedManyWithoutApartmentInput = {
    create?: XOR<MaintenanceTicketCreateWithoutApartmentInput, MaintenanceTicketUncheckedCreateWithoutApartmentInput> | MaintenanceTicketCreateWithoutApartmentInput[] | MaintenanceTicketUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutApartmentInput | MaintenanceTicketCreateOrConnectWithoutApartmentInput[]
    createMany?: MaintenanceTicketCreateManyApartmentInputEnvelope
    connect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
  }

  export type NotificationCreateNestedManyWithoutApartmentInput = {
    create?: XOR<NotificationCreateWithoutApartmentInput, NotificationUncheckedCreateWithoutApartmentInput> | NotificationCreateWithoutApartmentInput[] | NotificationUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutApartmentInput | NotificationCreateOrConnectWithoutApartmentInput[]
    createMany?: NotificationCreateManyApartmentInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type AIAssistantMessageCreateNestedManyWithoutApartmentInput = {
    create?: XOR<AIAssistantMessageCreateWithoutApartmentInput, AIAssistantMessageUncheckedCreateWithoutApartmentInput> | AIAssistantMessageCreateWithoutApartmentInput[] | AIAssistantMessageUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutApartmentInput | AIAssistantMessageCreateOrConnectWithoutApartmentInput[]
    createMany?: AIAssistantMessageCreateManyApartmentInputEnvelope
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
  }

  export type ApartmentAttachmentCreateNestedManyWithoutApartmentInput = {
    create?: XOR<ApartmentAttachmentCreateWithoutApartmentInput, ApartmentAttachmentUncheckedCreateWithoutApartmentInput> | ApartmentAttachmentCreateWithoutApartmentInput[] | ApartmentAttachmentUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: ApartmentAttachmentCreateOrConnectWithoutApartmentInput | ApartmentAttachmentCreateOrConnectWithoutApartmentInput[]
    createMany?: ApartmentAttachmentCreateManyApartmentInputEnvelope
    connect?: ApartmentAttachmentWhereUniqueInput | ApartmentAttachmentWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutApartmentInput = {
    create?: XOR<BookingCreateWithoutApartmentInput, BookingUncheckedCreateWithoutApartmentInput> | BookingCreateWithoutApartmentInput[] | BookingUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutApartmentInput | BookingCreateOrConnectWithoutApartmentInput[]
    createMany?: BookingCreateManyApartmentInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type ChecklistItemUncheckedCreateNestedManyWithoutApartmentInput = {
    create?: XOR<ChecklistItemCreateWithoutApartmentInput, ChecklistItemUncheckedCreateWithoutApartmentInput> | ChecklistItemCreateWithoutApartmentInput[] | ChecklistItemUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: ChecklistItemCreateOrConnectWithoutApartmentInput | ChecklistItemCreateOrConnectWithoutApartmentInput[]
    createMany?: ChecklistItemCreateManyApartmentInputEnvelope
    connect?: ChecklistItemWhereUniqueInput | ChecklistItemWhereUniqueInput[]
  }

  export type CleaningTaskUncheckedCreateNestedManyWithoutApartmentInput = {
    create?: XOR<CleaningTaskCreateWithoutApartmentInput, CleaningTaskUncheckedCreateWithoutApartmentInput> | CleaningTaskCreateWithoutApartmentInput[] | CleaningTaskUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutApartmentInput | CleaningTaskCreateOrConnectWithoutApartmentInput[]
    createMany?: CleaningTaskCreateManyApartmentInputEnvelope
    connect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
  }

  export type MaintenanceTicketUncheckedCreateNestedManyWithoutApartmentInput = {
    create?: XOR<MaintenanceTicketCreateWithoutApartmentInput, MaintenanceTicketUncheckedCreateWithoutApartmentInput> | MaintenanceTicketCreateWithoutApartmentInput[] | MaintenanceTicketUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutApartmentInput | MaintenanceTicketCreateOrConnectWithoutApartmentInput[]
    createMany?: MaintenanceTicketCreateManyApartmentInputEnvelope
    connect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
  }

  export type NotificationUncheckedCreateNestedManyWithoutApartmentInput = {
    create?: XOR<NotificationCreateWithoutApartmentInput, NotificationUncheckedCreateWithoutApartmentInput> | NotificationCreateWithoutApartmentInput[] | NotificationUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutApartmentInput | NotificationCreateOrConnectWithoutApartmentInput[]
    createMany?: NotificationCreateManyApartmentInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type AIAssistantMessageUncheckedCreateNestedManyWithoutApartmentInput = {
    create?: XOR<AIAssistantMessageCreateWithoutApartmentInput, AIAssistantMessageUncheckedCreateWithoutApartmentInput> | AIAssistantMessageCreateWithoutApartmentInput[] | AIAssistantMessageUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutApartmentInput | AIAssistantMessageCreateOrConnectWithoutApartmentInput[]
    createMany?: AIAssistantMessageCreateManyApartmentInputEnvelope
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
  }

  export type ApartmentAttachmentUncheckedCreateNestedManyWithoutApartmentInput = {
    create?: XOR<ApartmentAttachmentCreateWithoutApartmentInput, ApartmentAttachmentUncheckedCreateWithoutApartmentInput> | ApartmentAttachmentCreateWithoutApartmentInput[] | ApartmentAttachmentUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: ApartmentAttachmentCreateOrConnectWithoutApartmentInput | ApartmentAttachmentCreateOrConnectWithoutApartmentInput[]
    createMany?: ApartmentAttachmentCreateManyApartmentInputEnvelope
    connect?: ApartmentAttachmentWhereUniqueInput | ApartmentAttachmentWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BookingUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<BookingCreateWithoutApartmentInput, BookingUncheckedCreateWithoutApartmentInput> | BookingCreateWithoutApartmentInput[] | BookingUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutApartmentInput | BookingCreateOrConnectWithoutApartmentInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutApartmentInput | BookingUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: BookingCreateManyApartmentInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutApartmentInput | BookingUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutApartmentInput | BookingUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type ChecklistItemUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<ChecklistItemCreateWithoutApartmentInput, ChecklistItemUncheckedCreateWithoutApartmentInput> | ChecklistItemCreateWithoutApartmentInput[] | ChecklistItemUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: ChecklistItemCreateOrConnectWithoutApartmentInput | ChecklistItemCreateOrConnectWithoutApartmentInput[]
    upsert?: ChecklistItemUpsertWithWhereUniqueWithoutApartmentInput | ChecklistItemUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: ChecklistItemCreateManyApartmentInputEnvelope
    set?: ChecklistItemWhereUniqueInput | ChecklistItemWhereUniqueInput[]
    disconnect?: ChecklistItemWhereUniqueInput | ChecklistItemWhereUniqueInput[]
    delete?: ChecklistItemWhereUniqueInput | ChecklistItemWhereUniqueInput[]
    connect?: ChecklistItemWhereUniqueInput | ChecklistItemWhereUniqueInput[]
    update?: ChecklistItemUpdateWithWhereUniqueWithoutApartmentInput | ChecklistItemUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: ChecklistItemUpdateManyWithWhereWithoutApartmentInput | ChecklistItemUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: ChecklistItemScalarWhereInput | ChecklistItemScalarWhereInput[]
  }

  export type CleaningTaskUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<CleaningTaskCreateWithoutApartmentInput, CleaningTaskUncheckedCreateWithoutApartmentInput> | CleaningTaskCreateWithoutApartmentInput[] | CleaningTaskUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutApartmentInput | CleaningTaskCreateOrConnectWithoutApartmentInput[]
    upsert?: CleaningTaskUpsertWithWhereUniqueWithoutApartmentInput | CleaningTaskUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: CleaningTaskCreateManyApartmentInputEnvelope
    set?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    disconnect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    delete?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    connect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    update?: CleaningTaskUpdateWithWhereUniqueWithoutApartmentInput | CleaningTaskUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: CleaningTaskUpdateManyWithWhereWithoutApartmentInput | CleaningTaskUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: CleaningTaskScalarWhereInput | CleaningTaskScalarWhereInput[]
  }

  export type MaintenanceTicketUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<MaintenanceTicketCreateWithoutApartmentInput, MaintenanceTicketUncheckedCreateWithoutApartmentInput> | MaintenanceTicketCreateWithoutApartmentInput[] | MaintenanceTicketUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutApartmentInput | MaintenanceTicketCreateOrConnectWithoutApartmentInput[]
    upsert?: MaintenanceTicketUpsertWithWhereUniqueWithoutApartmentInput | MaintenanceTicketUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: MaintenanceTicketCreateManyApartmentInputEnvelope
    set?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    disconnect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    delete?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    connect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    update?: MaintenanceTicketUpdateWithWhereUniqueWithoutApartmentInput | MaintenanceTicketUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: MaintenanceTicketUpdateManyWithWhereWithoutApartmentInput | MaintenanceTicketUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: MaintenanceTicketScalarWhereInput | MaintenanceTicketScalarWhereInput[]
  }

  export type NotificationUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<NotificationCreateWithoutApartmentInput, NotificationUncheckedCreateWithoutApartmentInput> | NotificationCreateWithoutApartmentInput[] | NotificationUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutApartmentInput | NotificationCreateOrConnectWithoutApartmentInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutApartmentInput | NotificationUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: NotificationCreateManyApartmentInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutApartmentInput | NotificationUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutApartmentInput | NotificationUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type AIAssistantMessageUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<AIAssistantMessageCreateWithoutApartmentInput, AIAssistantMessageUncheckedCreateWithoutApartmentInput> | AIAssistantMessageCreateWithoutApartmentInput[] | AIAssistantMessageUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutApartmentInput | AIAssistantMessageCreateOrConnectWithoutApartmentInput[]
    upsert?: AIAssistantMessageUpsertWithWhereUniqueWithoutApartmentInput | AIAssistantMessageUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: AIAssistantMessageCreateManyApartmentInputEnvelope
    set?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    disconnect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    delete?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    update?: AIAssistantMessageUpdateWithWhereUniqueWithoutApartmentInput | AIAssistantMessageUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: AIAssistantMessageUpdateManyWithWhereWithoutApartmentInput | AIAssistantMessageUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: AIAssistantMessageScalarWhereInput | AIAssistantMessageScalarWhereInput[]
  }

  export type ApartmentAttachmentUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<ApartmentAttachmentCreateWithoutApartmentInput, ApartmentAttachmentUncheckedCreateWithoutApartmentInput> | ApartmentAttachmentCreateWithoutApartmentInput[] | ApartmentAttachmentUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: ApartmentAttachmentCreateOrConnectWithoutApartmentInput | ApartmentAttachmentCreateOrConnectWithoutApartmentInput[]
    upsert?: ApartmentAttachmentUpsertWithWhereUniqueWithoutApartmentInput | ApartmentAttachmentUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: ApartmentAttachmentCreateManyApartmentInputEnvelope
    set?: ApartmentAttachmentWhereUniqueInput | ApartmentAttachmentWhereUniqueInput[]
    disconnect?: ApartmentAttachmentWhereUniqueInput | ApartmentAttachmentWhereUniqueInput[]
    delete?: ApartmentAttachmentWhereUniqueInput | ApartmentAttachmentWhereUniqueInput[]
    connect?: ApartmentAttachmentWhereUniqueInput | ApartmentAttachmentWhereUniqueInput[]
    update?: ApartmentAttachmentUpdateWithWhereUniqueWithoutApartmentInput | ApartmentAttachmentUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: ApartmentAttachmentUpdateManyWithWhereWithoutApartmentInput | ApartmentAttachmentUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: ApartmentAttachmentScalarWhereInput | ApartmentAttachmentScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<BookingCreateWithoutApartmentInput, BookingUncheckedCreateWithoutApartmentInput> | BookingCreateWithoutApartmentInput[] | BookingUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutApartmentInput | BookingCreateOrConnectWithoutApartmentInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutApartmentInput | BookingUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: BookingCreateManyApartmentInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutApartmentInput | BookingUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutApartmentInput | BookingUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type ChecklistItemUncheckedUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<ChecklistItemCreateWithoutApartmentInput, ChecklistItemUncheckedCreateWithoutApartmentInput> | ChecklistItemCreateWithoutApartmentInput[] | ChecklistItemUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: ChecklistItemCreateOrConnectWithoutApartmentInput | ChecklistItemCreateOrConnectWithoutApartmentInput[]
    upsert?: ChecklistItemUpsertWithWhereUniqueWithoutApartmentInput | ChecklistItemUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: ChecklistItemCreateManyApartmentInputEnvelope
    set?: ChecklistItemWhereUniqueInput | ChecklistItemWhereUniqueInput[]
    disconnect?: ChecklistItemWhereUniqueInput | ChecklistItemWhereUniqueInput[]
    delete?: ChecklistItemWhereUniqueInput | ChecklistItemWhereUniqueInput[]
    connect?: ChecklistItemWhereUniqueInput | ChecklistItemWhereUniqueInput[]
    update?: ChecklistItemUpdateWithWhereUniqueWithoutApartmentInput | ChecklistItemUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: ChecklistItemUpdateManyWithWhereWithoutApartmentInput | ChecklistItemUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: ChecklistItemScalarWhereInput | ChecklistItemScalarWhereInput[]
  }

  export type CleaningTaskUncheckedUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<CleaningTaskCreateWithoutApartmentInput, CleaningTaskUncheckedCreateWithoutApartmentInput> | CleaningTaskCreateWithoutApartmentInput[] | CleaningTaskUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutApartmentInput | CleaningTaskCreateOrConnectWithoutApartmentInput[]
    upsert?: CleaningTaskUpsertWithWhereUniqueWithoutApartmentInput | CleaningTaskUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: CleaningTaskCreateManyApartmentInputEnvelope
    set?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    disconnect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    delete?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    connect?: CleaningTaskWhereUniqueInput | CleaningTaskWhereUniqueInput[]
    update?: CleaningTaskUpdateWithWhereUniqueWithoutApartmentInput | CleaningTaskUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: CleaningTaskUpdateManyWithWhereWithoutApartmentInput | CleaningTaskUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: CleaningTaskScalarWhereInput | CleaningTaskScalarWhereInput[]
  }

  export type MaintenanceTicketUncheckedUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<MaintenanceTicketCreateWithoutApartmentInput, MaintenanceTicketUncheckedCreateWithoutApartmentInput> | MaintenanceTicketCreateWithoutApartmentInput[] | MaintenanceTicketUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutApartmentInput | MaintenanceTicketCreateOrConnectWithoutApartmentInput[]
    upsert?: MaintenanceTicketUpsertWithWhereUniqueWithoutApartmentInput | MaintenanceTicketUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: MaintenanceTicketCreateManyApartmentInputEnvelope
    set?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    disconnect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    delete?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    connect?: MaintenanceTicketWhereUniqueInput | MaintenanceTicketWhereUniqueInput[]
    update?: MaintenanceTicketUpdateWithWhereUniqueWithoutApartmentInput | MaintenanceTicketUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: MaintenanceTicketUpdateManyWithWhereWithoutApartmentInput | MaintenanceTicketUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: MaintenanceTicketScalarWhereInput | MaintenanceTicketScalarWhereInput[]
  }

  export type NotificationUncheckedUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<NotificationCreateWithoutApartmentInput, NotificationUncheckedCreateWithoutApartmentInput> | NotificationCreateWithoutApartmentInput[] | NotificationUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutApartmentInput | NotificationCreateOrConnectWithoutApartmentInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutApartmentInput | NotificationUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: NotificationCreateManyApartmentInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutApartmentInput | NotificationUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutApartmentInput | NotificationUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type AIAssistantMessageUncheckedUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<AIAssistantMessageCreateWithoutApartmentInput, AIAssistantMessageUncheckedCreateWithoutApartmentInput> | AIAssistantMessageCreateWithoutApartmentInput[] | AIAssistantMessageUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutApartmentInput | AIAssistantMessageCreateOrConnectWithoutApartmentInput[]
    upsert?: AIAssistantMessageUpsertWithWhereUniqueWithoutApartmentInput | AIAssistantMessageUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: AIAssistantMessageCreateManyApartmentInputEnvelope
    set?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    disconnect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    delete?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    update?: AIAssistantMessageUpdateWithWhereUniqueWithoutApartmentInput | AIAssistantMessageUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: AIAssistantMessageUpdateManyWithWhereWithoutApartmentInput | AIAssistantMessageUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: AIAssistantMessageScalarWhereInput | AIAssistantMessageScalarWhereInput[]
  }

  export type ApartmentAttachmentUncheckedUpdateManyWithoutApartmentNestedInput = {
    create?: XOR<ApartmentAttachmentCreateWithoutApartmentInput, ApartmentAttachmentUncheckedCreateWithoutApartmentInput> | ApartmentAttachmentCreateWithoutApartmentInput[] | ApartmentAttachmentUncheckedCreateWithoutApartmentInput[]
    connectOrCreate?: ApartmentAttachmentCreateOrConnectWithoutApartmentInput | ApartmentAttachmentCreateOrConnectWithoutApartmentInput[]
    upsert?: ApartmentAttachmentUpsertWithWhereUniqueWithoutApartmentInput | ApartmentAttachmentUpsertWithWhereUniqueWithoutApartmentInput[]
    createMany?: ApartmentAttachmentCreateManyApartmentInputEnvelope
    set?: ApartmentAttachmentWhereUniqueInput | ApartmentAttachmentWhereUniqueInput[]
    disconnect?: ApartmentAttachmentWhereUniqueInput | ApartmentAttachmentWhereUniqueInput[]
    delete?: ApartmentAttachmentWhereUniqueInput | ApartmentAttachmentWhereUniqueInput[]
    connect?: ApartmentAttachmentWhereUniqueInput | ApartmentAttachmentWhereUniqueInput[]
    update?: ApartmentAttachmentUpdateWithWhereUniqueWithoutApartmentInput | ApartmentAttachmentUpdateWithWhereUniqueWithoutApartmentInput[]
    updateMany?: ApartmentAttachmentUpdateManyWithWhereWithoutApartmentInput | ApartmentAttachmentUpdateManyWithWhereWithoutApartmentInput[]
    deleteMany?: ApartmentAttachmentScalarWhereInput | ApartmentAttachmentScalarWhereInput[]
  }

  export type ApartmentCreateNestedOneWithoutChecklistItemsInput = {
    create?: XOR<ApartmentCreateWithoutChecklistItemsInput, ApartmentUncheckedCreateWithoutChecklistItemsInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutChecklistItemsInput
    connect?: ApartmentWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ApartmentUpdateOneRequiredWithoutChecklistItemsNestedInput = {
    create?: XOR<ApartmentCreateWithoutChecklistItemsInput, ApartmentUncheckedCreateWithoutChecklistItemsInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutChecklistItemsInput
    upsert?: ApartmentUpsertWithoutChecklistItemsInput
    connect?: ApartmentWhereUniqueInput
    update?: XOR<XOR<ApartmentUpdateToOneWithWhereWithoutChecklistItemsInput, ApartmentUpdateWithoutChecklistItemsInput>, ApartmentUncheckedUpdateWithoutChecklistItemsInput>
  }

  export type ApartmentCreateNestedOneWithoutNotificationsInput = {
    create?: XOR<ApartmentCreateWithoutNotificationsInput, ApartmentUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutNotificationsInput
    connect?: ApartmentWhereUniqueInput
  }

  export type ApartmentUpdateOneWithoutNotificationsNestedInput = {
    create?: XOR<ApartmentCreateWithoutNotificationsInput, ApartmentUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutNotificationsInput
    upsert?: ApartmentUpsertWithoutNotificationsInput
    disconnect?: ApartmentWhereInput | boolean
    delete?: ApartmentWhereInput | boolean
    connect?: ApartmentWhereUniqueInput
    update?: XOR<XOR<ApartmentUpdateToOneWithWhereWithoutNotificationsInput, ApartmentUpdateWithoutNotificationsInput>, ApartmentUncheckedUpdateWithoutNotificationsInput>
  }

  export type ApartmentCreateNestedOneWithoutBookingsInput = {
    create?: XOR<ApartmentCreateWithoutBookingsInput, ApartmentUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutBookingsInput
    connect?: ApartmentWhereUniqueInput
  }

  export type CleaningTaskCreateNestedOneWithoutBookingInput = {
    create?: XOR<CleaningTaskCreateWithoutBookingInput, CleaningTaskUncheckedCreateWithoutBookingInput>
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutBookingInput
    connect?: CleaningTaskWhereUniqueInput
  }

  export type CleaningTaskUncheckedCreateNestedOneWithoutBookingInput = {
    create?: XOR<CleaningTaskCreateWithoutBookingInput, CleaningTaskUncheckedCreateWithoutBookingInput>
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutBookingInput
    connect?: CleaningTaskWhereUniqueInput
  }

  export type ApartmentUpdateOneRequiredWithoutBookingsNestedInput = {
    create?: XOR<ApartmentCreateWithoutBookingsInput, ApartmentUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutBookingsInput
    upsert?: ApartmentUpsertWithoutBookingsInput
    connect?: ApartmentWhereUniqueInput
    update?: XOR<XOR<ApartmentUpdateToOneWithWhereWithoutBookingsInput, ApartmentUpdateWithoutBookingsInput>, ApartmentUncheckedUpdateWithoutBookingsInput>
  }

  export type CleaningTaskUpdateOneWithoutBookingNestedInput = {
    create?: XOR<CleaningTaskCreateWithoutBookingInput, CleaningTaskUncheckedCreateWithoutBookingInput>
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutBookingInput
    upsert?: CleaningTaskUpsertWithoutBookingInput
    disconnect?: CleaningTaskWhereInput | boolean
    delete?: CleaningTaskWhereInput | boolean
    connect?: CleaningTaskWhereUniqueInput
    update?: XOR<XOR<CleaningTaskUpdateToOneWithWhereWithoutBookingInput, CleaningTaskUpdateWithoutBookingInput>, CleaningTaskUncheckedUpdateWithoutBookingInput>
  }

  export type CleaningTaskUncheckedUpdateOneWithoutBookingNestedInput = {
    create?: XOR<CleaningTaskCreateWithoutBookingInput, CleaningTaskUncheckedCreateWithoutBookingInput>
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutBookingInput
    upsert?: CleaningTaskUpsertWithoutBookingInput
    disconnect?: CleaningTaskWhereInput | boolean
    delete?: CleaningTaskWhereInput | boolean
    connect?: CleaningTaskWhereUniqueInput
    update?: XOR<XOR<CleaningTaskUpdateToOneWithWhereWithoutBookingInput, CleaningTaskUpdateWithoutBookingInput>, CleaningTaskUncheckedUpdateWithoutBookingInput>
  }

  export type BookingCreateNestedOneWithoutCleaningTaskInput = {
    create?: XOR<BookingCreateWithoutCleaningTaskInput, BookingUncheckedCreateWithoutCleaningTaskInput>
    connectOrCreate?: BookingCreateOrConnectWithoutCleaningTaskInput
    connect?: BookingWhereUniqueInput
  }

  export type ApartmentCreateNestedOneWithoutCleaningTasksInput = {
    create?: XOR<ApartmentCreateWithoutCleaningTasksInput, ApartmentUncheckedCreateWithoutCleaningTasksInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutCleaningTasksInput
    connect?: ApartmentWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutCleaningTasksInput = {
    create?: XOR<UserCreateWithoutCleaningTasksInput, UserUncheckedCreateWithoutCleaningTasksInput>
    connectOrCreate?: UserCreateOrConnectWithoutCleaningTasksInput
    connect?: UserWhereUniqueInput
  }

  export type CleaningTaskMessageCreateNestedManyWithoutCleaningTaskInput = {
    create?: XOR<CleaningTaskMessageCreateWithoutCleaningTaskInput, CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput> | CleaningTaskMessageCreateWithoutCleaningTaskInput[] | CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: CleaningTaskMessageCreateOrConnectWithoutCleaningTaskInput | CleaningTaskMessageCreateOrConnectWithoutCleaningTaskInput[]
    createMany?: CleaningTaskMessageCreateManyCleaningTaskInputEnvelope
    connect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
  }

  export type AttachmentCreateNestedManyWithoutCleaningTaskInput = {
    create?: XOR<AttachmentCreateWithoutCleaningTaskInput, AttachmentUncheckedCreateWithoutCleaningTaskInput> | AttachmentCreateWithoutCleaningTaskInput[] | AttachmentUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutCleaningTaskInput | AttachmentCreateOrConnectWithoutCleaningTaskInput[]
    createMany?: AttachmentCreateManyCleaningTaskInputEnvelope
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
  }

  export type AIAssistantMessageCreateNestedManyWithoutCleaningTaskInput = {
    create?: XOR<AIAssistantMessageCreateWithoutCleaningTaskInput, AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput> | AIAssistantMessageCreateWithoutCleaningTaskInput[] | AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutCleaningTaskInput | AIAssistantMessageCreateOrConnectWithoutCleaningTaskInput[]
    createMany?: AIAssistantMessageCreateManyCleaningTaskInputEnvelope
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
  }

  export type CleaningTaskMessageUncheckedCreateNestedManyWithoutCleaningTaskInput = {
    create?: XOR<CleaningTaskMessageCreateWithoutCleaningTaskInput, CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput> | CleaningTaskMessageCreateWithoutCleaningTaskInput[] | CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: CleaningTaskMessageCreateOrConnectWithoutCleaningTaskInput | CleaningTaskMessageCreateOrConnectWithoutCleaningTaskInput[]
    createMany?: CleaningTaskMessageCreateManyCleaningTaskInputEnvelope
    connect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
  }

  export type AttachmentUncheckedCreateNestedManyWithoutCleaningTaskInput = {
    create?: XOR<AttachmentCreateWithoutCleaningTaskInput, AttachmentUncheckedCreateWithoutCleaningTaskInput> | AttachmentCreateWithoutCleaningTaskInput[] | AttachmentUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutCleaningTaskInput | AttachmentCreateOrConnectWithoutCleaningTaskInput[]
    createMany?: AttachmentCreateManyCleaningTaskInputEnvelope
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
  }

  export type AIAssistantMessageUncheckedCreateNestedManyWithoutCleaningTaskInput = {
    create?: XOR<AIAssistantMessageCreateWithoutCleaningTaskInput, AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput> | AIAssistantMessageCreateWithoutCleaningTaskInput[] | AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutCleaningTaskInput | AIAssistantMessageCreateOrConnectWithoutCleaningTaskInput[]
    createMany?: AIAssistantMessageCreateManyCleaningTaskInputEnvelope
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
  }

  export type BookingUpdateOneWithoutCleaningTaskNestedInput = {
    create?: XOR<BookingCreateWithoutCleaningTaskInput, BookingUncheckedCreateWithoutCleaningTaskInput>
    connectOrCreate?: BookingCreateOrConnectWithoutCleaningTaskInput
    upsert?: BookingUpsertWithoutCleaningTaskInput
    disconnect?: BookingWhereInput | boolean
    delete?: BookingWhereInput | boolean
    connect?: BookingWhereUniqueInput
    update?: XOR<XOR<BookingUpdateToOneWithWhereWithoutCleaningTaskInput, BookingUpdateWithoutCleaningTaskInput>, BookingUncheckedUpdateWithoutCleaningTaskInput>
  }

  export type ApartmentUpdateOneRequiredWithoutCleaningTasksNestedInput = {
    create?: XOR<ApartmentCreateWithoutCleaningTasksInput, ApartmentUncheckedCreateWithoutCleaningTasksInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutCleaningTasksInput
    upsert?: ApartmentUpsertWithoutCleaningTasksInput
    connect?: ApartmentWhereUniqueInput
    update?: XOR<XOR<ApartmentUpdateToOneWithWhereWithoutCleaningTasksInput, ApartmentUpdateWithoutCleaningTasksInput>, ApartmentUncheckedUpdateWithoutCleaningTasksInput>
  }

  export type UserUpdateOneWithoutCleaningTasksNestedInput = {
    create?: XOR<UserCreateWithoutCleaningTasksInput, UserUncheckedCreateWithoutCleaningTasksInput>
    connectOrCreate?: UserCreateOrConnectWithoutCleaningTasksInput
    upsert?: UserUpsertWithoutCleaningTasksInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCleaningTasksInput, UserUpdateWithoutCleaningTasksInput>, UserUncheckedUpdateWithoutCleaningTasksInput>
  }

  export type CleaningTaskMessageUpdateManyWithoutCleaningTaskNestedInput = {
    create?: XOR<CleaningTaskMessageCreateWithoutCleaningTaskInput, CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput> | CleaningTaskMessageCreateWithoutCleaningTaskInput[] | CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: CleaningTaskMessageCreateOrConnectWithoutCleaningTaskInput | CleaningTaskMessageCreateOrConnectWithoutCleaningTaskInput[]
    upsert?: CleaningTaskMessageUpsertWithWhereUniqueWithoutCleaningTaskInput | CleaningTaskMessageUpsertWithWhereUniqueWithoutCleaningTaskInput[]
    createMany?: CleaningTaskMessageCreateManyCleaningTaskInputEnvelope
    set?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    disconnect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    delete?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    connect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    update?: CleaningTaskMessageUpdateWithWhereUniqueWithoutCleaningTaskInput | CleaningTaskMessageUpdateWithWhereUniqueWithoutCleaningTaskInput[]
    updateMany?: CleaningTaskMessageUpdateManyWithWhereWithoutCleaningTaskInput | CleaningTaskMessageUpdateManyWithWhereWithoutCleaningTaskInput[]
    deleteMany?: CleaningTaskMessageScalarWhereInput | CleaningTaskMessageScalarWhereInput[]
  }

  export type AttachmentUpdateManyWithoutCleaningTaskNestedInput = {
    create?: XOR<AttachmentCreateWithoutCleaningTaskInput, AttachmentUncheckedCreateWithoutCleaningTaskInput> | AttachmentCreateWithoutCleaningTaskInput[] | AttachmentUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutCleaningTaskInput | AttachmentCreateOrConnectWithoutCleaningTaskInput[]
    upsert?: AttachmentUpsertWithWhereUniqueWithoutCleaningTaskInput | AttachmentUpsertWithWhereUniqueWithoutCleaningTaskInput[]
    createMany?: AttachmentCreateManyCleaningTaskInputEnvelope
    set?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    disconnect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    delete?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    update?: AttachmentUpdateWithWhereUniqueWithoutCleaningTaskInput | AttachmentUpdateWithWhereUniqueWithoutCleaningTaskInput[]
    updateMany?: AttachmentUpdateManyWithWhereWithoutCleaningTaskInput | AttachmentUpdateManyWithWhereWithoutCleaningTaskInput[]
    deleteMany?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
  }

  export type AIAssistantMessageUpdateManyWithoutCleaningTaskNestedInput = {
    create?: XOR<AIAssistantMessageCreateWithoutCleaningTaskInput, AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput> | AIAssistantMessageCreateWithoutCleaningTaskInput[] | AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutCleaningTaskInput | AIAssistantMessageCreateOrConnectWithoutCleaningTaskInput[]
    upsert?: AIAssistantMessageUpsertWithWhereUniqueWithoutCleaningTaskInput | AIAssistantMessageUpsertWithWhereUniqueWithoutCleaningTaskInput[]
    createMany?: AIAssistantMessageCreateManyCleaningTaskInputEnvelope
    set?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    disconnect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    delete?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    update?: AIAssistantMessageUpdateWithWhereUniqueWithoutCleaningTaskInput | AIAssistantMessageUpdateWithWhereUniqueWithoutCleaningTaskInput[]
    updateMany?: AIAssistantMessageUpdateManyWithWhereWithoutCleaningTaskInput | AIAssistantMessageUpdateManyWithWhereWithoutCleaningTaskInput[]
    deleteMany?: AIAssistantMessageScalarWhereInput | AIAssistantMessageScalarWhereInput[]
  }

  export type CleaningTaskMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput = {
    create?: XOR<CleaningTaskMessageCreateWithoutCleaningTaskInput, CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput> | CleaningTaskMessageCreateWithoutCleaningTaskInput[] | CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: CleaningTaskMessageCreateOrConnectWithoutCleaningTaskInput | CleaningTaskMessageCreateOrConnectWithoutCleaningTaskInput[]
    upsert?: CleaningTaskMessageUpsertWithWhereUniqueWithoutCleaningTaskInput | CleaningTaskMessageUpsertWithWhereUniqueWithoutCleaningTaskInput[]
    createMany?: CleaningTaskMessageCreateManyCleaningTaskInputEnvelope
    set?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    disconnect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    delete?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    connect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    update?: CleaningTaskMessageUpdateWithWhereUniqueWithoutCleaningTaskInput | CleaningTaskMessageUpdateWithWhereUniqueWithoutCleaningTaskInput[]
    updateMany?: CleaningTaskMessageUpdateManyWithWhereWithoutCleaningTaskInput | CleaningTaskMessageUpdateManyWithWhereWithoutCleaningTaskInput[]
    deleteMany?: CleaningTaskMessageScalarWhereInput | CleaningTaskMessageScalarWhereInput[]
  }

  export type AttachmentUncheckedUpdateManyWithoutCleaningTaskNestedInput = {
    create?: XOR<AttachmentCreateWithoutCleaningTaskInput, AttachmentUncheckedCreateWithoutCleaningTaskInput> | AttachmentCreateWithoutCleaningTaskInput[] | AttachmentUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutCleaningTaskInput | AttachmentCreateOrConnectWithoutCleaningTaskInput[]
    upsert?: AttachmentUpsertWithWhereUniqueWithoutCleaningTaskInput | AttachmentUpsertWithWhereUniqueWithoutCleaningTaskInput[]
    createMany?: AttachmentCreateManyCleaningTaskInputEnvelope
    set?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    disconnect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    delete?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    update?: AttachmentUpdateWithWhereUniqueWithoutCleaningTaskInput | AttachmentUpdateWithWhereUniqueWithoutCleaningTaskInput[]
    updateMany?: AttachmentUpdateManyWithWhereWithoutCleaningTaskInput | AttachmentUpdateManyWithWhereWithoutCleaningTaskInput[]
    deleteMany?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
  }

  export type AIAssistantMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput = {
    create?: XOR<AIAssistantMessageCreateWithoutCleaningTaskInput, AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput> | AIAssistantMessageCreateWithoutCleaningTaskInput[] | AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutCleaningTaskInput | AIAssistantMessageCreateOrConnectWithoutCleaningTaskInput[]
    upsert?: AIAssistantMessageUpsertWithWhereUniqueWithoutCleaningTaskInput | AIAssistantMessageUpsertWithWhereUniqueWithoutCleaningTaskInput[]
    createMany?: AIAssistantMessageCreateManyCleaningTaskInputEnvelope
    set?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    disconnect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    delete?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    update?: AIAssistantMessageUpdateWithWhereUniqueWithoutCleaningTaskInput | AIAssistantMessageUpdateWithWhereUniqueWithoutCleaningTaskInput[]
    updateMany?: AIAssistantMessageUpdateManyWithWhereWithoutCleaningTaskInput | AIAssistantMessageUpdateManyWithWhereWithoutCleaningTaskInput[]
    deleteMany?: AIAssistantMessageScalarWhereInput | AIAssistantMessageScalarWhereInput[]
  }

  export type ApartmentCreateNestedOneWithoutMaintenanceTicketsInput = {
    create?: XOR<ApartmentCreateWithoutMaintenanceTicketsInput, ApartmentUncheckedCreateWithoutMaintenanceTicketsInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutMaintenanceTicketsInput
    connect?: ApartmentWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutMaintenanceTicketsInput = {
    create?: XOR<UserCreateWithoutMaintenanceTicketsInput, UserUncheckedCreateWithoutMaintenanceTicketsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMaintenanceTicketsInput
    connect?: UserWhereUniqueInput
  }

  export type AttachmentCreateNestedManyWithoutMaintenanceTicketInput = {
    create?: XOR<AttachmentCreateWithoutMaintenanceTicketInput, AttachmentUncheckedCreateWithoutMaintenanceTicketInput> | AttachmentCreateWithoutMaintenanceTicketInput[] | AttachmentUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutMaintenanceTicketInput | AttachmentCreateOrConnectWithoutMaintenanceTicketInput[]
    createMany?: AttachmentCreateManyMaintenanceTicketInputEnvelope
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
  }

  export type MessageCreateNestedManyWithoutMaintenanceTicketInput = {
    create?: XOR<MessageCreateWithoutMaintenanceTicketInput, MessageUncheckedCreateWithoutMaintenanceTicketInput> | MessageCreateWithoutMaintenanceTicketInput[] | MessageUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutMaintenanceTicketInput | MessageCreateOrConnectWithoutMaintenanceTicketInput[]
    createMany?: MessageCreateManyMaintenanceTicketInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type AIAssistantMessageCreateNestedManyWithoutMaintenanceTicketInput = {
    create?: XOR<AIAssistantMessageCreateWithoutMaintenanceTicketInput, AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput> | AIAssistantMessageCreateWithoutMaintenanceTicketInput[] | AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutMaintenanceTicketInput | AIAssistantMessageCreateOrConnectWithoutMaintenanceTicketInput[]
    createMany?: AIAssistantMessageCreateManyMaintenanceTicketInputEnvelope
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
  }

  export type AttachmentUncheckedCreateNestedManyWithoutMaintenanceTicketInput = {
    create?: XOR<AttachmentCreateWithoutMaintenanceTicketInput, AttachmentUncheckedCreateWithoutMaintenanceTicketInput> | AttachmentCreateWithoutMaintenanceTicketInput[] | AttachmentUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutMaintenanceTicketInput | AttachmentCreateOrConnectWithoutMaintenanceTicketInput[]
    createMany?: AttachmentCreateManyMaintenanceTicketInputEnvelope
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
  }

  export type MessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput = {
    create?: XOR<MessageCreateWithoutMaintenanceTicketInput, MessageUncheckedCreateWithoutMaintenanceTicketInput> | MessageCreateWithoutMaintenanceTicketInput[] | MessageUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutMaintenanceTicketInput | MessageCreateOrConnectWithoutMaintenanceTicketInput[]
    createMany?: MessageCreateManyMaintenanceTicketInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type AIAssistantMessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput = {
    create?: XOR<AIAssistantMessageCreateWithoutMaintenanceTicketInput, AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput> | AIAssistantMessageCreateWithoutMaintenanceTicketInput[] | AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutMaintenanceTicketInput | AIAssistantMessageCreateOrConnectWithoutMaintenanceTicketInput[]
    createMany?: AIAssistantMessageCreateManyMaintenanceTicketInputEnvelope
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
  }

  export type ApartmentUpdateOneRequiredWithoutMaintenanceTicketsNestedInput = {
    create?: XOR<ApartmentCreateWithoutMaintenanceTicketsInput, ApartmentUncheckedCreateWithoutMaintenanceTicketsInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutMaintenanceTicketsInput
    upsert?: ApartmentUpsertWithoutMaintenanceTicketsInput
    connect?: ApartmentWhereUniqueInput
    update?: XOR<XOR<ApartmentUpdateToOneWithWhereWithoutMaintenanceTicketsInput, ApartmentUpdateWithoutMaintenanceTicketsInput>, ApartmentUncheckedUpdateWithoutMaintenanceTicketsInput>
  }

  export type UserUpdateOneWithoutMaintenanceTicketsNestedInput = {
    create?: XOR<UserCreateWithoutMaintenanceTicketsInput, UserUncheckedCreateWithoutMaintenanceTicketsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMaintenanceTicketsInput
    upsert?: UserUpsertWithoutMaintenanceTicketsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMaintenanceTicketsInput, UserUpdateWithoutMaintenanceTicketsInput>, UserUncheckedUpdateWithoutMaintenanceTicketsInput>
  }

  export type AttachmentUpdateManyWithoutMaintenanceTicketNestedInput = {
    create?: XOR<AttachmentCreateWithoutMaintenanceTicketInput, AttachmentUncheckedCreateWithoutMaintenanceTicketInput> | AttachmentCreateWithoutMaintenanceTicketInput[] | AttachmentUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutMaintenanceTicketInput | AttachmentCreateOrConnectWithoutMaintenanceTicketInput[]
    upsert?: AttachmentUpsertWithWhereUniqueWithoutMaintenanceTicketInput | AttachmentUpsertWithWhereUniqueWithoutMaintenanceTicketInput[]
    createMany?: AttachmentCreateManyMaintenanceTicketInputEnvelope
    set?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    disconnect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    delete?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    update?: AttachmentUpdateWithWhereUniqueWithoutMaintenanceTicketInput | AttachmentUpdateWithWhereUniqueWithoutMaintenanceTicketInput[]
    updateMany?: AttachmentUpdateManyWithWhereWithoutMaintenanceTicketInput | AttachmentUpdateManyWithWhereWithoutMaintenanceTicketInput[]
    deleteMany?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
  }

  export type MessageUpdateManyWithoutMaintenanceTicketNestedInput = {
    create?: XOR<MessageCreateWithoutMaintenanceTicketInput, MessageUncheckedCreateWithoutMaintenanceTicketInput> | MessageCreateWithoutMaintenanceTicketInput[] | MessageUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutMaintenanceTicketInput | MessageCreateOrConnectWithoutMaintenanceTicketInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutMaintenanceTicketInput | MessageUpsertWithWhereUniqueWithoutMaintenanceTicketInput[]
    createMany?: MessageCreateManyMaintenanceTicketInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutMaintenanceTicketInput | MessageUpdateWithWhereUniqueWithoutMaintenanceTicketInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutMaintenanceTicketInput | MessageUpdateManyWithWhereWithoutMaintenanceTicketInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type AIAssistantMessageUpdateManyWithoutMaintenanceTicketNestedInput = {
    create?: XOR<AIAssistantMessageCreateWithoutMaintenanceTicketInput, AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput> | AIAssistantMessageCreateWithoutMaintenanceTicketInput[] | AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutMaintenanceTicketInput | AIAssistantMessageCreateOrConnectWithoutMaintenanceTicketInput[]
    upsert?: AIAssistantMessageUpsertWithWhereUniqueWithoutMaintenanceTicketInput | AIAssistantMessageUpsertWithWhereUniqueWithoutMaintenanceTicketInput[]
    createMany?: AIAssistantMessageCreateManyMaintenanceTicketInputEnvelope
    set?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    disconnect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    delete?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    update?: AIAssistantMessageUpdateWithWhereUniqueWithoutMaintenanceTicketInput | AIAssistantMessageUpdateWithWhereUniqueWithoutMaintenanceTicketInput[]
    updateMany?: AIAssistantMessageUpdateManyWithWhereWithoutMaintenanceTicketInput | AIAssistantMessageUpdateManyWithWhereWithoutMaintenanceTicketInput[]
    deleteMany?: AIAssistantMessageScalarWhereInput | AIAssistantMessageScalarWhereInput[]
  }

  export type AttachmentUncheckedUpdateManyWithoutMaintenanceTicketNestedInput = {
    create?: XOR<AttachmentCreateWithoutMaintenanceTicketInput, AttachmentUncheckedCreateWithoutMaintenanceTicketInput> | AttachmentCreateWithoutMaintenanceTicketInput[] | AttachmentUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutMaintenanceTicketInput | AttachmentCreateOrConnectWithoutMaintenanceTicketInput[]
    upsert?: AttachmentUpsertWithWhereUniqueWithoutMaintenanceTicketInput | AttachmentUpsertWithWhereUniqueWithoutMaintenanceTicketInput[]
    createMany?: AttachmentCreateManyMaintenanceTicketInputEnvelope
    set?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    disconnect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    delete?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    update?: AttachmentUpdateWithWhereUniqueWithoutMaintenanceTicketInput | AttachmentUpdateWithWhereUniqueWithoutMaintenanceTicketInput[]
    updateMany?: AttachmentUpdateManyWithWhereWithoutMaintenanceTicketInput | AttachmentUpdateManyWithWhereWithoutMaintenanceTicketInput[]
    deleteMany?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
  }

  export type MessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput = {
    create?: XOR<MessageCreateWithoutMaintenanceTicketInput, MessageUncheckedCreateWithoutMaintenanceTicketInput> | MessageCreateWithoutMaintenanceTicketInput[] | MessageUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutMaintenanceTicketInput | MessageCreateOrConnectWithoutMaintenanceTicketInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutMaintenanceTicketInput | MessageUpsertWithWhereUniqueWithoutMaintenanceTicketInput[]
    createMany?: MessageCreateManyMaintenanceTicketInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutMaintenanceTicketInput | MessageUpdateWithWhereUniqueWithoutMaintenanceTicketInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutMaintenanceTicketInput | MessageUpdateManyWithWhereWithoutMaintenanceTicketInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type AIAssistantMessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput = {
    create?: XOR<AIAssistantMessageCreateWithoutMaintenanceTicketInput, AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput> | AIAssistantMessageCreateWithoutMaintenanceTicketInput[] | AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput[]
    connectOrCreate?: AIAssistantMessageCreateOrConnectWithoutMaintenanceTicketInput | AIAssistantMessageCreateOrConnectWithoutMaintenanceTicketInput[]
    upsert?: AIAssistantMessageUpsertWithWhereUniqueWithoutMaintenanceTicketInput | AIAssistantMessageUpsertWithWhereUniqueWithoutMaintenanceTicketInput[]
    createMany?: AIAssistantMessageCreateManyMaintenanceTicketInputEnvelope
    set?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    disconnect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    delete?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    connect?: AIAssistantMessageWhereUniqueInput | AIAssistantMessageWhereUniqueInput[]
    update?: AIAssistantMessageUpdateWithWhereUniqueWithoutMaintenanceTicketInput | AIAssistantMessageUpdateWithWhereUniqueWithoutMaintenanceTicketInput[]
    updateMany?: AIAssistantMessageUpdateManyWithWhereWithoutMaintenanceTicketInput | AIAssistantMessageUpdateManyWithWhereWithoutMaintenanceTicketInput[]
    deleteMany?: AIAssistantMessageScalarWhereInput | AIAssistantMessageScalarWhereInput[]
  }

  export type ApartmentCreateNestedOneWithoutAiAssistantMessagesInput = {
    create?: XOR<ApartmentCreateWithoutAiAssistantMessagesInput, ApartmentUncheckedCreateWithoutAiAssistantMessagesInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutAiAssistantMessagesInput
    connect?: ApartmentWhereUniqueInput
  }

  export type CleaningTaskCreateNestedOneWithoutAiAssistantMessagesInput = {
    create?: XOR<CleaningTaskCreateWithoutAiAssistantMessagesInput, CleaningTaskUncheckedCreateWithoutAiAssistantMessagesInput>
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutAiAssistantMessagesInput
    connect?: CleaningTaskWhereUniqueInput
  }

  export type MaintenanceTicketCreateNestedOneWithoutAiAssistantMessagesInput = {
    create?: XOR<MaintenanceTicketCreateWithoutAiAssistantMessagesInput, MaintenanceTicketUncheckedCreateWithoutAiAssistantMessagesInput>
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutAiAssistantMessagesInput
    connect?: MaintenanceTicketWhereUniqueInput
  }

  export type EnumAIAssistantMessageRoleFieldUpdateOperationsInput = {
    set?: $Enums.AIAssistantMessageRole
  }

  export type ApartmentUpdateOneWithoutAiAssistantMessagesNestedInput = {
    create?: XOR<ApartmentCreateWithoutAiAssistantMessagesInput, ApartmentUncheckedCreateWithoutAiAssistantMessagesInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutAiAssistantMessagesInput
    upsert?: ApartmentUpsertWithoutAiAssistantMessagesInput
    disconnect?: ApartmentWhereInput | boolean
    delete?: ApartmentWhereInput | boolean
    connect?: ApartmentWhereUniqueInput
    update?: XOR<XOR<ApartmentUpdateToOneWithWhereWithoutAiAssistantMessagesInput, ApartmentUpdateWithoutAiAssistantMessagesInput>, ApartmentUncheckedUpdateWithoutAiAssistantMessagesInput>
  }

  export type CleaningTaskUpdateOneWithoutAiAssistantMessagesNestedInput = {
    create?: XOR<CleaningTaskCreateWithoutAiAssistantMessagesInput, CleaningTaskUncheckedCreateWithoutAiAssistantMessagesInput>
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutAiAssistantMessagesInput
    upsert?: CleaningTaskUpsertWithoutAiAssistantMessagesInput
    disconnect?: CleaningTaskWhereInput | boolean
    delete?: CleaningTaskWhereInput | boolean
    connect?: CleaningTaskWhereUniqueInput
    update?: XOR<XOR<CleaningTaskUpdateToOneWithWhereWithoutAiAssistantMessagesInput, CleaningTaskUpdateWithoutAiAssistantMessagesInput>, CleaningTaskUncheckedUpdateWithoutAiAssistantMessagesInput>
  }

  export type MaintenanceTicketUpdateOneWithoutAiAssistantMessagesNestedInput = {
    create?: XOR<MaintenanceTicketCreateWithoutAiAssistantMessagesInput, MaintenanceTicketUncheckedCreateWithoutAiAssistantMessagesInput>
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutAiAssistantMessagesInput
    upsert?: MaintenanceTicketUpsertWithoutAiAssistantMessagesInput
    disconnect?: MaintenanceTicketWhereInput | boolean
    delete?: MaintenanceTicketWhereInput | boolean
    connect?: MaintenanceTicketWhereUniqueInput
    update?: XOR<XOR<MaintenanceTicketUpdateToOneWithWhereWithoutAiAssistantMessagesInput, MaintenanceTicketUpdateWithoutAiAssistantMessagesInput>, MaintenanceTicketUncheckedUpdateWithoutAiAssistantMessagesInput>
  }

  export type MaintenanceTicketCreateNestedOneWithoutAttachmentsInput = {
    create?: XOR<MaintenanceTicketCreateWithoutAttachmentsInput, MaintenanceTicketUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutAttachmentsInput
    connect?: MaintenanceTicketWhereUniqueInput
  }

  export type CleaningTaskCreateNestedOneWithoutAttachmentsInput = {
    create?: XOR<CleaningTaskCreateWithoutAttachmentsInput, CleaningTaskUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutAttachmentsInput
    connect?: CleaningTaskWhereUniqueInput
  }

  export type MessageCreateNestedManyWithoutAttachmentInput = {
    create?: XOR<MessageCreateWithoutAttachmentInput, MessageUncheckedCreateWithoutAttachmentInput> | MessageCreateWithoutAttachmentInput[] | MessageUncheckedCreateWithoutAttachmentInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutAttachmentInput | MessageCreateOrConnectWithoutAttachmentInput[]
    createMany?: MessageCreateManyAttachmentInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type CleaningTaskMessageCreateNestedManyWithoutAttachmentInput = {
    create?: XOR<CleaningTaskMessageCreateWithoutAttachmentInput, CleaningTaskMessageUncheckedCreateWithoutAttachmentInput> | CleaningTaskMessageCreateWithoutAttachmentInput[] | CleaningTaskMessageUncheckedCreateWithoutAttachmentInput[]
    connectOrCreate?: CleaningTaskMessageCreateOrConnectWithoutAttachmentInput | CleaningTaskMessageCreateOrConnectWithoutAttachmentInput[]
    createMany?: CleaningTaskMessageCreateManyAttachmentInputEnvelope
    connect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
  }

  export type MessageUncheckedCreateNestedManyWithoutAttachmentInput = {
    create?: XOR<MessageCreateWithoutAttachmentInput, MessageUncheckedCreateWithoutAttachmentInput> | MessageCreateWithoutAttachmentInput[] | MessageUncheckedCreateWithoutAttachmentInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutAttachmentInput | MessageCreateOrConnectWithoutAttachmentInput[]
    createMany?: MessageCreateManyAttachmentInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type CleaningTaskMessageUncheckedCreateNestedManyWithoutAttachmentInput = {
    create?: XOR<CleaningTaskMessageCreateWithoutAttachmentInput, CleaningTaskMessageUncheckedCreateWithoutAttachmentInput> | CleaningTaskMessageCreateWithoutAttachmentInput[] | CleaningTaskMessageUncheckedCreateWithoutAttachmentInput[]
    connectOrCreate?: CleaningTaskMessageCreateOrConnectWithoutAttachmentInput | CleaningTaskMessageCreateOrConnectWithoutAttachmentInput[]
    createMany?: CleaningTaskMessageCreateManyAttachmentInputEnvelope
    connect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
  }

  export type MaintenanceTicketUpdateOneWithoutAttachmentsNestedInput = {
    create?: XOR<MaintenanceTicketCreateWithoutAttachmentsInput, MaintenanceTicketUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutAttachmentsInput
    upsert?: MaintenanceTicketUpsertWithoutAttachmentsInput
    disconnect?: MaintenanceTicketWhereInput | boolean
    delete?: MaintenanceTicketWhereInput | boolean
    connect?: MaintenanceTicketWhereUniqueInput
    update?: XOR<XOR<MaintenanceTicketUpdateToOneWithWhereWithoutAttachmentsInput, MaintenanceTicketUpdateWithoutAttachmentsInput>, MaintenanceTicketUncheckedUpdateWithoutAttachmentsInput>
  }

  export type CleaningTaskUpdateOneWithoutAttachmentsNestedInput = {
    create?: XOR<CleaningTaskCreateWithoutAttachmentsInput, CleaningTaskUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutAttachmentsInput
    upsert?: CleaningTaskUpsertWithoutAttachmentsInput
    disconnect?: CleaningTaskWhereInput | boolean
    delete?: CleaningTaskWhereInput | boolean
    connect?: CleaningTaskWhereUniqueInput
    update?: XOR<XOR<CleaningTaskUpdateToOneWithWhereWithoutAttachmentsInput, CleaningTaskUpdateWithoutAttachmentsInput>, CleaningTaskUncheckedUpdateWithoutAttachmentsInput>
  }

  export type MessageUpdateManyWithoutAttachmentNestedInput = {
    create?: XOR<MessageCreateWithoutAttachmentInput, MessageUncheckedCreateWithoutAttachmentInput> | MessageCreateWithoutAttachmentInput[] | MessageUncheckedCreateWithoutAttachmentInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutAttachmentInput | MessageCreateOrConnectWithoutAttachmentInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutAttachmentInput | MessageUpsertWithWhereUniqueWithoutAttachmentInput[]
    createMany?: MessageCreateManyAttachmentInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutAttachmentInput | MessageUpdateWithWhereUniqueWithoutAttachmentInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutAttachmentInput | MessageUpdateManyWithWhereWithoutAttachmentInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type CleaningTaskMessageUpdateManyWithoutAttachmentNestedInput = {
    create?: XOR<CleaningTaskMessageCreateWithoutAttachmentInput, CleaningTaskMessageUncheckedCreateWithoutAttachmentInput> | CleaningTaskMessageCreateWithoutAttachmentInput[] | CleaningTaskMessageUncheckedCreateWithoutAttachmentInput[]
    connectOrCreate?: CleaningTaskMessageCreateOrConnectWithoutAttachmentInput | CleaningTaskMessageCreateOrConnectWithoutAttachmentInput[]
    upsert?: CleaningTaskMessageUpsertWithWhereUniqueWithoutAttachmentInput | CleaningTaskMessageUpsertWithWhereUniqueWithoutAttachmentInput[]
    createMany?: CleaningTaskMessageCreateManyAttachmentInputEnvelope
    set?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    disconnect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    delete?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    connect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    update?: CleaningTaskMessageUpdateWithWhereUniqueWithoutAttachmentInput | CleaningTaskMessageUpdateWithWhereUniqueWithoutAttachmentInput[]
    updateMany?: CleaningTaskMessageUpdateManyWithWhereWithoutAttachmentInput | CleaningTaskMessageUpdateManyWithWhereWithoutAttachmentInput[]
    deleteMany?: CleaningTaskMessageScalarWhereInput | CleaningTaskMessageScalarWhereInput[]
  }

  export type MessageUncheckedUpdateManyWithoutAttachmentNestedInput = {
    create?: XOR<MessageCreateWithoutAttachmentInput, MessageUncheckedCreateWithoutAttachmentInput> | MessageCreateWithoutAttachmentInput[] | MessageUncheckedCreateWithoutAttachmentInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutAttachmentInput | MessageCreateOrConnectWithoutAttachmentInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutAttachmentInput | MessageUpsertWithWhereUniqueWithoutAttachmentInput[]
    createMany?: MessageCreateManyAttachmentInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutAttachmentInput | MessageUpdateWithWhereUniqueWithoutAttachmentInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutAttachmentInput | MessageUpdateManyWithWhereWithoutAttachmentInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type CleaningTaskMessageUncheckedUpdateManyWithoutAttachmentNestedInput = {
    create?: XOR<CleaningTaskMessageCreateWithoutAttachmentInput, CleaningTaskMessageUncheckedCreateWithoutAttachmentInput> | CleaningTaskMessageCreateWithoutAttachmentInput[] | CleaningTaskMessageUncheckedCreateWithoutAttachmentInput[]
    connectOrCreate?: CleaningTaskMessageCreateOrConnectWithoutAttachmentInput | CleaningTaskMessageCreateOrConnectWithoutAttachmentInput[]
    upsert?: CleaningTaskMessageUpsertWithWhereUniqueWithoutAttachmentInput | CleaningTaskMessageUpsertWithWhereUniqueWithoutAttachmentInput[]
    createMany?: CleaningTaskMessageCreateManyAttachmentInputEnvelope
    set?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    disconnect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    delete?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    connect?: CleaningTaskMessageWhereUniqueInput | CleaningTaskMessageWhereUniqueInput[]
    update?: CleaningTaskMessageUpdateWithWhereUniqueWithoutAttachmentInput | CleaningTaskMessageUpdateWithWhereUniqueWithoutAttachmentInput[]
    updateMany?: CleaningTaskMessageUpdateManyWithWhereWithoutAttachmentInput | CleaningTaskMessageUpdateManyWithWhereWithoutAttachmentInput[]
    deleteMany?: CleaningTaskMessageScalarWhereInput | CleaningTaskMessageScalarWhereInput[]
  }

  export type ApartmentCreateNestedOneWithoutApartmentAttachmentsInput = {
    create?: XOR<ApartmentCreateWithoutApartmentAttachmentsInput, ApartmentUncheckedCreateWithoutApartmentAttachmentsInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutApartmentAttachmentsInput
    connect?: ApartmentWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ApartmentUpdateOneRequiredWithoutApartmentAttachmentsNestedInput = {
    create?: XOR<ApartmentCreateWithoutApartmentAttachmentsInput, ApartmentUncheckedCreateWithoutApartmentAttachmentsInput>
    connectOrCreate?: ApartmentCreateOrConnectWithoutApartmentAttachmentsInput
    upsert?: ApartmentUpsertWithoutApartmentAttachmentsInput
    connect?: ApartmentWhereUniqueInput
    update?: XOR<XOR<ApartmentUpdateToOneWithWhereWithoutApartmentAttachmentsInput, ApartmentUpdateWithoutApartmentAttachmentsInput>, ApartmentUncheckedUpdateWithoutApartmentAttachmentsInput>
  }

  export type MaintenanceTicketCreateNestedOneWithoutMessagesInput = {
    create?: XOR<MaintenanceTicketCreateWithoutMessagesInput, MaintenanceTicketUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutMessagesInput
    connect?: MaintenanceTicketWhereUniqueInput
  }

  export type AttachmentCreateNestedOneWithoutMessagesInput = {
    create?: XOR<AttachmentCreateWithoutMessagesInput, AttachmentUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: AttachmentCreateOrConnectWithoutMessagesInput
    connect?: AttachmentWhereUniqueInput
  }

  export type MaintenanceTicketUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<MaintenanceTicketCreateWithoutMessagesInput, MaintenanceTicketUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: MaintenanceTicketCreateOrConnectWithoutMessagesInput
    upsert?: MaintenanceTicketUpsertWithoutMessagesInput
    connect?: MaintenanceTicketWhereUniqueInput
    update?: XOR<XOR<MaintenanceTicketUpdateToOneWithWhereWithoutMessagesInput, MaintenanceTicketUpdateWithoutMessagesInput>, MaintenanceTicketUncheckedUpdateWithoutMessagesInput>
  }

  export type AttachmentUpdateOneWithoutMessagesNestedInput = {
    create?: XOR<AttachmentCreateWithoutMessagesInput, AttachmentUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: AttachmentCreateOrConnectWithoutMessagesInput
    upsert?: AttachmentUpsertWithoutMessagesInput
    disconnect?: AttachmentWhereInput | boolean
    delete?: AttachmentWhereInput | boolean
    connect?: AttachmentWhereUniqueInput
    update?: XOR<XOR<AttachmentUpdateToOneWithWhereWithoutMessagesInput, AttachmentUpdateWithoutMessagesInput>, AttachmentUncheckedUpdateWithoutMessagesInput>
  }

  export type CleaningTaskCreateNestedOneWithoutMessagesInput = {
    create?: XOR<CleaningTaskCreateWithoutMessagesInput, CleaningTaskUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutMessagesInput
    connect?: CleaningTaskWhereUniqueInput
  }

  export type AttachmentCreateNestedOneWithoutCleaningMessagesInput = {
    create?: XOR<AttachmentCreateWithoutCleaningMessagesInput, AttachmentUncheckedCreateWithoutCleaningMessagesInput>
    connectOrCreate?: AttachmentCreateOrConnectWithoutCleaningMessagesInput
    connect?: AttachmentWhereUniqueInput
  }

  export type CleaningTaskUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<CleaningTaskCreateWithoutMessagesInput, CleaningTaskUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: CleaningTaskCreateOrConnectWithoutMessagesInput
    upsert?: CleaningTaskUpsertWithoutMessagesInput
    connect?: CleaningTaskWhereUniqueInput
    update?: XOR<XOR<CleaningTaskUpdateToOneWithWhereWithoutMessagesInput, CleaningTaskUpdateWithoutMessagesInput>, CleaningTaskUncheckedUpdateWithoutMessagesInput>
  }

  export type AttachmentUpdateOneWithoutCleaningMessagesNestedInput = {
    create?: XOR<AttachmentCreateWithoutCleaningMessagesInput, AttachmentUncheckedCreateWithoutCleaningMessagesInput>
    connectOrCreate?: AttachmentCreateOrConnectWithoutCleaningMessagesInput
    upsert?: AttachmentUpsertWithoutCleaningMessagesInput
    disconnect?: AttachmentWhereInput | boolean
    delete?: AttachmentWhereInput | boolean
    connect?: AttachmentWhereUniqueInput
    update?: XOR<XOR<AttachmentUpdateToOneWithWhereWithoutCleaningMessagesInput, AttachmentUpdateWithoutCleaningMessagesInput>, AttachmentUncheckedUpdateWithoutCleaningMessagesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumAIAssistantMessageRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.AIAssistantMessageRole | EnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AIAssistantMessageRole[] | ListEnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AIAssistantMessageRole[] | ListEnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAIAssistantMessageRoleFilter<$PrismaModel> | $Enums.AIAssistantMessageRole
  }

  export type NestedEnumAIAssistantMessageRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AIAssistantMessageRole | EnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AIAssistantMessageRole[] | ListEnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AIAssistantMessageRole[] | ListEnumAIAssistantMessageRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAIAssistantMessageRoleWithAggregatesFilter<$PrismaModel> | $Enums.AIAssistantMessageRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAIAssistantMessageRoleFilter<$PrismaModel>
    _max?: NestedEnumAIAssistantMessageRoleFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type CleaningTaskCreateWithoutAssignedToInput = {
    id?: string
    date: Date | string
    status: string
    createdAt?: Date | string
    notes?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingCreateNestedOneWithoutCleaningTaskInput
    apartment: ApartmentCreateNestedOneWithoutCleaningTasksInput
    messages?: CleaningTaskMessageCreateNestedManyWithoutCleaningTaskInput
    attachments?: AttachmentCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskUncheckedCreateWithoutAssignedToInput = {
    id?: string
    apartmentId: string
    date: Date | string
    status: string
    createdAt?: Date | string
    notes?: string | null
    bookingId?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskCreateOrConnectWithoutAssignedToInput = {
    where: CleaningTaskWhereUniqueInput
    create: XOR<CleaningTaskCreateWithoutAssignedToInput, CleaningTaskUncheckedCreateWithoutAssignedToInput>
  }

  export type CleaningTaskCreateManyAssignedToInputEnvelope = {
    data: CleaningTaskCreateManyAssignedToInput | CleaningTaskCreateManyAssignedToInput[]
    skipDuplicates?: boolean
  }

  export type MaintenanceTicketCreateWithoutAssignedToInput = {
    id?: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    apartment: ApartmentCreateNestedOneWithoutMaintenanceTicketsInput
    attachments?: AttachmentCreateNestedManyWithoutMaintenanceTicketInput
    messages?: MessageCreateNestedManyWithoutMaintenanceTicketInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketUncheckedCreateWithoutAssignedToInput = {
    id?: string
    apartmentId: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    attachments?: AttachmentUncheckedCreateNestedManyWithoutMaintenanceTicketInput
    messages?: MessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketCreateOrConnectWithoutAssignedToInput = {
    where: MaintenanceTicketWhereUniqueInput
    create: XOR<MaintenanceTicketCreateWithoutAssignedToInput, MaintenanceTicketUncheckedCreateWithoutAssignedToInput>
  }

  export type MaintenanceTicketCreateManyAssignedToInputEnvelope = {
    data: MaintenanceTicketCreateManyAssignedToInput | MaintenanceTicketCreateManyAssignedToInput[]
    skipDuplicates?: boolean
  }

  export type CleaningTaskUpsertWithWhereUniqueWithoutAssignedToInput = {
    where: CleaningTaskWhereUniqueInput
    update: XOR<CleaningTaskUpdateWithoutAssignedToInput, CleaningTaskUncheckedUpdateWithoutAssignedToInput>
    create: XOR<CleaningTaskCreateWithoutAssignedToInput, CleaningTaskUncheckedCreateWithoutAssignedToInput>
  }

  export type CleaningTaskUpdateWithWhereUniqueWithoutAssignedToInput = {
    where: CleaningTaskWhereUniqueInput
    data: XOR<CleaningTaskUpdateWithoutAssignedToInput, CleaningTaskUncheckedUpdateWithoutAssignedToInput>
  }

  export type CleaningTaskUpdateManyWithWhereWithoutAssignedToInput = {
    where: CleaningTaskScalarWhereInput
    data: XOR<CleaningTaskUpdateManyMutationInput, CleaningTaskUncheckedUpdateManyWithoutAssignedToInput>
  }

  export type CleaningTaskScalarWhereInput = {
    AND?: CleaningTaskScalarWhereInput | CleaningTaskScalarWhereInput[]
    OR?: CleaningTaskScalarWhereInput[]
    NOT?: CleaningTaskScalarWhereInput | CleaningTaskScalarWhereInput[]
    id?: StringFilter<"CleaningTask"> | string
    apartmentId?: StringFilter<"CleaningTask"> | string
    date?: DateTimeFilter<"CleaningTask"> | Date | string
    status?: StringFilter<"CleaningTask"> | string
    createdAt?: DateTimeFilter<"CleaningTask"> | Date | string
    assignedToId?: StringNullableFilter<"CleaningTask"> | string | null
    notes?: StringNullableFilter<"CleaningTask"> | string | null
    bookingId?: StringNullableFilter<"CleaningTask"> | string | null
    checklistProgress?: JsonNullableFilter<"CleaningTask">
  }

  export type MaintenanceTicketUpsertWithWhereUniqueWithoutAssignedToInput = {
    where: MaintenanceTicketWhereUniqueInput
    update: XOR<MaintenanceTicketUpdateWithoutAssignedToInput, MaintenanceTicketUncheckedUpdateWithoutAssignedToInput>
    create: XOR<MaintenanceTicketCreateWithoutAssignedToInput, MaintenanceTicketUncheckedCreateWithoutAssignedToInput>
  }

  export type MaintenanceTicketUpdateWithWhereUniqueWithoutAssignedToInput = {
    where: MaintenanceTicketWhereUniqueInput
    data: XOR<MaintenanceTicketUpdateWithoutAssignedToInput, MaintenanceTicketUncheckedUpdateWithoutAssignedToInput>
  }

  export type MaintenanceTicketUpdateManyWithWhereWithoutAssignedToInput = {
    where: MaintenanceTicketScalarWhereInput
    data: XOR<MaintenanceTicketUpdateManyMutationInput, MaintenanceTicketUncheckedUpdateManyWithoutAssignedToInput>
  }

  export type MaintenanceTicketScalarWhereInput = {
    AND?: MaintenanceTicketScalarWhereInput | MaintenanceTicketScalarWhereInput[]
    OR?: MaintenanceTicketScalarWhereInput[]
    NOT?: MaintenanceTicketScalarWhereInput | MaintenanceTicketScalarWhereInput[]
    id?: StringFilter<"MaintenanceTicket"> | string
    apartmentId?: StringFilter<"MaintenanceTicket"> | string
    title?: StringFilter<"MaintenanceTicket"> | string
    description?: StringFilter<"MaintenanceTicket"> | string
    status?: StringFilter<"MaintenanceTicket"> | string
    priority?: StringFilter<"MaintenanceTicket"> | string
    createdAt?: DateTimeFilter<"MaintenanceTicket"> | Date | string
    assignedToId?: StringNullableFilter<"MaintenanceTicket"> | string | null
    scheduledStart?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    scheduledEnd?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    startedAt?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
    resolvedAt?: DateTimeNullableFilter<"MaintenanceTicket"> | Date | string | null
  }

  export type BookingCreateWithoutApartmentInput = {
    id?: string
    guestName?: string | null
    totalGuests: number
    checkInDate: Date | string
    checkOutDate: Date | string
    status?: string | null
    externalId?: string | null
    source?: string | null
    createdAt?: Date | string
    cleaningTask?: CleaningTaskCreateNestedOneWithoutBookingInput
  }

  export type BookingUncheckedCreateWithoutApartmentInput = {
    id?: string
    guestName?: string | null
    totalGuests: number
    checkInDate: Date | string
    checkOutDate: Date | string
    status?: string | null
    externalId?: string | null
    source?: string | null
    createdAt?: Date | string
    cleaningTask?: CleaningTaskUncheckedCreateNestedOneWithoutBookingInput
  }

  export type BookingCreateOrConnectWithoutApartmentInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutApartmentInput, BookingUncheckedCreateWithoutApartmentInput>
  }

  export type BookingCreateManyApartmentInputEnvelope = {
    data: BookingCreateManyApartmentInput | BookingCreateManyApartmentInput[]
    skipDuplicates?: boolean
  }

  export type ChecklistItemCreateWithoutApartmentInput = {
    id?: string
    label: string
    required?: boolean
    order?: number
    createdAt?: Date | string
    formula?: string | null
    type?: string
  }

  export type ChecklistItemUncheckedCreateWithoutApartmentInput = {
    id?: string
    label: string
    required?: boolean
    order?: number
    createdAt?: Date | string
    formula?: string | null
    type?: string
  }

  export type ChecklistItemCreateOrConnectWithoutApartmentInput = {
    where: ChecklistItemWhereUniqueInput
    create: XOR<ChecklistItemCreateWithoutApartmentInput, ChecklistItemUncheckedCreateWithoutApartmentInput>
  }

  export type ChecklistItemCreateManyApartmentInputEnvelope = {
    data: ChecklistItemCreateManyApartmentInput | ChecklistItemCreateManyApartmentInput[]
    skipDuplicates?: boolean
  }

  export type CleaningTaskCreateWithoutApartmentInput = {
    id?: string
    date: Date | string
    status: string
    createdAt?: Date | string
    notes?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingCreateNestedOneWithoutCleaningTaskInput
    assignedTo?: UserCreateNestedOneWithoutCleaningTasksInput
    messages?: CleaningTaskMessageCreateNestedManyWithoutCleaningTaskInput
    attachments?: AttachmentCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskUncheckedCreateWithoutApartmentInput = {
    id?: string
    date: Date | string
    status: string
    createdAt?: Date | string
    assignedToId?: string | null
    notes?: string | null
    bookingId?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskCreateOrConnectWithoutApartmentInput = {
    where: CleaningTaskWhereUniqueInput
    create: XOR<CleaningTaskCreateWithoutApartmentInput, CleaningTaskUncheckedCreateWithoutApartmentInput>
  }

  export type CleaningTaskCreateManyApartmentInputEnvelope = {
    data: CleaningTaskCreateManyApartmentInput | CleaningTaskCreateManyApartmentInput[]
    skipDuplicates?: boolean
  }

  export type MaintenanceTicketCreateWithoutApartmentInput = {
    id?: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    assignedTo?: UserCreateNestedOneWithoutMaintenanceTicketsInput
    attachments?: AttachmentCreateNestedManyWithoutMaintenanceTicketInput
    messages?: MessageCreateNestedManyWithoutMaintenanceTicketInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketUncheckedCreateWithoutApartmentInput = {
    id?: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    assignedToId?: string | null
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    attachments?: AttachmentUncheckedCreateNestedManyWithoutMaintenanceTicketInput
    messages?: MessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketCreateOrConnectWithoutApartmentInput = {
    where: MaintenanceTicketWhereUniqueInput
    create: XOR<MaintenanceTicketCreateWithoutApartmentInput, MaintenanceTicketUncheckedCreateWithoutApartmentInput>
  }

  export type MaintenanceTicketCreateManyApartmentInputEnvelope = {
    data: MaintenanceTicketCreateManyApartmentInput | MaintenanceTicketCreateManyApartmentInput[]
    skipDuplicates?: boolean
  }

  export type NotificationCreateWithoutApartmentInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
  }

  export type NotificationUncheckedCreateWithoutApartmentInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
  }

  export type NotificationCreateOrConnectWithoutApartmentInput = {
    where: NotificationWhereUniqueInput
    create: XOR<NotificationCreateWithoutApartmentInput, NotificationUncheckedCreateWithoutApartmentInput>
  }

  export type NotificationCreateManyApartmentInputEnvelope = {
    data: NotificationCreateManyApartmentInput | NotificationCreateManyApartmentInput[]
    skipDuplicates?: boolean
  }

  export type AIAssistantMessageCreateWithoutApartmentInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    createdAt?: Date | string
    cleaningTask?: CleaningTaskCreateNestedOneWithoutAiAssistantMessagesInput
    maintenanceTicket?: MaintenanceTicketCreateNestedOneWithoutAiAssistantMessagesInput
  }

  export type AIAssistantMessageUncheckedCreateWithoutApartmentInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    cleaningTaskId?: string | null
    maintenanceTicketId?: string | null
    createdAt?: Date | string
  }

  export type AIAssistantMessageCreateOrConnectWithoutApartmentInput = {
    where: AIAssistantMessageWhereUniqueInput
    create: XOR<AIAssistantMessageCreateWithoutApartmentInput, AIAssistantMessageUncheckedCreateWithoutApartmentInput>
  }

  export type AIAssistantMessageCreateManyApartmentInputEnvelope = {
    data: AIAssistantMessageCreateManyApartmentInput | AIAssistantMessageCreateManyApartmentInput[]
    skipDuplicates?: boolean
  }

  export type ApartmentAttachmentCreateWithoutApartmentInput = {
    id?: string
    filename: string
    url?: string | null
    mimeType?: string | null
    size?: number | null
    category?: string
    extractedText?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApartmentAttachmentUncheckedCreateWithoutApartmentInput = {
    id?: string
    filename: string
    url?: string | null
    mimeType?: string | null
    size?: number | null
    category?: string
    extractedText?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApartmentAttachmentCreateOrConnectWithoutApartmentInput = {
    where: ApartmentAttachmentWhereUniqueInput
    create: XOR<ApartmentAttachmentCreateWithoutApartmentInput, ApartmentAttachmentUncheckedCreateWithoutApartmentInput>
  }

  export type ApartmentAttachmentCreateManyApartmentInputEnvelope = {
    data: ApartmentAttachmentCreateManyApartmentInput | ApartmentAttachmentCreateManyApartmentInput[]
    skipDuplicates?: boolean
  }

  export type BookingUpsertWithWhereUniqueWithoutApartmentInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutApartmentInput, BookingUncheckedUpdateWithoutApartmentInput>
    create: XOR<BookingCreateWithoutApartmentInput, BookingUncheckedCreateWithoutApartmentInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutApartmentInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutApartmentInput, BookingUncheckedUpdateWithoutApartmentInput>
  }

  export type BookingUpdateManyWithWhereWithoutApartmentInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutApartmentInput>
  }

  export type BookingScalarWhereInput = {
    AND?: BookingScalarWhereInput | BookingScalarWhereInput[]
    OR?: BookingScalarWhereInput[]
    NOT?: BookingScalarWhereInput | BookingScalarWhereInput[]
    id?: StringFilter<"Booking"> | string
    apartmentId?: StringFilter<"Booking"> | string
    guestName?: StringNullableFilter<"Booking"> | string | null
    totalGuests?: IntFilter<"Booking"> | number
    checkInDate?: DateTimeFilter<"Booking"> | Date | string
    checkOutDate?: DateTimeFilter<"Booking"> | Date | string
    status?: StringNullableFilter<"Booking"> | string | null
    externalId?: StringNullableFilter<"Booking"> | string | null
    source?: StringNullableFilter<"Booking"> | string | null
    createdAt?: DateTimeFilter<"Booking"> | Date | string
  }

  export type ChecklistItemUpsertWithWhereUniqueWithoutApartmentInput = {
    where: ChecklistItemWhereUniqueInput
    update: XOR<ChecklistItemUpdateWithoutApartmentInput, ChecklistItemUncheckedUpdateWithoutApartmentInput>
    create: XOR<ChecklistItemCreateWithoutApartmentInput, ChecklistItemUncheckedCreateWithoutApartmentInput>
  }

  export type ChecklistItemUpdateWithWhereUniqueWithoutApartmentInput = {
    where: ChecklistItemWhereUniqueInput
    data: XOR<ChecklistItemUpdateWithoutApartmentInput, ChecklistItemUncheckedUpdateWithoutApartmentInput>
  }

  export type ChecklistItemUpdateManyWithWhereWithoutApartmentInput = {
    where: ChecklistItemScalarWhereInput
    data: XOR<ChecklistItemUpdateManyMutationInput, ChecklistItemUncheckedUpdateManyWithoutApartmentInput>
  }

  export type ChecklistItemScalarWhereInput = {
    AND?: ChecklistItemScalarWhereInput | ChecklistItemScalarWhereInput[]
    OR?: ChecklistItemScalarWhereInput[]
    NOT?: ChecklistItemScalarWhereInput | ChecklistItemScalarWhereInput[]
    id?: StringFilter<"ChecklistItem"> | string
    apartmentId?: StringFilter<"ChecklistItem"> | string
    label?: StringFilter<"ChecklistItem"> | string
    required?: BoolFilter<"ChecklistItem"> | boolean
    order?: IntFilter<"ChecklistItem"> | number
    createdAt?: DateTimeFilter<"ChecklistItem"> | Date | string
    formula?: StringNullableFilter<"ChecklistItem"> | string | null
    type?: StringFilter<"ChecklistItem"> | string
  }

  export type CleaningTaskUpsertWithWhereUniqueWithoutApartmentInput = {
    where: CleaningTaskWhereUniqueInput
    update: XOR<CleaningTaskUpdateWithoutApartmentInput, CleaningTaskUncheckedUpdateWithoutApartmentInput>
    create: XOR<CleaningTaskCreateWithoutApartmentInput, CleaningTaskUncheckedCreateWithoutApartmentInput>
  }

  export type CleaningTaskUpdateWithWhereUniqueWithoutApartmentInput = {
    where: CleaningTaskWhereUniqueInput
    data: XOR<CleaningTaskUpdateWithoutApartmentInput, CleaningTaskUncheckedUpdateWithoutApartmentInput>
  }

  export type CleaningTaskUpdateManyWithWhereWithoutApartmentInput = {
    where: CleaningTaskScalarWhereInput
    data: XOR<CleaningTaskUpdateManyMutationInput, CleaningTaskUncheckedUpdateManyWithoutApartmentInput>
  }

  export type MaintenanceTicketUpsertWithWhereUniqueWithoutApartmentInput = {
    where: MaintenanceTicketWhereUniqueInput
    update: XOR<MaintenanceTicketUpdateWithoutApartmentInput, MaintenanceTicketUncheckedUpdateWithoutApartmentInput>
    create: XOR<MaintenanceTicketCreateWithoutApartmentInput, MaintenanceTicketUncheckedCreateWithoutApartmentInput>
  }

  export type MaintenanceTicketUpdateWithWhereUniqueWithoutApartmentInput = {
    where: MaintenanceTicketWhereUniqueInput
    data: XOR<MaintenanceTicketUpdateWithoutApartmentInput, MaintenanceTicketUncheckedUpdateWithoutApartmentInput>
  }

  export type MaintenanceTicketUpdateManyWithWhereWithoutApartmentInput = {
    where: MaintenanceTicketScalarWhereInput
    data: XOR<MaintenanceTicketUpdateManyMutationInput, MaintenanceTicketUncheckedUpdateManyWithoutApartmentInput>
  }

  export type NotificationUpsertWithWhereUniqueWithoutApartmentInput = {
    where: NotificationWhereUniqueInput
    update: XOR<NotificationUpdateWithoutApartmentInput, NotificationUncheckedUpdateWithoutApartmentInput>
    create: XOR<NotificationCreateWithoutApartmentInput, NotificationUncheckedCreateWithoutApartmentInput>
  }

  export type NotificationUpdateWithWhereUniqueWithoutApartmentInput = {
    where: NotificationWhereUniqueInput
    data: XOR<NotificationUpdateWithoutApartmentInput, NotificationUncheckedUpdateWithoutApartmentInput>
  }

  export type NotificationUpdateManyWithWhereWithoutApartmentInput = {
    where: NotificationScalarWhereInput
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyWithoutApartmentInput>
  }

  export type NotificationScalarWhereInput = {
    AND?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    OR?: NotificationScalarWhereInput[]
    NOT?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    id?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    apartmentId?: StringNullableFilter<"Notification"> | string | null
  }

  export type AIAssistantMessageUpsertWithWhereUniqueWithoutApartmentInput = {
    where: AIAssistantMessageWhereUniqueInput
    update: XOR<AIAssistantMessageUpdateWithoutApartmentInput, AIAssistantMessageUncheckedUpdateWithoutApartmentInput>
    create: XOR<AIAssistantMessageCreateWithoutApartmentInput, AIAssistantMessageUncheckedCreateWithoutApartmentInput>
  }

  export type AIAssistantMessageUpdateWithWhereUniqueWithoutApartmentInput = {
    where: AIAssistantMessageWhereUniqueInput
    data: XOR<AIAssistantMessageUpdateWithoutApartmentInput, AIAssistantMessageUncheckedUpdateWithoutApartmentInput>
  }

  export type AIAssistantMessageUpdateManyWithWhereWithoutApartmentInput = {
    where: AIAssistantMessageScalarWhereInput
    data: XOR<AIAssistantMessageUpdateManyMutationInput, AIAssistantMessageUncheckedUpdateManyWithoutApartmentInput>
  }

  export type AIAssistantMessageScalarWhereInput = {
    AND?: AIAssistantMessageScalarWhereInput | AIAssistantMessageScalarWhereInput[]
    OR?: AIAssistantMessageScalarWhereInput[]
    NOT?: AIAssistantMessageScalarWhereInput | AIAssistantMessageScalarWhereInput[]
    id?: StringFilter<"AIAssistantMessage"> | string
    role?: EnumAIAssistantMessageRoleFilter<"AIAssistantMessage"> | $Enums.AIAssistantMessageRole
    content?: StringFilter<"AIAssistantMessage"> | string
    userRole?: EnumRoleFilter<"AIAssistantMessage"> | $Enums.Role
    apartmentId?: StringNullableFilter<"AIAssistantMessage"> | string | null
    cleaningTaskId?: StringNullableFilter<"AIAssistantMessage"> | string | null
    maintenanceTicketId?: StringNullableFilter<"AIAssistantMessage"> | string | null
    createdAt?: DateTimeFilter<"AIAssistantMessage"> | Date | string
  }

  export type ApartmentAttachmentUpsertWithWhereUniqueWithoutApartmentInput = {
    where: ApartmentAttachmentWhereUniqueInput
    update: XOR<ApartmentAttachmentUpdateWithoutApartmentInput, ApartmentAttachmentUncheckedUpdateWithoutApartmentInput>
    create: XOR<ApartmentAttachmentCreateWithoutApartmentInput, ApartmentAttachmentUncheckedCreateWithoutApartmentInput>
  }

  export type ApartmentAttachmentUpdateWithWhereUniqueWithoutApartmentInput = {
    where: ApartmentAttachmentWhereUniqueInput
    data: XOR<ApartmentAttachmentUpdateWithoutApartmentInput, ApartmentAttachmentUncheckedUpdateWithoutApartmentInput>
  }

  export type ApartmentAttachmentUpdateManyWithWhereWithoutApartmentInput = {
    where: ApartmentAttachmentScalarWhereInput
    data: XOR<ApartmentAttachmentUpdateManyMutationInput, ApartmentAttachmentUncheckedUpdateManyWithoutApartmentInput>
  }

  export type ApartmentAttachmentScalarWhereInput = {
    AND?: ApartmentAttachmentScalarWhereInput | ApartmentAttachmentScalarWhereInput[]
    OR?: ApartmentAttachmentScalarWhereInput[]
    NOT?: ApartmentAttachmentScalarWhereInput | ApartmentAttachmentScalarWhereInput[]
    id?: StringFilter<"ApartmentAttachment"> | string
    apartmentId?: StringFilter<"ApartmentAttachment"> | string
    filename?: StringFilter<"ApartmentAttachment"> | string
    url?: StringNullableFilter<"ApartmentAttachment"> | string | null
    mimeType?: StringNullableFilter<"ApartmentAttachment"> | string | null
    size?: IntNullableFilter<"ApartmentAttachment"> | number | null
    category?: StringFilter<"ApartmentAttachment"> | string
    extractedText?: StringNullableFilter<"ApartmentAttachment"> | string | null
    notes?: StringNullableFilter<"ApartmentAttachment"> | string | null
    createdAt?: DateTimeFilter<"ApartmentAttachment"> | Date | string
    updatedAt?: DateTimeFilter<"ApartmentAttachment"> | Date | string
  }

  export type ApartmentCreateWithoutChecklistItemsInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketCreateNestedManyWithoutApartmentInput
    notifications?: NotificationCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentUncheckedCreateWithoutChecklistItemsInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskUncheckedCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketUncheckedCreateNestedManyWithoutApartmentInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentUncheckedCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentCreateOrConnectWithoutChecklistItemsInput = {
    where: ApartmentWhereUniqueInput
    create: XOR<ApartmentCreateWithoutChecklistItemsInput, ApartmentUncheckedCreateWithoutChecklistItemsInput>
  }

  export type ApartmentUpsertWithoutChecklistItemsInput = {
    update: XOR<ApartmentUpdateWithoutChecklistItemsInput, ApartmentUncheckedUpdateWithoutChecklistItemsInput>
    create: XOR<ApartmentCreateWithoutChecklistItemsInput, ApartmentUncheckedCreateWithoutChecklistItemsInput>
    where?: ApartmentWhereInput
  }

  export type ApartmentUpdateToOneWithWhereWithoutChecklistItemsInput = {
    where?: ApartmentWhereInput
    data: XOR<ApartmentUpdateWithoutChecklistItemsInput, ApartmentUncheckedUpdateWithoutChecklistItemsInput>
  }

  export type ApartmentUpdateWithoutChecklistItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentUncheckedUpdateWithoutChecklistItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUncheckedUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUncheckedUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUncheckedUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentCreateWithoutNotificationsInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentUncheckedCreateWithoutNotificationsInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemUncheckedCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskUncheckedCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketUncheckedCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentUncheckedCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentCreateOrConnectWithoutNotificationsInput = {
    where: ApartmentWhereUniqueInput
    create: XOR<ApartmentCreateWithoutNotificationsInput, ApartmentUncheckedCreateWithoutNotificationsInput>
  }

  export type ApartmentUpsertWithoutNotificationsInput = {
    update: XOR<ApartmentUpdateWithoutNotificationsInput, ApartmentUncheckedUpdateWithoutNotificationsInput>
    create: XOR<ApartmentCreateWithoutNotificationsInput, ApartmentUncheckedCreateWithoutNotificationsInput>
    where?: ApartmentWhereInput
  }

  export type ApartmentUpdateToOneWithWhereWithoutNotificationsInput = {
    where?: ApartmentWhereInput
    data: XOR<ApartmentUpdateWithoutNotificationsInput, ApartmentUncheckedUpdateWithoutNotificationsInput>
  }

  export type ApartmentUpdateWithoutNotificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentUncheckedUpdateWithoutNotificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUncheckedUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUncheckedUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUncheckedUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUncheckedUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentCreateWithoutBookingsInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    checklistItems?: ChecklistItemCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketCreateNestedManyWithoutApartmentInput
    notifications?: NotificationCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentUncheckedCreateWithoutBookingsInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    checklistItems?: ChecklistItemUncheckedCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskUncheckedCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketUncheckedCreateNestedManyWithoutApartmentInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentUncheckedCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentCreateOrConnectWithoutBookingsInput = {
    where: ApartmentWhereUniqueInput
    create: XOR<ApartmentCreateWithoutBookingsInput, ApartmentUncheckedCreateWithoutBookingsInput>
  }

  export type CleaningTaskCreateWithoutBookingInput = {
    id?: string
    date: Date | string
    status: string
    createdAt?: Date | string
    notes?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    apartment: ApartmentCreateNestedOneWithoutCleaningTasksInput
    assignedTo?: UserCreateNestedOneWithoutCleaningTasksInput
    messages?: CleaningTaskMessageCreateNestedManyWithoutCleaningTaskInput
    attachments?: AttachmentCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskUncheckedCreateWithoutBookingInput = {
    id?: string
    apartmentId: string
    date: Date | string
    status: string
    createdAt?: Date | string
    assignedToId?: string | null
    notes?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskCreateOrConnectWithoutBookingInput = {
    where: CleaningTaskWhereUniqueInput
    create: XOR<CleaningTaskCreateWithoutBookingInput, CleaningTaskUncheckedCreateWithoutBookingInput>
  }

  export type ApartmentUpsertWithoutBookingsInput = {
    update: XOR<ApartmentUpdateWithoutBookingsInput, ApartmentUncheckedUpdateWithoutBookingsInput>
    create: XOR<ApartmentCreateWithoutBookingsInput, ApartmentUncheckedCreateWithoutBookingsInput>
    where?: ApartmentWhereInput
  }

  export type ApartmentUpdateToOneWithWhereWithoutBookingsInput = {
    where?: ApartmentWhereInput
    data: XOR<ApartmentUpdateWithoutBookingsInput, ApartmentUncheckedUpdateWithoutBookingsInput>
  }

  export type ApartmentUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checklistItems?: ChecklistItemUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentUncheckedUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checklistItems?: ChecklistItemUncheckedUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUncheckedUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUncheckedUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUncheckedUpdateManyWithoutApartmentNestedInput
  }

  export type CleaningTaskUpsertWithoutBookingInput = {
    update: XOR<CleaningTaskUpdateWithoutBookingInput, CleaningTaskUncheckedUpdateWithoutBookingInput>
    create: XOR<CleaningTaskCreateWithoutBookingInput, CleaningTaskUncheckedCreateWithoutBookingInput>
    where?: CleaningTaskWhereInput
  }

  export type CleaningTaskUpdateToOneWithWhereWithoutBookingInput = {
    where?: CleaningTaskWhereInput
    data: XOR<CleaningTaskUpdateWithoutBookingInput, CleaningTaskUncheckedUpdateWithoutBookingInput>
  }

  export type CleaningTaskUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    apartment?: ApartmentUpdateOneRequiredWithoutCleaningTasksNestedInput
    assignedTo?: UserUpdateOneWithoutCleaningTasksNestedInput
    messages?: CleaningTaskMessageUpdateManyWithoutCleaningTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutCleaningTaskNestedInput
  }

  export type CleaningTaskUncheckedUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
  }

  export type BookingCreateWithoutCleaningTaskInput = {
    id?: string
    guestName?: string | null
    totalGuests: number
    checkInDate: Date | string
    checkOutDate: Date | string
    status?: string | null
    externalId?: string | null
    source?: string | null
    createdAt?: Date | string
    apartment: ApartmentCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutCleaningTaskInput = {
    id?: string
    apartmentId: string
    guestName?: string | null
    totalGuests: number
    checkInDate: Date | string
    checkOutDate: Date | string
    status?: string | null
    externalId?: string | null
    source?: string | null
    createdAt?: Date | string
  }

  export type BookingCreateOrConnectWithoutCleaningTaskInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutCleaningTaskInput, BookingUncheckedCreateWithoutCleaningTaskInput>
  }

  export type ApartmentCreateWithoutCleaningTasksInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketCreateNestedManyWithoutApartmentInput
    notifications?: NotificationCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentUncheckedCreateWithoutCleaningTasksInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemUncheckedCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketUncheckedCreateNestedManyWithoutApartmentInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentUncheckedCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentCreateOrConnectWithoutCleaningTasksInput = {
    where: ApartmentWhereUniqueInput
    create: XOR<ApartmentCreateWithoutCleaningTasksInput, ApartmentUncheckedCreateWithoutCleaningTasksInput>
  }

  export type UserCreateWithoutCleaningTasksInput = {
    id?: string
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    name: string
    maintenanceTickets?: MaintenanceTicketCreateNestedManyWithoutAssignedToInput
  }

  export type UserUncheckedCreateWithoutCleaningTasksInput = {
    id?: string
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    name: string
    maintenanceTickets?: MaintenanceTicketUncheckedCreateNestedManyWithoutAssignedToInput
  }

  export type UserCreateOrConnectWithoutCleaningTasksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCleaningTasksInput, UserUncheckedCreateWithoutCleaningTasksInput>
  }

  export type CleaningTaskMessageCreateWithoutCleaningTaskInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    readByManagerAt?: Date | string | null
    attachment?: AttachmentCreateNestedOneWithoutCleaningMessagesInput
  }

  export type CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    attachmentId?: string | null
    readByManagerAt?: Date | string | null
  }

  export type CleaningTaskMessageCreateOrConnectWithoutCleaningTaskInput = {
    where: CleaningTaskMessageWhereUniqueInput
    create: XOR<CleaningTaskMessageCreateWithoutCleaningTaskInput, CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput>
  }

  export type CleaningTaskMessageCreateManyCleaningTaskInputEnvelope = {
    data: CleaningTaskMessageCreateManyCleaningTaskInput | CleaningTaskMessageCreateManyCleaningTaskInput[]
    skipDuplicates?: boolean
  }

  export type AttachmentCreateWithoutCleaningTaskInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    maintenanceTicket?: MaintenanceTicketCreateNestedOneWithoutAttachmentsInput
    messages?: MessageCreateNestedManyWithoutAttachmentInput
    cleaningMessages?: CleaningTaskMessageCreateNestedManyWithoutAttachmentInput
  }

  export type AttachmentUncheckedCreateWithoutCleaningTaskInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    maintenanceTicketId?: string | null
    messages?: MessageUncheckedCreateNestedManyWithoutAttachmentInput
    cleaningMessages?: CleaningTaskMessageUncheckedCreateNestedManyWithoutAttachmentInput
  }

  export type AttachmentCreateOrConnectWithoutCleaningTaskInput = {
    where: AttachmentWhereUniqueInput
    create: XOR<AttachmentCreateWithoutCleaningTaskInput, AttachmentUncheckedCreateWithoutCleaningTaskInput>
  }

  export type AttachmentCreateManyCleaningTaskInputEnvelope = {
    data: AttachmentCreateManyCleaningTaskInput | AttachmentCreateManyCleaningTaskInput[]
    skipDuplicates?: boolean
  }

  export type AIAssistantMessageCreateWithoutCleaningTaskInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    createdAt?: Date | string
    apartment?: ApartmentCreateNestedOneWithoutAiAssistantMessagesInput
    maintenanceTicket?: MaintenanceTicketCreateNestedOneWithoutAiAssistantMessagesInput
  }

  export type AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    apartmentId?: string | null
    maintenanceTicketId?: string | null
    createdAt?: Date | string
  }

  export type AIAssistantMessageCreateOrConnectWithoutCleaningTaskInput = {
    where: AIAssistantMessageWhereUniqueInput
    create: XOR<AIAssistantMessageCreateWithoutCleaningTaskInput, AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput>
  }

  export type AIAssistantMessageCreateManyCleaningTaskInputEnvelope = {
    data: AIAssistantMessageCreateManyCleaningTaskInput | AIAssistantMessageCreateManyCleaningTaskInput[]
    skipDuplicates?: boolean
  }

  export type BookingUpsertWithoutCleaningTaskInput = {
    update: XOR<BookingUpdateWithoutCleaningTaskInput, BookingUncheckedUpdateWithoutCleaningTaskInput>
    create: XOR<BookingCreateWithoutCleaningTaskInput, BookingUncheckedCreateWithoutCleaningTaskInput>
    where?: BookingWhereInput
  }

  export type BookingUpdateToOneWithWhereWithoutCleaningTaskInput = {
    where?: BookingWhereInput
    data: XOR<BookingUpdateWithoutCleaningTaskInput, BookingUncheckedUpdateWithoutCleaningTaskInput>
  }

  export type BookingUpdateWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    guestName?: NullableStringFieldUpdateOperationsInput | string | null
    totalGuests?: IntFieldUpdateOperationsInput | number
    checkInDate?: DateTimeFieldUpdateOperationsInput | Date | string
    checkOutDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apartment?: ApartmentUpdateOneRequiredWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    guestName?: NullableStringFieldUpdateOperationsInput | string | null
    totalGuests?: IntFieldUpdateOperationsInput | number
    checkInDate?: DateTimeFieldUpdateOperationsInput | Date | string
    checkOutDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApartmentUpsertWithoutCleaningTasksInput = {
    update: XOR<ApartmentUpdateWithoutCleaningTasksInput, ApartmentUncheckedUpdateWithoutCleaningTasksInput>
    create: XOR<ApartmentCreateWithoutCleaningTasksInput, ApartmentUncheckedCreateWithoutCleaningTasksInput>
    where?: ApartmentWhereInput
  }

  export type ApartmentUpdateToOneWithWhereWithoutCleaningTasksInput = {
    where?: ApartmentWhereInput
    data: XOR<ApartmentUpdateWithoutCleaningTasksInput, ApartmentUncheckedUpdateWithoutCleaningTasksInput>
  }

  export type ApartmentUpdateWithoutCleaningTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentUncheckedUpdateWithoutCleaningTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUncheckedUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUncheckedUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUncheckedUpdateManyWithoutApartmentNestedInput
  }

  export type UserUpsertWithoutCleaningTasksInput = {
    update: XOR<UserUpdateWithoutCleaningTasksInput, UserUncheckedUpdateWithoutCleaningTasksInput>
    create: XOR<UserCreateWithoutCleaningTasksInput, UserUncheckedCreateWithoutCleaningTasksInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCleaningTasksInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCleaningTasksInput, UserUncheckedUpdateWithoutCleaningTasksInput>
  }

  export type UserUpdateWithoutCleaningTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    maintenanceTickets?: MaintenanceTicketUpdateManyWithoutAssignedToNestedInput
  }

  export type UserUncheckedUpdateWithoutCleaningTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    maintenanceTickets?: MaintenanceTicketUncheckedUpdateManyWithoutAssignedToNestedInput
  }

  export type CleaningTaskMessageUpsertWithWhereUniqueWithoutCleaningTaskInput = {
    where: CleaningTaskMessageWhereUniqueInput
    update: XOR<CleaningTaskMessageUpdateWithoutCleaningTaskInput, CleaningTaskMessageUncheckedUpdateWithoutCleaningTaskInput>
    create: XOR<CleaningTaskMessageCreateWithoutCleaningTaskInput, CleaningTaskMessageUncheckedCreateWithoutCleaningTaskInput>
  }

  export type CleaningTaskMessageUpdateWithWhereUniqueWithoutCleaningTaskInput = {
    where: CleaningTaskMessageWhereUniqueInput
    data: XOR<CleaningTaskMessageUpdateWithoutCleaningTaskInput, CleaningTaskMessageUncheckedUpdateWithoutCleaningTaskInput>
  }

  export type CleaningTaskMessageUpdateManyWithWhereWithoutCleaningTaskInput = {
    where: CleaningTaskMessageScalarWhereInput
    data: XOR<CleaningTaskMessageUpdateManyMutationInput, CleaningTaskMessageUncheckedUpdateManyWithoutCleaningTaskInput>
  }

  export type CleaningTaskMessageScalarWhereInput = {
    AND?: CleaningTaskMessageScalarWhereInput | CleaningTaskMessageScalarWhereInput[]
    OR?: CleaningTaskMessageScalarWhereInput[]
    NOT?: CleaningTaskMessageScalarWhereInput | CleaningTaskMessageScalarWhereInput[]
    id?: StringFilter<"CleaningTaskMessage"> | string
    text?: StringNullableFilter<"CleaningTaskMessage"> | string | null
    role?: StringFilter<"CleaningTaskMessage"> | string
    senderName?: StringFilter<"CleaningTaskMessage"> | string
    createdAt?: DateTimeFilter<"CleaningTaskMessage"> | Date | string
    cleaningTaskId?: StringFilter<"CleaningTaskMessage"> | string
    attachmentId?: StringNullableFilter<"CleaningTaskMessage"> | string | null
    readByManagerAt?: DateTimeNullableFilter<"CleaningTaskMessage"> | Date | string | null
  }

  export type AttachmentUpsertWithWhereUniqueWithoutCleaningTaskInput = {
    where: AttachmentWhereUniqueInput
    update: XOR<AttachmentUpdateWithoutCleaningTaskInput, AttachmentUncheckedUpdateWithoutCleaningTaskInput>
    create: XOR<AttachmentCreateWithoutCleaningTaskInput, AttachmentUncheckedCreateWithoutCleaningTaskInput>
  }

  export type AttachmentUpdateWithWhereUniqueWithoutCleaningTaskInput = {
    where: AttachmentWhereUniqueInput
    data: XOR<AttachmentUpdateWithoutCleaningTaskInput, AttachmentUncheckedUpdateWithoutCleaningTaskInput>
  }

  export type AttachmentUpdateManyWithWhereWithoutCleaningTaskInput = {
    where: AttachmentScalarWhereInput
    data: XOR<AttachmentUpdateManyMutationInput, AttachmentUncheckedUpdateManyWithoutCleaningTaskInput>
  }

  export type AttachmentScalarWhereInput = {
    AND?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
    OR?: AttachmentScalarWhereInput[]
    NOT?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
    id?: StringFilter<"Attachment"> | string
    url?: StringFilter<"Attachment"> | string
    fileName?: StringFilter<"Attachment"> | string
    fileType?: StringNullableFilter<"Attachment"> | string | null
    createdAt?: DateTimeFilter<"Attachment"> | Date | string
    maintenanceTicketId?: StringNullableFilter<"Attachment"> | string | null
    cleaningTaskId?: StringNullableFilter<"Attachment"> | string | null
  }

  export type AIAssistantMessageUpsertWithWhereUniqueWithoutCleaningTaskInput = {
    where: AIAssistantMessageWhereUniqueInput
    update: XOR<AIAssistantMessageUpdateWithoutCleaningTaskInput, AIAssistantMessageUncheckedUpdateWithoutCleaningTaskInput>
    create: XOR<AIAssistantMessageCreateWithoutCleaningTaskInput, AIAssistantMessageUncheckedCreateWithoutCleaningTaskInput>
  }

  export type AIAssistantMessageUpdateWithWhereUniqueWithoutCleaningTaskInput = {
    where: AIAssistantMessageWhereUniqueInput
    data: XOR<AIAssistantMessageUpdateWithoutCleaningTaskInput, AIAssistantMessageUncheckedUpdateWithoutCleaningTaskInput>
  }

  export type AIAssistantMessageUpdateManyWithWhereWithoutCleaningTaskInput = {
    where: AIAssistantMessageScalarWhereInput
    data: XOR<AIAssistantMessageUpdateManyMutationInput, AIAssistantMessageUncheckedUpdateManyWithoutCleaningTaskInput>
  }

  export type ApartmentCreateWithoutMaintenanceTicketsInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskCreateNestedManyWithoutApartmentInput
    notifications?: NotificationCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentUncheckedCreateWithoutMaintenanceTicketsInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemUncheckedCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskUncheckedCreateNestedManyWithoutApartmentInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentUncheckedCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentCreateOrConnectWithoutMaintenanceTicketsInput = {
    where: ApartmentWhereUniqueInput
    create: XOR<ApartmentCreateWithoutMaintenanceTicketsInput, ApartmentUncheckedCreateWithoutMaintenanceTicketsInput>
  }

  export type UserCreateWithoutMaintenanceTicketsInput = {
    id?: string
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    name: string
    cleaningTasks?: CleaningTaskCreateNestedManyWithoutAssignedToInput
  }

  export type UserUncheckedCreateWithoutMaintenanceTicketsInput = {
    id?: string
    email: string
    password: string
    role: $Enums.Role
    createdAt?: Date | string
    name: string
    cleaningTasks?: CleaningTaskUncheckedCreateNestedManyWithoutAssignedToInput
  }

  export type UserCreateOrConnectWithoutMaintenanceTicketsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMaintenanceTicketsInput, UserUncheckedCreateWithoutMaintenanceTicketsInput>
  }

  export type AttachmentCreateWithoutMaintenanceTicketInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    cleaningTask?: CleaningTaskCreateNestedOneWithoutAttachmentsInput
    messages?: MessageCreateNestedManyWithoutAttachmentInput
    cleaningMessages?: CleaningTaskMessageCreateNestedManyWithoutAttachmentInput
  }

  export type AttachmentUncheckedCreateWithoutMaintenanceTicketInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    cleaningTaskId?: string | null
    messages?: MessageUncheckedCreateNestedManyWithoutAttachmentInput
    cleaningMessages?: CleaningTaskMessageUncheckedCreateNestedManyWithoutAttachmentInput
  }

  export type AttachmentCreateOrConnectWithoutMaintenanceTicketInput = {
    where: AttachmentWhereUniqueInput
    create: XOR<AttachmentCreateWithoutMaintenanceTicketInput, AttachmentUncheckedCreateWithoutMaintenanceTicketInput>
  }

  export type AttachmentCreateManyMaintenanceTicketInputEnvelope = {
    data: AttachmentCreateManyMaintenanceTicketInput | AttachmentCreateManyMaintenanceTicketInput[]
    skipDuplicates?: boolean
  }

  export type MessageCreateWithoutMaintenanceTicketInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    readByManagerAt?: Date | string | null
    attachment?: AttachmentCreateNestedOneWithoutMessagesInput
  }

  export type MessageUncheckedCreateWithoutMaintenanceTicketInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    attachmentId?: string | null
    readByManagerAt?: Date | string | null
  }

  export type MessageCreateOrConnectWithoutMaintenanceTicketInput = {
    where: MessageWhereUniqueInput
    create: XOR<MessageCreateWithoutMaintenanceTicketInput, MessageUncheckedCreateWithoutMaintenanceTicketInput>
  }

  export type MessageCreateManyMaintenanceTicketInputEnvelope = {
    data: MessageCreateManyMaintenanceTicketInput | MessageCreateManyMaintenanceTicketInput[]
    skipDuplicates?: boolean
  }

  export type AIAssistantMessageCreateWithoutMaintenanceTicketInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    createdAt?: Date | string
    apartment?: ApartmentCreateNestedOneWithoutAiAssistantMessagesInput
    cleaningTask?: CleaningTaskCreateNestedOneWithoutAiAssistantMessagesInput
  }

  export type AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    apartmentId?: string | null
    cleaningTaskId?: string | null
    createdAt?: Date | string
  }

  export type AIAssistantMessageCreateOrConnectWithoutMaintenanceTicketInput = {
    where: AIAssistantMessageWhereUniqueInput
    create: XOR<AIAssistantMessageCreateWithoutMaintenanceTicketInput, AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput>
  }

  export type AIAssistantMessageCreateManyMaintenanceTicketInputEnvelope = {
    data: AIAssistantMessageCreateManyMaintenanceTicketInput | AIAssistantMessageCreateManyMaintenanceTicketInput[]
    skipDuplicates?: boolean
  }

  export type ApartmentUpsertWithoutMaintenanceTicketsInput = {
    update: XOR<ApartmentUpdateWithoutMaintenanceTicketsInput, ApartmentUncheckedUpdateWithoutMaintenanceTicketsInput>
    create: XOR<ApartmentCreateWithoutMaintenanceTicketsInput, ApartmentUncheckedCreateWithoutMaintenanceTicketsInput>
    where?: ApartmentWhereInput
  }

  export type ApartmentUpdateToOneWithWhereWithoutMaintenanceTicketsInput = {
    where?: ApartmentWhereInput
    data: XOR<ApartmentUpdateWithoutMaintenanceTicketsInput, ApartmentUncheckedUpdateWithoutMaintenanceTicketsInput>
  }

  export type ApartmentUpdateWithoutMaintenanceTicketsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentUncheckedUpdateWithoutMaintenanceTicketsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUncheckedUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUncheckedUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUncheckedUpdateManyWithoutApartmentNestedInput
  }

  export type UserUpsertWithoutMaintenanceTicketsInput = {
    update: XOR<UserUpdateWithoutMaintenanceTicketsInput, UserUncheckedUpdateWithoutMaintenanceTicketsInput>
    create: XOR<UserCreateWithoutMaintenanceTicketsInput, UserUncheckedCreateWithoutMaintenanceTicketsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMaintenanceTicketsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMaintenanceTicketsInput, UserUncheckedUpdateWithoutMaintenanceTicketsInput>
  }

  export type UserUpdateWithoutMaintenanceTicketsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    cleaningTasks?: CleaningTaskUpdateManyWithoutAssignedToNestedInput
  }

  export type UserUncheckedUpdateWithoutMaintenanceTicketsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    cleaningTasks?: CleaningTaskUncheckedUpdateManyWithoutAssignedToNestedInput
  }

  export type AttachmentUpsertWithWhereUniqueWithoutMaintenanceTicketInput = {
    where: AttachmentWhereUniqueInput
    update: XOR<AttachmentUpdateWithoutMaintenanceTicketInput, AttachmentUncheckedUpdateWithoutMaintenanceTicketInput>
    create: XOR<AttachmentCreateWithoutMaintenanceTicketInput, AttachmentUncheckedCreateWithoutMaintenanceTicketInput>
  }

  export type AttachmentUpdateWithWhereUniqueWithoutMaintenanceTicketInput = {
    where: AttachmentWhereUniqueInput
    data: XOR<AttachmentUpdateWithoutMaintenanceTicketInput, AttachmentUncheckedUpdateWithoutMaintenanceTicketInput>
  }

  export type AttachmentUpdateManyWithWhereWithoutMaintenanceTicketInput = {
    where: AttachmentScalarWhereInput
    data: XOR<AttachmentUpdateManyMutationInput, AttachmentUncheckedUpdateManyWithoutMaintenanceTicketInput>
  }

  export type MessageUpsertWithWhereUniqueWithoutMaintenanceTicketInput = {
    where: MessageWhereUniqueInput
    update: XOR<MessageUpdateWithoutMaintenanceTicketInput, MessageUncheckedUpdateWithoutMaintenanceTicketInput>
    create: XOR<MessageCreateWithoutMaintenanceTicketInput, MessageUncheckedCreateWithoutMaintenanceTicketInput>
  }

  export type MessageUpdateWithWhereUniqueWithoutMaintenanceTicketInput = {
    where: MessageWhereUniqueInput
    data: XOR<MessageUpdateWithoutMaintenanceTicketInput, MessageUncheckedUpdateWithoutMaintenanceTicketInput>
  }

  export type MessageUpdateManyWithWhereWithoutMaintenanceTicketInput = {
    where: MessageScalarWhereInput
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyWithoutMaintenanceTicketInput>
  }

  export type MessageScalarWhereInput = {
    AND?: MessageScalarWhereInput | MessageScalarWhereInput[]
    OR?: MessageScalarWhereInput[]
    NOT?: MessageScalarWhereInput | MessageScalarWhereInput[]
    id?: StringFilter<"Message"> | string
    text?: StringNullableFilter<"Message"> | string | null
    role?: StringFilter<"Message"> | string
    senderName?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    maintenanceTicketId?: StringFilter<"Message"> | string
    attachmentId?: StringNullableFilter<"Message"> | string | null
    readByManagerAt?: DateTimeNullableFilter<"Message"> | Date | string | null
  }

  export type AIAssistantMessageUpsertWithWhereUniqueWithoutMaintenanceTicketInput = {
    where: AIAssistantMessageWhereUniqueInput
    update: XOR<AIAssistantMessageUpdateWithoutMaintenanceTicketInput, AIAssistantMessageUncheckedUpdateWithoutMaintenanceTicketInput>
    create: XOR<AIAssistantMessageCreateWithoutMaintenanceTicketInput, AIAssistantMessageUncheckedCreateWithoutMaintenanceTicketInput>
  }

  export type AIAssistantMessageUpdateWithWhereUniqueWithoutMaintenanceTicketInput = {
    where: AIAssistantMessageWhereUniqueInput
    data: XOR<AIAssistantMessageUpdateWithoutMaintenanceTicketInput, AIAssistantMessageUncheckedUpdateWithoutMaintenanceTicketInput>
  }

  export type AIAssistantMessageUpdateManyWithWhereWithoutMaintenanceTicketInput = {
    where: AIAssistantMessageScalarWhereInput
    data: XOR<AIAssistantMessageUpdateManyMutationInput, AIAssistantMessageUncheckedUpdateManyWithoutMaintenanceTicketInput>
  }

  export type ApartmentCreateWithoutAiAssistantMessagesInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketCreateNestedManyWithoutApartmentInput
    notifications?: NotificationCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentUncheckedCreateWithoutAiAssistantMessagesInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemUncheckedCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskUncheckedCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketUncheckedCreateNestedManyWithoutApartmentInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutApartmentInput
    apartmentAttachments?: ApartmentAttachmentUncheckedCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentCreateOrConnectWithoutAiAssistantMessagesInput = {
    where: ApartmentWhereUniqueInput
    create: XOR<ApartmentCreateWithoutAiAssistantMessagesInput, ApartmentUncheckedCreateWithoutAiAssistantMessagesInput>
  }

  export type CleaningTaskCreateWithoutAiAssistantMessagesInput = {
    id?: string
    date: Date | string
    status: string
    createdAt?: Date | string
    notes?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingCreateNestedOneWithoutCleaningTaskInput
    apartment: ApartmentCreateNestedOneWithoutCleaningTasksInput
    assignedTo?: UserCreateNestedOneWithoutCleaningTasksInput
    messages?: CleaningTaskMessageCreateNestedManyWithoutCleaningTaskInput
    attachments?: AttachmentCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskUncheckedCreateWithoutAiAssistantMessagesInput = {
    id?: string
    apartmentId: string
    date: Date | string
    status: string
    createdAt?: Date | string
    assignedToId?: string | null
    notes?: string | null
    bookingId?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskCreateOrConnectWithoutAiAssistantMessagesInput = {
    where: CleaningTaskWhereUniqueInput
    create: XOR<CleaningTaskCreateWithoutAiAssistantMessagesInput, CleaningTaskUncheckedCreateWithoutAiAssistantMessagesInput>
  }

  export type MaintenanceTicketCreateWithoutAiAssistantMessagesInput = {
    id?: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    apartment: ApartmentCreateNestedOneWithoutMaintenanceTicketsInput
    assignedTo?: UserCreateNestedOneWithoutMaintenanceTicketsInput
    attachments?: AttachmentCreateNestedManyWithoutMaintenanceTicketInput
    messages?: MessageCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketUncheckedCreateWithoutAiAssistantMessagesInput = {
    id?: string
    apartmentId: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    assignedToId?: string | null
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    attachments?: AttachmentUncheckedCreateNestedManyWithoutMaintenanceTicketInput
    messages?: MessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketCreateOrConnectWithoutAiAssistantMessagesInput = {
    where: MaintenanceTicketWhereUniqueInput
    create: XOR<MaintenanceTicketCreateWithoutAiAssistantMessagesInput, MaintenanceTicketUncheckedCreateWithoutAiAssistantMessagesInput>
  }

  export type ApartmentUpsertWithoutAiAssistantMessagesInput = {
    update: XOR<ApartmentUpdateWithoutAiAssistantMessagesInput, ApartmentUncheckedUpdateWithoutAiAssistantMessagesInput>
    create: XOR<ApartmentCreateWithoutAiAssistantMessagesInput, ApartmentUncheckedCreateWithoutAiAssistantMessagesInput>
    where?: ApartmentWhereInput
  }

  export type ApartmentUpdateToOneWithWhereWithoutAiAssistantMessagesInput = {
    where?: ApartmentWhereInput
    data: XOR<ApartmentUpdateWithoutAiAssistantMessagesInput, ApartmentUncheckedUpdateWithoutAiAssistantMessagesInput>
  }

  export type ApartmentUpdateWithoutAiAssistantMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentUncheckedUpdateWithoutAiAssistantMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUncheckedUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUncheckedUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUncheckedUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutApartmentNestedInput
    apartmentAttachments?: ApartmentAttachmentUncheckedUpdateManyWithoutApartmentNestedInput
  }

  export type CleaningTaskUpsertWithoutAiAssistantMessagesInput = {
    update: XOR<CleaningTaskUpdateWithoutAiAssistantMessagesInput, CleaningTaskUncheckedUpdateWithoutAiAssistantMessagesInput>
    create: XOR<CleaningTaskCreateWithoutAiAssistantMessagesInput, CleaningTaskUncheckedCreateWithoutAiAssistantMessagesInput>
    where?: CleaningTaskWhereInput
  }

  export type CleaningTaskUpdateToOneWithWhereWithoutAiAssistantMessagesInput = {
    where?: CleaningTaskWhereInput
    data: XOR<CleaningTaskUpdateWithoutAiAssistantMessagesInput, CleaningTaskUncheckedUpdateWithoutAiAssistantMessagesInput>
  }

  export type CleaningTaskUpdateWithoutAiAssistantMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingUpdateOneWithoutCleaningTaskNestedInput
    apartment?: ApartmentUpdateOneRequiredWithoutCleaningTasksNestedInput
    assignedTo?: UserUpdateOneWithoutCleaningTasksNestedInput
    messages?: CleaningTaskMessageUpdateManyWithoutCleaningTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutCleaningTaskNestedInput
  }

  export type CleaningTaskUncheckedUpdateWithoutAiAssistantMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    bookingId?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutCleaningTaskNestedInput
  }

  export type MaintenanceTicketUpsertWithoutAiAssistantMessagesInput = {
    update: XOR<MaintenanceTicketUpdateWithoutAiAssistantMessagesInput, MaintenanceTicketUncheckedUpdateWithoutAiAssistantMessagesInput>
    create: XOR<MaintenanceTicketCreateWithoutAiAssistantMessagesInput, MaintenanceTicketUncheckedCreateWithoutAiAssistantMessagesInput>
    where?: MaintenanceTicketWhereInput
  }

  export type MaintenanceTicketUpdateToOneWithWhereWithoutAiAssistantMessagesInput = {
    where?: MaintenanceTicketWhereInput
    data: XOR<MaintenanceTicketUpdateWithoutAiAssistantMessagesInput, MaintenanceTicketUncheckedUpdateWithoutAiAssistantMessagesInput>
  }

  export type MaintenanceTicketUpdateWithoutAiAssistantMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    apartment?: ApartmentUpdateOneRequiredWithoutMaintenanceTicketsNestedInput
    assignedTo?: UserUpdateOneWithoutMaintenanceTicketsNestedInput
    attachments?: AttachmentUpdateManyWithoutMaintenanceTicketNestedInput
    messages?: MessageUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type MaintenanceTicketUncheckedUpdateWithoutAiAssistantMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attachments?: AttachmentUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
    messages?: MessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type MaintenanceTicketCreateWithoutAttachmentsInput = {
    id?: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    apartment: ApartmentCreateNestedOneWithoutMaintenanceTicketsInput
    assignedTo?: UserCreateNestedOneWithoutMaintenanceTicketsInput
    messages?: MessageCreateNestedManyWithoutMaintenanceTicketInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketUncheckedCreateWithoutAttachmentsInput = {
    id?: string
    apartmentId: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    assignedToId?: string | null
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    messages?: MessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketCreateOrConnectWithoutAttachmentsInput = {
    where: MaintenanceTicketWhereUniqueInput
    create: XOR<MaintenanceTicketCreateWithoutAttachmentsInput, MaintenanceTicketUncheckedCreateWithoutAttachmentsInput>
  }

  export type CleaningTaskCreateWithoutAttachmentsInput = {
    id?: string
    date: Date | string
    status: string
    createdAt?: Date | string
    notes?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingCreateNestedOneWithoutCleaningTaskInput
    apartment: ApartmentCreateNestedOneWithoutCleaningTasksInput
    assignedTo?: UserCreateNestedOneWithoutCleaningTasksInput
    messages?: CleaningTaskMessageCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskUncheckedCreateWithoutAttachmentsInput = {
    id?: string
    apartmentId: string
    date: Date | string
    status: string
    createdAt?: Date | string
    assignedToId?: string | null
    notes?: string | null
    bookingId?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskCreateOrConnectWithoutAttachmentsInput = {
    where: CleaningTaskWhereUniqueInput
    create: XOR<CleaningTaskCreateWithoutAttachmentsInput, CleaningTaskUncheckedCreateWithoutAttachmentsInput>
  }

  export type MessageCreateWithoutAttachmentInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    readByManagerAt?: Date | string | null
    maintenanceTicket: MaintenanceTicketCreateNestedOneWithoutMessagesInput
  }

  export type MessageUncheckedCreateWithoutAttachmentInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    maintenanceTicketId: string
    readByManagerAt?: Date | string | null
  }

  export type MessageCreateOrConnectWithoutAttachmentInput = {
    where: MessageWhereUniqueInput
    create: XOR<MessageCreateWithoutAttachmentInput, MessageUncheckedCreateWithoutAttachmentInput>
  }

  export type MessageCreateManyAttachmentInputEnvelope = {
    data: MessageCreateManyAttachmentInput | MessageCreateManyAttachmentInput[]
    skipDuplicates?: boolean
  }

  export type CleaningTaskMessageCreateWithoutAttachmentInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    readByManagerAt?: Date | string | null
    cleaningTask: CleaningTaskCreateNestedOneWithoutMessagesInput
  }

  export type CleaningTaskMessageUncheckedCreateWithoutAttachmentInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    cleaningTaskId: string
    readByManagerAt?: Date | string | null
  }

  export type CleaningTaskMessageCreateOrConnectWithoutAttachmentInput = {
    where: CleaningTaskMessageWhereUniqueInput
    create: XOR<CleaningTaskMessageCreateWithoutAttachmentInput, CleaningTaskMessageUncheckedCreateWithoutAttachmentInput>
  }

  export type CleaningTaskMessageCreateManyAttachmentInputEnvelope = {
    data: CleaningTaskMessageCreateManyAttachmentInput | CleaningTaskMessageCreateManyAttachmentInput[]
    skipDuplicates?: boolean
  }

  export type MaintenanceTicketUpsertWithoutAttachmentsInput = {
    update: XOR<MaintenanceTicketUpdateWithoutAttachmentsInput, MaintenanceTicketUncheckedUpdateWithoutAttachmentsInput>
    create: XOR<MaintenanceTicketCreateWithoutAttachmentsInput, MaintenanceTicketUncheckedCreateWithoutAttachmentsInput>
    where?: MaintenanceTicketWhereInput
  }

  export type MaintenanceTicketUpdateToOneWithWhereWithoutAttachmentsInput = {
    where?: MaintenanceTicketWhereInput
    data: XOR<MaintenanceTicketUpdateWithoutAttachmentsInput, MaintenanceTicketUncheckedUpdateWithoutAttachmentsInput>
  }

  export type MaintenanceTicketUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    apartment?: ApartmentUpdateOneRequiredWithoutMaintenanceTicketsNestedInput
    assignedTo?: UserUpdateOneWithoutMaintenanceTicketsNestedInput
    messages?: MessageUpdateManyWithoutMaintenanceTicketNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type MaintenanceTicketUncheckedUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    messages?: MessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type CleaningTaskUpsertWithoutAttachmentsInput = {
    update: XOR<CleaningTaskUpdateWithoutAttachmentsInput, CleaningTaskUncheckedUpdateWithoutAttachmentsInput>
    create: XOR<CleaningTaskCreateWithoutAttachmentsInput, CleaningTaskUncheckedCreateWithoutAttachmentsInput>
    where?: CleaningTaskWhereInput
  }

  export type CleaningTaskUpdateToOneWithWhereWithoutAttachmentsInput = {
    where?: CleaningTaskWhereInput
    data: XOR<CleaningTaskUpdateWithoutAttachmentsInput, CleaningTaskUncheckedUpdateWithoutAttachmentsInput>
  }

  export type CleaningTaskUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingUpdateOneWithoutCleaningTaskNestedInput
    apartment?: ApartmentUpdateOneRequiredWithoutCleaningTasksNestedInput
    assignedTo?: UserUpdateOneWithoutCleaningTasksNestedInput
    messages?: CleaningTaskMessageUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutCleaningTaskNestedInput
  }

  export type CleaningTaskUncheckedUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    bookingId?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
  }

  export type MessageUpsertWithWhereUniqueWithoutAttachmentInput = {
    where: MessageWhereUniqueInput
    update: XOR<MessageUpdateWithoutAttachmentInput, MessageUncheckedUpdateWithoutAttachmentInput>
    create: XOR<MessageCreateWithoutAttachmentInput, MessageUncheckedCreateWithoutAttachmentInput>
  }

  export type MessageUpdateWithWhereUniqueWithoutAttachmentInput = {
    where: MessageWhereUniqueInput
    data: XOR<MessageUpdateWithoutAttachmentInput, MessageUncheckedUpdateWithoutAttachmentInput>
  }

  export type MessageUpdateManyWithWhereWithoutAttachmentInput = {
    where: MessageScalarWhereInput
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyWithoutAttachmentInput>
  }

  export type CleaningTaskMessageUpsertWithWhereUniqueWithoutAttachmentInput = {
    where: CleaningTaskMessageWhereUniqueInput
    update: XOR<CleaningTaskMessageUpdateWithoutAttachmentInput, CleaningTaskMessageUncheckedUpdateWithoutAttachmentInput>
    create: XOR<CleaningTaskMessageCreateWithoutAttachmentInput, CleaningTaskMessageUncheckedCreateWithoutAttachmentInput>
  }

  export type CleaningTaskMessageUpdateWithWhereUniqueWithoutAttachmentInput = {
    where: CleaningTaskMessageWhereUniqueInput
    data: XOR<CleaningTaskMessageUpdateWithoutAttachmentInput, CleaningTaskMessageUncheckedUpdateWithoutAttachmentInput>
  }

  export type CleaningTaskMessageUpdateManyWithWhereWithoutAttachmentInput = {
    where: CleaningTaskMessageScalarWhereInput
    data: XOR<CleaningTaskMessageUpdateManyMutationInput, CleaningTaskMessageUncheckedUpdateManyWithoutAttachmentInput>
  }

  export type ApartmentCreateWithoutApartmentAttachmentsInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketCreateNestedManyWithoutApartmentInput
    notifications?: NotificationCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentUncheckedCreateWithoutApartmentAttachmentsInput = {
    id?: string
    name: string
    apartmentCode?: string | null
    address: string
    latitude: number
    longitude: number
    squareMeters: number
    bedrooms: number
    bathrooms: number
    maxGuests: number
    accessInstructions?: string | null
    icalUrl?: string | null
    lastSyncAt?: Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutApartmentInput
    checklistItems?: ChecklistItemUncheckedCreateNestedManyWithoutApartmentInput
    cleaningTasks?: CleaningTaskUncheckedCreateNestedManyWithoutApartmentInput
    maintenanceTickets?: MaintenanceTicketUncheckedCreateNestedManyWithoutApartmentInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutApartmentInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutApartmentInput
  }

  export type ApartmentCreateOrConnectWithoutApartmentAttachmentsInput = {
    where: ApartmentWhereUniqueInput
    create: XOR<ApartmentCreateWithoutApartmentAttachmentsInput, ApartmentUncheckedCreateWithoutApartmentAttachmentsInput>
  }

  export type ApartmentUpsertWithoutApartmentAttachmentsInput = {
    update: XOR<ApartmentUpdateWithoutApartmentAttachmentsInput, ApartmentUncheckedUpdateWithoutApartmentAttachmentsInput>
    create: XOR<ApartmentCreateWithoutApartmentAttachmentsInput, ApartmentUncheckedCreateWithoutApartmentAttachmentsInput>
    where?: ApartmentWhereInput
  }

  export type ApartmentUpdateToOneWithWhereWithoutApartmentAttachmentsInput = {
    where?: ApartmentWhereInput
    data: XOR<ApartmentUpdateWithoutApartmentAttachmentsInput, ApartmentUncheckedUpdateWithoutApartmentAttachmentsInput>
  }

  export type ApartmentUpdateWithoutApartmentAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutApartmentNestedInput
  }

  export type ApartmentUncheckedUpdateWithoutApartmentAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apartmentCode?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    squareMeters?: IntFieldUpdateOperationsInput | number
    bedrooms?: IntFieldUpdateOperationsInput | number
    bathrooms?: IntFieldUpdateOperationsInput | number
    maxGuests?: IntFieldUpdateOperationsInput | number
    accessInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    icalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    technicalProfile?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutApartmentNestedInput
    checklistItems?: ChecklistItemUncheckedUpdateManyWithoutApartmentNestedInput
    cleaningTasks?: CleaningTaskUncheckedUpdateManyWithoutApartmentNestedInput
    maintenanceTickets?: MaintenanceTicketUncheckedUpdateManyWithoutApartmentNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutApartmentNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutApartmentNestedInput
  }

  export type MaintenanceTicketCreateWithoutMessagesInput = {
    id?: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    apartment: ApartmentCreateNestedOneWithoutMaintenanceTicketsInput
    assignedTo?: UserCreateNestedOneWithoutMaintenanceTicketsInput
    attachments?: AttachmentCreateNestedManyWithoutMaintenanceTicketInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketUncheckedCreateWithoutMessagesInput = {
    id?: string
    apartmentId: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    assignedToId?: string | null
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
    attachments?: AttachmentUncheckedCreateNestedManyWithoutMaintenanceTicketInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutMaintenanceTicketInput
  }

  export type MaintenanceTicketCreateOrConnectWithoutMessagesInput = {
    where: MaintenanceTicketWhereUniqueInput
    create: XOR<MaintenanceTicketCreateWithoutMessagesInput, MaintenanceTicketUncheckedCreateWithoutMessagesInput>
  }

  export type AttachmentCreateWithoutMessagesInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    maintenanceTicket?: MaintenanceTicketCreateNestedOneWithoutAttachmentsInput
    cleaningTask?: CleaningTaskCreateNestedOneWithoutAttachmentsInput
    cleaningMessages?: CleaningTaskMessageCreateNestedManyWithoutAttachmentInput
  }

  export type AttachmentUncheckedCreateWithoutMessagesInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    maintenanceTicketId?: string | null
    cleaningTaskId?: string | null
    cleaningMessages?: CleaningTaskMessageUncheckedCreateNestedManyWithoutAttachmentInput
  }

  export type AttachmentCreateOrConnectWithoutMessagesInput = {
    where: AttachmentWhereUniqueInput
    create: XOR<AttachmentCreateWithoutMessagesInput, AttachmentUncheckedCreateWithoutMessagesInput>
  }

  export type MaintenanceTicketUpsertWithoutMessagesInput = {
    update: XOR<MaintenanceTicketUpdateWithoutMessagesInput, MaintenanceTicketUncheckedUpdateWithoutMessagesInput>
    create: XOR<MaintenanceTicketCreateWithoutMessagesInput, MaintenanceTicketUncheckedCreateWithoutMessagesInput>
    where?: MaintenanceTicketWhereInput
  }

  export type MaintenanceTicketUpdateToOneWithWhereWithoutMessagesInput = {
    where?: MaintenanceTicketWhereInput
    data: XOR<MaintenanceTicketUpdateWithoutMessagesInput, MaintenanceTicketUncheckedUpdateWithoutMessagesInput>
  }

  export type MaintenanceTicketUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    apartment?: ApartmentUpdateOneRequiredWithoutMaintenanceTicketsNestedInput
    assignedTo?: UserUpdateOneWithoutMaintenanceTicketsNestedInput
    attachments?: AttachmentUpdateManyWithoutMaintenanceTicketNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type MaintenanceTicketUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attachments?: AttachmentUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type AttachmentUpsertWithoutMessagesInput = {
    update: XOR<AttachmentUpdateWithoutMessagesInput, AttachmentUncheckedUpdateWithoutMessagesInput>
    create: XOR<AttachmentCreateWithoutMessagesInput, AttachmentUncheckedCreateWithoutMessagesInput>
    where?: AttachmentWhereInput
  }

  export type AttachmentUpdateToOneWithWhereWithoutMessagesInput = {
    where?: AttachmentWhereInput
    data: XOR<AttachmentUpdateWithoutMessagesInput, AttachmentUncheckedUpdateWithoutMessagesInput>
  }

  export type AttachmentUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicket?: MaintenanceTicketUpdateOneWithoutAttachmentsNestedInput
    cleaningTask?: CleaningTaskUpdateOneWithoutAttachmentsNestedInput
    cleaningMessages?: CleaningTaskMessageUpdateManyWithoutAttachmentNestedInput
  }

  export type AttachmentUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
    cleaningMessages?: CleaningTaskMessageUncheckedUpdateManyWithoutAttachmentNestedInput
  }

  export type CleaningTaskCreateWithoutMessagesInput = {
    id?: string
    date: Date | string
    status: string
    createdAt?: Date | string
    notes?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingCreateNestedOneWithoutCleaningTaskInput
    apartment: ApartmentCreateNestedOneWithoutCleaningTasksInput
    assignedTo?: UserCreateNestedOneWithoutCleaningTasksInput
    attachments?: AttachmentCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskUncheckedCreateWithoutMessagesInput = {
    id?: string
    apartmentId: string
    date: Date | string
    status: string
    createdAt?: Date | string
    assignedToId?: string | null
    notes?: string | null
    bookingId?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    attachments?: AttachmentUncheckedCreateNestedManyWithoutCleaningTaskInput
    aiAssistantMessages?: AIAssistantMessageUncheckedCreateNestedManyWithoutCleaningTaskInput
  }

  export type CleaningTaskCreateOrConnectWithoutMessagesInput = {
    where: CleaningTaskWhereUniqueInput
    create: XOR<CleaningTaskCreateWithoutMessagesInput, CleaningTaskUncheckedCreateWithoutMessagesInput>
  }

  export type AttachmentCreateWithoutCleaningMessagesInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    maintenanceTicket?: MaintenanceTicketCreateNestedOneWithoutAttachmentsInput
    cleaningTask?: CleaningTaskCreateNestedOneWithoutAttachmentsInput
    messages?: MessageCreateNestedManyWithoutAttachmentInput
  }

  export type AttachmentUncheckedCreateWithoutCleaningMessagesInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    maintenanceTicketId?: string | null
    cleaningTaskId?: string | null
    messages?: MessageUncheckedCreateNestedManyWithoutAttachmentInput
  }

  export type AttachmentCreateOrConnectWithoutCleaningMessagesInput = {
    where: AttachmentWhereUniqueInput
    create: XOR<AttachmentCreateWithoutCleaningMessagesInput, AttachmentUncheckedCreateWithoutCleaningMessagesInput>
  }

  export type CleaningTaskUpsertWithoutMessagesInput = {
    update: XOR<CleaningTaskUpdateWithoutMessagesInput, CleaningTaskUncheckedUpdateWithoutMessagesInput>
    create: XOR<CleaningTaskCreateWithoutMessagesInput, CleaningTaskUncheckedCreateWithoutMessagesInput>
    where?: CleaningTaskWhereInput
  }

  export type CleaningTaskUpdateToOneWithWhereWithoutMessagesInput = {
    where?: CleaningTaskWhereInput
    data: XOR<CleaningTaskUpdateWithoutMessagesInput, CleaningTaskUncheckedUpdateWithoutMessagesInput>
  }

  export type CleaningTaskUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingUpdateOneWithoutCleaningTaskNestedInput
    apartment?: ApartmentUpdateOneRequiredWithoutCleaningTasksNestedInput
    assignedTo?: UserUpdateOneWithoutCleaningTasksNestedInput
    attachments?: AttachmentUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutCleaningTaskNestedInput
  }

  export type CleaningTaskUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    bookingId?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    attachments?: AttachmentUncheckedUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
  }

  export type AttachmentUpsertWithoutCleaningMessagesInput = {
    update: XOR<AttachmentUpdateWithoutCleaningMessagesInput, AttachmentUncheckedUpdateWithoutCleaningMessagesInput>
    create: XOR<AttachmentCreateWithoutCleaningMessagesInput, AttachmentUncheckedCreateWithoutCleaningMessagesInput>
    where?: AttachmentWhereInput
  }

  export type AttachmentUpdateToOneWithWhereWithoutCleaningMessagesInput = {
    where?: AttachmentWhereInput
    data: XOR<AttachmentUpdateWithoutCleaningMessagesInput, AttachmentUncheckedUpdateWithoutCleaningMessagesInput>
  }

  export type AttachmentUpdateWithoutCleaningMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicket?: MaintenanceTicketUpdateOneWithoutAttachmentsNestedInput
    cleaningTask?: CleaningTaskUpdateOneWithoutAttachmentsNestedInput
    messages?: MessageUpdateManyWithoutAttachmentNestedInput
  }

  export type AttachmentUncheckedUpdateWithoutCleaningMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
    messages?: MessageUncheckedUpdateManyWithoutAttachmentNestedInput
  }

  export type CleaningTaskCreateManyAssignedToInput = {
    id?: string
    apartmentId: string
    date: Date | string
    status: string
    createdAt?: Date | string
    notes?: string | null
    bookingId?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MaintenanceTicketCreateManyAssignedToInput = {
    id?: string
    apartmentId: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
  }

  export type CleaningTaskUpdateWithoutAssignedToInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingUpdateOneWithoutCleaningTaskNestedInput
    apartment?: ApartmentUpdateOneRequiredWithoutCleaningTasksNestedInput
    messages?: CleaningTaskMessageUpdateManyWithoutCleaningTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutCleaningTaskNestedInput
  }

  export type CleaningTaskUncheckedUpdateWithoutAssignedToInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    bookingId?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
  }

  export type CleaningTaskUncheckedUpdateManyWithoutAssignedToInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    bookingId?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MaintenanceTicketUpdateWithoutAssignedToInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    apartment?: ApartmentUpdateOneRequiredWithoutMaintenanceTicketsNestedInput
    attachments?: AttachmentUpdateManyWithoutMaintenanceTicketNestedInput
    messages?: MessageUpdateManyWithoutMaintenanceTicketNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type MaintenanceTicketUncheckedUpdateWithoutAssignedToInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attachments?: AttachmentUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
    messages?: MessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type MaintenanceTicketUncheckedUpdateManyWithoutAssignedToInput = {
    id?: StringFieldUpdateOperationsInput | string
    apartmentId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BookingCreateManyApartmentInput = {
    id?: string
    guestName?: string | null
    totalGuests: number
    checkInDate: Date | string
    checkOutDate: Date | string
    status?: string | null
    externalId?: string | null
    source?: string | null
    createdAt?: Date | string
  }

  export type ChecklistItemCreateManyApartmentInput = {
    id?: string
    label: string
    required?: boolean
    order?: number
    createdAt?: Date | string
    formula?: string | null
    type?: string
  }

  export type CleaningTaskCreateManyApartmentInput = {
    id?: string
    date: Date | string
    status: string
    createdAt?: Date | string
    assignedToId?: string | null
    notes?: string | null
    bookingId?: string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MaintenanceTicketCreateManyApartmentInput = {
    id?: string
    title: string
    description: string
    status: string
    priority: string
    createdAt?: Date | string
    assignedToId?: string | null
    scheduledStart?: Date | string | null
    scheduledEnd?: Date | string | null
    startedAt?: Date | string | null
    resolvedAt?: Date | string | null
  }

  export type NotificationCreateManyApartmentInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
  }

  export type AIAssistantMessageCreateManyApartmentInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    cleaningTaskId?: string | null
    maintenanceTicketId?: string | null
    createdAt?: Date | string
  }

  export type ApartmentAttachmentCreateManyApartmentInput = {
    id?: string
    filename: string
    url?: string | null
    mimeType?: string | null
    size?: number | null
    category?: string
    extractedText?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BookingUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    guestName?: NullableStringFieldUpdateOperationsInput | string | null
    totalGuests?: IntFieldUpdateOperationsInput | number
    checkInDate?: DateTimeFieldUpdateOperationsInput | Date | string
    checkOutDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTask?: CleaningTaskUpdateOneWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    guestName?: NullableStringFieldUpdateOperationsInput | string | null
    totalGuests?: IntFieldUpdateOperationsInput | number
    checkInDate?: DateTimeFieldUpdateOperationsInput | Date | string
    checkOutDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTask?: CleaningTaskUncheckedUpdateOneWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateManyWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    guestName?: NullableStringFieldUpdateOperationsInput | string | null
    totalGuests?: IntFieldUpdateOperationsInput | number
    checkInDate?: DateTimeFieldUpdateOperationsInput | Date | string
    checkOutDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChecklistItemUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    required?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
  }

  export type ChecklistItemUncheckedUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    required?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
  }

  export type ChecklistItemUncheckedUpdateManyWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    required?: BoolFieldUpdateOperationsInput | boolean
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
  }

  export type CleaningTaskUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    booking?: BookingUpdateOneWithoutCleaningTaskNestedInput
    assignedTo?: UserUpdateOneWithoutCleaningTasksNestedInput
    messages?: CleaningTaskMessageUpdateManyWithoutCleaningTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutCleaningTaskNestedInput
  }

  export type CleaningTaskUncheckedUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    bookingId?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
    messages?: CleaningTaskMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutCleaningTaskNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutCleaningTaskNestedInput
  }

  export type CleaningTaskUncheckedUpdateManyWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    bookingId?: NullableStringFieldUpdateOperationsInput | string | null
    checklistProgress?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MaintenanceTicketUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedTo?: UserUpdateOneWithoutMaintenanceTicketsNestedInput
    attachments?: AttachmentUpdateManyWithoutMaintenanceTicketNestedInput
    messages?: MessageUpdateManyWithoutMaintenanceTicketNestedInput
    aiAssistantMessages?: AIAssistantMessageUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type MaintenanceTicketUncheckedUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attachments?: AttachmentUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
    messages?: MessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
    aiAssistantMessages?: AIAssistantMessageUncheckedUpdateManyWithoutMaintenanceTicketNestedInput
  }

  export type MaintenanceTicketUncheckedUpdateManyWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type NotificationUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIAssistantMessageUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTask?: CleaningTaskUpdateOneWithoutAiAssistantMessagesNestedInput
    maintenanceTicket?: MaintenanceTicketUpdateOneWithoutAiAssistantMessagesNestedInput
  }

  export type AIAssistantMessageUncheckedUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIAssistantMessageUncheckedUpdateManyWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApartmentAttachmentUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApartmentAttachmentUncheckedUpdateWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApartmentAttachmentUncheckedUpdateManyWithoutApartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    category?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CleaningTaskMessageCreateManyCleaningTaskInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    attachmentId?: string | null
    readByManagerAt?: Date | string | null
  }

  export type AttachmentCreateManyCleaningTaskInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    maintenanceTicketId?: string | null
  }

  export type AIAssistantMessageCreateManyCleaningTaskInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    apartmentId?: string | null
    maintenanceTicketId?: string | null
    createdAt?: Date | string
  }

  export type CleaningTaskMessageUpdateWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attachment?: AttachmentUpdateOneWithoutCleaningMessagesNestedInput
  }

  export type CleaningTaskMessageUncheckedUpdateWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CleaningTaskMessageUncheckedUpdateManyWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AttachmentUpdateWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicket?: MaintenanceTicketUpdateOneWithoutAttachmentsNestedInput
    messages?: MessageUpdateManyWithoutAttachmentNestedInput
    cleaningMessages?: CleaningTaskMessageUpdateManyWithoutAttachmentNestedInput
  }

  export type AttachmentUncheckedUpdateWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    messages?: MessageUncheckedUpdateManyWithoutAttachmentNestedInput
    cleaningMessages?: CleaningTaskMessageUncheckedUpdateManyWithoutAttachmentNestedInput
  }

  export type AttachmentUncheckedUpdateManyWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AIAssistantMessageUpdateWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apartment?: ApartmentUpdateOneWithoutAiAssistantMessagesNestedInput
    maintenanceTicket?: MaintenanceTicketUpdateOneWithoutAiAssistantMessagesNestedInput
  }

  export type AIAssistantMessageUncheckedUpdateWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    apartmentId?: NullableStringFieldUpdateOperationsInput | string | null
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIAssistantMessageUncheckedUpdateManyWithoutCleaningTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    apartmentId?: NullableStringFieldUpdateOperationsInput | string | null
    maintenanceTicketId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentCreateManyMaintenanceTicketInput = {
    id?: string
    url: string
    fileName?: string
    fileType?: string | null
    createdAt?: Date | string
    cleaningTaskId?: string | null
  }

  export type MessageCreateManyMaintenanceTicketInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    attachmentId?: string | null
    readByManagerAt?: Date | string | null
  }

  export type AIAssistantMessageCreateManyMaintenanceTicketInput = {
    id?: string
    role: $Enums.AIAssistantMessageRole
    content: string
    userRole: $Enums.Role
    apartmentId?: string | null
    cleaningTaskId?: string | null
    createdAt?: Date | string
  }

  export type AttachmentUpdateWithoutMaintenanceTicketInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTask?: CleaningTaskUpdateOneWithoutAttachmentsNestedInput
    messages?: MessageUpdateManyWithoutAttachmentNestedInput
    cleaningMessages?: CleaningTaskMessageUpdateManyWithoutAttachmentNestedInput
  }

  export type AttachmentUncheckedUpdateWithoutMaintenanceTicketInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
    messages?: MessageUncheckedUpdateManyWithoutAttachmentNestedInput
    cleaningMessages?: CleaningTaskMessageUncheckedUpdateManyWithoutAttachmentNestedInput
  }

  export type AttachmentUncheckedUpdateManyWithoutMaintenanceTicketInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MessageUpdateWithoutMaintenanceTicketInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attachment?: AttachmentUpdateOneWithoutMessagesNestedInput
  }

  export type MessageUncheckedUpdateWithoutMaintenanceTicketInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageUncheckedUpdateManyWithoutMaintenanceTicketInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AIAssistantMessageUpdateWithoutMaintenanceTicketInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apartment?: ApartmentUpdateOneWithoutAiAssistantMessagesNestedInput
    cleaningTask?: CleaningTaskUpdateOneWithoutAiAssistantMessagesNestedInput
  }

  export type AIAssistantMessageUncheckedUpdateWithoutMaintenanceTicketInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    apartmentId?: NullableStringFieldUpdateOperationsInput | string | null
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIAssistantMessageUncheckedUpdateManyWithoutMaintenanceTicketInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumAIAssistantMessageRoleFieldUpdateOperationsInput | $Enums.AIAssistantMessageRole
    content?: StringFieldUpdateOperationsInput | string
    userRole?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    apartmentId?: NullableStringFieldUpdateOperationsInput | string | null
    cleaningTaskId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageCreateManyAttachmentInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    maintenanceTicketId: string
    readByManagerAt?: Date | string | null
  }

  export type CleaningTaskMessageCreateManyAttachmentInput = {
    id?: string
    text?: string | null
    role: string
    senderName: string
    createdAt?: Date | string
    cleaningTaskId: string
    readByManagerAt?: Date | string | null
  }

  export type MessageUpdateWithoutAttachmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maintenanceTicket?: MaintenanceTicketUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type MessageUncheckedUpdateWithoutAttachmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicketId?: StringFieldUpdateOperationsInput | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageUncheckedUpdateManyWithoutAttachmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maintenanceTicketId?: StringFieldUpdateOperationsInput | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CleaningTaskMessageUpdateWithoutAttachmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cleaningTask?: CleaningTaskUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type CleaningTaskMessageUncheckedUpdateWithoutAttachmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTaskId?: StringFieldUpdateOperationsInput | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CleaningTaskMessageUncheckedUpdateManyWithoutAttachmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    text?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cleaningTaskId?: StringFieldUpdateOperationsInput | string
    readByManagerAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}