import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Settings from "@/models/Settings"

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { latitude, longitude } = body

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    await connectToDatabase()

    // Get restaurant settings
    const settings = await Settings.findOne({})

    if (!settings) {
      return NextResponse.json({ error: "Restaurant settings not found" }, { status: 404 })
    }

    // If location verification is disabled, always return true
    if (!settings.enableLocationVerification) {
      return NextResponse.json({ verified: true, distance: 0 })
    }

    // Calculate distance between customer and restaurant
    const distance = calculateDistance(latitude, longitude, settings.latitude, settings.longitude)

    // Check if customer is within the geofence radius
    const verified = distance <= settings.geofenceRadius

    return NextResponse.json({
      verified,
      distance,
      maxDistance: settings.geofenceRadius,
    })
  } catch (error) {
    console.error("Error verifying location:", error)
    return NextResponse.json({ error: "Failed to verify location" }, { status: 500 })
  }
}

