import mongoose, { Schema, type Document } from "mongoose"

export interface ICategory extends Document {
  name: string
  description?: string
  order: number
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "resturantorder_categories", // Specify collection name
  },
)

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)

