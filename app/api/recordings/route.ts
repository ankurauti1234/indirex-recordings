/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { VideoRecording } from "@/lib/entities/VideoRecording"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get("channelId")
    const genreId = searchParams.get("genreId")
    const date = searchParams.get("date")
    const hour = searchParams.get("hour")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const db = await getDb()

    if (!db.hasMetadata(VideoRecording)) {
      throw new Error("VideoRecording metadata not found")
    }

    const query = db
      .getRepository(VideoRecording)
      .createQueryBuilder("recording")
      .leftJoinAndSelect("recording.channel", "channel")
      .leftJoinAndSelect("channel.genre", "genre")

    if (channelId) {
      query.andWhere("channel.id = :channelId", { channelId })
    }

    if (genreId) {
      query.andWhere("genre.id = :genreId", { genreId })
    }

    if (date) {
      query.andWhere("recording.recordingDate = :date", { date })
    }

    if (hour) {
      query.andWhere("recording.hour = :hour", { hour: Number.parseInt(hour) })
    }

    const [recordings, total] = await query
      .orderBy("recording.recordingDate", "DESC")
      .addOrderBy("recording.hour", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return NextResponse.json({
      data: recordings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
