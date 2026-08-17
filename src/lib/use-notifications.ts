"use client"
import { useState, useEffect, useCallback } from "react"

export function useNotifications() {
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      if (data.success) {
        setUnread(data.unread)
        setNotifications(data.notifications)
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000) // Polling a cada 10s
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PUT" })
    setUnread(0)
  }

  return { unread, notifications, markAllRead, refresh: fetchNotifications }
}
