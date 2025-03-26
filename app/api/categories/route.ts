import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Category from "@/models/Category"

export async function GET() {
  try {
    await connectToDatabase()
    const categories = await Category.find({}).sort({ order: 1 })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await connectToDatabase()
    const category = new Category(body)
    await category.save()
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

