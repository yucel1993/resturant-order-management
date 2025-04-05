"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const orderId = searchParams.get("order_id")
  const [isLoading, setIsLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    if (!sessionId || !orderId) {
      router.push("/")
      return
    }

    const verifyPayment = async () => {
      try {
        // Call API to verify payment and update order status
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}&order_id=${orderId}`)

        if (!response.ok) {
          throw new Error("Failed to verify payment")
        }

        const data = await response.json()
        setOrderDetails(data.order)
      } catch (error) {
        console.error("Error verifying payment:", error)
      } finally {
        setIsLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId, orderId, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <p>Verifying your payment...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your order has been placed and payment has been received.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="mb-2 text-sm font-medium">Order Summary</div>
            <div className="text-sm">
              <div className="flex justify-between py-1">
                <span>Order ID:</span>
                <span className="font-medium">{orderId?.substring(0, 8)}</span>
              </div>
              {orderDetails && (
                <>
                  <div className="flex justify-between py-1">
                    <span>Table:</span>
                    <span className="font-medium">{orderDetails.tableNumber}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Total Amount:</span>
                    <span className="font-medium">${orderDetails.total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Your order is being prepared. You will be notified when it's ready.
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/" className="w-full">
            <Button className="w-full">Return to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

