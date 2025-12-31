/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { VideoRecording } from "@/lib/entities/VideoRecording"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDb()
    const recording = await db.getRepository(VideoRecording).findOne({
      where: { id: Number.parseInt(id) },
      relations: ["channel", "channel.genre"],
    })

    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 })
    }

    return NextResponse.json(recording)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
