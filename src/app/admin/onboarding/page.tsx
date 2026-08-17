"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, title: "Dados da loja", icon: "🏪" },
  { id: 2, title: "Logo e aparência", icon: "🎨" },
  { id: 3, title: "Horários", icon: "⏰" },
  { id: 4, title: "Categorias", icon: "📁" },
  { id: 5, title: "Pagamento", icon: "💳" },
  { id: 6, title: "Sua loja está pronta!", icon: "🎉" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [store, setStore] = useState<any>({})
  const [settings, setSettings] = useState<any>({})
  const [hours, setHours] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [newCat, setNewCat] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/store/settings").then(r => r.json()).then(data => {
      if (data.success) {
        setStore(data.store)
        setSettings(data.settings || {})
        setHours(data.businessHours || [])
      }
    })
  }, [])

  const saveAndNext = async () => {
    setSaving(true)
    if (step === 1) {
      await fetch("/api/store/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeData: store }),
      })
    }
    if (step === 3) {
      await fetch("/api/store/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessHours: hours }),
      })
    }
    if (step === 4) {
      for (const cat of categories) {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cat }),
        })
      }
    }
    if (step === 5) {
      await fetch("/api/store/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settingsData: settings }),
      })
      // Abrir loja
      await fetch("/api/store/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeData: { isOpen: true } }),
      })
    }
    setSaving(false)
    setStep(step + 1)
  }

  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {steps.map(s => (
            <div key={s.id} className={`h-1.5 flex-1 rounded-full ${step >= s.id ? "bg-rose-600" : "bg-gray-200"}`} />
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="text-center mb-6">
            <span className="text-4xl">{steps[step - 1].icon}</span>
            <h2 className="text-xl font-bold mt-2">{steps[step - 1].title}</h2>
          </div>

          {/* Step 1 - Dados da loja */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da loja</label>
                <input value={store.name || ""} onChange={e => setStore({...store, name: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl" placeholder="Ex: Pizzaria do João" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea value={store.description || ""} onChange={e => setStore({...store, description: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl" rows={2} placeholder="Conte sobre sua loja..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp</label>
                <input value={store.whatsapp || ""} onChange={e => setStore({...store, whatsapp: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl" placeholder="33999999999" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Endereço</label>
                <input value={store.address || ""} onChange={e => setStore({...store, address: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl" placeholder="Rua, número - Bairro" />
              </div>
            </div>
          )}

          {/* Step 2 - Logo e aparência */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Logo da loja</label>
                <div className="flex items-center gap-3">
                  {store.logo ? (
                    <img src={store.logo} alt="Logo" className="w-20 h-20 object-cover rounded-xl border" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <span className="text-2xl text-gray-400">🏪</span>
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border rounded-xl text-sm font-medium text-center transition">
                      {store.logo ? "Trocar logo" : "Selecionar logo"}
                    </div>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const fd = new FormData()
                      fd.append("file", file)
                      const res = await fetch("/api/upload", { method: "POST", body: fd })
                      const data = await res.json()
                      if (data.success) setStore({...store, logo: data.url})
                    }} className="hidden" />
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-400">Você pode alterar essas configurações depois.</p>
            </div>
          )}

          {/* Step 3 - Horários */}
          {step === 3 && (
            <div className="space-y-3">
              {hours.map((h, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <span className="w-20 font-medium text-sm">{days[h.dayOfWeek]}</span>
                  <button onClick={() => {
                    const updated = [...hours]
                    updated[i] = { ...updated[i], isOpen: !updated[i].isOpen }
                    setHours(updated)
                  }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    h.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>{h.isOpen ? "Aberto" : "Fechado"}</button>
                  {h.isOpen && (
                    <>
                      <input type="time" value={h.openTime || "11:00"} onChange={e => {
                        const updated = [...hours]; updated[i] = { ...updated[i], openTime: e.target.value }; setHours(updated)
                      }} className="px-2 py-1.5 border rounded-lg text-sm" />
                      <span className="text-gray-400">às</span>
                      <input type="time" value={h.closeTime || "23:00"} onChange={e => {
                        const updated = [...hours]; updated[i] = { ...updated[i], closeTime: e.target.value }; setHours(updated)
                      }} className="px-2 py-1.5 border rounded-lg text-sm" />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 4 - Categorias */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Crie as categorias do seu cardápio</p>
              <div className="flex gap-2">
                <input value={newCat} onChange={e => setNewCat(e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-xl" placeholder="Ex: Pizzas"
                  onKeyDown={e => {
                    if (e.key === "Enter" && newCat.trim()) {
                      setCategories([...categories, newCat.trim()])
                      setNewCat("")
                    }
                  }} />
                <button onClick={() => {
                  if (newCat.trim()) { setCategories([...categories, newCat.trim()]); setNewCat("") }
                }} className="px-4 py-3 bg-rose-600 text-white rounded-xl font-medium">+</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((c, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-100 rounded-full text-sm flex items-center gap-2">
                    {c}
                    <button onClick={() => setCategories(categories.filter((_, j) => j !== i))} className="text-red-400">×</button>
                  </span>
                ))}
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-gray-400 mb-2">Sugestões:</p>
                <div className="flex flex-wrap gap-2">
                  {["Pizzas", "Hambúrgueres", "Lanches", "Bebidas", "Sobremesas", "Salgados"].filter(s => !categories.includes(s)).map(s => (
                    <button key={s} onClick={() => setCategories([...categories, s])}
                      className="px-3 py-1.5 border border-dashed rounded-full text-xs text-gray-500 hover:border-rose-400 hover:text-rose-600">+ {s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5 - Pagamento */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Configure as formas de pagamento</p>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium">💵 Dinheiro</span>
                <input type="checkbox" checked={settings.cashEnabled ?? true}
                  onChange={e => setSettings({...settings, cashEnabled: e.target.checked})} />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium">📱 PIX</span>
                <input type="checkbox" checked={settings.pixEnabled ?? false}
                  onChange={e => setSettings({...settings, pixEnabled: e.target.checked})} />
              </label>
              {settings.pixEnabled && (
                <input value={settings.pixKey || ""} onChange={e => setSettings({...settings, pixKey: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl" placeholder="Sua chave PIX" />
              )}
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium">💳 Cartão</span>
                <input type="checkbox" checked={settings.cardEnabled ?? false}
                  onChange={e => setSettings({...settings, cardEnabled: e.target.checked})} />
              </label>
              <div>
                <label className="block text-sm font-medium mb-1">Taxa de entrega (R$)</label>
                <input type="number" step="0.50" value={settings.deliveryFee ?? 0}
                  onChange={e => setSettings({...settings, deliveryFee: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 border rounded-xl" />
              </div>
            </div>
          )}

          {/* Step 6 - Concluído */}
          {step === 6 && (
            <div className="text-center py-6">
              <p className="text-6xl mb-4">🎉</p>
              <h3 className="text-2xl font-bold mb-2">Sua loja está pronta!</h3>
              <p className="text-gray-500 mb-6">Agora você pode adicionar produtos e compartilhar seu link.</p>
              <button onClick={() => router.push("/admin")}
                className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700">
                Ir para o painel
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 6 && (
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="flex-1 py-3 border rounded-xl font-medium">Voltar</button>
              )}
              <button onClick={saveAndNext} disabled={saving}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 disabled:opacity-50">
                {saving ? "Salvando..." : step === 5 ? "Finalizar 🚀" : "Próximo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
