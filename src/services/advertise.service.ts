import { db } from "@/lib/db"

export async function createAdSubmission(data: {
  userId: string
  companyName: string
  senderType: string
  title: string
  description: string
  link?: string
  imageUrl?: string
  locale?: string
}) {
  return db.adSubmission.create({
    data: {
      userId: data.userId,
      companyName: data.companyName,
      senderType: data.senderType,
      title: data.title,
      description: data.description,
      link: data.link || "",
      imageUrl: data.imageUrl || "",
      locale: data.locale || "ar",
      status: "pending",
    },
    select: { id: true },
  })
}
