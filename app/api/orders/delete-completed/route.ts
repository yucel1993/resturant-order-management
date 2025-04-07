import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Order from "@/models/Order"
import Table from "@/models/Table"

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get("tableId")

    if (!tableId) {
      return NextResponse.json({ error: "Table ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Find and delete all completed orders for the specified table
    const result = await Order.deleteMany({
      tableId: tableId,
      status: "completed",
    })

    // Check if there are any remaining active orders for this table
    // Modified to only consider pending and preparing orders as active
    const activeOrdersCount = await Order.countDocuments({
      tableId: tableId,
      status: { $in: ["pending", "preparing"] }, // Removed "ready" from active orders
    })

    // If no active orders remain, update the table status to available
    if (activeOrdersCount === 0) {
      await Table.findByIdAndUpdate(tableId, { status: "available" })
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      tableStatusUpdated: activeOrdersCount === 0,
      message: `Successfully deleted ${result.deletedCount} completed orders`,
    })
  } catch (error) {
    console.error("Error deleting completed orders:", error)
    return NextResponse.json({ error: "Failed to delete completed orders" }, { status: 500 })
  }
}

