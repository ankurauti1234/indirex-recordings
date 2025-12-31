/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { ChannelGenre } from "@/lib/entities/ChannelGenre"

export async function GET() {
  try {
    const db = await getDb()

    if (!db.hasMetadata(ChannelGenre)) {
      throw new Error("ChannelGenre metadata not found")
    }

    const genres = await db.getRepository(ChannelGenre).find({
      order: { genreName: "ASC" },
    })
    return NextResponse.json(genres)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
