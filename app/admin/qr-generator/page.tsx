"use client"

import { useState } from "react"
import { Download, RefreshCw } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export default function QRGenerator() {
  const [tableNumber, setTableNumber] = useState("1")
  const [qrSize, setQrSize] = useState("200")
  const [baseUrl, setBaseUrl] = useState("https://resturant-order-management.vercel.app/menu")
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)

  const qrUrl = `${baseUrl}/${tableNumber}${verificationCode ? `?code=${verificationCode}` : ""}`

  const generateVerificationCode = async () => {
    setIsGeneratingCode(true)
    try {
      const response = await fetch("/api/tables/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableNumber: Number.parseInt(tableNumber) }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate verification code")
      }

      const data = await response.json()
      setVerificationCode(data.verificationCode)
      toast({
        description: `Verification code generated: ${data.verificationCode}`,
      })
    } catch (error) {
      console.error("Error generating verification code:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate verification code. Please try again.",
      })
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")

      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `table-${tableNumber}-qrcode.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const printQRCode = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      const canvas = document.getElementById("qr-code") as HTMLCanvasElement
      const imageUrl = canvas.toDataURL("image/png")

      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - Table ${tableNumber}</title>
            <style>
              body {
                font-family: system-ui, sans-serif;
                text-align: center;
                padding: 20px;
              }
              .qr-container {
                margin: 20px auto;
                max-width: 300px;
              }
              img {
                max-width: 100%;
              }
              h2 {
                margin-bottom: 5px;
              }
              p {
                color: #666;
                margin-top: 5px;
              }
              .verification-code {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
                color: #000;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>Table ${tableNumber}</h2>
              <p>Scan to order</p>
              <img src="${imageUrl}" alt="QR Code for Table ${tableNumber}" />
              ${verificationCode ? `<div class="verification-code">Code: ${verificationCode}</div>` : ""}
              <p>${qrUrl}</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
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
              <Link href="/admin/customer-tables" className="text-sm font-medium">
                Customer Tables
              </Link>
              <Link href="/admin/menu" className="text-sm font-medium text-muted-foreground">
                Menu Management
              </Link>
              <Link href="/admin/tables" className="text-sm font-medium text-muted-foreground">
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
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">QR Code Generator</h1>
          <p className="text-muted-foreground">Generate QR codes for your restaurant tables</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Settings</CardTitle>
              <CardDescription>Customize your QR code for each table</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base-url">Base URL</Label>
                <Input
                  id="base-url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://your-domain.com/menu"
                />
                <p className="text-xs text-muted-foreground">
                  This is the base URL for your menu. Table number will be appended to this URL.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="table-number">Table Number</Label>
                <Input
                  id="table-number"
                  type="number"
                  min="1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-size">QR Code Size</Label>
                <Select value={qrSize} onValueChange={setQrSize}>
                  <SelectTrigger id="qr-size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">Small (128px)</SelectItem>
                    <SelectItem value="200">Medium (200px)</SelectItem>
                    <SelectItem value="256">Large (256px)</SelectItem>
                    <SelectItem value="320">Extra Large (320px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Verification Code</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 border rounded-md bg-muted">{verificationCode || "No code generated"}</div>
                  <Button variant="outline" size="icon" onClick={generateVerificationCode} disabled={isGeneratingCode}>
                    <RefreshCw className={`h-4 w-4 ${isGeneratingCode ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generate a verification code that customers must enter to place an order. The code expires after 30
                  minutes.
                </p>
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium">QR Code URL:</p>
                <p className="text-sm text-muted-foreground break-all">{qrUrl}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button className="w-full sm:w-auto" onClick={downloadQRCode}>
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={printQRCode}>
                Print QR Code
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Code Preview</CardTitle>
              <CardDescription>Scan with your phone to test</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="rounded-lg border p-4 bg-white">
                <QRCodeCanvas
                  id="qr-code"
                  value={qrUrl}
                  size={Number.parseInt(qrSize)}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="font-medium">Table {tableNumber}</p>
                <p className="text-sm text-muted-foreground">Scan to order</p>
                {verificationCode && <p className="mt-2 font-bold">Code: {verificationCode}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

