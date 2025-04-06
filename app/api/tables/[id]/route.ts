import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Table from "@/models/Table"

// Update the GET function to await params
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const { id } = await params
    const table = await Table.findById(id)

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json(table)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch table" }, { status: 500 })
  }
}

// Update the PUT function to await params
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    await connectToDatabase()
    const { id } = await params

    const table = await Table.findByIdAndUpdate(id, body, { new: true, runValidators: true })

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json(table)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 })
  }
}

// Update the DELETE function to await params
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const { id } = await params
    const table = await Table.findByIdAndDelete(id)

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Table deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 })
  }
}

