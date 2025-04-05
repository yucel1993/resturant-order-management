import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import connectToDatabase from "@/lib/mongodb"
import Order from "@/models/Order"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Use the latest API version
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, items, tableNumber, customerName } = body

    // Connect to database
    await connectToDatabase()

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: `Table ${tableNumber}`,
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }))

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${request.headers.get("origin")}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${request.headers.get("origin")}/payment/cancel?order_id=${orderId}`,
      metadata: {
        orderId: orderId,
        tableNumber: tableNumber.toString(),
        customerName,
      },
    })

    // Update the order with the Stripe session ID
    await Order.findByIdAndUpdate(orderId, {
      stripeSessionId: session.id,
      paymentStatus: "pending",
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

