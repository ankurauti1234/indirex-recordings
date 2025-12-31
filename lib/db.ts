import "reflect-metadata"
import { DataSource } from "typeorm"
import { Channel } from "./entities/Channel"
import { ChannelGenre } from "./entities/ChannelGenre"
import { VideoRecording } from "./entities/VideoRecording"
import { User } from "./entities/User"

const isDev = process.env.NODE_ENV === "development"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: isDev, // Set to false in production
  logging: isDev,
  entities: [Channel, ChannelGenre, VideoRecording, User],
  subscribers: [],
  migrations: [],
  ssl: {
    rejectUnauthorized: false, // Required for many RDS/managed DBs
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
