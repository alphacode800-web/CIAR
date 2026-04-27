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
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage marketplace catalog and stock.</p>
      </div>

      <form onSubmit={createProduct} className="grid gap-3 rounded-xl border border-border p-4">
        <h2 className="text-sm font-medium">Create New Product</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Product title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <Input placeholder="Price (e.g. 99.99)" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
          <Input placeholder="Stock" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} required />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Input placeholder="Image URLs separated by comma" value={form.images} onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))} required />
        <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
        <div>
          <Button disabled={loading}>{loading ? "Saving..." : "Create Product"}</Button>
        </div>
      </form>

      <div className="rounded-xl border border-border p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.title}</TableCell>
                <TableCell>{product.category?.name ?? "-"}</TableCell>
                <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => deleteProduct(product.id)}>
                    Delete
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

