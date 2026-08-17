"use client"
import { useState, useEffect } from "react"

export default function CategoriasPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("standard")

  const load = () => {
    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.categories) })
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!name) return
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories"
    const method = editing ? "PUT" : "POST"
    await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, type }),
    })
    setShowForm(false)
    setEditing(null)
    setName("")
    setDescription("")
    setType("standard")
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
    setShowForm(true)
  }

  const typeLabels: Record<string, string> = {
    standard: "📁 Padrão",
    pizza: "🍕 Pizza",
    advanced: "🔧 Avançado",
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <button onClick={() => { setEditing(null); setName(""); setDescription(""); setType("standard"); setShowForm(true) }}
          className="px-4 py-2 text-white rounded-xl font-medium" style={{ backgroundColor: "var(--btn)" }}>+ Nova categoria</button>
      </div>

      <div className="space-y-3">
        {categories.map(c => (
          <div key={c.id} className={`bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 ${!c.isActive ? "opacity-50" : ""}`}>
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{typeLabels[c.type] || c.type}</span>
                <span className="text-xs text-gray-400">{c._count?.products || 0} produtos</span>
              </div>
            </div>
            <button onClick={() => toggleActive(c)} className={`w-10 h-6 rounded-full relative transition ${c.isActive ? "bg-green-400" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${c.isActive ? "left-4.5" : "left-0.5"}`} />
            </button>
            <button onClick={() => startEdit(c)} className="text-gray-400 hover:text-blue-600">✏️</button>
            <button onClick={() => deleteCategory(c.id)} className="text-gray-400 hover:text-red-600">🗑️</button>
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
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
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
                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 border rounded-xl">
                  <option value="standard">📁 Padrão</option>
                  <option value="pizza">🍕 Pizza</option>
                  <option value="advanced">🔧 Avançado (com opções)</option>
                </select>
              </div>
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
