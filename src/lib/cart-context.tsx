"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type CartItem = {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  sizeName?: string
  crustName?: string
  halfHalf?: boolean
  flavor1?: string
  flavor2?: string
  notes?: string
  options: { name: string; price: number; quantity: number }[]
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (index: number) => void
  updateQty: (index: number, delta: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children, storeSlug }: { children: ReactNode; storeSlug: string }) {
  const [items, setItems] = useState<CartItem[]>([])
  const key = `cart_${storeSlug}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [key])

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(items))
    } catch {}
  }, [items, key])

  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item])
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateQty = (index: number, delta: number) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, item) => {
    const optsTotal = item.options.reduce((s, o) => s + o.price * (o.quantity || 1), 0)
    return sum + (item.unitPrice + optsTotal) * item.quantity
  }, 0)

  const count = items.reduce((s, item) => s + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be inside CartProvider")
  return ctx
}
