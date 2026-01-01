/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query } from "@/lib/db";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const { rows } = await query(
      `SELECT id, email, password, name
       FROM users
       WHERE email = $1`,
      [email]
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await login({ id: user.id, email: user.email, name: user.name });

    return NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Login failed" },
      { status: 500 }
    );
  }
}
