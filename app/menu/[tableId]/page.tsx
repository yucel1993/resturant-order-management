"use client"

import { CardContent } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Check, MinusCircle, PlusCircle, Package, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { MyOrders } from "@/components/my-orders"

interface Category {
  _id: string
  name: string
  description?: string
  order: number
}

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: string | Category
  image?: string
  available: boolean
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function MenuPage() {
  const params = useParams()
  const router = useRouter()
  const tableId = params.tableId as string

  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [isPackage, setIsPackage] = useState(false)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLocationVerified, setIsLocationVerified] = useState(false)
  const [isLocationChecking, setIsLocationChecking] = useState(true)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  const [submittedName, setSubmittedName] = useState("")
  const [currentOrderId, setCurrentOrderId] = useState<string>("")

  // Add geolocation verification
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocationChecking(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Replace these coordinates with your restaurant's actual coordinates
          const restaurantLat = 40.03824 // Your restaurant's latitude
          const restaurantLng = 32.888812 // Your restaurant's longitude
          const maxDistanceInMeters = 500 // Maximum allowed distance (adjust as needed)

          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            restaurantLat,
            restaurantLng,
          )

          console.log("Distance from restaurant:", distance, "meters")

          if (distance > maxDistanceInMeters) {
            setIsLocationVerified(false)
            setIsLocationDialogOpen(true)
            toast({
              variant: "destructive",
              title: "Location Error",
              description: "You must be in the restaurant to place an order.",
            })
          } else {
            setIsLocationVerified(true)
            fetchCategories()
            fetchMenuItems()
          }
          setIsLocationChecking(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLocationChecking(false)
          setIsLocationDialogOpen(true)
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Please enable location services to place an order.",
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    } else {
      setIsLocationChecking(false)
      setIsLocationDialogOpen(true)
      toast({
        variant: "destructive",
        title: "Location Error",
        description: "Your browser doesn't support geolocation.",
      })
    }
  }, [])

  // Helper function to calculate distance between two points
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load menu categories. Please try again.",
      })
    }
  }

  const fetchMenuItems = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/menu-items")
      if (!response.ok) {
        throw new Error("Failed to fetch menu items")
      }
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error("Error fetching menu items:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load menu items. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item._id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        return [...prevCart, { id: item._id, name: item.name, price: item.price, quantity: 1 }]
      }
    })
    toast({
      description: `Added ${item.name} to your order`,
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
        )
      } else {
        return prevCart.filter((cartItem) => cartItem.id !== itemId)
      }
    })
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    if (!customerName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your name",
      })
      return
    }

    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Your cart is empty",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Get table information
      const tableResponse = await fetch(`/api/tables?number=${tableId}`)
      if (!tableResponse.ok) {
        throw new Error("Failed to fetch table information")
      }
      const tableData = await tableResponse.json()

      if (!tableData || tableData.length === 0) {
        throw new Error("Table not found")
      }

      const table = tableData[0]

      // Create the order
      const order = {
        tableId: table._id,
        tableNumber: Number.parseInt(tableId),
        customerName,
        items: cart.map((item) => ({
          menuItem: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: calculateTotal(),
        status: "pending",
        paymentStatus: "pending",
        specialInstructions,
        isPackage, // Add the package flag
      }

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      })

      const orderData = await orderResponse.json()
      setCurrentOrderId(orderData._id)
      // Store the order ID in localStorage to track "my orders"
      const storedOrderIds = localStorage.getItem("myOrders")
      const myOrders = storedOrderIds ? JSON.parse(storedOrderIds) : []
      if (!myOrders.includes(orderData._id)) {
        localStorage.setItem("myOrders", JSON.stringify([...myOrders, orderData._id]))
      }
      // Save the current order ID for the confirmation dialog
      const currentOrderId = orderData._id

      if (!orderResponse.ok) {
        throw new Error("Failed to submit order")
      }

      // Update table status to occupied
      try {
        await fetch(`/api/tables/${table._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "occupied",
          }),
        })
      } catch (error) {
        console.error("Error updating table status:", error)
        // Continue even if table status update fails
      }

      // Save the customer name for the confirmation dialog
      setSubmittedName(customerName)

      // Reset form and cart
      setCart([])
      setSpecialInstructions("")
      setIsPackage(false)

      // Close order dialog
      setIsOrderDialogOpen(false)

      // Important: Add a small delay before showing confirmation dialog
      setTimeout(() => {
        setIsConfirmationDialogOpen(true)
      }, 100)

      toast({
        description: "Your order has been submitted successfully!",
      })
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your order. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getCategoryItems = (categoryId: string) => {
    return menuItems.filter((item) => {
      const itemCategoryId = typeof item.category === "object" ? item.category._id : item.category
      return itemCategoryId === categoryId && item.available
    })
  }

  const MenuItem = ({ item }: { item: MenuItem }) => (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="font-medium">${item.price.toFixed(2)}</p>
        <Button size="sm" onClick={() => addToCart(item)}>
          Add to Order
        </Button>
      </CardFooter>
    </Card>
  )

  // Show location verification dialog
  if (isLocationDialogOpen) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-10 flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Location Verification Required</CardTitle>
            <CardDescription>We need to verify that you are in our restaurant to place an order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              For security reasons, our ordering system is only available to customers who are physically present in our
              restaurant.
            </p>
            <p>Please ensure your location services are enabled and that you are within our restaurant premises.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Return to Home
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isLocationChecking || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-10 text-center">
        <p>Verifying your location and loading menu...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Table {tableId}</h1>
        <p className="text-muted-foreground">Browse our menu and place your order</p>
      </div>

      {/* Add the MyOrders component here */}
      <div className="mb-6">
        <MyOrders />
      </div>

      {categories.length > 0 ? (
        <Tabs defaultValue={categories[0]._id} className="w-full">
          <TabsList
            className="grid w-full"
            style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}
          >
            {categories.map((category) => (
              <TabsTrigger key={category._id} value={category._id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category._id} value={category._id} className="mt-6">
              <h2 className="text-xl font-bold mb-4">{category.name}</h2>
              {category.description && <p className="text-muted-foreground mb-6">{category.description}</p>}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getCategoryItems(category._id).length > 0 ? (
                  getCategoryItems(category._id).map((item) => <MenuItem key={item._id} item={item} />)
                ) : (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    No items available in this category.
                  </p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-8">
          <p>No menu categories available.</p>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button size="lg" className="gap-2" onClick={() => setIsOrderDialogOpen(true)} disabled={cart.length === 0}>
          View Order ({cart.reduce((total, item) => total + item.quantity, 0)} items)
        </Button>
      </div>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Order</DialogTitle>
            <DialogDescription>Review your order before submitting</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {cart.length > 0 ? (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => addToCart({ _id: item.id, name: item.name, price: item.price } as MenuItem)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-muted-foreground">Your cart is empty</p>
            )}

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests or allergies?"
                />
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex flex-1 items-center space-x-2">
                  <Switch id="package" checked={isPackage} onCheckedChange={setIsPackage} />
                  <Label htmlFor="package" className="flex items-center gap-1 cursor-pointer">
                    <Package className="h-4 w-4" />
                    Takeaway Order
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitOrder} disabled={cart.length === 0 || !customerName || isProcessing}>
              {isProcessing ? "Processing..." : "Submit Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={isConfirmationDialogOpen}
        onOpenChange={(open) => {
          console.log("Confirmation dialog state changed:", open)
          setIsConfirmationDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Submitted!</DialogTitle>
            <DialogDescription>
              Thank you for your order, {submittedName}. Your order has been received and is being prepared.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Check className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="text-center py-2 bg-yellow-50 rounded-md border border-yellow-200 mb-4">
            <p className="font-medium text-yellow-800">
              We have taken your order. Please go to the cash register for payment.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsConfirmationDialogOpen(false)} className="sm:flex-1">
              Close
            </Button>
            <Button
              onClick={() => {
                setIsConfirmationDialogOpen(false)
                router.push(`/order-status/${currentOrderId}`)
              }}
              className="sm:flex-1"
            >
              Track Order Status <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => {
              setSubmittedName(customerName || "Test User")
              setIsConfirmationDialogOpen(true)
              console.log("Debug button clicked, dialog state:", isConfirmationDialogOpen)
            }}
          >
            Test Confirmation Dialog
          </Button>
        </div>
      )}
    </div>
  )
}

