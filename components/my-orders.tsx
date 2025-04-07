"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Package, RefreshCw, AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Order {
  _id: string
  tableNumber: number
  customerName: string
  status: string
  total: number
  createdAt: string
  isPackage?: boolean
}

export function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchMyOrders()
  }, [])

  const fetchMyOrders = async () => {
    setIsLoading(true)
    setLoadError(null)
    setIsRefreshing(true)

    try {
      // Get order IDs from localStorage
      const storedOrderIds = localStorage.getItem("myOrders")
      if (!storedOrderIds) {
        setOrders([])
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      const myOrderIds = JSON.parse(storedOrderIds) as string[]
      if (!myOrderIds.length) {
        setOrders([])
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      // Fetch each order with retry logic
      const fetchOrderWithRetry = async (id: string, retries = 2): Promise<any> => {
        try {
          const response = await fetch(`/api/orders/${id}`)
          if (!response.ok) {
            throw new Error(`Failed to fetch order ${id}`)
          }
          return response.json()
        } catch (error) {
          if (retries > 0) {
            // Wait 500ms before retrying
            await new Promise((resolve) => setTimeout(resolve, 500))
            return fetchOrderWithRetry(id, retries - 1)
          }
          console.error(`Failed to fetch order ${id} after retries:`, error)
          return null
        }
      }

      // Fetch orders with retry
      const orderPromises = myOrderIds.map((id) => fetchOrderWithRetry(id))
      const orderResults = await Promise.all(orderPromises)

      // Filter out null results, sort by date (newest first), and take only the 3 most recent
      const validOrders = orderResults
        .filter((order) => order !== null && order !== undefined)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)

      console.log(
        `Showing ${validOrders.length} most recent orders out of ${orderResults.filter(Boolean).length} total orders`,
      )

      setOrders(validOrders)
      setLoadError(null)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setLoadError("Failed to load your recent orders")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading orders</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={fetchMyOrders}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Retry Loading Orders
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!orders.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Recent Orders</CardTitle>
        <CardDescription>Track your recent orders</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Order #{order._id.substring(0, 8)}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {order.isPackage ? (
                    <>
                      <Package className="h-3 w-3" /> Takeaway
                    </>
                  ) : (
                    <>Table {order.tableNumber}</>
                  )}
                  <span className="mx-1">•</span>
                  {formatDate(order.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
                <Button variant="ghost" size="sm" onClick={() => router.push(`/order-status/${order._id}`)}>
                  View
                </Button>
              </div>
            </div>
            <Separator />
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full" onClick={fetchMyOrders} disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Refreshing...
            </>
          ) : (
            "Refresh Orders"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

