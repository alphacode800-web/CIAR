"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("ciar_token")
      const res = await fetch("/api/admin/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const data = await res.json()
      setUsers(data?.users ?? [])
    }
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#6f1d1b]">المستخدمون</h1>
        <p className="mt-1 text-sm text-[#475569]">جميع الحسابات المسجلة في المتجر.</p>
      </div>

      <div className="rounded-xl border border-white/55 bg-white/40 p-3 backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[#334155]">الاسم</TableHead>
              <TableHead className="text-[#334155]">البريد الإلكتروني</TableHead>
              <TableHead className="text-[#334155]">الدور</TableHead>
              <TableHead className="text-[#334155]">تاريخ الانضمام</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-white/45">
                <TableCell className="text-[#1e3a5f]">{user.name}</TableCell>
                <TableCell className="text-[#334155]">{user.email}</TableCell>
                <TableCell className="capitalize text-[#334155]">{user.role}</TableCell>
                <TableCell className="text-[#64748b]">{new Date(user.createdAt).toLocaleDateString("ar-SA")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

