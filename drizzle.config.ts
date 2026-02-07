import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./server/schema-sqlite.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
});
