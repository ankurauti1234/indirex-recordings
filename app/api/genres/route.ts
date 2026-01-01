/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT 
         id,
         genre_name AS "genreName"
       FROM channel_genre
       ORDER BY genre_name ASC`
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch genres" },
      { status: 500 }
    );
  }
}
