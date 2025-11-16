"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors={true}
      closeButton={true}
      duration={4000}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // Light theme custom colors
          "--normal-bg": "#ffffff",
          "--normal-text": "#1f2937",
          "--normal-border": "#e5e7eb",
          
          // Success toast colors (green)
          "--success-bg": "#22c55e",
          "--success-text": "#ffffff",
          "--success-border": "#22c55e",
          
          // Error toast colors (red)
          "--error-bg": "#ef4444",
          "--error-text": "#ffffff",
          "--error-border": "#ffffff",
          
          // Info toast colors (blue)
          "--info-bg": "#eff6ff",
          "--info-text": "#2563eb",
          "--info-border": "#3b82f6",
          
          // Warning toast colors (yellow)
          "--warning-bg": "#fffbeb",
          "--warning-text": "#d97706",
          "--warning-border": "#f59e0b",
          
          "--border-radius": "12px",
          fontFamily: "var(--font-Poppins)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
