import { Clock } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Clock className="h-8 w-8 animate-spin text-primary" />
        <p>Loading order status...</p>
      </div>
    </div>
  )
}

