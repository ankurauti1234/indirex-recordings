/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { User } from "@/lib/entities/User"  // ← Fix this line
import bcrypt from "bcrypt"
import { login } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const db = await getDb()
    const userRepository = db.getRepository(User)

    const user = await userRepository.findOne({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await login({ id: user.id, email: user.email, name: user.name })

    return NextResponse.json({ success: true, user: { email: user.email, name: user.name } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}