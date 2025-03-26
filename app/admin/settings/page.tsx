"use client"

import type React from "react"

import { useState } from "react"
import { Save } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const [restaurantSettings, setRestaurantSettings] = useState({
    name: "My Restaurant",
    description: "Delicious food and great atmosphere",
    address: "123 Main St, City, Country",
    phone: "+1 (555) 123-4567",
    email: "contact@myrestaurant.com",
    website: "https://myrestaurant.com",
    orderNotifications: true,
    autoAcceptOrders: false,
    requireCustomerName: true,
    showPrices: true,
    enableSpecialInstructions: true,
    baseUrl: "https://resturant-order-management.vercel.app/menu",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRestaurantSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setRestaurantSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const saveSettings = () => {
    // In a real app, this would save to the database
    toast({
      description: "Settings saved successfully",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              TableOrder
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/admin/dashboard" className="text-sm font-medium text-muted-foreground">
                Dashboard
              </Link>
              <Link href="/admin/menu" className="text-sm font-medium text-muted-foreground">
                Menu Management
              </Link>
              <Link href="/admin/tables" className="text-sm font-medium text-muted-foreground">
                Tables
              </Link>
              <Link href="/admin/settings" className="text-sm font-medium">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Configure your restaurant and ordering system</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
                <CardDescription>Basic information about your restaurant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input id="name" name="name" value={restaurantSettings.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={restaurantSettings.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={restaurantSettings.address}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={restaurantSettings.phone} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={restaurantSettings.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" value={restaurantSettings.website} onChange={handleInputChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ordering System</CardTitle>
                <CardDescription>Configure how the ordering system works</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">Base URL for QR Codes</Label>
                  <Input id="baseUrl" name="baseUrl" value={restaurantSettings.baseUrl} onChange={handleInputChange} />
                  <p className="text-xs text-muted-foreground">
                    This is the base URL used for generating QR codes. Table number will be appended to this URL.
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="orderNotifications">Order Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications for new orders</p>
                    </div>
                    <Switch
                      id="orderNotifications"
                      checked={restaurantSettings.orderNotifications}
                      onCheckedChange={(checked) => handleSwitchChange("orderNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoAcceptOrders">Auto-Accept Orders</Label>
                      <p className="text-sm text-muted-foreground">Automatically accept new orders</p>
                    </div>
                    <Switch
                      id="autoAcceptOrders"
                      checked={restaurantSettings.autoAcceptOrders}
                      onCheckedChange={(checked) => handleSwitchChange("autoAcceptOrders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireCustomerName">Require Customer Name</Label>
                      <p className="text-sm text-muted-foreground">
                        Require customers to provide their name when ordering
                      </p>
                    </div>
                    <Switch
                      id="requireCustomerName"
                      checked={restaurantSettings.requireCustomerName}
                      onCheckedChange={(checked) => handleSwitchChange("requireCustomerName", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showPrices">Show Prices</Label>
                      <p className="text-sm text-muted-foreground">Display prices on the menu</p>
                    </div>
                    <Switch
                      id="showPrices"
                      checked={restaurantSettings.showPrices}
                      onCheckedChange={(checked) => handleSwitchChange("showPrices", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableSpecialInstructions">Special Instructions</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow customers to add special instructions to their orders
                      </p>
                    </div>
                    <Switch
                      id="enableSpecialInstructions"
                      checked={restaurantSettings.enableSpecialInstructions}
                      onCheckedChange={(checked) => handleSwitchChange("enableSpecialInstructions", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

