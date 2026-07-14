import { db } from "@/lib/db"

export type FraudAlert = {
  orderId: string
  userId: string
  totalPrice: number
  createdAt: string
  riskScore: number
  level: "low" | "medium" | "high"
  reasons: string[]
}

function isRoundAmount(value: number): boolean {
  return value >= 1000 && value % 500 === 0
}

export async function scanFraudRisks(): Promise<{
  alerts: FraudAlert[]
  scanned: number
  highRisk: number
}> {
  const since = new Date()
  since.setDate(since.getDate() - 14)

  const orders = await db.order.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      userId: true,
      totalPrice: true,
      createdAt: true,
      status: true,
    },
  })

  const byUser = new Map<string, typeof orders>()
  for (const order of orders) {
    const bucket = byUser.get(order.userId) || []
    bucket.push(order)
    byUser.set(order.userId, bucket)
  }

  const alerts: FraudAlert[] = []

  for (const order of orders) {
    const reasons: string[] = []
    let riskScore = 0
    const amount = Number(order.totalPrice || 0)
    const userOrders = byUser.get(order.userId) || []

    if (amount >= 5000) {
      riskScore += 25
      reasons.push("قيمة طلب مرتفعة")
    }
    if (isRoundAmount(amount)) {
      riskScore += 15
      reasons.push("مبلغ دائري مشبوه")
    }
    if (userOrders.length >= 3) {
      riskScore += 20
      reasons.push("عدة طلبات من نفس المستخدم خلال أسبوعين")
    }
    if (order.status === "PENDING" && amount >= 2000) {
      riskScore += 10
      reasons.push("طلب معلّق بقيمة كبيرة")
    }

    const recentBurst = userOrders.filter((o) => {
      const diff = order.createdAt.getTime() - o.createdAt.getTime()
      return diff >= 0 && diff <= 2 * 60 * 60 * 1000
    })
    if (recentBurst.length >= 2) {
      riskScore += 30
      reasons.push("طلبات متتالية سريعة")
    }

    if (riskScore < 20) continue

    alerts.push({
      orderId: order.id,
      userId: order.userId,
      totalPrice: amount,
      createdAt: order.createdAt.toISOString(),
      riskScore: Math.min(100, riskScore),
      level: riskScore >= 50 ? "high" : riskScore >= 30 ? "medium" : "low",
      reasons,
    })
  }

  alerts.sort((a, b) => b.riskScore - a.riskScore)

  return {
    alerts: alerts.slice(0, 15),
    scanned: orders.length,
    highRisk: alerts.filter((a) => a.level === "high").length,
  }
}
