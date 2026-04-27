import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

type OrderWithItems = {
  id: string
  userId: string
  totalPrice: Prisma.Decimal
  status: string
  createdAt: Date
  user?: { id: string; name: string; email: string }
  items: Array<{
    id: string
    productId: string
    quantity: number
    price: Prisma.Decimal
    product: {
      id: string
      title: string
      images: string[]
    }
  }>
}

export function mapOrder(order: OrderWithItems) {
  return {
    ...order,
    totalPrice: Number(order.totalPrice),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  }
}

export async function getOrdersByUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, title: true, images: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return orders.map(mapOrder)
}

export async function getAllOrders() {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      items: {
        include: {
          product: {
            select: { id: true, title: true, images: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return orders.map(mapOrder)
}

