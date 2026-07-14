import { db } from "@/lib/db"

export type InventoryAlert = {
  productId: string
  title: string
  stock: number
  soldLast30Days: number
  avgDailyDemand: number
  daysUntilStockout: number | null
  status: "healthy" | "low" | "critical" | "overstock"
  recommendation: string
}

export async function buildInventoryForecast(): Promise<{
  alerts: InventoryAlert[]
  summary: { healthy: number; low: number; critical: number; overstock: number }
}> {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const products = await db.product.findMany({
    take: 100,
    select: {
      id: true,
      title: true,
      stock: true,
      orderItems: {
        where: { order: { createdAt: { gte: since } } },
        select: { quantity: true },
      },
    },
  })

  const alerts: InventoryAlert[] = products.map((product) => {
    const soldLast30Days = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    const avgDailyDemand = soldLast30Days / 30
    const daysUntilStockout =
      avgDailyDemand > 0 ? Math.round(product.stock / avgDailyDemand) : product.stock > 0 ? null : 0

    let status: InventoryAlert["status"] = "healthy"
    let recommendation = "المخزون ضمن المستوى الطبيعي."

    if (product.stock === 0 && soldLast30Days > 0) {
      status = "critical"
      recommendation = "نفاد المخزون — أعد التوريد فوراً."
    } else if (daysUntilStockout !== null && daysUntilStockout <= 7) {
      status = "critical"
      recommendation = "تنبؤ بنفاد خلال أسبوع — خطط لإعادة التوريد."
    } else if (daysUntilStockout !== null && daysUntilStockout <= 14) {
      status = "low"
      recommendation = "مخزون منخفض — راقب الطلب اليومي."
    } else if (product.stock > 0 && soldLast30Days === 0) {
      status = "overstock"
      recommendation = "لا مبيعات حديثة — فكّر في عرض ترويجي."
    } else if (product.stock > soldLast30Days * 3 && soldLast30Days > 0) {
      status = "overstock"
      recommendation = "مخزون أعلى من الطلب — قلّل الكمية القادمة."
    }

    return {
      productId: product.id,
      title: product.title,
      stock: product.stock,
      soldLast30Days,
      avgDailyDemand: Number(avgDailyDemand.toFixed(2)),
      daysUntilStockout,
      status,
      recommendation,
    }
  })

  alerts.sort((a, b) => {
    const rank = { critical: 0, low: 1, overstock: 2, healthy: 3 }
    return rank[a.status] - rank[b.status]
  })

  const summary = {
    healthy: alerts.filter((a) => a.status === "healthy").length,
    low: alerts.filter((a) => a.status === "low").length,
    critical: alerts.filter((a) => a.status === "critical").length,
    overstock: alerts.filter((a) => a.status === "overstock").length,
  }

  return { alerts: alerts.slice(0, 20), summary }
}
