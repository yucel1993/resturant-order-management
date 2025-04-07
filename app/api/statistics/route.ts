import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Order from "@/models/Order"
import MenuItem from "@/models/MenuItem"
import Category from "@/models/Category"

// Define interfaces for our data structures
interface MenuItemStat {
  id: string
  name: string
  category: string
  categoryName: string
  orderCount: number
  totalQuantity: number
  percentage?: number
  categoryPercentage?: number
}

interface CategoryStat {
  id: string
  name: string
  totalOrders: number
  percentage?: number
  items: MenuItemStat[]
}

interface CategoryStatsMap {
  [key: string]: CategoryStat
}

interface MenuItemMap {
  [key: string]: MenuItemStat
}

export async function GET() {
  try {
    await connectToDatabase()

    // Get all categories
    const categories = await Category.find({}).sort({ order: 1 })

    // Get all menu items with their categories
    const menuItems = await MenuItem.find({}).populate("category")

    // Get all orders
    const orders = await Order.find({})

    // Create a map of menu item IDs to their details
    const menuItemMap: MenuItemMap = {}

    menuItems.forEach((item) => {
      const itemId = item._id.toString()
      menuItemMap[itemId] = {
        id: itemId,
        name: item.name,
        category: typeof item.category === "object" ? item.category._id.toString() : item.category.toString(),
        categoryName: typeof item.category === "object" ? item.category.name : "",
        orderCount: 0,
        totalQuantity: 0,
      }
    })

    // Count orders for each menu item
    let totalOrderedItems = 0

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const menuItemId = item.menuItem.toString()
        if (menuItemMap[menuItemId]) {
          menuItemMap[menuItemId].orderCount += 1
          menuItemMap[menuItemId].totalQuantity += item.quantity
          totalOrderedItems += item.quantity
        }
      })
    })

    // Group by category
    const categoryStats: CategoryStatsMap = {}

    categories.forEach((category) => {
      const categoryId = category._id.toString()
      categoryStats[categoryId] = {
        id: categoryId,
        name: category.name,
        totalOrders: 0,
        items: [],
      }
    })

    // Populate category stats
    Object.values(menuItemMap).forEach((item) => {
      if (categoryStats[item.category]) {
        categoryStats[item.category].items.push(item)
        categoryStats[item.category].totalOrders += item.totalQuantity
      }
    })

    // Calculate percentages
    Object.values(categoryStats).forEach((category) => {
      category.items.forEach((item) => {
        item.percentage = totalOrderedItems > 0 ? (item.totalQuantity / totalOrderedItems) * 100 : 0

        item.categoryPercentage = category.totalOrders > 0 ? (item.totalQuantity / category.totalOrders) * 100 : 0
      })

      // Sort items by order count (descending)
      category.items.sort((a, b) => b.totalQuantity - a.totalQuantity)

      // Calculate category percentage of total orders
      category.percentage = totalOrderedItems > 0 ? (category.totalOrders / totalOrderedItems) * 100 : 0
    })

    return NextResponse.json({
      categories: Object.values(categoryStats),
      totalOrderedItems,
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}

