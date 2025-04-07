import { Clock } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Clock className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading statistics...</p>
      </div>
    </div>
  )
}

