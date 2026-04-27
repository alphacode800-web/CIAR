"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Order = {
  id: string
  status: string
  totalPrice: number
  createdAt: string
  user?: { name: string; email: string }
  items: Array<{ id: string; quantity: number; product: { title: string } }>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("ciar_token")
      const res = await fetch("/api/orders/admin", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const data = await res.json()
      setOrders(data?.data?.orders ?? [])
    }
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Track orders, status, and totals.</p>
      </div>

      <div className="rounded-xl border border-border p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <p className="font-medium">{order.user?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{order.user?.email ?? "-"}</p>
                </TableCell>
                <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                <TableCell className="capitalize">{order.status}</TableCell>
                <TableCell>${Number(order.totalPrice).toFixed(2)}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

