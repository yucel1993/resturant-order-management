"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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
  const router = useRouter()

  useEffect(() => {
    fetchMyOrders()
  }, [])

  const fetchMyOrders = async () => {
    setIsLoading(true)
    try {
      // Get order IDs from localStorage
      const storedOrderIds = localStorage.getItem("myOrders")
      if (!storedOrderIds) {
        setOrders([])
        setIsLoading(false)
        return
      }

      const myOrderIds = JSON.parse(storedOrderIds) as string[]
      if (!myOrderIds.length) {
        setOrders([])
        setIsLoading(false)
        return
      }

      // Fetch each order
      const orderPromises = myOrderIds.map((id) =>
        fetch(`/api/orders/${id}`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
      )

      const orderResults = await Promise.all(orderPromises)
      const validOrders = orderResults
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3) // Only show the 3 most recent orders

      setOrders(validOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
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
        <Button variant="outline" size="sm" className="w-full" onClick={fetchMyOrders}>
          Refresh Orders
        </Button>
      </CardContent>
    </Card>
  )
}

