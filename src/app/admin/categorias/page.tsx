"use client"
import { useState, useEffect } from "react"

export default function CategoriasPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [catTemplates, setCatTemplates] = useState<Record<string, any[]>>({})
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("standard")
  const [editingExtras, setEditingExtras] = useState<string | null>(null)
  const [extraName, setExtraName] = useState("")
  const [extraPrice, setExtraPrice] = useState("")
  const [sorveteSabores, setSorveteSabores] = useState<any[]>([])
  const [sorveteCoberturas, setSorveteCoberturas] = useState<any[]>([])
  const [saborName, setSaborName] = useState("")
  const [saborColor, setSaborColor] = useState("#CCCCCC")
  const [coberturaName, setCoberturaName] = useState("")
  const [coberturaColor, setCoberturaColor] = useState("#CCCCCC")
  const [sorveteImage, setSorveteImage] = useState("")
  // Confeitaria (bolos e doces) state
  const [confeitariaSabores, setConfeitariaSabores] = useState<any[]>([])
  const [confeitariaRecheios, setConfeitariaRecheios] = useState<any[]>([])
  const [confeitariaCoberturas, setConfeitariaCoberturas] = useState<any[]>([])
  const [confeitariaTamanhos, setConfeitariaTamanhos] = useState<any[]>([])
  const [confSaborName, setConfSaborName] = useState("")
  const [confRecheioName, setConfRecheioName] = useState("")
  const [confCoberturaName, setConfCoberturaName] = useState("")
  const [confTamanhoName, setConfTamanhoName] = useState("")
  const [confTamanhoFatias, setConfTamanhoFatias] = useState("")
  const [confTamanhoPreco, setConfTamanhoPreco] = useState("")
  // Picolé state
  const [picoleCoberturas, setPicoleCoberturas] = useState<any[]>([])
  const [picCoberturaName, setPicCoberturaName] = useState("")
  const [picCoberturaPreco, setPicCoberturaPreco] = useState("")
  // Bebidas state
  const [bebidaTamanhos, setBebidaTamanhos] = useState<any[]>([])
  const [bebTamanhoName, setBebTamanhoName] = useState("")
  const [bebTamanhoPreco, setBebTamanhoPreco] = useState("")
  // Lanche state
  const [lancheExtras, setLancheExtras] = useState<any[]>([])
  const [lanExtraName, setLanExtraName] = useState("")
  const [lanExtraPreco, setLanExtraPreco] = useState("")
  // Pizza state
  const [pizzaCrusts, setPizzaCrusts] = useState<any[]>([])
  const [crustName, setCrustName] = useState("")
  const [crustPrice, setCrustPrice] = useState("")
  // Available days state
  const [availableDays, setAvailableDays] = useState<number[]>([])
  // Encomenda state
  const [isEncomenda, setIsEncomenda] = useState(false)


  const load = () => {
    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.categories) })
    // Load extras templates from API
    fetch("/api/categories/templates").then(r => r.json()).then(d => {
      if (d.success && d.templates) setCatTemplates(d.templates)
    })
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!name) return
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories"
    const method = editing ? "PUT" : "POST"
    await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, type, availableDays, isEncomenda }),
    })
    if (type === 'sorvete' && (sorveteSabores.length > 0 || sorveteCoberturas.length > 0 || sorveteImage)) {
      await fetch("/api/sorvete-config", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: { sabores: sorveteSabores, coberturas: sorveteCoberturas, image: sorveteImage } }),
      })
    }
    if (type === 'confeitaria') {
      await fetch("/api/sorvete-config", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: {
          sabores: confeitariaSabores,
          recheios: confeitariaRecheios,
          coberturas: confeitariaCoberturas,
          tamanhos: confeitariaTamanhos,
        } }),
      })
    }
    if (type === 'picole') {
      await fetch("/api/sorvete-config", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: {
          coberturas: picoleCoberturas,
        } }),
      })
    }
    if (type === 'bebidas') {
      await fetch("/api/sorvete-config", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: {
          tamanhos: bebidaTamanhos,
        } }),
      })
    }
    if (type === 'lanche') {
      await fetch("/api/sorvete-config", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: {
          extras: lancheExtras,
        } }),
      })
    }

    setShowForm(false)
    setEditing(null)
    setName("")
    setDescription("")
    setType("standard")
    setSorveteSabores([])
    setSorveteCoberturas([])
    setSorveteImage("")
    setConfeitariaSabores([])
    setConfeitariaRecheios([])
    setConfeitariaCoberturas([])
    setConfeitariaTamanhos([])
    setPicoleCoberturas([])
    setBebidaTamanhos([])
    setLancheExtras([])
    setAvailableDays([])
    setIsEncomenda(false)

    load()
  }

  const deleteCategory = async (id: string) => {
    if (!confirm("Excluir categoria? Os produtos dessa categoria ficarão sem categoria.")) return
    await fetch(`/api/categories/${id}`, { method: "DELETE" })
    load()
  }

  const toggleActive = async (cat: any) => {
    await fetch(`/api/categories/${cat.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    })
    load()
  }

  const startEdit = (c: any) => {
    setEditing(c)
    setName(c.name)
    setDescription(c.description || "")
    setType(c.type)
    setAvailableDays(c.availableDays || [])
    setIsEncomenda(c.isEncomenda || false)
    setShowForm(true)
    if (c.type === 'sorvete' || c.type === 'confeitaria' || c.type === 'picole' || c.type === 'bebidas') {
      fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
        .then(r => r.json())
        .then(data => {
          if (data.store?.sorveteConfig) {
            const cfg = data.store.sorveteConfig
            if (c.type === 'sorvete') {
              setSorveteSabores(cfg.sabores || [])
              setSorveteCoberturas(cfg.coberturas || [])
              setSorveteImage(cfg.image || "")
            }
            if (c.type === 'confeitaria') {
              setConfeitariaSabores(cfg.sabores || [])
              setConfeitariaRecheios(cfg.recheios || [])
              setConfeitariaCoberturas(cfg.coberturas || [])
              setConfeitariaTamanhos(cfg.tamanhos || [])
            }
            if (c.type === 'picole') {
              setPicoleCoberturas(cfg.coberturas || [])
            }
            if (c.type === 'bebidas') {
              setBebidaTamanhos(cfg.tamanhos || [])
            }
          }
        })
        .catch(() => {})
    }

  }

  const addExtra = (catId: string) => {
    if (!extraName.trim()) return
    const current = catTemplates[catId] || []
    setCatTemplates({ ...catTemplates, [catId]: [...current, { name: extraName.trim(), price: extraPrice || "0" }] })
    setExtraName("")
    setExtraPrice("")
  }

  const removeExtra = (catId: string, idx: number) => {
    const current = catTemplates[catId] || []
    setCatTemplates({ ...catTemplates, [catId]: current.filter((_, i) => i !== idx) })
  }

  const saveExtras = async (catId: string) => {
    const extras = catTemplates[catId] || []
    const res = await fetch("/api/categories/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: catId, extras }),
    })
    const data = await res.json()
    if (data.success) {
      alert(`Extras sincronizados com ${data.count} produto(s)!`)
      setEditingExtras(null)
    }
  }

  const typeLabels: Record<string, string> = {
    standard: "📁 Padrão",
    pizza: "🍕 Pizza",
    advanced: "🔧 Avançado",
    sorvete: "🍦 Sorvete",
    acai: "🫐 Açaí",
    confeitaria: "🎂 Bolos e Doces",
    picole: "🧊 Picolé",
    bebidas: "🥤 Bebidas",
    lanche: "🍔 Lanche",
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <button onClick={() => { setEditing(null); setName(""); setDescription(""); setType("standard"); setAvailableDays([]); setIsEncomenda(false); setShowForm(true) }}
          className="px-4 py-2 text-white rounded-xl font-medium" style={{ backgroundColor: "var(--btn)" }}>+ Nova categoria</button>
      </div>

      <div className="space-y-3">
        {categories.map(c => (
          <div key={c.id} className={`bg-white rounded-xl shadow-sm ${!c.isActive ? "opacity-50" : ""}`}>
            {/* Category header */}
            <div className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">{c.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{typeLabels[c.type] || c.type}</span>
                  <span className="text-xs text-gray-400">{c._count?.products || 0} produtos</span>
                  {c.availableDays && c.availableDays.length > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      📅 {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].filter((_, i) => c.availableDays.includes(i)).join(", ")}
                    </span>
                  )}
                  {c.isEncomenda && (
                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">📦 Encomenda</span>
                  )}
                </div>
              </div>
              <button onClick={() => toggleActive(c)} className={`w-10 h-6 rounded-full relative transition ${c.isActive ? "bg-green-400" : "bg-gray-300"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${c.isActive ? "left-4.5" : "left-0.5"}`} />
              </button>
              <button onClick={() => startEdit(c)} className="text-gray-400 hover:text-blue-600">✏️</button>
              <button onClick={() => deleteCategory(c.id)} className="text-gray-400 hover:text-red-600">🗑️</button>
            </div>

            {/* Extras section */}
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="flex items-center justify-between mt-3 mb-2">
                <span className="text-sm font-bold text-gray-600">Extras de {c.name}</span>
                <button onClick={() => setEditingExtras(editingExtras === c.id ? null : c.id)}
                  className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                  {editingExtras === c.id ? "Fechar" : "Editar"}
                </button>
              </div>

              {editingExtras !== c.id && (
              <div className="flex flex-wrap gap-1.5">
                {(catTemplates[c.id] || []).length === 0 ? (
                  <span className="text-xs text-gray-400">Nenhum extra configurado</span>
                ) : (
                  (catTemplates[c.id] || []).map((e, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {e.name} {parseFloat(e.price) > 0 ? `+R$ ${parseFloat(e.price).toFixed(2)}` : "grátis"}
                    </span>
                  ))
                )}
              </div>
              )}

              {editingExtras === c.id && (
                <div className="mt-2 space-y-2">
                  {(catTemplates[c.id] || []).map((e, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm font-medium">{e.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">
                          {parseFloat(e.price) > 0 ? `+R$ ${parseFloat(e.price).toFixed(2)}` : "grátis"}
                        </span>
                        <button onClick={() => removeExtra(c.id, i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input value={extraName} onChange={e => setExtraName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Ex: Bacon"
                      onKeyDown={e => e.key === "Enter" && addExtra(c.id)} />
                    <input type="number" step="0.01" value={extraPrice} onChange={e => setExtraPrice(e.target.value)}
                      className="w-24 px-3 py-2 border rounded-lg text-sm" placeholder="R$ 0,00"
                      onKeyDown={e => e.key === "Enter" && addExtra(c.id)} />
                    <button onClick={() => addExtra(c.id)} className="px-3 py-2 bg-gray-200 rounded-lg text-sm font-medium">+</button>
                  </div>
                  <button onClick={() => saveExtras(c.id)}
                    className="w-full py-2 text-white rounded-lg font-bold text-sm"
                    style={{ backgroundColor: "var(--btn)" }}>
                    Salvar Extras
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📁</p>
          <p>Nenhuma categoria cadastrada</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => { setShowForm(false); setEditing(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">{editing ? "Editar" : "Nova"} categoria</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl" placeholder="Ex: Hambúrgueres" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl" placeholder="Opcional" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select value={type} onChange={e => {
                  setType(e.target.value)
                  if ((e.target.value === 'sorvete' || e.target.value === 'confeitaria' || e.target.value === 'picole' || e.target.value === 'bebidas' || e.target.value === 'lanche') && editing) {
                    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
                      .then(r => r.json())
                      .then(data => {
                        if (data.store?.sorveteConfig) {
                          const cfg = data.store.sorveteConfig
                          if (e.target.value === 'sorvete') {
                            setSorveteSabores(cfg.sabores || [])
                            setSorveteCoberturas(cfg.coberturas || [])
                          }
                          if (e.target.value === 'confeitaria') {
                            setConfeitariaSabores(cfg.sabores || [])
                            setConfeitariaRecheios(cfg.recheios || [])
                            setConfeitariaCoberturas(cfg.coberturas || [])
                            setConfeitariaTamanhos(cfg.tamanhos || [])
                          }
                          if (e.target.value === 'picole') {
                            setPicoleCoberturas(cfg.coberturas || [])
                          }
                          if (e.target.value === 'bebidas') {
                                    setBebidaTamanhos(cfg.tamanhos || [])
                                  }
                                  if (e.target.value === 'lanche') {
                                    setLancheExtras(cfg.extras || [])
                                  }
                        }
                      })
                      .catch(() => {})
                  }

                }} className="w-full px-4 py-3 border rounded-xl">
                  <option value="standard">📁 Padrão</option>
                  <option value="advanced">🔧 Avançado (com opções)</option>
                  <option value="pizza">🍕 Pizza</option>
                  <option value="sorvete">🍦 Sorvete</option>
                  <option value="acai">🫐 Açaí</option>
                  <option value="confeitaria">🎂 Bolos e Doces</option>
                  <option value="picole">🧊 Picolé</option>
                  <option value="bebidas">🥤 Bebidas</option>
                  <option value="lanche">🍔 Lanche</option>
                </select>
              </div>

              {type === 'sorvete' && (
                <div className="border-t pt-4 space-y-4 bg-pink-50 -mx-2 px-4 py-4 rounded-xl">
                  <h4 className="font-bold text-sm">🍦 Imagem & Coberturas</h4>

                  <div>
                    <label className="block text-sm font-medium mb-2">Imagem</label>
                    <div className="flex items-center gap-3">
                      {sorveteImage && (
                        <img src={sorveteImage} alt="Sorvete" className="w-16 h-16 object-cover rounded-lg border" />
                      )}
                      <label className="cursor-pointer px-3 py-2 text-white rounded-lg font-bold text-sm" style={{ backgroundColor: "var(--btn)" }}>
                        {sorveteImage ? "Trocar imagem" : "Selecionar imagem"}
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const fd = new FormData()
                          fd.append("file", file)
                          const res = await fetch("/api/upload", { method: "POST", body: fd })
                          const data = await res.json()
                          if (data.success) setSorveteImage(data.url)
                        }} />
                      </label>
                      {sorveteImage && (
                        <button onClick={() => setSorveteImage("")} className="text-red-400 hover:text-red-600 text-sm">Remover</button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Coberturas</label>
                    {sorveteCoberturas.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {sorveteCoberturas.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                            <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: c.color }} />
                            <span className="flex-1 text-sm font-medium">{c.name}</span>
                            <button onClick={() => setSorveteCoberturas(sorveteCoberturas.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-lg">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="color" value={coberturaColor} onChange={e => setCoberturaColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                      <input value={coberturaName} onChange={e => setCoberturaName(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Ex: Calda de Morango"
                        onKeyDown={e => { if (e.key === "Enter" && coberturaName.trim()) { setSorveteCoberturas([...sorveteCoberturas, { name: coberturaName.trim(), color: coberturaColor }]); setCoberturaName(""); setCoberturaColor("#CCCCCC") } }} />
                      <button onClick={() => { if (coberturaName.trim()) { setSorveteCoberturas([...sorveteCoberturas, { name: coberturaName.trim(), color: coberturaColor }]); setCoberturaName(""); setCoberturaColor("#CCCCCC") } }}
                        className="px-3 py-2 text-white rounded-lg font-bold" style={{ backgroundColor: "var(--btn)" }}>+</button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">💡 Os sabores são gerenciados em Produtos</p>
                </div>
              )}

              {/* Confeitaria config */}
              {type === 'confeitaria' && (
                <div className="border-t pt-4 space-y-4 bg-amber-50 -mx-2 px-4 py-4 rounded-xl">
                  <h4 className="font-bold text-sm">🎂 Configuração de Bolos e Doces</h4>
                  <p className="text-xs text-gray-500">💡 As opções de bolos são gerenciadas em Produtos</p>
                </div>
              )}

              {/* Picolé config - removido, coberturas são gerenciadas em Produtos */}

              {/* Bebidas config */}
              {type === 'bebidas' && (
                <div className="border-t pt-4 space-y-4 bg-sky-50 -mx-2 px-4 py-4 rounded-xl">
                  <h4 className="font-bold text-sm">🥤 Tamanhos de Bebidas</h4>
                  <p className="text-xs text-gray-500">Tamanhos disponíveis para bebidas (ex: 300ml, 500ml, 1L)</p>

                  {bebidaTamanhos.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {bebidaTamanhos.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                          <span className="flex-1 text-sm font-medium">{s.name}</span>
                          <span className="text-sm text-green-600 font-medium">R$ {parseFloat(s.price).toFixed(2)}</span>
                          <button onClick={() => setBebidaTamanhos(bebidaTamanhos.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-lg">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input value={bebTamanhoName} onChange={e => setBebTamanhoName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Ex: 300ml, 500ml, 1L"
                      onKeyDown={e => { if (e.key === "Enter" && bebTamanhoName.trim()) { setBebidaTamanhos([...bebidaTamanhos, { name: bebTamanhoName.trim(), price: bebTamanhoPreco || "0" }]); setBebTamanhoName(""); setBebTamanhoPreco("") } }} />
                    <input type="number" step="0.01" value={bebTamanhoPreco} onChange={e => setBebTamanhoPreco(e.target.value)}
                      className="w-24 px-3 py-2 border rounded-lg text-sm" placeholder="R$ 0,00"
                      onKeyDown={e => { if (e.key === "Enter" && bebTamanhoName.trim()) { setBebidaTamanhos([...bebidaTamanhos, { name: bebTamanhoName.trim(), price: bebTamanhoPreco || "0" }]); setBebTamanhoName(""); setBebTamanhoPreco("") } }} />
                    <button onClick={() => { if (bebTamanhoName.trim()) { setBebidaTamanhos([...bebidaTamanhos, { name: bebTamanhoName.trim(), price: bebTamanhoPreco || "0" }]); setBebTamanhoName(""); setBebTamanhoPreco("") } }}
                      className="px-3 py-2 text-white rounded-lg font-bold" style={{ backgroundColor: "var(--btn)" }}>+</button>
                  </div>
                </div>
              )}

              {/* Lanche config */}
              {type === 'lanche' && (
                <div className="border-t pt-4 space-y-4 bg-amber-50 -mx-2 px-4 py-4 rounded-xl">
                  <h4 className="font-bold text-sm">🍔 Configuração de Lanche</h4>
                  <p className="text-xs text-gray-500">💡 Os extras do lanche são gerenciados em Produtos</p>
                </div>
              )}

              {/* Pizza config */}
              {type === 'pizza' && (
                <div className="border-t pt-4 space-y-4 bg-orange-50 -mx-2 px-4 py-4 rounded-xl">
                  <h4 className="font-bold text-sm">🍕 Bordas de Pizza</h4>
                  <p className="text-xs text-gray-500">Configure as opções de borda recheada que aparecem para o cliente</p>

                  {pizzaCrusts.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {pizzaCrusts.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                          <span className="flex-1 text-sm font-medium">{c.name}</span>
                          <span className="text-sm text-green-600 font-medium">+R$ {parseFloat(c.price).toFixed(2)}</span>
                          <button onClick={() => setPizzaCrusts(pizzaCrusts.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-lg">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input value={crustName} onChange={e => setCrustName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Ex: Borda de Catupiry"
                      onKeyDown={e => { if (e.key === "Enter" && crustName.trim()) { setPizzaCrusts([...pizzaCrusts, { name: crustName.trim(), price: crustPrice || "0" }]); setCrustName(""); setCrustPrice("") } }} />
                    <input type="number" step="0.01" value={crustPrice} onChange={e => setCrustPrice(e.target.value)}
                      className="w-24 px-3 py-2 border rounded-lg text-sm" placeholder="R$ 0,00"
                      onKeyDown={e => { if (e.key === "Enter" && crustName.trim()) { setPizzaCrusts([...pizzaCrusts, { name: crustName.trim(), price: crustPrice || "0" }]); setCrustName(""); setCrustPrice("") } }} />
                    <button onClick={() => { if (crustName.trim()) { setPizzaCrusts([...pizzaCrusts, { name: crustName.trim(), price: crustPrice || "0" }]); setCrustName(""); setCrustPrice("") } }}
                      className="px-3 py-2 text-white rounded-lg font-bold" style={{ backgroundColor: "var(--btn)" }}>+</button>
                  </div>
                </div>
              )}


              {/* Dias disponíveis */}
              <div>
                <label className="block text-sm font-medium mb-2">📅 Dias de funcionamento</label>
                <p className="text-xs text-gray-400 mb-2">Deixe vazio para todos os dias</p>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { v: 0, l: "Dom" }, { v: 1, l: "Seg" }, { v: 2, l: "Ter" },
                    { v: 3, l: "Qua" }, { v: 4, l: "Qui" }, { v: 5, l: "Sex" }, { v: 6, l: "Sáb" },
                  ].map(d => (
                    <button key={d.v} type="button"
                      onClick={() => setAvailableDays(prev => prev.includes(d.v) ? prev.filter(x => x !== d.v) : [...prev, d.v].sort())}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                        availableDays.includes(d.v) ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-300"
                      }`} style={availableDays.includes(d.v) ? { backgroundColor: "var(--primary)" } : {}}>
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Encomenda */}
              <button type="button" onClick={() => setIsEncomenda(!isEncomenda)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition ${
                  isEncomenda ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <div className="text-left">
                    <span className="text-sm font-medium block">Por encomenda</span>
                    <span className="text-xs text-gray-400">Cliente escolhe a data de entrega</span>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full transition flex items-center ${
                  isEncomenda ? "bg-amber-400 justify-end" : "bg-gray-300 justify-start"
                }`}>
                  <div className="w-5 h-5 bg-white rounded-full shadow mx-0.5" />
                </div>
              </button>

              <div className="flex gap-3">
                <button onClick={() => { setShowForm(false); setEditing(null) }} className="flex-1 py-3 border rounded-xl">Cancelar</button>
                <button onClick={save} className="flex-1 py-3 text-white rounded-xl font-bold" style={{ backgroundColor: "var(--btn)" }}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
