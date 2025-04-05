import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Settings from "@/models/Settings"

export async function GET() {
  try {
    await connectToDatabase()

    // Get the first settings document or create a default one if none exists
    let settings = await Settings.findOne({})

    if (!settings) {
      settings = new Settings({
        restaurantName: "My Restaurant",
        latitude: 37.7749,
        longitude: -122.4194,
        geofenceRadius: 500,
      })
      await settings.save()
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await connectToDatabase()

    // Find existing settings or create new ones
    let settings = await Settings.findOne({})

    if (settings) {
      // Update existing settings
      Object.assign(settings, body)
    } else {
      // Create new settings
      settings = new Settings(body)
    }

    await settings.save()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}

