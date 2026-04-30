"use client"

import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Category = { id: string; name: string }
type Product = {
  id: string
  title: string
  price: number
  stock: number
  category?: { name: string }
}

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    images: "",
    categoryId: "",
    stock: "",
  })

  const getHeaders = () => {
    const token = localStorage.getItem("ciar_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const load = async () => {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch("/api/store/categories", { headers: getHeaders() }),
      fetch("/api/products", { headers: getHeaders() }),
    ])
    const categoriesData = await categoriesRes.json()
    const productsData = await productsRes.json()
    setCategories(categoriesData?.data?.categories ?? [])
    setProducts(productsData?.data?.products ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  const createProduct = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getHeaders() },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: Number(form.price),
          images: form.images.split(",").map((item) => item.trim()).filter(Boolean),
          categoryId: form.categoryId,
          stock: Number(form.stock),
        }),
      })
      setForm({ title: "", description: "", price: "", images: "", categoryId: "", stock: "" })
      await load()
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE", headers: getHeaders() })
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#6f1d1b]">المنتجات</h1>
        <p className="mt-1 text-sm text-[#475569]">إدارة كتالوج المتجر والمخزون.</p>
      </div>

      <form onSubmit={createProduct} className="grid gap-3 rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-xl">
        <h2 className="text-sm font-medium text-[#7a2e1f]">إضافة منتج جديد</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="اسم المنتج" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <Input placeholder="السعر (مثال: 99.99)" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
          <Input placeholder="المخزون" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} required />
          <select
            className="h-10 rounded-md border border-white/60 bg-white/55 px-3 text-sm text-[#1e3a5f]"
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            required
          >
            <option value="">اختر التصنيف</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Input placeholder="روابط الصور مفصولة بفاصلة" value={form.images} onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))} required />
        <Textarea placeholder="وصف المنتج" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
        <div>
          <Button className="bg-[#1e3a5f] text-white hover:bg-[#173150]" disabled={loading}>
            {loading ? "جاري الحفظ..." : "إضافة المنتج"}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-white/55 bg-white/40 p-3 backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[#334155]">الاسم</TableHead>
              <TableHead className="text-[#334155]">التصنيف</TableHead>
              <TableHead className="text-[#334155]">السعر</TableHead>
              <TableHead className="text-[#334155]">المخزون</TableHead>
              <TableHead className="text-right text-[#334155]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-white/45">
                <TableCell className="text-[#1e3a5f]">{product.title}</TableCell>
                <TableCell className="text-[#334155]">{product.category?.name ?? "-"}</TableCell>
                <TableCell className="text-[#1e3a5f]">${Number(product.price).toFixed(2)}</TableCell>
                <TableCell className="text-[#334155]">{product.stock}</TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => deleteProduct(product.id)}>
                    حذف
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

