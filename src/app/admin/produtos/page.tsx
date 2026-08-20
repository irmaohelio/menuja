1|1|"use client"
2|2|import { useState, useEffect } from "react"
3|3|
4|4|type Adicional = { name: string; price: string }
5|5|type PizzaSize = { name: string; price: string }
6|6|type CategoryTemplate = { [categoryId: string]: Adicional[] }
7|7|
8|8|// Componente de imagem com fallback
9|9|function ProductImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
10|10|  const [error, setError] = useState(false)
11|11|  if (!src || error) {
12|12|    return (
13|13|      <div className={`${className} bg-gray-100 flex items-center justify-center rounded-lg`}>
14|14|        <span className="text-2xl text-gray-300">📷</span>
15|15|      </div>
16|16|    )
17|17|  }
18|18|  return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />
19|19|}
20|20|
21|21|export default function ProdutosPage() {
22|22|  const [products, setProducts] = useState<any[]>([])
23|23|  const [categories, setCategories] = useState<any[]>([])
24|24|  const [showForm, setShowForm] = useState(false)
25|25|  const [minimized, setMinimized] = useState(false)
26|26|  const [editing, setEditing] = useState<any>(null)
27|27|  const [saving, setSaving] = useState(false)
28|28|  const [form, setForm] = useState({
29|29|    name: "", description: "", price: "", promoPrice: "", categoryId: "", isFeatured: false, hasSizes: false, hasExtras: false, image: "",
30|30|  })
31|31|  const [adicionais, setAdicionais] = useState<Adicional[]>([])
32|32|  const [addName, setAddName] = useState("")
33|33|  const [addPrice, setAddPrice] = useState("")
34|34|  const [editandoAdicional, setEditandoAdicional] = useState<number | null>(null)
35|35|  const [editAddName, setEditAddName] = useState("")
36|36|  const [editAddPrice, setEditAddPrice] = useState("")
37|37|  const [pizzaSizes, setPizzaSizes] = useState<PizzaSize[]>([])
38|  const [sorveteSabores, setSorveteSabores] = useState<SorveteSabor[]>([])
39|  const [sorveteCoberturas, setSorveteCoberturas] = useState<SorveteCobertura[]>([])
40|  const [saborName, setSaborName] = useState("")
41|  const [saborColor, setSaborColor] = useState("#CCCCCC")
42|  const [coberturaName, setCoberturaName] = useState("")
43|  const [coberturaColor, setCoberturaColor] = useState("#CCCCCC")
44|38|  const [sizeName, setSizeName] = useState("")
45|39|  const [sizePrice, setSizePrice] = useState("")
46|40|
47|41|  // Auto-save rascunho no localStorage
48|42|  const saveDraft = () => {
49|43|    const hasData = form.name || form.description || form.price || form.image || adicionais.length > 0 || pizzaSizes.length > 0
50|44|    if (!hasData) return
51|45|    const draft = { form, adicionais, pizzaSizes, editing: editing?.id || null }
52|46|    try { localStorage.setItem("product_draft", JSON.stringify(draft)) } catch {}
53|47|  }
54|48|
55|49|  const loadDraft = () => {
56|50|    try {
57|51|      const saved = localStorage.getItem("product_draft")
58|52|      if (!saved) return false
59|53|      const draft = JSON.parse(saved)
60|54|      if (draft.form) {
61|55|        setForm(prev => ({ ...prev, ...draft.form }))
62|56|        if (draft.adicionais?.length) setAdicionais(draft.adicionais)
63|57|        if (draft.pizzaSizes?.length) setPizzaSizes(draft.pizzaSizes)
64|58|        if (draft.editing) {
65|59|          const p = products.find((pr: any) => pr.id === draft.editing)
66|60|          if (p) setEditing(p)
67|61|        }
68|62|        return true
69|63|      }
70|64|    } catch {}
71|65|    return false
72|66|  }
73|67|
74|68|  const clearDraft = () => {
75|69|    try { localStorage.removeItem("product_draft") } catch {}
76|70|  }
77|71|
78|72|  // Templates por categoria
79|73|  const [catTemplates, setCatTemplates] = useState<CategoryTemplate>(() => {
80|74|    try {
81|75|      const saved = localStorage.getItem("cat_extras_templates")
82|76|      if (saved) return JSON.parse(saved)
83|77|    } catch {}
84|78|    return {}
85|79|  })
86|80|
87|81|  // Inicializar templates padrão
88|82|  useEffect(() => {
89|83|    if (categories.length === 0) return
90|84|    // Load from API
91|85|    fetch("/api/categories/templates").then(r => r.json()).then(d => {
92|86|      if (d.success && d.templates) {
93|87|        setCatTemplates(prev => {
94|88|          const merged = { ...prev, ...d.templates }
95|89|          try { localStorage.setItem("cat_extras_templates", JSON.stringify(merged)) } catch {}
96|90|          return merged
97|91|        })
98|92|      }
99|93|    })
100|94|  }, [categories])
101|95|
102|96|  const load = () => {
103|97|    fetch("/api/products").then(r => r.json()).then(d => { if (d.success) setProducts(d.products) })
104|98|    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.categories) })
105|99|  }
106|100|  useEffect(() => { load() }, [])
107|101|
108|102|  const handleCategoryChange = async (categoryId: string) => {
109|103|    setForm(f => ({ ...f, categoryId }))
110|104|    
111|105|    // Buscar extras da API (banco de dados)
112|106|    try {
113|107|      const res = await fetch(`/api/categories/templates?categoryId=${categoryId}`)
114|108|      const data = await res.json()
115|109|      if (data.success && data.extras?.length > 0) {
116|110|        setAdicionais(data.extras.map((e: any) => ({ name: e.name, price: String(e.price) })))
117|111|        setForm(f => ({ ...f, hasExtras: true }))
118|112|        return
119|113|      }
120|114|    } catch {}
121|115|    
122|116|    // Fallback: templates locais (localStorage)
123|117|    if (catTemplates[categoryId]?.length) {
124|118|      setAdicionais([...catTemplates[categoryId]])
125|119|    } else {
126|120|      setAdicionais([])
127|121|    }
128|122|  }
129|123|
130|124|  const save = async () => {
131|125|    setSaving(true)
132|126|    const body: any = {
133|127|      ...form,
134|128|      price: parseFloat(form.price) || 0,
135|129|      promoPrice: form.promoPrice ? parseFloat(form.promoPrice) : null,
136|130|      optionGroups: form.hasExtras && adicionais.length > 0 ? [{
137|131|        name: "Adicionais", required: false, minQty: 0, maxQty: 20,
138|132|        options: adicionais.map(a => ({ name: a.name, price: parseFloat(a.price) || 0, isDefault: false })),
139|133|      }] : [],
140|134|    }
141|135|    delete body.hasSizes
142|136|    delete body.hasExtras
143|137|    // Only set isPizza if the product was already pizza OR explicitly has pizza-related data
144|138|    if (editing) {
145|139|      body.isPizza = editing.isPizza
146|140|    } else {
147|141|      body.isPizza = false // New products are never pizza by default; sizes are universal
148|142|    }
149|143|    if (form.hasSizes) {
150|144|      body.pizzaSizes = pizzaSizes.map(s => ({ name: s.name, price: parseFloat(s.price) || 0 }))
151|145|    }
152|146|    const url = editing ? `/api/products/${editing.id}` : "/api/products"
153|147|    const method = editing ? "PUT" : "POST"
154|148|    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
155|149|    clearDraft()
156|150|    setShowForm(false)
157|151|    setEditing(null)
158|152|    resetForm()
159|153|    setSaving(false)
160|154|    load()
161|155|  }
162|156|
163|157|  const deleteProduct = async (id: string) => {
164|158|    if (!confirm("Excluir produto?")) return
165|159|    await fetch(`/api/products/${id}`, { method: "DELETE" })
166|160|    load()
167|161|  }
168|162|
169|163|  const toggleActive = async (product: any) => {
170|164|    await fetch(`/api/products/${product.id}`, {
171|165|      method: "PUT", headers: { "Content-Type": "application/json" },
172|166|      body: JSON.stringify({ isActive: !product.isActive }),
173|167|    })
174|168|    load()
175|169|  }
176|170|
177|171|  const toggleFeatured = async (product: any) => {
178|172|    await fetch(`/api/products/${product.id}`, {
179|173|      method: "PUT", headers: { "Content-Type": "application/json" },
180|174|      body: JSON.stringify({ isFeatured: !product.isFeatured }),
181|175|    })
182|176|    load()
183|177|  }
184|178|
185|179|  const toggleSizeActive = async (product: any, sizeId: string) => {
186|180|    const sizes = product.pizzaSizes.map((s: any) =>
187|181|      s.id === sizeId ? { ...s, isActive: !s.isActive } : s
188|182|    )
189|183|    await fetch(`/api/products/${product.id}`, {
190|184|      method: "PUT", headers: { "Content-Type": "application/json" },
191|185|      body: JSON.stringify({ pizzaSizes: sizes }),
192|186|    })
193|187|    load()
194|188|  }
195|189|
196|190|  const resetForm = () => {
197|191|    setForm({ name: "", description: "", price: "", promoPrice: "", categoryId: "", isFeatured: false, hasSizes: false, hasExtras: false, image: "" })
198|192|    setAdicionais([])
199|193|    setPizzaSizes([])
200|194|  }
201|195|
202|196|  const startEdit = (p: any) => {
203|197|    setEditing(p)
204|198|    setForm({
205|199|      name: p.name, description: p.description || "", price: String(p.price),
206|200|      promoPrice: p.promoPrice ? String(p.promoPrice) : "", categoryId: p.categoryId || "",
207|201|      isFeatured: p.isFeatured, hasSizes: p.isPizza || (p.pizzaSizes?.length > 0), hasExtras: p.optionGroups?.[0]?.options?.length > 0, image: p.image || "",
208|202|    })
209|203|    setAdicionais(p.optionGroups?.[0]?.options?.map((o: any) => ({ name: o.name, price: String(o.price) })) || [])
210|204|    setPizzaSizes(p.pizzaSizes?.map((s: any) => ({ name: s.name, price: String(s.price) })) || [])
211|205|    setShowForm(true)
212|206|    setMinimized(false)
213|207|  }
214|208|
215|209|  const duplicateProduct = (p: any) => {
216|210|    setEditing(null)
217|211|    setForm({
218|212|      name: p.name + " (cópia)", description: p.description || "", price: String(p.price),
219|213|      promoPrice: p.promoPrice ? String(p.promoPrice) : "", categoryId: p.categoryId || "",
220|214|      isFeatured: false, hasSizes: p.isPizza || (p.pizzaSizes?.length > 0), hasExtras: p.optionGroups?.[0]?.options?.length > 0, image: p.image || "",
221|215|    })
222|216|    setAdicionais(p.optionGroups?.[0]?.options?.map((o: any) => ({ name: o.name, price: String(o.price) })) || [])
223|217|    setPizzaSizes(p.pizzaSizes?.map((s: any) => ({ name: s.name, price: String(s.price) })) || [])
224|218|    setShowForm(true)
225|219|    setMinimized(false)
226|220|  }
227|221|
228|222|  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
229|223|    const file = e.target.files?.[0]
230|224|    if (!file) return
231|225|    const fd = new FormData()
232|226|    fd.append("file", file)
233|227|    const res = await fetch("/api/upload", { method: "POST", body: fd })
234|228|    const data = await res.json()
235|229|    if (data.success) setForm({ ...form, image: data.url })
236|230|  }
237|231|
238|232|  const addAdicional = () => {
239|233|    if (!addName.trim()) return
240|234|    setAdicionais([...adicionais, { name: addName.trim(), price: addPrice || "0" }])
241|235|    setAddName("")
242|236|    setAddPrice("")
243|237|  }
244|238|  const removeAdicional = (idx: number) => setAdicionais(adicionais.filter((_, i) => i !== idx))
245|239|
246|240|  const startEditAdicional = (idx: number) => {
247|241|    setEditandoAdicional(idx)
248|242|    setEditAddName(adicionais[idx].name)
249|243|    setEditAddPrice(adicionais[idx].price)
250|244|  }
251|245|
252|246|  const saveEditAdicional = () => {
253|247|    if (editandoAdicional === null || !editAddName.trim()) return
254|248|    const novos = [...adicionais]
255|249|    novos[editandoAdicional] = { name: editAddName.trim(), price: editAddPrice || "0" }
256|250|    setAdicionais(novos)
257|251|    setEditandoAdicional(null)
258|252|    setEditAddName("")
259|253|    setEditAddPrice("")
260|254|  }
261|255|
262|256|  const cancelEditAdicional = () => {
263|257|    setEditandoAdicional(null)
264|258|    setEditAddName("")
265|259|    setEditAddPrice("")
266|260|  }
267|261|
268|262|  const saveCategoryTemplate = () => {
269|263|    if (!form.categoryId || adicionais.length === 0) return
270|264|    const newTemplates = { ...catTemplates, [form.categoryId]: [...adicionais] }
271|265|    setCatTemplates(newTemplates)
272|266|    try { localStorage.setItem("cat_extras_templates", JSON.stringify(newTemplates)) } catch {}
273|267|    alert("Extras salvos como modelo desta categoria!")
274|268|  }
275|269|
276|270|  const addPizzaSize = () => {
277|271|    if (!sizeName.trim()) return
278|272|    setPizzaSizes([...pizzaSizes, { name: sizeName.trim(), price: sizePrice || "0" }])
279|273|    setSizeName("")
280|274|    setSizePrice("")
281|275|  }
282|276|  const removePizzaSize = (idx: number) => setPizzaSizes(pizzaSizes.filter((_, i) => i !== idx))
283|277|  const [editandoSize, setEditandoSize] = useState<number | null>(null)
284|278|  const [editSizeName, setEditSizeName] = useState("")
285|279|  const [editSizePrice, setEditSizePrice] = useState("")
286|280|  const startEditSize = (idx: number) => {
287|281|    setEditandoSize(idx)
288|282|    setEditSizeName(pizzaSizes[idx].name)
289|283|    setEditSizePrice(pizzaSizes[idx].price)
290|284|  }
291|285|  const saveEditSize = () => {
292|286|    if (editandoSize === null) return
293|287|    const updated = [...pizzaSizes]
294|288|    updated[editandoSize] = { name: editSizeName.trim(), price: editSizePrice || "0" }
295|289|    setPizzaSizes(updated)
296|290|    setEditandoSize(null)
297|291|  }
298|292|  const cancelEditSize = () => setEditandoSize(null)
299|293|
300|294|  // Agrupar produtos por categoria
301|295|  const productsByCategory = categories.map(cat => ({
302|296|    ...cat,
303|297|    products: products.filter(p => p.categoryId === cat.id),
304|298|  })).filter(cat => cat.products.length > 0)
305|299|
306|300|  const uncategorized = products.filter(p => !p.categoryId)
307|301|  const currentCatTemplate = form.categoryId ? catTemplates[form.categoryId] : null
308|302|
309|303|  return (
310|304|    <div>
311|305|      <div className="flex items-center justify-between mb-6">
312|306|        <h1 className="text-2xl font-bold">Produtos</h1>
313|307|        <button onClick={() => { setEditing(null); setShowForm(true); setMinimized(false); setTimeout(() => { if (!loadDraft()) resetForm() }, 50) }}
314|308|          className="px-4 py-2  text-white rounded-xl font-medium  active:scale-95 transition"
315|309|          style={{ backgroundColor: "var(--btn)" }}>
316|310|          + Novo produto
317|311|        </button>
318|312|      </div>
319|313|
320|314|      {/* Produtos por categoria */}
321|315|      {productsByCategory.map(cat => (
322|316|        <div key={cat.id} className="mb-6">
323|317|          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
324|318|            {cat.name}
325|319|            <span className="text-sm font-normal text-gray-400">({cat.products.length})</span>
326|320|          </h2>
327|321|          <div className="space-y-2">
328|322|            {cat.products.map((p: any) => (
329|323|              <ProductCard
330|324|                key={p.id}
331|325|                product={p}
332|326|                onEdit={() => startEdit(p)}
333|327|                onDuplicate={() => duplicateProduct(p)}
334|328|                onDelete={() => deleteProduct(p.id)}
335|329|                onToggle={() => toggleActive(p)}
336|330|                onFeatured={() => toggleFeatured(p)}
337|331|                onToggleSize={(sizeId) => toggleSizeActive(p, sizeId)}
338|332|              />
339|333|            ))}
340|334|          </div>
341|335|        </div>
342|336|      ))}
343|337|
344|338|      {/* Sem categoria */}
345|339|      {uncategorized.length > 0 && (
346|340|        <div className="mb-6">
347|341|          <h2 className="text-lg font-bold mb-3 text-gray-500">Sem categoria</h2>
348|342|          <div className="space-y-2">
349|343|            {uncategorized.map(p => (
350|344|              <ProductCard
351|345|                key={p.id}
352|346|                product={p}
353|347|                onEdit={() => startEdit(p)}
354|348|                onDuplicate={() => duplicateProduct(p)}
355|349|                onDelete={() => deleteProduct(p.id)}
356|350|                onToggle={() => toggleActive(p)}
357|351|                onFeatured={() => toggleFeatured(p)}
358|352|                onToggleSize={(sizeId) => toggleSizeActive(p, sizeId)}
359|353|              />
360|354|            ))}
361|355|          </div>
362|356|        </div>
363|357|      )}
364|358|
365|359|      {products.length === 0 && (
366|360|        <div className="text-center py-20 text-gray-400">
367|361|          <p className="text-4xl mb-3">📦</p>
368|362|          <p>Nenhum produto cadastrado</p>
369|363|          <button onClick={() => { setEditing(null); setShowForm(true); setMinimized(false); setTimeout(() => { if (!loadDraft()) resetForm() }, 50) }}
370|364|            className="mt-4 px-6 py-2  text-white rounded-xl font-medium"
371|365|            style={{ backgroundColor: "var(--btn)" }}>
372|366|            Criar primeiro produto
373|367|          </button>
374|368|        </div>
375|369|      )}
376|370|
377|371|      {/* Modal de produto */}
378|372|      {showForm && !minimized && (
379|373|        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
380|374|          onClick={() => { saveDraft(); setMinimized(true) }}>
381|375|          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-6"
382|376|            onClick={e => e.stopPropagation()}>
383|377|            <h3 className="text-xl font-bold mb-4">{editing ? "Editar" : "Novo"} produto</h3>
384|378|            <div className="space-y-4">
385|379|              {/* Foto */}
386|380|              <div>
387|381|                <label className="block text-sm font-medium mb-1">Foto</label>
388|382|                <div className="flex items-center gap-3">
389|383|                  {form.image ? (
390|384|                    <ProductImage src={form.image} alt="" className="w-20 h-20 object-cover rounded-xl border" />
391|385|                  ) : (
392|386|                    <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
393|387|                      <span className="text-2xl text-gray-400">📷</span>
394|388|                    </div>
395|389|                  )}
396|390|                  <div className="flex-1">
397|391|                    <label className="cursor-pointer">
398|392|                      <div className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border rounded-xl text-sm font-medium text-center transition">
399|393|                        {form.image ? "Trocar foto" : "Selecionar foto"}
400|394|                      </div>
401|395|                      <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
402|396|                    </label>
403|397|                    <span className="text-xs text-gray-500 mt-1 block">tamanho 250x250px</span>
404|398|                  </div>
405|399|                </div>
406|400|              </div>
407|401|
408|402|              {/* Nome */}
409|403|              <div>
410|404|                <label className="block text-sm font-medium mb-1">Nome *</label>
411|405|                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
412|406|                  className="w-full px-4 py-3 border rounded-xl" placeholder="Ex: Hambúrguer Clássico" />
413|407|              </div>
414|408|
415|409|              {/* Descrição */}
416|410|              <div>
417|411|                <label className="block text-sm font-medium mb-1">Descrição</label>
418|412|                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
419|413|                  className="w-full px-4 py-3 border rounded-xl" rows={2} placeholder="Ingredientes, etc." />
420|414|              </div>
421|415|
422|416|              {/* Checkboxes */}
423|417|              <div className="flex gap-4">
424|418|                <label className="flex items-center gap-2">
425|419|                  <input type="checkbox" checked={form.hasSizes} onChange={e => setForm({...form, hasSizes: e.target.checked})} />
426|420|                  <span className="text-sm">📐 Preço por tamanho</span>
427|421|                </label>
428|422|                <label className="flex items-center gap-2">
429|423|                  <input type="checkbox" checked={form.hasExtras} onChange={async (e) => {
430|424|                    const checked = e.target.checked
431|425|                    setForm({...form, hasExtras: checked})
432|426|                    if (checked && adicionais.length === 0 && form.categoryId) {
433|427|                      // Try loading from category template
434|428|                      const template = catTemplates[form.categoryId]
435|429|                      if (template && template.length > 0) {
436|430|                        setAdicionais([...template])
437|431|                      } else {
438|432|                        // Fetch from API
439|433|                        try {
440|434|                          const res = await fetch(`/api/categories/templates?categoryId=${form.categoryId}`)
441|435|                          const data = await res.json()
442|436|                          if (data.success && data.extras?.length > 0) {
443|437|                            setAdicionais(data.extras.map((e: any) => ({ name: e.name, price: String(e.price) })))
444|438|                          }
445|439|                        } catch {}
446|440|                      }
447|441|                    }
448|442|                  }} />
449|443|                  <span className="text-sm">➕ Adicionais</span>
450|444|                </label>
451|445|              </div>
452|446|
453|447|              {/* Preço */}
454|448|              {!form.hasSizes && (
455|449|                <div className="grid grid-cols-2 gap-3">
456|450|                  <div>
457|451|                    <label className="block text-sm font-medium mb-1">Preço *</label>
458|452|                    <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
459|453|                      className="w-full px-4 py-3 border rounded-xl" placeholder="0.00" />
460|454|                  </div>
461|455|                  <div>
462|456|                    <label className="block text-sm font-medium mb-1">Preço promo</label>
463|457|                    <input type="number" step="0.01" value={form.promoPrice} onChange={e => setForm({...form, promoPrice: e.target.value})}
464|458|                      className="w-full px-4 py-3 border rounded-xl" placeholder="Opcional" />
465|459|                  </div>
466|460|                </div>
467|461|              )}
468|462|
469|463|              {/* Categoria */}
470|464|              <div>
471|465|                <label className="block text-sm font-medium mb-1">Categoria</label>
472|466|                <select value={form.categoryId} onChange={e => handleCategoryChange(e.target.value)}
473|467|                  className="w-full px-4 py-3 border rounded-xl">
474|468|                  <option value="">Selecione</option>
475|469|                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
476|470|                </select>
477|471|                {!editing && currentCatTemplate && (
478|472|                  <p className="text-xs text-green-600 mt-1">✅ Extras da categoria carregados automaticamente</p>
479|473|                )}
480|474|              </div>
481|475|
482|476|              {/* Tamanhos por preço */}
483|477|              {form.hasSizes && (
484|478|                <div className="border-t pt-4 space-y-4 bg-orange-50 -mx-2 px-4 py-4 rounded-xl">
485|479|                  <h4 className="font-bold text-sm">📐 Tamanhos e Preços</h4>
486|480|                  <div>
487|481|                    <label className="block text-sm font-medium mb-2">Tamanhos</label>
488|482|                    {pizzaSizes.length > 0 && (
489|483|                      <div className="space-y-2 mb-3">
490|484|                        {pizzaSizes.map((s, i) => (
491|485|                          <div key={i}>
492|486|                            {editandoSize === i ? (
493|487|                              <div className="bg-blue-50 px-3 py-2 rounded-lg space-y-2">
494|488|                                <div className="flex gap-2">
495|489|                                  <input value={editSizeName} onChange={e => setEditSizeName(e.target.value)}
496|490|                                    className="flex-1 px-2 py-1.5 border rounded-lg text-sm" placeholder="Nome"
497|491|                                    onKeyDown={e => e.key === "Enter" && saveEditSize()} />
498|492|                                  <input type="number" step="0.01" value={editSizePrice} onChange={e => setEditSizePrice(e.target.value)}
499|493|                                    className="w-24 px-2 py-1.5 border rounded-lg text-sm" placeholder="R$ 0,00"
500|494|                                    onKeyDown={e => e.key === "Enter" && saveEditSize()} />
501|495|                                </div>
502|496|                                <div className="flex gap-2 justify-end">
503|497|                                  <button onClick={cancelEditSize} className="px-3 py-1 text-xs border rounded-lg">Cancelar</button>
504|498|                                  <button onClick={saveEditSize} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg">Salvar</button>
505|499|                                </div>
506|500|                              </div>
507|501|                            ) : (
508|502|                              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border">
509|503|                                <span className="font-medium text-sm">{s.name.toUpperCase()}</span>
510|504|                                <div className="flex items-center gap-2">
511|505|                                  <span className="text-sm text-green-600 font-medium">R$ {parseFloat(s.price).toFixed(2)}</span>
512|506|                                  <button onClick={() => startEditSize(i)} className="text-blue-400 hover:text-blue-600 text-sm">✏️</button>
513|507|                                  <button onClick={() => removePizzaSize(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
514|508|                                </div>
515|509|                              </div>
516|510|                            )}
517|511|                          </div>
518|512|                        ))}
519|513|                      </div>
520|514|                    )}
521|515|                    <div className="flex gap-2">
522|516|                      <input value={sizeName} onChange={e => setSizeName(e.target.value)}
523|517|                        className="flex-1 px-3 py-2.5 border rounded-xl text-sm" placeholder="P, M, G..."
524|518|                        onKeyDown={e => e.key === "Enter" && addPizzaSize()} />
525|519|                      <input type="number" step="0.01" value={sizePrice} onChange={e => setSizePrice(e.target.value)}
526|520|                        className="w-24 px-3 py-2.5 border rounded-xl text-sm" placeholder="R$ 0,00"
527|521|                        onKeyDown={e => e.key === "Enter" && addPizzaSize()} />
528|522|                      <button onClick={addPizzaSize} className="px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-lg">+</button>
529|523|                    </div>
530|524|                  </div>
531|525|                </div>
532|526|              )}
533|527|
534|528|              {/* ADICIONAIS */}
535|529|              {form.hasExtras && (
536|530|              <div className="border-t pt-4">
537|531|                <div className="flex items-center justify-between mb-3">
538|532|                  <label className="text-sm font-bold">➕ Adicionais</label>
539|533|                  {adicionais.length > 0 && form.categoryId && (
540|534|                    <button onClick={saveCategoryTemplate} type="button"
541|535|                      className="text-xs text-blue-600 underline">Salvar como modelo</button>
542|536|                  )}
543|537|                </div>
544|538|                {adicionais.length > 0 && (
545|539|                  <div className="space-y-2 mb-3">
546|540|                    {adicionais.map((a, i) => (
547|541|                      <div key={i}>
548|542|                        {editandoAdicional === i ? (
549|543|                          <div className="bg-blue-50 px-3 py-2 rounded-lg space-y-2">
550|544|                            <div className="flex gap-2">
551|545|                              <input value={editAddName} onChange={e => setEditAddName(e.target.value)}
552|546|                                className="flex-1 px-2 py-1.5 border rounded-lg text-sm" placeholder="Nome"
553|547|                                onKeyDown={e => e.key === "Enter" && saveEditAdicional()} />
554|548|                              <input type="number" step="0.01" value={editAddPrice} onChange={e => setEditAddPrice(e.target.value)}
555|549|                                className="w-24 px-2 py-1.5 border rounded-lg text-sm" placeholder="R$ 0,00"
556|550|                                onKeyDown={e => e.key === "Enter" && saveEditAdicional()} />
557|551|                            </div>
558|552|                            <div className="flex gap-2 justify-end">
559|553|                              <button onClick={cancelEditAdicional} className="px-3 py-1 text-xs border rounded-lg">Cancelar</button>
560|554|                              <button onClick={saveEditAdicional} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg">Salvar</button>
561|555|                            </div>
562|556|                          </div>
563|557|                        ) : (
564|558|                          <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
565|559|                            <span className="text-sm font-medium">{a.name}</span>
566|560|                            <div className="flex items-center gap-2">
567|561|                              <span className="text-sm text-green-600 font-medium">+R$ {parseFloat(a.price).toFixed(2)}</span>
568|562|                              <button onClick={() => startEditAdicional(i)} className="text-blue-400 hover:text-blue-600 text-sm">✏️</button>
569|563|                              <button onClick={() => removeAdicional(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
570|564|                            </div>
571|565|                          </div>
572|566|                        )}
573|567|                      </div>
574|568|                    ))}
575|569|                  </div>
576|570|                )}
577|571|                <div className="flex gap-2">
578|572|                  <input value={addName} onChange={e => setAddName(e.target.value)}
579|573|                    className="flex-1 px-3 py-2.5 border rounded-xl text-sm" placeholder="Ex: Bacon"
580|574|                    onKeyDown={e => e.key === "Enter" && addAdicional()} />
581|575|                  <input type="number" step="0.01" value={addPrice} onChange={e => setAddPrice(e.target.value)}
582|576|                    className="w-24 px-3 py-2.5 border rounded-xl text-sm" placeholder="R$ 0,00"
583|577|                    onKeyDown={e => e.key === "Enter" && addAdicional()} />
584|578|                  <button onClick={addAdicional} className="px-4 py-2.5 text-white rounded-xl font-bold text-lg" style={{ backgroundColor: "var(--btn)" }}>+</button>
585|579|                </div>
586|580|              </div>
587|581|              )}
588|582|
589|583|              {/* Botões */}
590|584|              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
591|585|                <button onClick={() => { clearDraft(); setShowForm(false); setEditing(null); setMinimized(false) }} className="flex-1 py-3 border rounded-xl font-medium">Cancelar</button>
592|586|                <button onClick={save} disabled={saving}
593|587|                  className="flex-1 py-3  text-white rounded-xl font-bold disabled:opacity-50"
594|588|            style={{ backgroundColor: "var(--btn)" }}>
595|589|                  {saving ? "Salvando..." : "Salvar"}
596|590|                </button>
597|591|              </div>
598|592|            </div>
599|593|          </div>
600|594|        </div>
601|595|      )}
602|596|
603|597|      {/* Barra minimizada */}
604|598|      {showForm && minimized && (
605|599|        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white shadow-lg rounded-full px-6 py-3 flex items-center gap-3 border cursor-pointer hover:shadow-xl transition"
606|600|          onClick={() => setMinimized(false)}>
607|601|          <span className="text-sm font-medium">{editing ? "✏️ Editando" : "➕ Novo produto"}</span>
608|602|          <span className="text-gray-400 text-xs">Toque para continuar</span>
609|603|          <button onClick={(e) => { e.stopPropagation(); clearDraft(); setShowForm(false); setEditing(null); setMinimized(false) }}
610|604|            className="text-red-400 hover:text-red-600 text-sm ml-2">✕</button>
611|605|        </div>
612|606|      )}
613|607|    </div>
614|608|  )
615|609|}
616|610|
617|611|// Card de produto separado
618|612|function ProductCard({ product, onEdit, onDuplicate, onDelete, onToggle, onFeatured, onToggleSize }: {
619|613|  product: any; onEdit: () => void; onDuplicate: () => void; onDelete: () => void; onToggle: () => void; onFeatured: () => void; onToggleSize: (sizeId: string) => void
620|614|}) {
621|615|  const p = product
622|616|  const hasSizes = p.pizzaSizes?.length > 0
623|617|  return (
624|618|    <div className={`bg-white p-3 sm:p-4 rounded-xl shadow-sm transition ${!p.isActive ? "opacity-50" : ""}`}>
625|619|      <div className="flex items-center gap-3 sm:gap-4">
626|620|        <ProductImage src={p.image} alt={p.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0" />
627|621|        <div className="flex-1 min-w-0">
628|622|          <p className="font-medium truncate text-sm sm:text-base">{p.name}</p>
629|623|          <div className="flex items-center gap-2 mt-1 flex-wrap">
630|624|            {hasSizes ? (
631|625|              <span className="text-sm font-medium text-green-700">a partir de R$ {Math.min(...p.pizzaSizes.map((s: any) => s.price)).toFixed(2)}</span>
632|626|            ) : p.promoPrice ? (
633|627|              <>
634|628|                <span className="text-xs line-through text-gray-400">R$ {p.price.toFixed(2)}</span>
635|629|                <span className="text-sm font-bold text-green-600">R$ {p.promoPrice.toFixed(2)}</span>
636|630|              </>
637|631|            ) : (
638|632|              <span className="text-sm font-medium text-green-700">R$ {p.price.toFixed(2)}</span>
639|633|            )}
640|634|            {p.isPizza && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">🍕</span>}
641|635|            {!p.isActive && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Indisponível</span>}
642|636|            {p.optionGroups?.[0]?.options?.length > 0 && (
643|637|              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">+{p.optionGroups[0].options.length}</span>
644|638|            )}
645|639|          </div>
646|640|          {hasSizes && (
647|641|            <div className="flex flex-wrap gap-1.5 mt-2">
648|642|              {p.pizzaSizes.map((size: any) => (
649|643|                <button key={size.id} onClick={(e) => { e.stopPropagation(); onToggleSize(size.id) }}
650|644|                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition ${
651|645|                    size.isActive !== false
652|646|                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
653|647|                      : "bg-red-50 text-red-500 border-red-200 line-through hover:bg-green-50 hover:text-green-600 hover:border-green-200"
654|648|                  }`}
655|649|                  title={size.isActive !== false ? `Indisponibilizar ${size.name}` : `Disponibilizar ${size.name}`}>
656|650|                  {size.name} R${size.price.toFixed(2)}
657|651|                </button>
658|652|              ))}
659|653|            </div>
660|654|          )}
661|655|        </div>
662|656|        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
663|657|        <button onClick={onToggle}
664|658|          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
665|659|          title={p.isActive ? "Clique para indisponibilizar" : "Clique para disponibilizar"}>
666|660|          <div className={`w-4 h-4 rounded-full relative transition ${p.isActive ? "bg-green-400" : "bg-red-400"}`}>
667|661|            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition ${p.isActive ? "left-[6px]" : "left-0.5"}`} />
668|662|          </div>
669|663|          <span className="text-xs">{p.isActive ? "Disponível" : "Indisponível"}</span>
670|664|        </button>
671|665|        <button onClick={onFeatured}
672|666|          className={`p-1 active:scale-90 transition ${p.isFeatured ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
673|667|          title={p.isFeatured ? "Destaque ativo - Clique para remover" : "Marcar como destaque"}>
674|668|          {p.isFeatured ? "⭐" : "☆"}
675|669|        </button>
676|670|        <button onClick={onEdit} className="text-gray-400 hover:text-blue-600 p-1 active:scale-90 transition" title="Editar">✏️</button>
677|671|        <button onClick={onDuplicate} className="text-gray-400 hover:text-green-600 p-1 active:scale-90 transition hidden sm:block" title="Duplicar">📋</button>
678|672|        <button onClick={onDelete} className="text-gray-400 hover:text-red-600 p-1 active:scale-90 transition" title="Excluir">🗑️</button>
679|673|        </div>
680|674|      </div>
681|675|    </div>
682|676|  )
683|677|}
684|678|
685|679|// Editor de extras por categoria
686|680|function CategoryTemplateEditor({ category, extras, onSave }: {
687|681|  category: any; extras: Adicional[]; onSave: (extras: Adicional[]) => void
688|682|}) {
689|683|  const [editing, setEditing] = useState(false)
690|684|  const [list, setList] = useState<Adicional[]>([])
691|685|  const [name, setName] = useState("")
692|686|  const [price, setPrice] = useState("")
693|687|  const [saving, setSaving] = useState(false)
694|688|
695|689|  const startEdit = () => { setList([...extras]); setEditing(true) }
696|690|  const addItem = () => {
697|691|    if (!name.trim()) return
698|692|    setList([...list, { name: name.trim(), price: price || "0" }])
699|693|    setName("")
700|694|    setPrice("")
701|695|  }
702|696|  const removeItem = (idx: number) => setList(list.filter((_, i) => i !== idx))
703|697|
704|698|  const save = async () => {
705|699|    setSaving(true)
706|700|    try {
707|701|      const res = await fetch("/api/categories/templates", {
708|702|        method: "PUT",
709|703|        headers: { "Content-Type": "application/json" },
710|704|        body: JSON.stringify({ categoryId: category.id, extras: list }),
711|705|      })
712|706|      const data = await res.json()
713|707|      if (data.success) {
714|708|        onSave(list)
715|709|        alert(`Extras sincronizados com ${data.count} produto(s)!`)
716|710|      }
717|711|    } catch { alert("Erro ao salvar") }
718|712|    setSaving(false)
719|713|    setEditing(false)
720|714|  }
721|715|
722|716|  return (
723|717|    <div className="mt-3">
724|718|      <div className="flex items-center justify-between mb-2">
725|719|        <div>
726|720|          <span className="font-bold text-sm">Extras de {category.name}</span>
727|721|          <span className="text-xs text-gray-400 ml-2">({extras.length})</span>
728|722|        </div>
729|723|        <button onClick={editing ? () => setEditing(false) : startEdit}
730|724|          className="text-sm  font-medium">
731|725|          {editing ? "Cancelar" : "Editar"}
732|726|        </button>
733|727|      </div>
734|728|
735|729|      {!editing && extras.length > 0 && (
736|730|        <div className="flex flex-wrap gap-1.5">
737|731|          {extras.map((e, i) => (
738|732|            <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">
739|733|              {e.name} {parseFloat(e.price) > 0 ? `+R$ ${parseFloat(e.price).toFixed(2)}` : "grátis"}
740|734|            </span>
741|735|          ))}
742|736|        </div>
743|737|      )}
744|738|
745|739|      {!editing && extras.length === 0 && (
746|740|        <p className="text-sm text-gray-400">Nenhum extra configurado</p>
747|741|      )}
748|742|
749|743|      {editing && (
750|744|        <div className="space-y-3 mt-3">
751|745|          {list.map((item, i) => (
752|746|            <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
753|747|              <span className="text-sm font-medium">{item.name}</span>
754|748|              <div className="flex items-center gap-2">
755|749|                <span className="text-sm text-green-600 font-medium">
756|750|                  {parseFloat(item.price) > 0 ? `+R$ ${parseFloat(item.price).toFixed(2)}` : "grátis"}
757|751|                </span>
758|752|                <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
759|753|              </div>
760|754|            </div>
761|755|          ))}
762|756|          <div className="flex gap-2">
763|757|            <input value={name} onChange={e => setName(e.target.value)}
764|758|              className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Ex: Bacon"
765|759|              onKeyDown={e => e.key === "Enter" && addItem()} />
766|760|            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
767|761|              className="w-24 px-3 py-2 border rounded-lg text-sm" placeholder="R$ 0,00"
768|762|              onKeyDown={e => e.key === "Enter" && addItem()} />
769|763|            <button onClick={addItem} className="px-3 py-2 bg-gray-200 rounded-lg text-sm font-medium">+</button>
770|764|          </div>
771|765|          <button onClick={save} disabled={saving}
772|766|            className="w-full py-2.5  text-white rounded-lg font-bold text-sm disabled:opacity-50"
773|767|            style={{ backgroundColor: "var(--btn)" }}>
774|768|            {saving ? "Salvando..." : "Salvar extras"}
775|769|          </button>
776|770|        </div>
777|771|      )}
778|772|    </div>
779|773|  )
780|774|}
781|775|