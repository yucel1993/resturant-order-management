"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentCancelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")

  useEffect(() => {
    if (!orderId) {
      router.push("/")
      return
    }

    // Optionally update the order status to cancelled
    const updateOrderStatus = async () => {
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentStatus: "failed",
            status: "cancelled",
          }),
        })
      } catch (error) {
        console.error("Error updating order status:", error)
      }
    }

    updateOrderStatus()
  }, [orderId, router])

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>Your order has been cancelled and no payment has been processed.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>
            If you experienced any issues during the payment process, please try again or contact our support team for
            assistance.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/" className="w-full">
            <Button className="w-full">Return to Home</Button>
          </Link>
          <Link href={`/menu/${searchParams.get("table_id") || "1"}`} className="w-full">
            <Button variant="outline" className="w-full">
              Return to Menu
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

