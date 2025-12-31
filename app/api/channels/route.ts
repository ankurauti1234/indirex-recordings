/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Channel } from "@/lib/entities/Channel";

export async function GET() {
  try {
    const db = await getDb();

    if (!db.hasMetadata(Channel)) {
      throw new Error("Channel metadata not found");
    }

    const channels = await db.getRepository(Channel).find({
      relations: ["genre"],
      order: { name: "ASC" },
    });

    return NextResponse.json(channels);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}