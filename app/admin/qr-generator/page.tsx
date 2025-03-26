"use client"

import { useState } from "react"
import { Download, QrCode } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function QRGenerator() {
  const [tableNumber, setTableNumber] = useState("1")
  const [qrSize, setQrSize] = useState("200")
  const [baseUrl, setBaseUrl] = useState("https://example.com/menu")

  const qrUrl = `${baseUrl}/${tableNumber}`

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
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>Table ${tableNumber}</h2>
              <p>Scan to order</p>
              <img src="${imageUrl}" alt="QR Code for Table ${tableNumber}" />
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
    <div className="container mx-auto px-4 py-6 md:py-10">
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
              <QRCodeCanvas id="qr-code" value={qrUrl} size={Number.parseInt(qrSize)} level="H" includeMargin={true} />
            </div>
            <div className="mt-4 text-center">
              <p className="font-medium">Table {tableNumber}</p>
              <p className="text-sm text-muted-foreground">Scan to order</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Bulk Generation</h2>
        <Card>
          <CardHeader>
            <CardTitle>Generate Multiple QR Codes</CardTitle>
            <CardDescription>Create QR codes for multiple tables at once</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-table">Start Table</Label>
                <Input id="start-table" type="number" min="1" defaultValue="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-table">End Table</Label>
                <Input id="end-table" type="number" min="1" defaultValue="10" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full sm:w-auto">
              <QrCode className="mr-2 h-4 w-4" />
              Generate Bulk QR Codes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

