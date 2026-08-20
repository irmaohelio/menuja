1|"use client"
2|import { useState, useEffect } from "react"
3|4|
5|export default function CategoriasPage() {
6|  const [categories, setCategories] = useState<any[]>([])
7|  const [catTemplates, setCatTemplates] = useState<Record<string, any[]>>({})
8|  const [showForm, setShowForm] = useState(false)
9|  const [editing, setEditing] = useState<any>(null)
10|  const [name, setName] = useState("")
11|  const [description, setDescription] = useState("")
12|  const [type, setType] = useState("standard")
13|  const [editingExtras, setEditingExtras] = useState<string | null>(null)
14|  const [extraName, setExtraName] = useState("")
15|  const [extraPrice, setExtraPrice] = useState("")
16|
17|  const load = () => {
18|    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.categories) })
19|    // Load extras templates from API
20|    fetch("/api/categories/templates").then(r => r.json()).then(d => {
21|      if (d.success && d.templates) setCatTemplates(d.templates)
22|    })
23|  }
24|  useEffect(() => { load() }, [])
25|
26|  const save = async () => {
27|    if (!name) return
28|    const url = editing ? `/api/categories/${editing.id}` : "/api/categories"
29|    const method = editing ? "PUT" : "POST"
30|    await fetch(url, {
31|      method, headers: { "Content-Type": "application/json" },
32|      body: JSON.stringify({ name, description, type }),
33|    })
34|    setShowForm(false)
35|    setEditing(null)
36|    setName("")
37|    setDescription("")
38|    setType("standard")
39|    load()
40|  }
41|
42|  const deleteCategory = async (id: string) => {
43|    if (!confirm("Excluir categoria? Os produtos dessa categoria ficarão sem categoria.")) return
44|    await fetch(`/api/categories/${id}`, { method: "DELETE" })
45|    load()
46|  }
47|
48|  const toggleActive = async (cat: any) => {
49|    await fetch(`/api/categories/${cat.id}`, {
50|      method: "PUT", headers: { "Content-Type": "application/json" },
51|      body: JSON.stringify({ isActive: !cat.isActive }),
52|    })
53|    load()
54|  }
55|
56|  const startEdit = (c: any) => {
57|    setEditing(c)
58|    setName(c.name)
59|    setDescription(c.description || "")
60|    setType(c.type)
61|    setShowForm(true)
62|  }
63|
64|  const addExtra = (catId: string) => {
65|    if (!extraName.trim()) return
66|    const current = catTemplates[catId] || []
67|    setCatTemplates({ ...catTemplates, [catId]: [...current, { name: extraName.trim(), price: extraPrice || "0" }] })
68|    setExtraName("")
69|    setExtraPrice("")
70|  }
71|
72|  const removeExtra = (catId: string, idx: number) => {
73|    const current = catTemplates[catId] || []
74|    setCatTemplates({ ...catTemplates, [catId]: current.filter((_, i) => i !== idx) })
75|  }
76|
77|  const saveExtras = async (catId: string) => {
78|    const extras = catTemplates[catId] || []
79|    const res = await fetch("/api/categories/templates", {
80|      method: "PUT",
81|      headers: { "Content-Type": "application/json" },
82|      body: JSON.stringify({ categoryId: catId, extras }),
83|    })
84|    const data = await res.json()
85|    if (data.success) {
86|      alert(`Extras sincronizados com ${data.count} produto(s)!`)
87|      setEditingExtras(null)
88|    }
89|  }
90|
91|  const typeLabels: Record<string, string> = {
92|    standard: "📁 Padrão",
93|    pizza: "🍕 Pizza",
94|    advanced: "🔧 Avançado",
    sorvete: "🍦 Sorvete",
95|  }
96|
97|  return (
98|    <div>
99|      <div className="flex items-center justify-between mb-6">
100|        <h1 className="text-2xl font-bold">Categorias</h1>
101|        <button onClick={() => { setEditing(null); setName(""); setDescription(""); setType("standard"); setShowForm(true) }}
102|          className="px-4 py-2 text-white rounded-xl font-medium" style={{ backgroundColor: "var(--btn)" }}>+ Nova categoria</button>
103|      </div>
104|
105|      <div className="space-y-3">
106|        {categories.map(c => (
107|          <div key={c.id} className={`bg-white rounded-xl shadow-sm ${!c.isActive ? "opacity-50" : ""}`}>
108|            {/* Category header */}
109|            <div className="p-4 flex items-center gap-4">
110|              <div className="flex-1">
111|                <p className="font-medium">{c.name}</p>
112|                <div className="flex items-center gap-2 mt-1">
113|                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{typeLabels[c.type] || c.type}</span>
114|                  <span className="text-xs text-gray-400">{c._count?.products || 0} produtos</span>
115|                </div>
116|              </div>
117|              <button onClick={() => toggleActive(c)} className={`w-10 h-6 rounded-full relative transition ${c.isActive ? "bg-green-400" : "bg-gray-300"}`}>
118|                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${c.isActive ? "left-4.5" : "left-0.5"}`} />
119|              </button>
120|              <button onClick={() => startEdit(c)} className="text-gray-400 hover:text-blue-600">✏️</button>
121|              <button onClick={() => deleteCategory(c.id)} className="text-gray-400 hover:text-red-600">🗑️</button>
122|            </div>
123|
124|            {/* Extras section */}
125|            <div className="px-4 pb-4 border-t border-gray-100">
126|              <div className="flex items-center justify-between mt-3 mb-2">
127|                <span className="text-sm font-bold text-gray-600">Extras de {c.name}</span>
128|                <button onClick={() => setEditingExtras(editingExtras === c.id ? null : c.id)}
129|                  className="text-sm font-medium" style={{ color: "var(--primary)" }}>
130|                  {editingExtras === c.id ? "Fechar" : "Editar"}
131|                </button>
132|              </div>
133|
134|              {editingExtras !== c.id && (
135|              <div className="flex flex-wrap gap-1.5">
136|                {(catTemplates[c.id] || []).length === 0 ? (
137|                  <span className="text-xs text-gray-400">Nenhum extra configurado</span>
138|                ) : (
139|                  (catTemplates[c.id] || []).map((e, i) => (
140|                    <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">
141|                      {e.name} {parseFloat(e.price) > 0 ? `+R$ ${parseFloat(e.price).toFixed(2)}` : "grátis"}
142|                    </span>
143|                  ))
144|                )}
145|              </div>
146|              )}
147|
148|              {editingExtras === c.id && (
149|                <div className="mt-2 space-y-2">
150|                  {(catTemplates[c.id] || []).map((e, i) => (
151|                    <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
152|                      <span className="text-sm font-medium">{e.name}</span>
153|                      <div className="flex items-center gap-2">
154|                        <span className="text-sm text-green-600 font-medium">
155|                          {parseFloat(e.price) > 0 ? `+R$ ${parseFloat(e.price).toFixed(2)}` : "grátis"}
156|                        </span>
157|                        <button onClick={() => removeExtra(c.id, i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
158|                      </div>
159|                    </div>
160|                  ))}
161|                  <div className="flex gap-2">
162|                    <input value={extraName} onChange={e => setExtraName(e.target.value)}
163|                      className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Ex: Bacon"
164|                      onKeyDown={e => e.key === "Enter" && addExtra(c.id)} />
165|                    <input type="number" step="0.01" value={extraPrice} onChange={e => setExtraPrice(e.target.value)}
166|                      className="w-24 px-3 py-2 border rounded-lg text-sm" placeholder="R$ 0,00"
167|                      onKeyDown={e => e.key === "Enter" && addExtra(c.id)} />
168|                    <button onClick={() => addExtra(c.id)} className="px-3 py-2 bg-gray-200 rounded-lg text-sm font-medium">+</button>
169|                  </div>
170|                  <button onClick={() => saveExtras(c.id)}
171|                    className="w-full py-2 text-white rounded-lg font-bold text-sm"
172|                    style={{ backgroundColor: "var(--btn)" }}>
173|                    Salvar Extras
174|                  </button>
175|                </div>
176|              )}
177|
178|              {c.name === 'Sorvete' && (
179|                <div className="mt-3 pt-3 border-t border-gray-100">
180|                  <Link href="/admin/sorvete" className="text-sm font-medium" style={{ color: "var(--primary)" }}>
181|                    🍦 Configurar Sabores & Coberturas →
182|                  </Link>
183|                </div>
184|              )}
185|            </div>
186|          </div>
187|        ))}
188|      </div>
189|
190|      {categories.length === 0 && (
191|        <div className="text-center py-20 text-gray-400">
192|          <p className="text-4xl mb-3">📁</p>
193|          <p>Nenhuma categoria cadastrada</p>
194|        </div>
195|      )}
196|
197|      {showForm && (
198|        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
199|          onClick={() => { setShowForm(false); setEditing(null) }}>
200|          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
201|            <h3 className="text-xl font-bold mb-4">{editing ? "Editar" : "Nova"} categoria</h3>
202|            <div className="space-y-4">
203|              <div>
204|                <label className="block text-sm font-medium mb-1">Nome *</label>
205|                <input value={name} onChange={e => setName(e.target.value)}
206|                  className="w-full px-4 py-3 border rounded-xl" placeholder="Ex: Hambúrgueres" />
207|              </div>
208|              <div>
209|                <label className="block text-sm font-medium mb-1">Descrição</label>
210|                <input value={description} onChange={e => setDescription(e.target.value)}
211|                  className="w-full px-4 py-3 border rounded-xl" placeholder="Opcional" />
212|              </div>
213|              <div>
214|                <label className="block text-sm font-medium mb-1">Tipo</label>
215|                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 border rounded-xl">
216|                  <option value="standard">📁 Padrão</option>
217|                  <option value="pizza">🍕 Pizza</option>
218|                  <option value="advanced">🔧 Avançado (com opções)</option>
                  <option value="sorvete">🍦 Sorvete</option>
219|                </select>
220|              </div>
221|              <div className="flex gap-3">
222|                <button onClick={() => { setShowForm(false); setEditing(null) }} className="flex-1 py-3 border rounded-xl">Cancelar</button>
223|                <button onClick={save} className="flex-1 py-3 text-white rounded-xl font-bold" style={{ backgroundColor: "var(--btn)" }}>Salvar</button>
224|              </div>
225|            </div>
226|          </div>
227|        </div>
228|      )}
229|    </div>
230|  )
231|}
232|