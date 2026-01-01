/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const channelId = searchParams.get("channelId");
    const genreId   = searchParams.get("genreId");
    const date      = searchParams.get("date");
    const hour      = searchParams.get("hour");
    const page      = parseInt(searchParams.get("page") || "1", 10);
    const limit     = parseInt(searchParams.get("limit") || "12", 10);
    const offset    = (page - 1) * limit;

    const where: string[] = [];
    const params: any[] = [];

    if (channelId) { params.push(channelId); where.push(`c.id = $${params.length}`); }
    if (genreId)   { params.push(genreId);   where.push(`g.id = $${params.length}`); }
    if (date)      { params.push(date);      where.push(`r."recordingDate" = $${params.length}`); }
    if (hour)      { params.push(+hour);     where.push(`r.hour = $${params.length}`); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const totalRes = await query(
      `
      SELECT COUNT(*)::int AS total
      FROM video_recording r
      JOIN channel c       ON c.id = r."channelId"
      JOIN channel_genre g ON g.id = c."genreId"
      ${whereSql}
      `,
      params
    );

    const total = totalRes.rows[0]?.total ?? 0;

    const { rows } = await query(
      `
      SELECT
        r.id,
        r."recordingDate" AS "recordingDate",
        r.hour,
        r."videoUrl"      AS "videoUrl",
        r."channelId"     AS "channelId",
        c.name            AS "channelName",
        g.id              AS "genreId",
        g."genreName"     AS "genreName"
      FROM video_recording r
      JOIN channel c       ON c.id = r."channelId"
      JOIN channel_genre g ON g.id = c."genreId"
      ${whereSql}
      ORDER BY r."recordingDate" DESC, r.hour DESC
      LIMIT ${limit} OFFSET ${offset}
      `,
      params
    );

    return NextResponse.json({
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch recordings" },
      { status: 500 }
    );
  }
}
