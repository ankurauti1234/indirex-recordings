/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { User } from "@/lib/entities/User"
import bcrypt from "bcrypt"
import { login } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()
    const db = await getDb()

    if (!db.hasMetadata(User)) {
      throw new Error("User metadata not found. Initialization sequence failed.")
    }

    const userRepository = db.getRepository(User)

    const existingUser = await userRepository.findOne({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = userRepository.create({
      email,
      password: hashedPassword,
      name,
    })

    await userRepository.save(user)

    // Auto login after registration
    await login({ id: user.id, email: user.email, name: user.name })

    return NextResponse.json({ success: true, user: { email: user.email, name: user.name } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
