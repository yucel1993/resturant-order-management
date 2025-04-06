import mongoose, { Schema, type Document } from "mongoose"

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId
  name: string
  price: number
  quantity: number
}

export interface IOrder extends Document {
  tableId: mongoose.Types.ObjectId
  tableNumber: number
  customerName: string
  items: IOrderItem[]
  total: number
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  stripeSessionId?: string
  specialInstructions?: string
  isPackage?: boolean
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema: Schema = new Schema({
  menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem" },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
})

const OrderSchema: Schema = new Schema(
  {
    tableId: { type: Schema.Types.ObjectId, ref: "Table", required: true },
    tableNumber: { type: Number, required: true },
    customerName: { type: String, required: true },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    stripeSessionId: { type: String },
    specialInstructions: { type: String },
    isPackage: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "resturantorder_orders", // Specify collection name
  },
)

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)

