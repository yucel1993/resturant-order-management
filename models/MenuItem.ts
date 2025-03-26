import mongoose, { Schema, type Document } from "mongoose"

export interface IMenuItem extends Document {
  name: string
  description: string
  price: number
  category: mongoose.Types.ObjectId
  image?: string
  available: boolean
}

const MenuItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    image: { type: String },
    available: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "resturantorder_menu_items", // Specify collection name
  },
)

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema)

