// lib/db.ts
import "reflect-metadata"
import { DataSource } from "typeorm"

const isDev = process.env.NODE_ENV === "development"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: isDev,
  logging: isDev,
  // CHANGE THIS: Use glob pattern so all entities are included in build
  entities: [
    "src/lib/entities/**/*.ts",           // During development
    "dist/lib/entities/**/*.js",          // In production (after build)
  ],
  subscribers: [],
  migrations: [],
  ssl: {
    rejectUnauthorized: false,
  },
})

let initialized = false

export async function getDb() {
  if (!initialized) {
    await AppDataSource.initialize()
    initialized = true
  }
  return AppDataSource
}