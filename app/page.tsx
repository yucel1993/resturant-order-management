import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-xl font-bold">TableOrder</div>
          <nav className="flex items-center gap-6">
            <Link href="/admin/login" className="text-sm font-medium">
              Admin Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    QR Code Ordering System for Restaurants
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Streamline your restaurant operations with our QR code ordering system. Customers scan, order, and
                    pay without waiting for service.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/admin/dashboard">
                    <Button className="gap-1">
                      View Demo Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/menu/demo">
                    <Button variant="outline">Try Customer Interface</Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative h-[350px] w-[350px] sm:h-[450px] sm:w-[450px] md:h-[550px] md:w-[550px]">
                  <div className="bg-muted rounded-lg p-6 shadow-lg">
                    <div className="space-y-2 mb-4">
                      <h3 className="text-xl font-bold">How It Works</h3>
                      <p className="text-sm text-muted-foreground">Simple 3-step process</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium">Scan QR Code</h4>
                          <p className="text-sm text-muted-foreground">Each table has a unique QR code</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium">Browse & Order</h4>
                          <p className="text-sm text-muted-foreground">Select items from the digital menu</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium">Submit & Wait</h4>
                          <p className="text-sm text-muted-foreground">Staff receives order and prepares it</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

