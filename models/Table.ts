import mongoose, { Schema, type Document } from "mongoose"

export interface ITable extends Document {
  number: number
  capacity: number
  status: "available" | "occupied" | "reserved"
  qrCode?: string
}

const TableSchema: Schema = new Schema(
  {
    number: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved"],
      default: "available",
    },
    qrCode: { type: String },
  },
  {
    timestamps: true,
    collection: "resturantorder_tables", // Specify collection name
  },
)

export default mongoose.models.Table || mongoose.model<ITable>("Table", TableSchema)

