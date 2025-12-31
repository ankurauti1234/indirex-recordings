import { NextResponse } from "next/server"
import { getSession } from "./lib/auth"

export async function proxy(request) {
  const session = await getSession()

  // Protect /dashboard and other routes
  if (
    !session &&
    (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/player"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect logged in users away from auth pages
  if (session && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/player/:path*", "/login", "/register"],
}
