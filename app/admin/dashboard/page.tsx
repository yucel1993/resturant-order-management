"use client"

import { useEffect, useState } from "react"
import { Check, ChevronDown, Clock, MoreHorizontal, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface OrderItem {
  id: string
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

interface TableInfo {
  _id: string
  number: number
  capacity: number
  status: string
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const tableId = searchParams.get("tableId")

  // Add a logout function
  const logoutAdmin = () => {
    // Set the cookie to expire immediately and clear its value
    document.cookie = "admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict"
    router.push("/admin/login")
    toast({
      description: "You have been logged out",
    })
  }

  useEffect(() => {
    if (!tableId) {
      router.push("/admin/customer-tables")
      return
    }

    fetchTableInfo()
    fetchOrders()
  }, [tableId, router])

  const fetchTableInfo = async () => {
    if (!tableId) return

    try {
      const response = await fetch(`/api/tables/${tableId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch table information")
      }
      const data = await response.json()
      console.log("Table info:", data)
      setTableInfo(data)
    } catch (error) {
      console.error("Error fetching table info:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load table information. Please try again.",
      })
    }
  }

  const fetchOrders = async () => {
    if (!tableId) return

    setIsLoading(true)
    try {
      // Use a more explicit URL to avoid any encoding issues
      const url = `/api/orders?tableId=${tableId}`
      console.log("Fetching orders with URL:", url)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }
      const data = await response.json()
      console.log("Orders for table:", data)
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add this function to your dashboard component
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      const updatedOrder = await response.json()

      // Update the orders state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)),
      )

      // Only update table status when an order is marked as completed
      if (newStatus === "completed") {
        try {
          // First check if there are any other active orders (pending, preparing, or ready)
          const activeOrdersResponse = await fetch(`/api/orders?tableId=${tableId}&status=pending,preparing,ready`)
          if (activeOrdersResponse.ok) {
            const activeOrders = await activeOrdersResponse.json()

            // If no other active orders, update table status to available
            if (!activeOrders || activeOrders.length === 0) {
              const updateTableResponse = await fetch(`/api/tables/${tableId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "available" }),
              })

              if (updateTableResponse.ok && tableInfo) {
                setTableInfo({
                  ...tableInfo,
                  status: "available",
                })
              }
            }
          }
        } catch (error) {
          console.error("Error updating table status:", error)
        }
      }

      toast({
        description: `Order status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status. Please try again.",
      })
    }
  }

  const confirmDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId)
    setDeleteDialogOpen(true)
  }

  const deleteOrder = async () => {
    if (!orderToDelete) return

    try {
      const response = await fetch(`/api/orders/${orderToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete order")
      }

      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderToDelete))

      toast({
        description: "Order deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete order. Please try again.",
      })
    } finally {
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    // Filter by status if not on "all" tab
    if (activeTab !== "all" && order.status !== activeTab) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        order._id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.tableNumber.toString().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query))
      )
    }

    return true
  })

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

  const pendingCount = orders.filter((order) => order.status === "pending").length
  const preparingCount = orders.filter((order) => order.status === "preparing").length
  const readyCount = orders.filter((order) => order.status === "ready").length
  const completedCount = orders.filter((order) => order.status === "completed").length
  const totalSales = orders.filter((order) => order.status === "completed").reduce((sum, order) => sum + order.total, 0)

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
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Admin <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logoutAdmin}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {tableInfo ? `Table ${tableInfo.number} Orders` : "Orders"}
                </h1>
                <p className="text-muted-foreground">
                  {tableInfo ? `Manage orders for Table ${tableInfo.number}` : "Manage orders"}
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push("/admin/customer-tables")}>
                Back to Tables
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingCount === 1 ? "Order" : "Orders"} waiting to be prepared
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Preparing</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{preparingCount}</div>
                <p className="text-xs text-muted-foreground">
                  {preparingCount === 1 ? "Order" : "Orders"} in preparation
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready to Serve</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{readyCount}</div>
                <p className="text-xs text-muted-foreground">
                  {readyCount === 1 ? "Order" : "Orders"} ready for service
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {completedCount} completed {completedCount === 1 ? "order" : "orders"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold">Orders</h2>
              <div className="flex items-center gap-2">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search orders..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all" onValueChange={(value) => setActiveTab(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchOrders}>
                  Refresh
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Special Instructions</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order._id.substring(0, 8)}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          {order.items.map((item) => (
                            <div key={item.id} className="text-sm">
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>
                          {order.specialInstructions ? (
                            <div className="max-w-xs truncate text-sm">{order.specialInstructions}</div>
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {order.isPackage ? (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800">
                              Takeaway
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              Dine-in
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {order.status === "pending" && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order._id, "preparing")}>
                                  Mark as Preparing
                                </DropdownMenuItem>
                              )}
                              {order.status === "preparing" && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order._id, "ready")}>
                                  Mark as Ready
                                </DropdownMenuItem>
                              )}
                              {order.status === "ready" && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order._id, "completed")}>
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => confirmDeleteOrder(order._id)}>
                                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteOrder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

