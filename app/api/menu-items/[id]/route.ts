import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import MenuItem from "@/models/MenuItem"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const menuItem = await MenuItem.findById(params.id).populate("category")

    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json(menuItem)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menu item" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    await connectToDatabase()

    const menuItem = await MenuItem.findByIdAndUpdate(params.id, body, { new: true, runValidators: true }).populate(
      "category",
    )

    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json(menuItem)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const menuItem = await MenuItem.findByIdAndDelete(params.id)

    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Menu item deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
  }
}

