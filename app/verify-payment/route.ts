import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import connectToDatabase from "@/lib/mongodb"
import Order from "@/models/Order"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const orderId = searchParams.get("order_id")

    if (!sessionId || !orderId) {
      return NextResponse.json({ error: "Missing session_id or order_id" }, { status: 400 })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Connect to database
    await connectToDatabase()

    // Find the order
    const order = await Order.findById(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify that the session ID matches the one stored with the order
    if (order.stripeSessionId !== sessionId) {
      return NextResponse.json({ error: "Session ID mismatch" }, { status: 400 })
    }

    // Check if payment was successful
    if (session.payment_status === "paid") {
      // Update order status
      order.paymentStatus = "paid"
      await order.save()

      return NextResponse.json({
        success: true,
        order: {
          _id: order._id,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not completed",
          paymentStatus: session.payment_status,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}

