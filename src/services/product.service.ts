import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export function mapProduct(product: {
  id: string
  title: string
  description: string
  price: Prisma.Decimal
  images: string[]
  categoryId: string
  sellerId: string
  stock: number
  createdAt: Date
  category?: { id: string; name: string; image: string }
  seller?: { id: string; name: string; email: string }
}) {
  return {
    ...product,
    price: Number(product.price),
  }
}

export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      seller: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return products.map(mapProduct)
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      seller: {
        select: { id: true, name: true, email: true },
      },
    },
  })
  return product ? mapProduct(product) : null
}

