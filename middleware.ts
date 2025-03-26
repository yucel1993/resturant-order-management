import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path is for admin routes (excluding the login page)
  const isAdminRoute = path.startsWith("/admin") && !path.startsWith("/admin/login")

  // Get the authentication cookie
  const adminAuth = request.cookies.get("admin-auth")?.value

  // If it's an admin route and the user is not authenticated, redirect to login
  if (isAdminRoute && adminAuth !== "true") {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

// Configure the paths that should be checked by the middleware
export const config = {
  matcher: ["/admin/:path*"],
}

