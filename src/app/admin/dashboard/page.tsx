"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardStats = {
  products: number
  orders: number
  users: number
  revenue: number
}

type RecentOrder = {
  id: string
  status: string
  totalPrice: number
  createdAt: string
  user?: { name: string; email: string }
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats>({ products: 0, orders: 0, users: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("ciar_token")
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
        fetch("/api/products", { headers }),
        fetch("/api/orders/admin", { headers }),
        fetch("/api/admin/users", { headers }),
      ])

      const products =
        productsRes.status === "fulfilled" && productsRes.value.ok
          ? (((await productsRes.value.json())?.data?.products ?? []) as Array<unknown>)
          : []
      const orders =
        ordersRes.status === "fulfilled" && ordersRes.value.ok
          ? (((await ordersRes.value.json())?.data?.orders ?? []) as RecentOrder[])
          : []
      const users =
        usersRes.status === "fulfilled" && usersRes.value.ok
          ? (((await usersRes.value.json())?.users ?? []) as Array<unknown>)
          : []

      const revenue = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0)
      setStats({
        products: products.length,
        orders: orders.length,
        users: users.length,
        revenue,
      })
      setRecentOrders(orders.slice(0, 6))
    }

    void load()
  }, [])

  const cards = useMemo(
    () => [
      { label: "Products", value: stats.products },
      { label: "Orders", value: stats.orders },
      { label: "Users", value: stats.users },
      { label: "Revenue", value: `$${stats.revenue.toFixed(2)}` },
    ],
    [stats]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor your marketplace in real time.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest transactions in JOMAA STORE</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent orders found.</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{order.user?.name ?? "Unknown customer"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${Number(order.totalPrice).toFixed(2)}</p>
                  <p className="text-xs capitalize text-muted-foreground">{order.status}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

