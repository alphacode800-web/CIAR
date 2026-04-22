"use client"

import { useAuthModal } from "@/lib/auth-modal-context"
import { AuthModal } from "@/components/layout/auth-modal"

export function AuthModalWrapper() {
  const { mode, close } = useAuthModal()

  if (!mode) return null

  return <AuthModal mode={mode} onClose={close} />
}
