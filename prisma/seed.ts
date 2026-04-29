import { PrismaClient, Prisma, Role, OrderStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

const platforms = [
  { slug: "jomaa-market", category: "Marketplace", imageUrl: "/images/ecommerce.png", externalUrl: "https://market.jomaa.store", views: 52400, featured: true },
  { slug: "jomaa-fashion", category: "Fashion", imageUrl: "/images/ecommerce.png", externalUrl: "https://fashion.jomaa.store", views: 40250, featured: true },
  { slug: "jomaa-electronics", category: "Electronics", imageUrl: "/images/ecommerce.png", externalUrl: "https://electronics.jomaa.store", views: 39820, featured: true },
  { slug: "jomaa-home", category: "Home & Living", imageUrl: "/images/ecommerce.png", externalUrl: "https://home.jomaa.store", views: 28950, featured: false },
  { slug: "jomaa-groceries", category: "Groceries", imageUrl: "/images/ecommerce.png", externalUrl: "https://groceries.jomaa.store", views: 44110, featured: true },
  { slug: "jomaa-pharmacy", category: "Health", imageUrl: "/images/healthcare.png", externalUrl: "https://pharmacy.jomaa.store", views: 23640, featured: false },
  { slug: "jomaa-beauty", category: "Beauty", imageUrl: "/images/ecommerce.png", externalUrl: "https://beauty.jomaa.store", views: 19480, featured: false },
  { slug: "jomaa-books", category: "Books", imageUrl: "/images/education.png", externalUrl: "https://books.jomaa.store", views: 12870, featured: false },
  { slug: "jomaa-sports", category: "Sports", imageUrl: "/images/ecommerce.png", externalUrl: "https://sports.jomaa.store", views: 17330, featured: false },
  { slug: "jomaa-kids", category: "Kids", imageUrl: "/images/ecommerce.png", externalUrl: "https://kids.jomaa.store", views: 16740, featured: false },
  { slug: "jomaa-auto", category: "Automotive", imageUrl: "/images/car-rental.png", externalUrl: "https://auto.jomaa.store", views: 11890, featured: false },
  { slug: "jomaa-b2b", category: "B2B", imageUrl: "/images/logistics.png", externalUrl: "https://b2b.jomaa.store", views: 9120, featured: false },
  { slug: "jomaa-deals", category: "Deals", imageUrl: "/images/ecommerce.png", externalUrl: "https://deals.jomaa.store", views: 55300, featured: true },
] as const

async function main() {
  console.log("Seeding JOMAA STORE...")

  await db.projectTranslation.deleteMany()
  await db.project.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()

  const hashed = await bcrypt.hash("CIAR-8000", 12)

  const admin = await db.user.upsert({
    where: { email: "ciar800" },
    update: { name: "CIAR Admin", password: hashed, role: Role.ADMIN },
    create: {
      name: "CIAR Admin",
      email: "ciar800",
      password: hashed,
      role: Role.ADMIN,
    },
  })

  const seller = await db.user.upsert({
    where: { email: "seller@jomaa.store" },
    update: { name: "Main Seller", password: hashed, role: Role.SELLER },
    create: {
      name: "Main Seller",
      email: "seller@jomaa.store",
      password: hashed,
      role: Role.SELLER,
    },
  })

  const buyer = await db.user.upsert({
    where: { email: "user@jomaa.store" },
    update: { name: "Store User", password: hashed, role: Role.USER },
    create: {
      name: "Store User",
      email: "user@jomaa.store",
      password: hashed,
      role: Role.USER,
    },
  })

  const [electronics, fashion] = await Promise.all([
    db.category.create({
      data: {
        name: "Electronics",
        image: "https://images.jomaa.store/categories/electronics.jpg",
      },
    }),
    db.category.create({
      data: {
        name: "Fashion",
        image: "https://images.jomaa.store/categories/fashion.jpg",
      },
    }),
  ])

  const [phone, watch] = await Promise.all([
    db.product.create({
      data: {
        title: "JOMAA Pro Phone",
        description: "Premium smartphone with 256GB storage and advanced camera.",
        price: new Prisma.Decimal("699.99"),
        images: [
          "https://images.jomaa.store/products/phone-1.jpg",
          "https://images.jomaa.store/products/phone-2.jpg",
        ],
        categoryId: electronics.id,
        sellerId: seller.id,
        stock: 40,
      },
    }),
    db.product.create({
      data: {
        title: "JOMAA Smart Watch",
        description: "Lightweight watch with fitness and health tracking.",
        price: new Prisma.Decimal("149.99"),
        images: ["https://images.jomaa.store/products/watch-1.jpg"],
        categoryId: fashion.id,
        sellerId: seller.id,
        stock: 90,
      },
    }),
  ])

  await db.order.create({
    data: {
      userId: buyer.id,
      totalPrice: new Prisma.Decimal("849.98"),
      status: OrderStatus.PENDING,
      items: {
        create: [
          {
            productId: phone.id,
            quantity: 1,
            price: new Prisma.Decimal("699.99"),
          },
          {
            productId: watch.id,
            quantity: 1,
            price: new Prisma.Decimal("149.99"),
          },
        ],
      },
    },
  })

  for (const [index, platform] of platforms.entries()) {
    await db.project.create({
      data: {
        slug: platform.slug,
        category: platform.category,
        imageUrl: platform.imageUrl,
        externalUrl: platform.externalUrl,
        featured: platform.featured,
        published: true,
        order: index + 1,
        views: platform.views,
        tags: JSON.stringify([platform.category, "JOMAA", "Platform"]),
        translations: {
          create: [
            {
              locale: "en",
              name: platform.slug.replace("jomaa-", "JOMAA ").replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              tagline: "A premium digital platform by JOMAA STORE.",
              description: "A modern commerce platform designed for performance, trust, and seamless customer experience.",
            },
            {
              locale: "ar",
              name: platform.slug.replace("jomaa-", "منصة جمعة "),
              tagline: "منصة رقمية متطورة من JOMAA STORE.",
              description: "منصة تجارة حديثة مصممة للسرعة والثقة وتجربة استخدام سلسة.",
            },
          ],
        },
      },
    })
  }

  console.log("Seed completed.")
  console.log("Platforms seeded:", platforms.length)
  console.log("Admin: CIAR800 / CIAR-8000")
  console.log("Seller: seller@jomaa.store / CIAR-8000")
  console.log("User: user@jomaa.store / CIAR-8000")
  console.log("Admin user id:", admin.id)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
