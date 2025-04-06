"use client"

import { useEffect, useState } from "react"
import { Clock, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface TableType {
  _id: string
  number: number
  capacity: number
  status: "available" | "occupied" | "reserved"
}

interface OrderItem {
  menuItem: string
  name: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  tableId: string
  tableNumber: number
  customerName: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  specialInstructions?: string
  isPackage?: boolean
}

export default function CustomerTablesPage() {
  const [tables, setTables] = useState<TableType[]>([])
  const [tableOrders, setTableOrders] = useState<Record<string, Order[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTablesAndOrders()

    // Set up a refresh interval
    const intervalId = setInterval(fetchTablesAndOrders, 30000) // Refresh every 30 seconds

    return () => clearInterval(intervalId) // Clean up on unmount
  }, [])

  // Update the fetchTablesAndOrders function to better handle the orders data
  const fetchTablesAndOrders = async () => {
    setIsLoading(true)
    try {
      // Fetch tables
      const tablesResponse = await fetch("/api/tables")
      if (!tablesResponse.ok) {
        throw new Error("Failed to fetch tables")
      }
      const tablesData = await tablesResponse.json()
      setTables(tablesData)

      // Fetch all active orders (pending, preparing, ready)
      const ordersResponse = await fetch("/api/orders?status=pending,preparing,ready")
      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch orders")
      }
      const ordersData = await ordersResponse.json()

      // Group orders by tableId
      const ordersMap: Record<string, Order[]> = {}

      ordersData.forEach((order: Order) => {
        if (!ordersMap[order.tableId]) {
          ordersMap[order.tableId] = []
        }
        ordersMap[order.tableId].push(order)
      })

      console.log("Orders map:", ordersMap) // Add this for debugging
      setTableOrders(ordersMap)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tables and orders. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToDashboard = (tableId: string) => {
    router.push(`/admin/dashboard?tableId=${tableId}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "preparing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Preparing
          </Badge>
        )
      case "ready":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Ready
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTableStatusBadge = (status: string, hasOrders: boolean) => {
    if (hasOrders) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Occupied
        </Badge>
      )
    }

    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Available
          </Badge>
        )
      case "occupied":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Occupied
          </Badge>
        )
      case "reserved":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Reserved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
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
              <Link href="/admin/customer-tables" className="text-sm font-medium">
                Customer Tables
              </Link>
              <Link href="/admin/menu" className="text-sm font-medium text-muted-foreground">
                Menu Management
              </Link>
              <Link href="/admin/tables" className="text-sm font-medium text-muted-foreground">
                Tables
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
            <h1 className="text-3xl font-bold tracking-tight">Customer Tables</h1>
            <p className="text-muted-foreground">View and manage orders by table</p>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Active Tables</h2>
            <Button variant="outline" onClick={fetchTablesAndOrders} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Clock className="h-6 w-6 animate-spin mr-2" />
              <p>Loading tables and orders...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tables.map((table) => {
                const orders = tableOrders[table._id] || []
                const hasOrders = orders.length > 0

                return (
                  <Card
                    key={table._id}
                    className={`${hasOrders ? "border-primary/50" : ""} cursor-pointer hover:border-primary transition-colors`}
                    onClick={() => navigateToDashboard(table._id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>Table {table.number}</CardTitle>
                        {getTableStatusBadge(table.status, hasOrders)}
                      </div>
                      <div className="text-sm text-muted-foreground">Capacity: {table.capacity} people</div>
                    </CardHeader>
                    <CardContent>
                      {hasOrders ? (
                        <div className="space-y-4">
                          <div className="font-medium">
                            {orders.length} Active {orders.length === 1 ? "Order" : "Orders"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Click to view and manage orders for this table
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-muted-foreground">No active orders for this table</div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

              {tables.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p>No tables found. Add tables in the Tables Management section.</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">All Tables Overview</h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Active Orders</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.length > 0 ? (
                    tables.map((table) => {
                      const orders = tableOrders[table._id] || []
                      return (
                        <TableRow key={table._id}>
                          <TableCell className="font-medium">Table {table.number}</TableCell>
                          <TableCell>{getTableStatusBadge(table.status, orders.length > 0)}</TableCell>
                          <TableCell>{table.capacity} people</TableCell>
                          <TableCell>{orders.length}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => navigateToDashboard(table._id)}>
                              View Orders
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No tables found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

