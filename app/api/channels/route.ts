/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await query(
      `
      SELECT 
        c.id,
        c.channel_id   AS "channelId",
        c.name,
        c.logo_url     AS "logoUrl",
        c."genreId"    AS "genreId",
        g.id           AS "genreIdDb",
        g."genreName"  AS "genreName"
      FROM channel c
      JOIN channel_genre g ON g.id = c."genreId"
      ORDER BY c.name ASC
      `
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch channels" },
      { status: 500 }
    );
  }
}
