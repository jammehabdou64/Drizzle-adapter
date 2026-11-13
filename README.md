# Drizzle adapter

Javel lifecycle wrapper for a Drizzle database. `connect()` registers the client as `app("drizzle")`. `disconnect()` closes the pool you pass in.

## Drizzle setup

### 1. Install

```bash
bun add javel-drizzle-adapter
bun add drizzle-orm
bun add postgres           # or mysql2 / better-sqlite3 / @libsql/client
bun add -d drizzle-kit
```

### 2. Configure in `config/database.ts`

Pass `{ schema }` when you want Drizzle's relational `db.query` API.

```typescript
// config/database.ts
import { env } from "javel-jcc/helpers";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../database/schema";

const connectionString = env(
  "DATABASE_URL",
  "postgres://root:secret@127.0.0.1:5432/app",
);
const client = postgres(connectionString);

export const database = {
  // ... other configs ...

  drizzle: {
    client: drizzle(client, { schema }),
    pool: client,
  },
};
```

### 3. Provider (`app/Providers/DrizzleServiceProvider.ts`)

```typescript
// app/Providers/DrizzleServiceProvider.ts
import { ServiceProvider } from "javel-jcc/Providers/ServiceProvider";
import { DrizzleAdapter } from "javel-drizzle-adapter";

export class DrizzleServiceProvider extends ServiceProvider {
  private _db = new DrizzleAdapter(this.app.config("database.drizzle"));

  async register() {}

  async boot() {
    await this._db.connect();
  }
}
```

Register it in `app/bootstrap/providers.ts`:

```typescript
import { AppServiceProvider } from "../Providers/AppServiceProvider";
import { DrizzleServiceProvider } from "../Providers/DrizzleServiceProvider";
import { RouteServiceProvider } from "../Providers/RouteServiceProvider";

export const providers = [
  AppServiceProvider,
  DrizzleServiceProvider,
  RouteServiceProvider,
];
```

### 4. Use in your application

**Via Constructor Injection (`@InjectDrizzle`):**

Inject the Drizzle database instance directly into a service or controller constructor using `@InjectDrizzle()`:

```typescript
// app/Services/UsersService.ts
import { Inject } from "javel-jcc";
import { InjectDrizzle } from "javel-drizzle-adapter";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "../../database/schema";

@Inject()
export class UsersService {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async all() {
    return await this.db.query.users.findMany();
  }
}
```

Or inject directly into a Controller:

```typescript
// app/Http/Controllers/UserController.ts
import { Controller } from "javel-jcc/Routing/Controller";
import { Action, Inject } from "javel-jcc";
import { InjectDrizzle } from "javel-drizzle-adapter";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "../../../database/schema";

@Inject()
export class UserController extends Controller {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {
    super();
  }

  @Action()
  async index() {
    const users = await this.db.query.users.findMany();
    return { users };
  }
}
```

**Via `app("drizzle")`:**

```typescript
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "../database/schema";

const db = app<PostgresJsDatabase<typeof schema>>("drizzle");
const users = await db.query.users.findMany();
```

`getConnection()` throws `drizzle is not connected. Call connect() first.` until `connect()` has finished. Call `disconnect()` when the application shuts down.
