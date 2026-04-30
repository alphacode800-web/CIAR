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
      { label: "المنتجات", value: stats.products },
      { label: "الطلبات", value: stats.orders },
      { label: "المستخدمون", value: stats.users },
      { label: "الإيرادات", value: `$${stats.revenue.toFixed(2)}` },
    ],
    [stats]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#6f1d1b]">نظرة عامة</h1>
        <p className="mt-1 text-sm text-[#475569]">تابع أداء المتجر والعمليات بشكل لحظي.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="border-white/50 bg-white/45 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#475569]">{card.label}</CardDescription>
              <CardTitle className="text-2xl text-[#1e3a5f]">{card.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-white/50 bg-white/45 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-[#7a2e1f]">أحدث الطلبات</CardTitle>
          <CardDescription className="text-[#475569]">آخر العمليات في متجر JOMAA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[#64748b]">لا توجد طلبات حديثة.</p>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-white/55 bg-white/40 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#1e3a5f]">{order.user?.name ?? "عميل غير معروف"}</p>
                  <p className="text-xs text-[#64748b]">{new Date(order.createdAt).toLocaleString("ar-SA")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1e3a5f]">${Number(order.totalPrice).toFixed(2)}</p>
                  <p className="text-xs capitalize text-[#64748b]">{order.status}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

