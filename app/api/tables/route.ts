import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Table from "@/models/Table"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const number = searchParams.get("number")

    let query = {}
    if (number) {
      query = { number: Number.parseInt(number) }
    }

    const tables = await Table.find(query).sort({ number: 1 })
    return NextResponse.json(tables)
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await connectToDatabase()
    const table = new Table(body)
    await table.save()
    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 })
  }
}

