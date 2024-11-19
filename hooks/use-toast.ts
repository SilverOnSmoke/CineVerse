import * as React from "react"
import { toast as sonnerToast, type ToastT } from "sonner"

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

function toast({
  title,
  description,
  variant,
  ...props
}: {
  title?: string
  description?: string
  variant?: "default" | "destructive"
} & Omit<ToasterToast, "id">) {
  const id = Math.random().toString(36).slice(2)

  sonnerToast(title, {
    description,
    style: {
      backgroundColor: variant === "destructive" ? "var(--destructive)" : undefined,
      color: variant === "destructive" ? "var(--destructive-foreground)" : undefined,
    },
    id,
    ...props,
  })

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
  }
}

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}

export { useToast, toast }
