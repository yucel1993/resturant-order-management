"use client"

import { useEffect, useState } from "react"
import { Clock, RefreshCw, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tableToDeleteFrom, setTableToDeleteFrom] = useState<string | null>(null)
  const [isDeletingOrders, setIsDeletingOrders] = useState(false)

  useEffect(() => {
    fetchTablesAndOrders()

    // Set up a refresh interval
    const intervalId = setInterval(fetchTablesAndOrders, 30000) // Refresh every 30 seconds

    return () => clearInterval(intervalId) // Clean up on unmount
  }, [])

  const fetchTablesAndOrders = async () => {
    setIsLoading(true)
    try {
      // Fetch tables
      const tablesResponse = await fetch("/api/tables")
      if (!tablesResponse.ok) {
        throw new Error("Failed to fetch tables")
      }
      const tablesData = await tablesResponse.json()
      console.log("Tables data:", tablesData)
      setTables(tablesData)

      // Fetch all orders (including completed ones)
      const ordersResponse = await fetch("/api/orders")
      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch orders")
      }
      const ordersData = await ordersResponse.json()
      console.log("Orders data:", ordersData)

      // Group orders by tableId
      const ordersMap: Record<string, Order[]> = {}

      if (ordersData && ordersData.length > 0) {
        ordersData.forEach((order: Order) => {
          if (!ordersMap[order.tableId]) {
            ordersMap[order.tableId] = []
          }
          ordersMap[order.tableId].push(order)
        })
      }

      console.log("Orders map:", ordersMap)
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

  // Let's also add a manual check function to verify if a table has orders
  const hasActiveOrders = (tableId: string) => {
    if (!tableOrders[tableId]) return false
    return tableOrders[tableId].some(
      (order) => order.status === "pending" || order.status === "preparing" || order.status === "ready",
    )
  }

  const navigateToDashboard = (tableId: string) => {
    router.push(`/admin/dashboard?tableId=${tableId}`)
  }

  const deleteCompletedOrders = async (tableId: string) => {
    setTableToDeleteFrom(tableId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCompletedOrders = async () => {
    if (!tableToDeleteFrom) return

    setIsDeletingOrders(true)
    try {
      const response = await fetch(`/api/orders/delete-completed?tableId=${tableToDeleteFrom}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete completed orders")
      }

      const result = await response.json()

      toast({
        description: `Successfully deleted ${result.deletedCount} completed orders`,
      })

      // Refresh the data
      fetchTablesAndOrders()
    } catch (error) {
      console.error("Error deleting completed orders:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete completed orders. Please try again.",
      })
    } finally {
      setIsDeletingOrders(false)
      setIsDeleteDialogOpen(false)
      setTableToDeleteFrom(null)
    }
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

  const getTableStatusBadge = (status: string, hasActiveOrders: boolean) => {
    if (hasActiveOrders) {
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

  const getCompletedOrdersCount = (tableId: string) => {
    if (!tableOrders[tableId]) return 0
    return tableOrders[tableId].filter((order) => order.status === "completed").length
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
              <Link href="/admin/statistics" className="text-sm font-medium text-muted-foreground">
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
            <h1 className="text-3xl font-bold tracking-tight">Customer Tables</h1>
            <p className="text-muted-foreground">View and manage orders by table</p>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Active Tables</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchTablesAndOrders} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
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
                const activeOrders = orders.filter(
                  (o) => o.status === "pending" || o.status === "preparing" || o.status === "ready",
                )
                const hasOrders = activeOrders.length > 0

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
                            {activeOrders.length} Active {activeOrders.length === 1 ? "Order" : "Orders"}
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
                    <TableHead>Completed Orders</TableHead>
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
                          <TableCell>{orders.filter((o) => o.status !== "completed").length}</TableCell>
                          <TableCell>{getCompletedOrdersCount(table._id)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => navigateToDashboard(table._id)}>
                                View Orders
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteCompletedOrders(table._id)}
                                className="text-red-500 hover:text-red-700"
                                disabled={getCompletedOrdersCount(table._id) === 0}
                                title="Delete completed orders"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Completed Orders</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all completed orders for this table? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeletingOrders}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCompletedOrders} disabled={isDeletingOrders}>
              {isDeletingOrders ? "Deleting..." : "Delete Orders"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

