"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Edit, MoreHorizontal, Plus, QrCode, Trash2 } from "lucide-react"
import Link from "next/link"
import { QRCodeCanvas } from "qrcode.react"

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
import { toast } from "@/components/ui/use-toast"

interface TableType {
  _id: string
  number: number
  capacity: number
  status: "available" | "occupied" | "reserved"
  qrCode?: string
  activeOrders?: number
}

export default function TablesManagement() {
  const [tables, setTables] = useState<TableType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Form states
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false)
  const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState(false)

  const [currentTable, setCurrentTable] = useState<TableType | null>(null)
  const [tableToDelete, setTableToDelete] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    number: "",
    capacity: "",
    status: "available" as "available" | "occupied" | "reserved",
  })

  const [baseUrl, setBaseUrl] = useState("https://example.com/menu")

  useEffect(() => {
    fetchTables()

    // Set up a refresh interval to update table statuses
    const intervalId = setInterval(fetchTables, 30000) // Refresh every 30 seconds

    return () => clearInterval(intervalId) // Clean up on unmount
  }, [])

  const fetchTables = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tables")
      if (!response.ok) {
        throw new Error("Failed to fetch tables")
      }
      const data = await response.json()

      // Get active orders for each table
      const tablesWithOrders = await Promise.all(
        data.map(async (table: TableType) => {
          try {
            const ordersResponse = await fetch(`/api/orders?tableId=${table._id}&status=pending,preparing,ready`)
            if (ordersResponse.ok) {
              const orders = await ordersResponse.json()
              return {
                ...table,
                activeOrders: orders.length,
              }
            }
            return table
          } catch (error) {
            console.error(`Error fetching orders for table ${table.number}:`, error)
            return table
          }
        }),
      )

      setTables(tablesWithOrders)
    } catch (error) {
      console.error("Error fetching tables:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tables. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      number: "",
      capacity: "",
      status: "available",
    })
  }

  const openAddTableDialog = () => {
    resetForm()
    setIsAddTableDialogOpen(true)
  }

  const openEditTableDialog = (table: TableType) => {
    setCurrentTable(table)
    setFormData({
      number: table.number.toString(),
      capacity: table.capacity.toString(),
      status: table.status,
    })
    setIsEditTableDialogOpen(true)
  }

  const openQRCodeDialog = (table: TableType) => {
    setCurrentTable(table)
    setIsQRCodeDialogOpen(true)
  }

  const confirmDeleteTable = (tableId: string) => {
    setTableToDelete(tableId)
    setIsDeleteDialogOpen(true)
  }

  const addTable = async () => {
    try {
      const response = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: Number.parseInt(formData.number),
          capacity: Number.parseInt(formData.capacity),
          status: formData.status,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add table")
      }

      const newTable = await response.json()
      setTables((prev) => [...prev, newTable])

      toast({
        description: "Table added successfully",
      })

      setIsAddTableDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding table:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add table. Please try again.",
      })
    }
  }

  const updateTable = async () => {
    if (!currentTable) return

    try {
      const response = await fetch(`/api/tables/${currentTable._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: Number.parseInt(formData.number),
          capacity: Number.parseInt(formData.capacity),
          status: formData.status,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update table")
      }

      const updatedTable = await response.json()
      setTables((prev) => prev.map((table) => (table._id === currentTable._id ? updatedTable : table)))

      toast({
        description: "Table updated successfully",
      })

      setIsEditTableDialogOpen(false)
      setCurrentTable(null)
      resetForm()
    } catch (error) {
      console.error("Error updating table:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update table. Please try again.",
      })
    }
  }

  const deleteTable = async () => {
    if (!tableToDelete) return

    try {
      const response = await fetch(`/api/tables/${tableToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete table")
      }

      setTables((prev) => prev.filter((table) => table._id !== tableToDelete))

      toast({
        description: "Table deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting table:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete table. Please try again.",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setTableToDelete(null)
    }
  }

  const downloadQRCode = () => {
    if (!currentTable) return

    const canvas = document.getElementById("table-qr-code") as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")

      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `table-${currentTable.number}-qrcode.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const getStatusBadge = (status: string, activeOrders?: number) => {
    // If there are active orders, always show as occupied regardless of status
    if (activeOrders && activeOrders > 0) {
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Occupied
          </Badge>
          <span className="text-xs text-muted-foreground">
            {activeOrders} active {activeOrders === 1 ? "order" : "orders"}
          </span>
        </div>
      )
    }

    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Available
          </Badge>
        )
      case "occupied":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Occupied
          </Badge>
        )
      case "reserved":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Reserved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
              <Link href="/admin/tables" className="text-sm font-medium">
                Tables
              </Link>
              <Link href="/admin/qr-generator" className="text-sm font-medium text-muted-foreground">
                QR Generator
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
            <h1 className="text-3xl font-bold tracking-tight">Tables Management</h1>
            <p className="text-muted-foreground">Manage your restaurant tables and QR codes</p>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Tables</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchTables}>
                Refresh
              </Button>
              <Button onClick={openAddTableDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Table
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Number</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading tables...
                    </TableCell>
                  </TableRow>
                ) : tables.length > 0 ? (
                  tables.map((table) => (
                    <TableRow key={table._id}>
                      <TableCell className="font-medium">Table {table.number}</TableCell>
                      <TableCell>{table.capacity} people</TableCell>
                      <TableCell>{getStatusBadge(table.status, table.activeOrders)}</TableCell>
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
                            <DropdownMenuItem onClick={() => openEditTableDialog(table)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openQRCodeDialog(table)}>
                              <QrCode className="mr-2 h-4 w-4" />
                              View QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => confirmDeleteTable(table._id)}>
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
                    <TableCell colSpan={4} className="h-24 text-center">
                      No tables found. Add your first table to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Add Table Dialog */}
      <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Table</DialogTitle>
            <DialogDescription>Add a new table to your restaurant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="number">Table Number</Label>
              <Input
                id="number"
                name="number"
                type="number"
                min="1"
                value={formData.number}
                onChange={handleInputChange}
                placeholder="Table number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Number of people"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value: "available" | "occupied" | "reserved") =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTable} disabled={!formData.number || !formData.capacity}>
              Add Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={isEditTableDialogOpen} onOpenChange={setIsEditTableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>Update the details of this table</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-number">Table Number</Label>
              <Input
                id="edit-number"
                name="number"
                type="number"
                min="1"
                value={formData.number}
                onChange={handleInputChange}
                placeholder="Table number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Number of people"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value: "available" | "occupied" | "reserved") =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateTable} disabled={!formData.number || !formData.capacity}>
              Update Table
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
              Are you sure you want to delete this table? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteTable}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQRCodeDialogOpen} onOpenChange={setIsQRCodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Table QR Code</DialogTitle>
            <DialogDescription>{currentTable && `QR code for Table ${currentTable.number}`}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <div className="rounded-lg border p-4 bg-white">
              {currentTable && (
                <QRCodeCanvas
                  id="table-qr-code"
                  value={`${baseUrl}/${currentTable.number}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
            <div className="mt-4 text-center">
              {currentTable && (
                <>
                  <p className="font-medium">Table {currentTable.number}</p>
                  <p className="text-sm text-muted-foreground">Scan to order</p>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQRCodeDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={downloadQRCode}>Download QR Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

