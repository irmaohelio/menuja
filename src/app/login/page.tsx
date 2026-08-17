"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error)
        return
      }

      // Force full page reload to ensure cookie is sent on next request
      if (data.user.role === "master") {
        window.location.replace("/master")
      } else {
        window.location.replace("/admin")
      }
    } catch {
      setError("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">📋</div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent tracking-tight">MenuJá</span>
          </Link>
          <p className="text-gray-500 mt-2">Acesse sua conta</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-sm space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              placeholder="seu@email.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              placeholder="Sua senha" required />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition disabled:opacity-50">
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Não tem conta? <Link href="/cadastro" className="text-rose-600 font-medium">Criar agora</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
