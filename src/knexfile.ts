import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import type knex from "knex";

const config: knex.Knex.Config = {
  client: "postgresql",
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: "./db/migrations",
    extension: "ts",
    loadExtensions: [".ts"],
  },
};

export default config;
