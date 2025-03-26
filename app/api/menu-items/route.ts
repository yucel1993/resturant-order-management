import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import MenuItem from "@/models/MenuItem"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = {}
    if (category) {
      query = { category }
    }

    const menuItems = await MenuItem.find(query).populate("category")
    return NextResponse.json(menuItems)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await connectToDatabase()
    const menuItem = new MenuItem(body)
    await menuItem.save()
    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 })
  }
}

