"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Check, Clock, Package, RefreshCw } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

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
  paymentStatus: string
  createdAt: string
  specialInstructions?: string
  isPackage?: boolean
}

export default function OrderStatusPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Check if this is the user's order
    const storedOrderIds = localStorage.getItem("myOrders")
    const myOrders = storedOrderIds ? JSON.parse(storedOrderIds) : []

    if (!myOrders.includes(orderId)) {
      // Store this order ID for future reference
      localStorage.setItem("myOrders", JSON.stringify([...myOrders, orderId]))
    }

    fetchOrderStatus()

    // Set up polling to refresh the order status every 30 seconds
    const intervalId = setInterval(fetchOrderStatus, 30000)

    return () => clearInterval(intervalId)
  }, [orderId])

  const fetchOrderStatus = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch order")
      }

      const data = await response.json()
      setOrder(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order status. Please try again.",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending":
        return 1
      case "preparing":
        return 2
      case "ready":
        return 3
      case "completed":
        return 4
      default:
        return 0
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
    return date.toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-8 w-8 animate-spin text-primary" />
          <p>Loading order status...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
            <CardDescription>We couldn't find the order you're looking for.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/" className="w-full">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentStep = getStatusStep(order.status)

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Order Status</CardTitle>
          <CardDescription>Track the status of your order #{orderId.substring(0, 8)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Order Status</h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(order.status)}
                {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchOrderStatus} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Status timeline */}
          <div className="relative pt-4">
            <div className="absolute left-[15px] top-0 h-full w-[2px] bg-muted"></div>

            <div
              className={`relative flex items-start mb-6 ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background"}`}
              >
                1
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Order Received</h4>
                <p className="text-sm text-muted-foreground">Your order has been received by the restaurant</p>
              </div>
            </div>

            <div
              className={`relative flex items-start mb-6 ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep >= 2 ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background"}`}
              >
                2
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Preparing</h4>
                <p className="text-sm text-muted-foreground">The kitchen is preparing your order</p>
              </div>
            </div>

            <div
              className={`relative flex items-start mb-6 ${currentStep >= 3 ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep >= 3 ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background"}`}
              >
                3
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Ready</h4>
                <p className="text-sm text-muted-foreground">
                  Your order is ready for {order.isPackage ? "pickup" : "service"}
                </p>
              </div>
            </div>

            <div className={`relative flex items-start ${currentStep >= 4 ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep >= 4 ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background"}`}
              >
                <Check className="h-4 w-4" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Completed</h4>
                <p className="text-sm text-muted-foreground">Your order has been completed</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Order Details</h3>
              <div className="text-sm grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Order ID:</div>
                <div className="font-medium">{orderId.substring(0, 8)}</div>

                <div className="text-muted-foreground">Customer:</div>
                <div className="font-medium">{order.customerName}</div>

                <div className="text-muted-foreground">Table:</div>
                <div className="font-medium">{order.tableNumber}</div>

                <div className="text-muted-foreground">Type:</div>
                <div className="font-medium flex items-center">
                  {order.isPackage ? (
                    <>
                      <Package className="h-4 w-4 mr-1" /> Takeaway
                    </>
                  ) : (
                    "Dine-in"
                  )}
                </div>

                <div className="text-muted-foreground">Ordered at:</div>
                <div className="font-medium">{formatDate(order.createdAt)}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      {item.quantity}x {item.name}
                    </div>
                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <div>Total</div>
                  <div>${order.total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {order.specialInstructions && (
              <div>
                <h3 className="font-medium mb-2">Special Instructions</h3>
                <div className="text-sm bg-muted p-3 rounded-md">{order.specialInstructions}</div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href={`/menu/${order.tableNumber}`} className="w-full">
            <Button variant="outline" className="w-full">
              Return to Menu
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full">
              Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

