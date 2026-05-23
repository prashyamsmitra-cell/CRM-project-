import { loadEnvFile } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

loadEnvFile(path.resolve(currentDir, "../../apps/backend/.env"));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set for drizzle-kit.");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
