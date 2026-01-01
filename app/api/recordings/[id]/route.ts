/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await params;
    const raw = resolved?.id;

    // Accept only positive integer ids
    if (!raw || !/^\d+$/.test(raw)) {
      return NextResponse.json(
        { error: "Invalid recording id" },
        { status: 400 }
      );
    }

    const id = parseInt(raw, 10);

    const { rows } = await query(
      `
      SELECT
        r.id,
        r."recordingDate",
        r.hour,
        r."videoUrl",
        json_build_object(
          'id', c.id,
          'channelId', c.channel_id,
          'name', c.name,
          'logoUrl', c.logo_url,
          'genre', json_build_object(
            'id', g.id,
            'genreName', g."genreName"
          )
        ) AS channel
      FROM video_recording r
      JOIN channel c       ON c.id = r."channelId"
      JOIN channel_genre g ON g.id = c."genreId"
      WHERE r.id = $1
      `,
      [id]
    );

    const recording = rows[0];

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recording);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch recording" },
      { status: 500 }
    );
  }
}
