import type { DatabaseDriver } from "./DatabaseDriver.js";
import { notConnected } from "./errors.js";

export type DrizzleCloseable = {
  end?: () => Promise<void>;
  close?: () => Promise<void>;
  destroy?: () => Promise<void> | void;
};

export type DrizzleAdapterOptions<TDb = unknown> = {
  /** Result of drizzle(...) */
  client: TDb;
  /**
   * Underlying pool/client used to close connections
   * (e.g. postgres.js sql, mysql2 pool, better-sqlite3 db).
   */
  pool?: DrizzleCloseable;
};

/**
 * Lifecycle wrapper for Drizzle ORM.
 * Drizzle itself does not own the connection — pass the pool to disconnect.
 *
 *   import { drizzle } from "drizzle-orm/node-postgres";
 *   import pg from "pg";
 *   const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
 *   const db = new DrizzleAdapter({ client: drizzle(pool), pool });
 */
export class DrizzleAdapter<TDb = unknown> implements DatabaseDriver<TDb> {
  readonly name = "drizzle";
  private _client: TDb | null = null;
  private _pool: DrizzleCloseable | undefined;
  private _connected = false;

  constructor(private options: DrizzleAdapterOptions<TDb>) {}

  async connect(): Promise<void> {
    if (this._connected && this._client) return;
    this._client = this.options.client;
    this._pool =
      this.options?.pool ||
      (this.options?.client as unknown as DrizzleCloseable);
    this._connected = true;
    app().instance("drizzle", this._client);
  }

  getConnection(): TDb {
    if (!this._client) notConnected(this.name);
    return this._client;
  }

  async disconnect(): Promise<void> {
    if (!this._connected) return;
    const pool = this._pool;
    if (pool) {
      if (typeof pool.end === "function") await pool.end();
      else if (typeof pool.close === "function") await pool.close();
      else if (typeof pool.destroy === "function") await pool.destroy();
    }
    this._client = null;
    this._connected = false;
    app().forget("drizzle");
  }

  isConnected(): boolean {
    return this._connected;
  }
}

export { InjectDrizzle } from "./Decorator.js";
