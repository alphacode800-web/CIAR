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

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0)
  const totalItems = orders.reduce((sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0), 0)
  const deliveredCount = orders.filter((order) => order.status.toLowerCase() === "delivered").length

  const statusClassMap: Record<string, string> = {
    pending: "bg-[#f2e2c4] text-[#7a2e1f]",
    processing: "bg-[#dbe7f5] text-[#1e3a5f]",
    shipped: "bg-[#d7e5ed] text-[#334155]",
    delivered: "bg-[#dde8d6] text-[#365740]",
    cancelled: "bg-[#ead7d2] text-[#6f1d1b]",
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/55 bg-gradient-to-r from-[#7a2e1f]/85 to-[#8b5e34]/85 px-6 py-5 text-white shadow-lg backdrop-blur-xl">
        <h1 className="text-2xl font-semibold md:text-3xl">الطلبات</h1>
        <p className="mt-1 text-sm text-white/90 md:text-base">تابع الطلبات والحالات والإجماليات ونشاط العملاء.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/55 bg-white/45 px-5 py-4 backdrop-blur-xl">
          <p className="text-xs font-semibold tracking-widest text-[#475569]">عدد الطلبات</p>
          <p className="mt-2 text-3xl font-bold text-[#1e3a5f]">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-white/55 bg-white/45 px-5 py-4 backdrop-blur-xl">
          <p className="text-xs font-semibold tracking-widest text-[#475569]">الإيرادات</p>
          <p className="mt-2 text-3xl font-bold text-[#1e3a5f]">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-white/55 bg-white/45 px-5 py-4 backdrop-blur-xl">
          <p className="text-xs font-semibold tracking-widest text-[#475569]">العناصر المباعة</p>
          <p className="mt-2 text-3xl font-bold text-[#1e3a5f]">{totalItems}</p>
        </div>
        <div className="rounded-2xl border border-white/55 bg-white/45 px-5 py-4 backdrop-blur-xl">
          <p className="text-xs font-semibold tracking-widest text-[#475569]">الطلبات المسلمة</p>
          <p className="mt-2 text-3xl font-bold text-[#1e3a5f]">{deliveredCount}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/55 bg-white/45 shadow-lg backdrop-blur-xl">
        <div className="border-b border-white/55 bg-white/35 px-5 py-4">
          <p className="text-sm font-semibold text-[#7a2e1f]">كل الطلبات</p>
          <p className="text-xs text-[#64748b]">عرض واضح وحديث لجميع طلبات المتجر.</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[#334155]">العميل</TableHead>
              <TableHead className="text-[#334155]">العناصر</TableHead>
              <TableHead className="text-[#334155]">الحالة</TableHead>
              <TableHead className="text-[#334155]">الإجمالي</TableHead>
              <TableHead className="text-[#334155]">التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const normalizedStatus = order.status.toLowerCase()
              return (
                <TableRow key={order.id} className="hover:bg-white/40">
                  <TableCell>
                    <p className="font-medium text-[#1e3a5f]">{order.user?.name ?? "غير معروف"}</p>
                    <p className="text-xs text-[#64748b]">{order.user?.email ?? "-"}</p>
                  </TableCell>
                  <TableCell className="font-medium text-[#334155]">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        statusClassMap[normalizedStatus] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-[#1e3a5f]">${Number(order.totalPrice).toFixed(2)}</TableCell>
                  <TableCell className="text-[#64748b]">{new Date(order.createdAt).toLocaleString("ar-SA")}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

