import type { Knex } from "knex";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env") });

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
