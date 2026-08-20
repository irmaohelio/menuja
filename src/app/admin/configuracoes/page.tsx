"use client"
import { useState, useEffect } from "react"

const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export default function ConfiguracoesPage() {
  const [store, setStore] = useState<any>({})
  const [settings, setSettings] = useState<any>({})
  const [hours, setHours] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState("loja")

  useEffect(() => {
    fetch("/api/store/settings").then(r => r.json()).then(data => {
      if (data.success) {
        setStore(data.store)
        setSettings(data.settings || {})
        setHours(data.businessHours || [])
      }
    })
  }, [])

  const save = async () => {
    console.log("[CONFIG] Save clicked!")
    setSaving(true)
    try {
      // Only send scalar store fields, strip nested objects and system fields
      const { id, userId, createdAt, updatedAt, settings: _s, categories: _c, products: _p, customers: _cu, orders: _o, businessHours: _bh, highlights: _h, notifications: _n, pizzaCrusts: _pc, user: _u, ...storeScalar } = store
      console.log("[CONFIG] Sending:", JSON.stringify({ storeData: storeScalar, settingsData: settings, businessHours: hours }).substring(0, 300))
      
      const res = await fetch("/api/store/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeData: storeScalar, settingsData: settings, businessHours: hours }),
      })
      console.log("[CONFIG] Response status:", res.status)
      const data = await res.json()
      console.log("[CONFIG] Response data:", JSON.stringify(data).substring(0, 200))
      if (data.success) {
        alert("Salvo!")
        // Reload fresh data
        fetch("/api/store/settings").then(r => r.json()).then(d => {
          if (d.success) {
            setStore(d.store)
            setSettings(d.settings || {})
            setHours(d.businessHours || [])
          }
        })
      } else {
        alert("Erro ao salvar: " + (data.error || "Tente novamente"))
      }
    } catch (err) {
      console.log("[CONFIG] Error:", err)
      alert("Erro de conexão: " + err)
    }
    setSaving(false)
  }

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    fd.append("type", "logo")
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (data.success) setStore({ ...store, logo: data.url })
  }

  const handleBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    fd.append("type", "banner")
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (data.success) setStore({ ...store, banner: data.url })
  }

  const tabs = [
    { id: "loja", label: "🏪 Loja" },
    { id: "horarios", label: "⏰ Horários" },
    { id: "entrega", label: "🚗 Entrega" },
    { id: "pagamento", label: "💳 Pagamento" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <button onClick={save} disabled={saving}
          className="px-6 py-2 text-white rounded-xl font-medium disabled:opacity-50"
          style={{ backgroundColor: "var(--btn)" }}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
              tab === t.id ? " text-white" : "bg-white text-gray-700"
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Loja */}
      {tab === "loja" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Logo</label>
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
                <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">Tamanho recomendado: <strong>200x200px</strong></p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Banner da loja</label>
            <div className="flex flex-col gap-3">
              {store.banner ? (
                <div className="relative">
                  <img src={store.banner} alt="Banner" className="w-full h-32 object-cover rounded-xl border" />
                  <button onClick={() => setStore({ ...store, banner: null })}
                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">✕</button>
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Nenhum banner</span>
                </div>
              )}
              <label className="cursor-pointer">
                <div className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border rounded-xl text-sm font-medium text-center transition">
                  {store.banner ? "Trocar banner" : "Selecionar banner"}
                </div>
                <input type="file" accept="image/*" onChange={handleBanner} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 text-center">Aparece no topo da página da loja • Tamanho recomendado: <strong>780x280px</strong></p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome da loja</label>
            <input value={store.name || ""} onChange={e => setStore({...store, name: e.target.value})}
              className="w-full px-4 py-3 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea value={store.description || ""} onChange={e => setStore({...store, description: e.target.value})}
              className="w-full px-4 py-3 border rounded-xl" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input value={store.phone || ""} onChange={e => setStore({...store, phone: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input value={store.whatsapp || ""} onChange={e => setStore({...store, whatsapp: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Endereço</label>
            <input value={store.address || ""} onChange={e => setStore({...store, address: e.target.value})}
              className="w-full px-4 py-3 border rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input value={store.city || ""} onChange={e => setStore({...store, city: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <input value={store.state || ""} onChange={e => setStore({...store, state: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input value={store.zipCode || ""} onChange={e => setStore({...store, zipCode: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl" />
            </div>
          </div>

        </div>
      )}

      {/* Horários */}
      {tab === "horarios" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-3">
          {hours.map((h, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className="w-24 font-medium text-sm">{days[h.dayOfWeek]}</span>
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

      {/* Entrega */}
      {tab === "entrega" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <label className="flex items-center justify-between">
            <span>Entrega disponível</span>
            <input type="checkbox" checked={settings.deliveryEnabled ?? true}
              onChange={e => setSettings({...settings, deliveryEnabled: e.target.checked})} />
          </label>
          <label className="flex items-center justify-between">
            <span>Retirada no local</span>
            <input type="checkbox" checked={settings.pickupEnabled ?? true}
              onChange={e => setSettings({...settings, pickupEnabled: e.target.checked})} />
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Taxa de entrega (R$)</label>
            <input type="number" step="0.50" value={settings.deliveryFee ?? 0}
              onChange={e => setSettings({...settings, deliveryFee: parseFloat(e.target.value) || 0})}
              className="w-full px-4 py-3 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pedido mínimo (R$)</label>
            <input type="number" step="1" value={settings.minOrder ?? 0}
              onChange={e => setSettings({...settings, minOrder: parseFloat(e.target.value) || 0})}
              className="w-full px-4 py-3 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tempo médio de preparo (min)</label>
            <input type="number" value={settings.avgPrepTime ?? 30}
              onChange={e => setSettings({...settings, avgPrepTime: parseInt(e.target.value) || 30})}
              className="w-full px-4 py-3 border rounded-xl" />
          </div>
        </div>
      )}

      {/* Pagamento */}
      {tab === "pagamento" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <label className="flex items-center justify-between">
            <span>💵 Dinheiro</span>
            <input type="checkbox" checked={settings.cashEnabled ?? true}
              onChange={e => setSettings({...settings, cashEnabled: e.target.checked})} />
          </label>
          <label className="flex items-center justify-between">
            <span>📱 PIX</span>
            <input type="checkbox" checked={settings.pixEnabled ?? false}
              onChange={e => setSettings({...settings, pixEnabled: e.target.checked})} />
          </label>
          {settings.pixEnabled && (
            <div>
              <label className="block text-sm font-medium mb-1">Chave PIX</label>
              <input value={settings.pixKey || ""} onChange={e => setSettings({...settings, pixKey: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl" placeholder="Sua chave PIX" />
            </div>
          )}
          <label className="flex items-center justify-between">
            <span>💳 Cartão</span>
            <input type="checkbox" checked={settings.cardEnabled ?? false}
              onChange={e => setSettings({...settings, cardEnabled: e.target.checked})} />
          </label>
        </div>
      )}
    </div>
  )
}
