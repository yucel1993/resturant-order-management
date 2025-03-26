"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Check, MinusCircle, PlusCircle } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

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
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchMenuItems()
  }, [])

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
        specialInstructions,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      })

      if (!response.ok) {
        throw new Error("Failed to submit order")
      }

      setIsOrderDialogOpen(false)
      setIsConfirmationDialogOpen(true)

      // Reset cart after successful order
      setCart([])
      setSpecialInstructions("")
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your order. Please try again.",
      })
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-10 text-center">
        <p>Loading menu...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Table {tableId}</h1>
        <p className="text-muted-foreground">Browse our menu and place your order</p>
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitOrder} disabled={cart.length === 0 || !customerName}>
              Submit Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Submitted!</DialogTitle>
            <DialogDescription>
              Thank you for your order, {customerName}. Your order has been received and is being prepared.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Check className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsConfirmationDialogOpen(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

