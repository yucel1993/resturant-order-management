import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Table from "@/models/Table"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const table = await Table.findById(params.id)

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json(table)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch table" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    await connectToDatabase()

    const table = await Table.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json(table)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const table = await Table.findByIdAndDelete(params.id)

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Table deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 })
  }
}

