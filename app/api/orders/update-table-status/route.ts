import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Table from "@/models/Table"
import Order from "@/models/Order"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableId, status } = body

    if (!tableId) {
      return NextResponse.json({ error: "Table ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Update the table status
    const table = await Table.findByIdAndUpdate(tableId, { status: status || "occupied" }, { new: true })

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, table })
  } catch (error) {
    console.error("Error updating table status:", error)
    return NextResponse.json({ error: "Failed to update table status" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get("tableId")

    if (!tableId) {
      return NextResponse.json({ error: "Table ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if there are any active orders for this table
    // Modified to only consider pending and preparing orders as active
    const activeOrders = await Order.find({
      tableId,
      status: { $in: ["pending", "preparing"] }, // Removed "ready" from active orders
    }).countDocuments()

    // Determine the appropriate table status
    let status = "available"
    if (activeOrders > 0) {
      status = "occupied"
    }

    // Update the table status
    const table = await Table.findByIdAndUpdate(tableId, { status }, { new: true })

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, table, activeOrders })
  } catch (error) {
    console.error("Error checking table status:", error)
    return NextResponse.json({ error: "Failed to check table status" }, { status: 500 })
  }
}

