/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query } from "@/lib/db";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Check if user exists
    const existing = await query(
      `SELECT 1 FROM users WHERE email = $1`,
      [email]
    );

    if (existing.rowCount != null && existing.rowCount > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await query(
      `INSERT INTO users (email, password, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [email, hashedPassword, name]
    );

    const user = rows[0];

    // Auto-login after registration
    await login({ id: user.id, email: user.email, name: user.name });

    return NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Registration failed" },
      { status: 500 }
    );
  }
}
