import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const tableId = searchParams.get("tableId")

    const query: any = {}
    if (status) {
      query.status = status
    }
    if (tableId) {
      query.tableId = tableId
    }

    const orders = await Order.find(query).sort({ createdAt: -1 })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await connectToDatabase()
    const order = new Order(body)
    await order.save()
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

