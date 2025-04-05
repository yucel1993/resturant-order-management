import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import connectToDatabase from "@/lib/mongodb"
import Order from "@/models/Order"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// This is your Stripe webhook secret for verifying webhook events
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature") as string

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Connect to database
        await connectToDatabase()

        // Update order status in your database
        if (session.metadata?.orderId) {
          const order = await Order.findById(session.metadata.orderId)

          if (order) {
            order.paymentStatus = "paid"
            await order.save()
            console.log(`Order ${order._id} payment status updated to paid`)
          }
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Connect to database
        await connectToDatabase()

        // Find the order associated with this payment intent
        if (paymentIntent.metadata?.orderId) {
          const order = await Order.findById(paymentIntent.metadata.orderId)

          if (order) {
            order.paymentStatus = "failed"
            await order.save()
            console.log(`Order ${order._id} payment status updated to failed`)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ error: "Failed to handle webhook" }, { status: 500 })
  }
}

// Disable body parsing, we need the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

