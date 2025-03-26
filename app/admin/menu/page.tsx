"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export default function MenuManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Form states
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)

  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true,
  })

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    order: "0",
  })

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
        description: "Failed to load categories. Please try again.",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCategoryFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      available: true,
    })
  }

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      order: "0",
    })
  }

  const openAddItemDialog = () => {
    resetForm()
    setIsAddItemDialogOpen(true)
  }

  const openEditItemDialog = (item: MenuItem) => {
    setCurrentItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: typeof item.category === "object" ? item.category._id : item.category,
      available: item.available,
    })
    setIsEditItemDialogOpen(true)
  }

  const confirmDeleteItem = (itemId: string) => {
    setItemToDelete(itemId)
    setIsDeleteDialogOpen(true)
  }

  const addMenuItem = async () => {
    try {
      const response = await fetch("/api/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          category: formData.category,
          available: formData.available,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add menu item")
      }

      const newItem = await response.json()
      setMenuItems((prev) => [...prev, newItem])

      toast({
        description: "Menu item added successfully",
      })

      setIsAddItemDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding menu item:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add menu item. Please try again.",
      })
    }
  }

  const updateMenuItem = async () => {
    if (!currentItem) return

    try {
      const response = await fetch(`/api/menu-items/${currentItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          category: formData.category,
          available: formData.available,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update menu item")
      }

      const updatedItem = await response.json()
      setMenuItems((prev) => prev.map((item) => (item._id === currentItem._id ? updatedItem : item)))

      toast({
        description: "Menu item updated successfully",
      })

      setIsEditItemDialogOpen(false)
      setCurrentItem(null)
      resetForm()
    } catch (error) {
      console.error("Error updating menu item:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update menu item. Please try again.",
      })
    }
  }

  const deleteMenuItem = async () => {
    if (!itemToDelete) return

    try {
      const response = await fetch(`/api/menu-items/${itemToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete menu item")
      }

      setMenuItems((prev) => prev.filter((item) => item._id !== itemToDelete))

      toast({
        description: "Menu item deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete menu item. Please try again.",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const addCategory = async () => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryFormData.name,
          description: categoryFormData.description,
          order: Number.parseInt(categoryFormData.order),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add category")
      }

      const newCategory = await response.json()
      setCategories((prev) => [...prev, newCategory])

      toast({
        description: "Category added successfully",
      })

      setIsAddCategoryDialogOpen(false)
      resetCategoryForm()
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add category. Please try again.",
      })
    }
  }

  const filteredMenuItems = menuItems.filter((item) => {
    // Filter by category if not on "all" tab
    if (activeTab !== "all") {
      const categoryId = typeof item.category === "object" ? item.category._id : item.category
      if (categoryId !== activeTab) {
        return false
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
    }

    return true
  })

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId)
    return category ? category.name : "Unknown"
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
              <Link href="/admin/menu" className="text-sm font-medium">
                Menu Management
              </Link>
              <Link href="/admin/tables" className="text-sm font-medium text-muted-foreground">
                Tables
              </Link>
              <Link href="/admin/settings" className="text-sm font-medium text-muted-foreground">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
            <p className="text-muted-foreground">Add, edit, and manage your restaurant's menu items</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category._id} value={category._id}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="flex gap-2">
                  <Button onClick={() => setIsAddCategoryDialogOpen(true)} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                  <Button onClick={openAddItemDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Menu Item
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search menu items..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Loading menu items...
                        </TableCell>
                      </TableRow>
                    ) : filteredMenuItems.length > 0 ? (
                      filteredMenuItems.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {typeof item.category === "object" ? item.category.name : getCategoryName(item.category)}
                          </TableCell>
                          <TableCell>
                            {item.available ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-100 text-red-800">
                                Unavailable
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditItemDialog(item)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => confirmDeleteItem(item._id)}>
                                  <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No menu items found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Add Menu Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>Add a new item to your restaurant menu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Item name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Item description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="available"
                name="available"
                type="checkbox"
                checked={formData.available}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="available">Available</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addMenuItem} disabled={!formData.name || !formData.price || !formData.category}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update the details of this menu item</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Item description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price ($)</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="edit-available"
                name="available"
                type="checkbox"
                checked={formData.available}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-available">Available</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateMenuItem} disabled={!formData.name || !formData.price || !formData.category}>
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this menu item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteMenuItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Add a new category for menu items</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                name="name"
                value={categoryFormData.name}
                onChange={handleCategoryInputChange}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description (Optional)</Label>
              <Textarea
                id="category-description"
                name="description"
                value={categoryFormData.description}
                onChange={handleCategoryInputChange}
                placeholder="Category description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-order">Display Order</Label>
              <Input
                id="category-order"
                name="order"
                type="number"
                min="0"
                value={categoryFormData.order}
                onChange={handleCategoryInputChange}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCategory} disabled={!categoryFormData.name}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

