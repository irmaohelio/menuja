"use client"
import { useState, useEffect } from "react"

type Adicional = { name: string; price: string }
type PizzaSize = { name: string; price: string }
type CategoryTemplate = { [categoryId: string]: Adicional[] }

// Componente de imagem com fallback
function ProductImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [error, setError] = useState(false)
  if (!src || error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center rounded-lg`}>
        <span className="text-2xl text-gray-300">📷</span>
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "", description: "", price: "", promoPrice: "", categoryId: "", isFeatured: false, hasSizes: false, hasExtras: false, image: "",
  })
  const [adicionais, setAdicionais] = useState<Adicional[]>([])
  const [addName, setAddName] = useState("")
  const [addPrice, setAddPrice] = useState("")
  const [editandoAdicional, setEditandoAdicional] = useState<number | null>(null)
  const [editAddName, setEditAddName] = useState("")
  const [editAddPrice, setEditAddPrice] = useState("")
  const [pizzaSizes, setPizzaSizes] = useState<PizzaSize[]>([])
  const [sizeName, setSizeName] = useState("")
  const [sizePrice, setSizePrice] = useState("")

  // Auto-save rascunho no localStorage
  const saveDraft = () => {
    const hasData = form.name || form.description || form.price || form.image || adicionais.length > 0 || pizzaSizes.length > 0
    if (!hasData) return
    const draft = { form, adicionais, pizzaSizes, editing: editing?.id || null }
    try { localStorage.setItem("product_draft", JSON.stringify(draft)) } catch {}
  }

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem("product_draft")
      if (!saved) return false
      const draft = JSON.parse(saved)
      if (draft.form) {
        setForm(prev => ({ ...prev, ...draft.form }))
        if (draft.adicionais?.length) setAdicionais(draft.adicionais)
        if (draft.pizzaSizes?.length) setPizzaSizes(draft.pizzaSizes)
        if (draft.editing) {
          const p = products.find((pr: any) => pr.id === draft.editing)
          if (p) setEditing(p)
        }
        return true
      }
    } catch {}
    return false
  }

  const clearDraft = () => {
    try { localStorage.removeItem("product_draft") } catch {}
  }

  // Templates por categoria
  const [catTemplates, setCatTemplates] = useState<CategoryTemplate>(() => {
    try {
      const saved = localStorage.getItem("cat_extras_templates")
      if (saved) return JSON.parse(saved)
    } catch {}
    return {}
  })

  // Inicializar templates padrão
  useEffect(() => {
    if (categories.length === 0) return
    // Load from API
    fetch("/api/categories/templates").then(r => r.json()).then(d => {
      if (d.success && d.templates) {
        setCatTemplates(prev => {
          const merged = { ...prev, ...d.templates }
          try { localStorage.setItem("cat_extras_templates", JSON.stringify(merged)) } catch {}
          return merged
        })
      }
    })
  }, [categories])

  const load = () => {
    fetch("/api/products").then(r => r.json()).then(d => { if (d.success) setProducts(d.products) })
    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.categories) })
  }
  useEffect(() => { load() }, [])

  const isSorveteCategory = (catId: string) => {
    const cat = categories.find(c => c.id === catId)
    return cat?.type === "sorvete"
  }

  const handleCategoryChange = async (categoryId: string) => {
    setForm(f => ({ ...f, categoryId }))
    
    // Buscar extras da API (banco de dados)
    try {
      const res = await fetch(`/api/categories/templates?categoryId=${categoryId}`)
      const data = await res.json()
      if (data.success && data.extras?.length > 0) {
        setAdicionais(data.extras.map((e: any) => ({ name: e.name, price: String(e.price) })))
        setForm(f => ({ ...f, hasExtras: true }))
        return
      }
    } catch {}
    
    // Fallback: templates locais (localStorage)
    if (catTemplates[categoryId]?.length) {
      setAdicionais([...catTemplates[categoryId]])
    } else {
      setAdicionais([])
    }
  }

  const save = async () => {
    setSaving(true)
    const body: any = {
      ...form,
      price: parseFloat(form.price) || 0,
      promoPrice: form.promoPrice ? parseFloat(form.promoPrice) : null,
      optionGroups: form.hasExtras && adicionais.length > 0 ? [{
        name: "Adicionais", required: false, minQty: 0, maxQty: 20,
        options: adicionais.map(a => ({ name: a.name, price: parseFloat(a.price) || 0, isDefault: false })),
      }] : [],
    }
    delete body.hasSizes
    delete body.hasExtras
    // Only set isPizza if the product was already pizza OR explicitly has pizza-related data
    if (editing) {
      body.isPizza = editing.isPizza
    } else {
      body.isPizza = false // New products are never pizza by default; sizes are universal
    }
    if (form.hasSizes) {
      body.pizzaSizes = pizzaSizes.map(s => ({ name: s.name, price: parseFloat(s.price) || 0 }))
    }
    const url = editing ? `/api/products/${editing.id}` : "/api/products"
    const method = editing ? "PUT" : "POST"
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    clearDraft()
    setShowForm(false)
    setEditing(null)
    resetForm()
    setSaving(false)
    load()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Excluir produto?")) return
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    load()
  }

  const toggleActive = async (product: any) => {
    await fetch(`/api/products/${product.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    })
    load()
  }

  const toggleFeatured = async (product: any) => {
    await fetch(`/api/products/${product.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !product.isFeatured }),
    })
    load()
  }

  const toggleSizeActive = async (product: any, sizeId: string) => {
    const sizes = product.pizzaSizes.map((s: any) =>
      s.id === sizeId ? { ...s, isActive: !s.isActive } : s
    )
    await fetch(`/api/products/${product.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pizzaSizes: sizes }),
    })
    load()
  }

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", promoPrice: "", categoryId: "", isFeatured: false, hasSizes: false, hasExtras: false, image: "" })
    setAdicionais([])
    setPizzaSizes([])
  }

  const startEdit = (p: any) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description || "", price: String(p.price),
      promoPrice: p.promoPrice ? String(p.promoPrice) : "", categoryId: p.categoryId || "",
      isFeatured: p.isFeatured, hasSizes: p.isPizza || (p.pizzaSizes?.length > 0), hasExtras: p.optionGroups?.[0]?.options?.length > 0, image: p.image || "",
    })
    setAdicionais(p.optionGroups?.[0]?.options?.map((o: any) => ({ name: o.name, price: String(o.price) })) || [])
    setPizzaSizes(p.pizzaSizes?.map((s: any) => ({ name: s.name, price: String(s.price) })) || [])
    setShowForm(true)
    setMinimized(false)
  }

  const duplicateProduct = (p: any) => {
    setEditing(null)
    setForm({
      name: p.name + " (cópia)", description: p.description || "", price: String(p.price),
      promoPrice: p.promoPrice ? String(p.promoPrice) : "", categoryId: p.categoryId || "",
      isFeatured: false, hasSizes: p.isPizza || (p.pizzaSizes?.length > 0), hasExtras: p.optionGroups?.[0]?.options?.length > 0, image: p.image || "",
    })
    setAdicionais(p.optionGroups?.[0]?.options?.map((o: any) => ({ name: o.name, price: String(o.price) })) || [])
    setPizzaSizes(p.pizzaSizes?.map((s: any) => ({ name: s.name, price: String(s.price) })) || [])
    setShowForm(true)
    setMinimized(false)
  }

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (data.success) setForm({ ...form, image: data.url })
  }

  const addAdicional = () => {
    if (!addName.trim()) return
    setAdicionais([...adicionais, { name: addName.trim(), price: addPrice || "0" }])
    setAddName("")
    setAddPrice("")
  }
  const removeAdicional = (idx: number) => setAdicionais(adicionais.filter((_, i) => i !== idx))

  const startEditAdicional = (idx: number) => {
    setEditandoAdicional(idx)
    setEditAddName(adicionais[idx].name)
    setEditAddPrice(adicionais[idx].price)
  }

  const saveEditAdicional = () => {
    if (editandoAdicional === null || !editAddName.trim()) return
    const novos = [...adicionais]
    novos[editandoAdicional] = { name: editAddName.trim(), price: editAddPrice || "0" }
    setAdicionais(novos)
    setEditandoAdicional(null)
    setEditAddName("")
    setEditAddPrice("")
  }

  const cancelEditAdicional = () => {
    setEditandoAdicional(null)
    setEditAddName("")
    setEditAddPrice("")
  }

  const saveCategoryTemplate = () => {
    if (!form.categoryId || adicionais.length === 0) return
    const newTemplates = { ...catTemplates, [form.categoryId]: [...adicionais] }
    setCatTemplates(newTemplates)
    try { localStorage.setItem("cat_extras_templates", JSON.stringify(newTemplates)) } catch {}
    alert("Extras salvos como modelo desta categoria!")
  }

  const addPizzaSize = () => {
    if (!sizeName.trim()) return
    setPizzaSizes([...pizzaSizes, { name: sizeName.trim(), price: sizePrice || "0" }])
    setSizeName("")
    setSizePrice("")
  }
  const removePizzaSize = (idx: number) => setPizzaSizes(pizzaSizes.filter((_, i) => i !== idx))
  const [editandoSize, setEditandoSize] = useState<number | null>(null)
  const [editSizeName, setEditSizeName] = useState("")
  const [editSizePrice, setEditSizePrice] = useState("")
  const startEditSize = (idx: number) => {
    setEditandoSize(idx)
    setEditSizeName(pizzaSizes[idx].name)
    setEditSizePrice(pizzaSizes[idx].price)
  }
  const saveEditSize = () => {
    if (editandoSize === null) return
    const updated = [...pizzaSizes]
    updated[editandoSize] = { name: editSizeName.trim(), price: editSizePrice || "0" }
    setPizzaSizes(updated)
    setEditandoSize(null)
  }
  const cancelEditSize = () => setEditandoSize(null)

  // Agrupar produtos por categoria
  const productsByCategory = categories.map(cat => ({
    ...cat,
    products: products.filter(p => p.categoryId === cat.id),
  })).filter(cat => cat.products.length > 0)

  const uncategorized = products.filter(p => !p.categoryId)
  const currentCatTemplate = form.categoryId ? catTemplates[form.categoryId] : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); setMinimized(false); setTimeout(() => { if (!loadDraft()) resetForm() }, 50) }}
          className="px-4 py-2  text-white rounded-xl font-medium  active:scale-95 transition"
          style={{ backgroundColor: "var(--btn)" }}>
          + Novo produto
        </button>
      </div>

      {/* Produtos por categoria */}
      {productsByCategory.map(cat => (
        <div key={cat.id} className="mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            {cat.name}
            <span className="text-sm font-normal text-gray-400">({cat.products.length})</span>
          </h2>
          <div className="space-y-2">
            {cat.products.map((p: any) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={() => startEdit(p)}
                onDuplicate={() => duplicateProduct(p)}
                onDelete={() => deleteProduct(p.id)}
                onToggle={() => toggleActive(p)}
                onFeatured={() => toggleFeatured(p)}
                onToggleSize={(sizeId) => toggleSizeActive(p, sizeId)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Sem categoria */}
      {uncategorized.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-gray-500">Sem categoria</h2>
          <div className="space-y-2">
            {uncategorized.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={() => startEdit(p)}
                onDuplicate={() => duplicateProduct(p)}
                onDelete={() => deleteProduct(p.id)}
                onToggle={() => toggleActive(p)}
                onFeatured={() => toggleFeatured(p)}
                onToggleSize={(sizeId) => toggleSizeActive(p, sizeId)}
              />
            ))}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p>Nenhum produto cadastrado</p>
          <button onClick={() => { setEditing(null); setShowForm(true); setMinimized(false); setTimeout(() => { if (!loadDraft()) resetForm() }, 50) }}
            className="mt-4 px-6 py-2  text-white rounded-xl font-medium"
            style={{ backgroundColor: "var(--btn)" }}>
            Criar primeiro produto
          </button>
        </div>
      )}

      {/* Modal de produto */}
      {showForm && !minimized && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => { saveDraft(); setMinimized(true) }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">{editing ? "Editar" : "Novo"} produto</h3>
            <div className="space-y-4">
              {/* Foto - escondido para sorvete */}
              {!isSorveteCategory(form.categoryId) && (
              <div>
                <label className="block text-sm font-medium mb-1">Foto</label>
                <div className="flex items-center gap-3">
                  {form.image ? (
                    <ProductImage src={form.image} alt="" className="w-20 h-20 object-cover rounded-xl border" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <span className="text-2xl text-gray-400">📷</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border rounded-xl text-sm font-medium text-center transition">
                        {form.image ? "Trocar foto" : "Selecionar foto"}
                      </div>
                      <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                    </label>
                    <span className="text-xs text-gray-500 mt-1 block">tamanho 250x250px</span>
                  </div>
                </div>
              </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl" placeholder={isSorveteCategory(form.categoryId) ? "Ex: 1 Bola" : "Ex: Hambúrguer Clássico"} />
              </div>

              {/* Descrição - escondida para sorvete */}
              {!isSorveteCategory(form.categoryId) && (
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl" rows={2} placeholder="Ingredientes, etc." />
              </div>
              )}

              {/* Checkboxes - Preço por tamanho escondido para sorvete */}
              <div className="flex gap-4">
                {!isSorveteCategory(form.categoryId) && (
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.hasSizes} onChange={e => setForm({...form, hasSizes: e.target.checked})} />
                  <span className="text-sm">📐 Preço por tamanho</span>
                </label>
                )}
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.hasExtras} onChange={async (e) => {
                    const checked = e.target.checked
                    setForm({...form, hasExtras: checked})
                    if (checked && adicionais.length === 0 && form.categoryId) {
                      // Try loading from category template
                      const template = catTemplates[form.categoryId]
                      if (template && template.length > 0) {
                        setAdicionais([...template])
                      } else {
                        // Fetch from API
                        try {
                          const res = await fetch(`/api/categories/templates?categoryId=${form.categoryId}`)
                          const data = await res.json()
                          if (data.success && data.extras?.length > 0) {
                            setAdicionais(data.extras.map((e: any) => ({ name: e.name, price: String(e.price) })))
                          }
                        } catch {}
                      }
                    }
                  }} />
                  <span className="text-sm">➕ Adicionais</span>
                </label>
              </div>

              {/* Preço */}
              {!form.hasSizes && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço *</label>
                    <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                      className="w-full px-4 py-3 border rounded-xl" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço promo</label>
                    <input type="number" step="0.01" value={form.promoPrice} onChange={e => setForm({...form, promoPrice: e.target.value})}
                      className="w-full px-4 py-3 border rounded-xl" placeholder="Opcional" />
                  </div>
                </div>
              )}

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select value={form.categoryId} onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl">
                  <option value="">Selecione</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {!editing && currentCatTemplate && (
                  <p className="text-xs text-green-600 mt-1">✅ Extras da categoria carregados automaticamente</p>
                )}
              </div>

              {/* Tamanhos por preço */}
              {form.hasSizes && (
                <div className="border-t pt-4 space-y-4 bg-orange-50 -mx-2 px-4 py-4 rounded-xl">
                  <h4 className="font-bold text-sm">📐 Tamanhos e Preços</h4>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tamanhos</label>
                    {pizzaSizes.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {pizzaSizes.map((s, i) => (
                          <div key={i}>
                            {editandoSize === i ? (
                              <div className="bg-blue-50 px-3 py-2 rounded-lg space-y-2">
                                <div className="flex gap-2">
                                  <input value={editSizeName} onChange={e => setEditSizeName(e.target.value)}
                                    className="flex-1 px-2 py-1.5 border rounded-lg text-sm" placeholder="Nome"
                                    onKeyDown={e => e.key === "Enter" && saveEditSize()} />
                                  <input type="number" step="0.01" value={editSizePrice} onChange={e => setEditSizePrice(e.target.value)}
                                    className="w-24 px-2 py-1.5 border rounded-lg text-sm" placeholder="R$ 0,00"
                                    onKeyDown={e => e.key === "Enter" && saveEditSize()} />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button onClick={cancelEditSize} className="px-3 py-1 text-xs border rounded-lg">Cancelar</button>
                                  <button onClick={saveEditSize} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg">Salvar</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border">
                                <span className="font-medium text-sm">{s.name.toUpperCase()}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-green-600 font-medium">R$ {parseFloat(s.price).toFixed(2)}</span>
                                  <button onClick={() => startEditSize(i)} className="text-blue-400 hover:text-blue-600 text-sm">✏️</button>
                                  <button onClick={() => removePizzaSize(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input value={sizeName} onChange={e => setSizeName(e.target.value)}
                        className="flex-1 px-3 py-2.5 border rounded-xl text-sm" placeholder="P, M, G..."
                        onKeyDown={e => e.key === "Enter" && addPizzaSize()} />
                      <input type="number" step="0.01" value={sizePrice} onChange={e => setSizePrice(e.target.value)}
                        className="w-24 px-3 py-2.5 border rounded-xl text-sm" placeholder="R$ 0,00"
                        onKeyDown={e => e.key === "Enter" && addPizzaSize()} />
                      <button onClick={addPizzaSize} className="px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-lg">+</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ADICIONAIS */}
              {form.hasExtras && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold">➕ Adicionais</label>
                  {adicionais.length > 0 && form.categoryId && (
                    <button onClick={saveCategoryTemplate} type="button"
                      className="text-xs text-blue-600 underline">Salvar como modelo</button>
                  )}
                </div>
                {adicionais.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {adicionais.map((a, i) => (
                      <div key={i}>
                        {editandoAdicional === i ? (
                          <div className="bg-blue-50 px-3 py-2 rounded-lg space-y-2">
                            <div className="flex gap-2">
                              <input value={editAddName} onChange={e => setEditAddName(e.target.value)}
                                className="flex-1 px-2 py-1.5 border rounded-lg text-sm" placeholder="Nome"
                                onKeyDown={e => e.key === "Enter" && saveEditAdicional()} />
                              <input type="number" step="0.01" value={editAddPrice} onChange={e => setEditAddPrice(e.target.value)}
                                className="w-24 px-2 py-1.5 border rounded-lg text-sm" placeholder="R$ 0,00"
                                onKeyDown={e => e.key === "Enter" && saveEditAdicional()} />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={cancelEditAdicional} className="px-3 py-1 text-xs border rounded-lg">Cancelar</button>
                              <button onClick={saveEditAdicional} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg">Salvar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                            <span className="text-sm font-medium">{a.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-green-600 font-medium">+R$ {parseFloat(a.price).toFixed(2)}</span>
                              <button onClick={() => startEditAdicional(i)} className="text-blue-400 hover:text-blue-600 text-sm">✏️</button>
                              <button onClick={() => removeAdicional(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={addName} onChange={e => setAddName(e.target.value)}
                    className="flex-1 px-3 py-2.5 border rounded-xl text-sm" placeholder="Ex: Bacon"
                    onKeyDown={e => e.key === "Enter" && addAdicional()} />
                  <input type="number" step="0.01" value={addPrice} onChange={e => setAddPrice(e.target.value)}
                    className="w-24 px-3 py-2.5 border rounded-xl text-sm" placeholder="R$ 0,00"
                    onKeyDown={e => e.key === "Enter" && addAdicional()} />
                  <button onClick={addAdicional} className="px-4 py-2.5 text-white rounded-xl font-bold text-lg" style={{ backgroundColor: "var(--btn)" }}>+</button>
                </div>
              </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                <button onClick={() => { clearDraft(); setShowForm(false); setEditing(null); setMinimized(false) }} className="flex-1 py-3 border rounded-xl font-medium">Cancelar</button>
                <button onClick={save} disabled={saving}
                  className="flex-1 py-3  text-white rounded-xl font-bold disabled:opacity-50"
            style={{ backgroundColor: "var(--btn)" }}>
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra minimizada */}
      {showForm && minimized && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white shadow-lg rounded-full px-6 py-3 flex items-center gap-3 border cursor-pointer hover:shadow-xl transition"
          onClick={() => setMinimized(false)}>
          <span className="text-sm font-medium">{editing ? "✏️ Editando" : "➕ Novo produto"}</span>
          <span className="text-gray-400 text-xs">Toque para continuar</span>
          <button onClick={(e) => { e.stopPropagation(); clearDraft(); setShowForm(false); setEditing(null); setMinimized(false) }}
            className="text-red-400 hover:text-red-600 text-sm ml-2">✕</button>
        </div>
      )}
    </div>
  )
}

// Card de produto separado
function ProductCard({ product, onEdit, onDuplicate, onDelete, onToggle, onFeatured, onToggleSize }: {
  product: any; onEdit: () => void; onDuplicate: () => void; onDelete: () => void; onToggle: () => void; onFeatured: () => void; onToggleSize: (sizeId: string) => void
}) {
  const p = product
  const hasSizes = p.pizzaSizes?.length > 0
  return (
    <div className={`bg-white p-3 sm:p-4 rounded-xl shadow-sm transition ${!p.isActive ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <ProductImage src={p.image} alt={p.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm sm:text-base">{p.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {hasSizes ? (
              <span className="text-sm font-medium text-green-700">a partir de R$ {Math.min(...p.pizzaSizes.map((s: any) => s.price)).toFixed(2)}</span>
            ) : p.promoPrice ? (
              <>
                <span className="text-xs line-through text-gray-400">R$ {p.price.toFixed(2)}</span>
                <span className="text-sm font-bold text-green-600">R$ {p.promoPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-sm font-medium text-green-700">R$ {p.price.toFixed(2)}</span>
            )}
            {p.isPizza && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">🍕</span>}
            {!p.isActive && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Indisponível</span>}
            {p.optionGroups?.[0]?.options?.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">+{p.optionGroups[0].options.length}</span>
            )}
          </div>
          {hasSizes && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {p.pizzaSizes.map((size: any) => (
                <button key={size.id} onClick={(e) => { e.stopPropagation(); onToggleSize(size.id) }}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition ${
                    size.isActive !== false
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      : "bg-red-50 text-red-500 border-red-200 line-through hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                  }`}
                  title={size.isActive !== false ? `Indisponibilizar ${size.name}` : `Disponibilizar ${size.name}`}>
                  {size.name} R${size.price.toFixed(2)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button onClick={onToggle}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
          title={p.isActive ? "Clique para indisponibilizar" : "Clique para disponibilizar"}>
          <div className={`w-4 h-4 rounded-full relative transition ${p.isActive ? "bg-green-400" : "bg-red-400"}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition ${p.isActive ? "left-[6px]" : "left-0.5"}`} />
          </div>
          <span className="text-xs">{p.isActive ? "Disponível" : "Indisponível"}</span>
        </button>
        <button onClick={onFeatured}
          className={`p-1 active:scale-90 transition ${p.isFeatured ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
          title={p.isFeatured ? "Destaque ativo - Clique para remover" : "Marcar como destaque"}>
          {p.isFeatured ? "⭐" : "☆"}
        </button>
        <button onClick={onEdit} className="text-gray-400 hover:text-blue-600 p-1 active:scale-90 transition" title="Editar">✏️</button>
        <button onClick={onDuplicate} className="text-gray-400 hover:text-green-600 p-1 active:scale-90 transition hidden sm:block" title="Duplicar">📋</button>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-600 p-1 active:scale-90 transition" title="Excluir">🗑️</button>
        </div>
      </div>
    </div>
  )
}

// Editor de extras por categoria
function CategoryTemplateEditor({ category, extras, onSave }: {
  category: any; extras: Adicional[]; onSave: (extras: Adicional[]) => void
}) {
  const [editing, setEditing] = useState(false)
  const [list, setList] = useState<Adicional[]>([])
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [saving, setSaving] = useState(false)

  const startEdit = () => { setList([...extras]); setEditing(true) }
  const addItem = () => {
    if (!name.trim()) return
    setList([...list, { name: name.trim(), price: price || "0" }])
    setName("")
    setPrice("")
  }
  const removeItem = (idx: number) => setList(list.filter((_, i) => i !== idx))

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/categories/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: category.id, extras: list }),
      })
      const data = await res.json()
      if (data.success) {
        onSave(list)
        alert(`Extras sincronizados com ${data.count} produto(s)!`)
      }
    } catch { alert("Erro ao salvar") }
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-bold text-sm">Extras de {category.name}</span>
          <span className="text-xs text-gray-400 ml-2">({extras.length})</span>
        </div>
        <button onClick={editing ? () => setEditing(false) : startEdit}
          className="text-sm  font-medium">
          {editing ? "Cancelar" : "Editar"}
        </button>
      </div>

      {!editing && extras.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {extras.map((e, i) => (
            <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">
              {e.name} {parseFloat(e.price) > 0 ? `+R$ ${parseFloat(e.price).toFixed(2)}` : "grátis"}
            </span>
          ))}
        </div>
      )}

      {!editing && extras.length === 0 && (
        <p className="text-sm text-gray-400">Nenhum extra configurado</p>
      )}

      {editing && (
        <div className="space-y-3 mt-3">
          {list.map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">
                  {parseFloat(item.price) > 0 ? `+R$ ${parseFloat(item.price).toFixed(2)}` : "grátis"}
                </span>
                <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={name} onChange={e => setName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Ex: Bacon"
              onKeyDown={e => e.key === "Enter" && addItem()} />
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
              className="w-24 px-3 py-2 border rounded-lg text-sm" placeholder="R$ 0,00"
              onKeyDown={e => e.key === "Enter" && addItem()} />
            <button onClick={addItem} className="px-3 py-2 bg-gray-200 rounded-lg text-sm font-medium">+</button>
          </div>
          <button onClick={save} disabled={saving}
            className="w-full py-2.5  text-white rounded-lg font-bold text-sm disabled:opacity-50"
            style={{ backgroundColor: "var(--btn)" }}>
            {saving ? "Salvando..." : "Salvar extras"}
          </button>
        </div>
      )}
    </div>
  )
}
