"use server"

import { cookies } from "next/headers"

export async function loginAdmin(username: string, password: string) {
  // Get admin credentials from environment variables
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  // Check if credentials are set
  if (!adminUsername || !adminPassword) {
    console.error("Admin credentials not set in environment variables")
    return {
      success: false,
      message: "Authentication system is not properly configured. Please contact support.",
    }
  }

  // Validate credentials
  if (username === adminUsername && password === adminPassword) {
    // Set an authentication cookie (this is a simple implementation)
    // In a production app, you would want to use a more secure method like JWT
    const cookieStore = cookies()
    cookieStore.set("admin-auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return {
      success: true,
      message: "Login successful",
    }
  }

  // If credentials don't match
  return {
    success: false,
    message: "Invalid username or password",
  }
}

