import mongoose, { Schema, type Document } from "mongoose"

export interface ISettings extends Document {
  restaurantName: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  latitude: number
  longitude: number
  geofenceRadius: number
  enableLocationVerification: boolean
  orderNotifications: boolean
  autoAcceptOrders: boolean
  requireCustomerName: boolean
  showPrices: boolean
  enableSpecialInstructions: boolean
  baseUrl: string
}

const SettingsSchema: Schema = new Schema(
  {
    restaurantName: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    latitude: { type: Number, default: 37.7749 }, // Default to San Francisco
    longitude: { type: Number, default: -122.4194 },
    geofenceRadius: { type: Number, default: 500 }, // Default 500 meters
    enableLocationVerification: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
    autoAcceptOrders: { type: Boolean, default: false },
    requireCustomerName: { type: Boolean, default: true },
    showPrices: { type: Boolean, default: true },
    enableSpecialInstructions: { type: Boolean, default: true },
    baseUrl: { type: String, default: "https://example.com/menu" },
  },
  {
    timestamps: true,
    collection: "resturantorder_settings", // Specify collection name
  },
)

export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema)

