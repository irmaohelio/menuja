"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const segments = [
  { value: "pizzaria", label: "🍕 Pizzaria" },
  { value: "lanchonete", label: "🍔 Lanche Delivery" },
  { value: "salgados", label: "🌮 Salgados" },
  { value: "marmitas", label: "🍱 Marmitas" },
  { value: "acai", label: "🍨 Açaí" },
  { value: "doces", label: "🎂 Doces" },
  { value: "bebidas", label: "🍺 Bebidas" },
  { value: "outros", label: "📦 Outros" },
]

export default function CadastroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
    storeName: "", segment: "outros",
  })

  const update = (field: string, value: string) => setForm({ ...form, [field]: value })

  const handleRegister = async () => {
    setError("")
    if (form.password !== form.confirmPassword) {
      setError("As senhas não conferem")
      return
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error)
        return
      }
      router.push("/admin/onboarding")
    } catch {
      setError("Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">📋</div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent tracking-tight">MenuJá</span>
          </Link>
          <p className="text-gray-500 mt-2">Crie sua loja em minutos</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm">
          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? "bg-rose-600" : "bg-gray-200"}`} />
            ))}
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{error}</div>}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Seus dados</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Nome completo</label>
                <input value={form.name} onChange={e => update("name", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input value={form.phone} onChange={e => update("phone", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <input type="password" value={form.password} onChange={e => update("password", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmar senha</label>
                <input type="password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Repita a senha" />
              </div>
              <button onClick={() => {
                if (!form.name || !form.email || !form.password) { setError("Preencha todos os campos"); return }
                setStep(2)
              }} className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition">
                Próximo
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Sua loja</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Nome da loja</label>
                <input value={form.storeName} onChange={e => update("storeName", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Ex: Pizzaria do João" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de negócio</label>
                <div className="grid grid-cols-2 gap-2">
                  {segments.map(s => (
                    <button key={s.value} onClick={() => update("segment", s.value)}
                      className={`p-3 rounded-xl text-sm font-medium border-2 transition ${
                        form.segment === s.value ? "border-rose-600 bg-rose-50 text-rose-700" : "border-gray-200 hover:border-gray-300"
                      }`}>{s.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50">Voltar</button>
                <button onClick={handleRegister} disabled={loading}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition disabled:opacity-50">
                  {loading ? "Criando..." : "Criar loja 🚀"}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            Já tem conta? <Link href="/login" className="text-rose-600 font-medium">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
