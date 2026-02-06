import type { Knex } from "knex";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config({ path: resolve(process.cwd(), ".env") });

const config: Knex.Config = {
  client: "postgresql",
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: "./db/migrations",
    extension: "ts",
    loadExtensions: [".ts"],
  },
};

export default config;
