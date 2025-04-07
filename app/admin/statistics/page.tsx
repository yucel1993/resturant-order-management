"use client"

import { useEffect, useState } from "react"
import { Clock, RefreshCw } from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

// Define types for our statistics data
interface MenuItem {
  id: string
  name: string
  category: string
  categoryName: string
  orderCount: number
  totalQuantity: number
  percentage: number
  categoryPercentage: number
}

interface CategoryStats {
  id: string
  name: string
  totalOrders: number
  percentage: number
  items: MenuItem[]
}

interface StatisticsData {
  categories: CategoryStats[]
  totalOrderedItems: number
}

// Colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6B6B",
  "#6A7FDB",
  "#61DAFB",
  "#FF9AA2",
]

export default function StatisticsPage() {
  const [statsData, setStatsData] = useState<StatisticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/statistics")
      if (!response.ok) {
        throw new Error("Failed to fetch statistics")
      }
      const data = await response.json()
      setStatsData(data)

      // Set the first category as active by default
      if (data.categories && data.categories.length > 0) {
        setActiveCategory(data.categories[0].id)
      }
    } catch (error) {
      console.error("Error fetching statistics:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load statistics. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format percentage for display
  const formatPercentage = (value: number) => {
    return value.toFixed(1) + "%"
  }

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p>Orders: {payload[0].value}</p>
          <p>Percentage: {formatPercentage(payload[0].payload.percentage)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              TableOrder
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/admin/customer-tables" className="text-sm font-medium text-muted-foreground">
                Customer Tables
              </Link>
              <Link href="/admin/menu" className="text-sm font-medium text-muted-foreground">
                Menu Management
              </Link>
              <Link href="/admin/tables" className="text-sm font-medium text-muted-foreground">
                Tables
              </Link>
              <Link href="/admin/statistics" className="text-sm font-medium">
                Statistics
              </Link>
              <Link href="/admin/qr-generator" className="text-sm font-medium text-muted-foreground">
                QR Generator
              </Link>
              <Link href="/admin/settings" className="text-sm font-medium text-muted-foreground">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Order Statistics</h1>
                <p className="text-muted-foreground">Analyze order patterns and popular menu items</p>
              </div>
              <Button variant="outline" onClick={fetchStatistics} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Clock className="h-8 w-8 animate-spin mr-2" />
              <p>Loading statistics...</p>
            </div>
          ) : !statsData || statsData.totalOrderedItems === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Order Data Available</CardTitle>
                <CardDescription>
                  There are no orders in the system yet. Statistics will be available once customers start placing
                  orders.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              {/* Category Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Overview</CardTitle>
                  <CardDescription>Distribution of orders across different menu categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statsData.categories}
                          dataKey="totalOrders"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={150}
                          fill="#8884d8"
                          label={({ name, percentage }) => `${name} (${formatPercentage(percentage)})`}
                        >
                          {statsData.categories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Details</CardTitle>
                  <CardDescription>Detailed breakdown of orders by menu item within each category</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue={activeCategory || ""}
                    value={activeCategory || ""}
                    onValueChange={setActiveCategory}
                  >
                    <TabsList className="mb-4">
                      {statsData.categories.map((category) => (
                        <TabsTrigger key={category.id} value={category.id}>
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {statsData.categories.map((category) => (
                      <TabsContent key={category.id} value={category.id}>
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-medium">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {category.totalOrders} orders ({formatPercentage(category.percentage)} of total)
                              </p>
                            </div>
                          </div>

                          {category.items.length > 0 ? (
                            <div className="h-[400px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={category.items} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                  <YAxis />
                                  <Tooltip
                                    formatter={(value, name, props) => {
                                      if (name === "totalQuantity") {
                                        return [`${value} orders`, "Orders"]
                                      }
                                      return [value, name]
                                    }}
                                  />
                                  <Legend />
                                  <Bar
                                    dataKey="totalQuantity"
                                    name="Orders"
                                    fill="#0088FE"
                                    label={{
                                      position: "top",
                                      formatter: (value) => (value > 0 ? value : ""),
                                    }}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="text-center py-12 text-muted-foreground">
                              No orders for items in this category
                            </div>
                          )}

                          {/* Item Percentage Breakdown */}
                          {category.items.length > 0 && (
                            <div className="mt-6">
                              <h4 className="font-medium mb-2">Item Popularity</h4>
                              <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={category.items}
                                      dataKey="totalQuantity"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={150}
                                      fill="#8884d8"
                                      label={({ name, categoryPercentage }) =>
                                        `${name} (${formatPercentage(categoryPercentage)})`
                                      }
                                    >
                                      {category.items.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Top Items Overall */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Most Popular Items</CardTitle>
                  <CardDescription>The most frequently ordered items across all categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statsData.categories
                          .flatMap((cat) => cat.items)
                          .sort((a, b) => b.totalQuantity - a.totalQuantity)
                          .slice(0, 10)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name, props) => {
                            if (name === "totalQuantity") {
                              return [`${value} orders`, "Orders"]
                            }
                            return [value, name]
                          }}
                          labelFormatter={(label) => {
                            const item = statsData.categories
                              .flatMap((cat) => cat.items)
                              .find((item) => item.name === label)
                            return `${label} (${item?.categoryName || "Unknown Category"})`
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="totalQuantity"
                          name="Orders"
                          fill="#00C49F"
                          label={{
                            position: "top",
                            formatter: (value) => (value > 0 ? value : ""),
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

