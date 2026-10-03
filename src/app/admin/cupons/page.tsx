"use client"
import { useState, useEffect } from "react"

const empty = { id: "", code: "", discountType: "percent", value: "", minOrder: "", maxUses: "", expiresAt: "", isActive: true }

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch("/api/coupons").then((r) => r.json()).then((d) => { if (d.success) setCoupons(d.coupons) })
  }
  useEffect(load, [])

  const save = async () => {
    if (!form.code.trim()) { alert("Informe o código"); return }
    if (!form.value || Number(form.value) <= 0) { alert("Informe o valor do desconto"); return }
    setSaving(true)
    const method = form.id ? "PUT" : "POST"
    const res = await fetch("/api/coupons", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: Number(form.value), minOrder: Number(form.minOrder) || 0 }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) { setForm(empty); load() } else { alert(data.error || "Erro ao salvar") }
  }

  const edit = (c: any) => setForm({
    id: c.id, code: c.code, discountType: c.discountType, value: String(c.value),
    minOrder: String(c.minOrder ?? ""), maxUses: c.maxUses == null ? "" : String(c.maxUses),
    expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "", isActive: c.isActive,
  })

  const remove = async (id: string) => {
    if (!confirm("Excluir este cupom?")) return
    const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" })
    const data = await res.json()
    if (data.success) load(); else alert(data.error || "Erro")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Cupons de desconto</h1>
      <p className="text-sm text-gray-500 mb-6">Crie códigos promocionais para seus clientes usarem no carrinho.</p>

      <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Código</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="EX: PROMO10" className="w-full px-4 py-3 border rounded-xl uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl bg-white">
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{form.discountType === "percent" ? "Desconto (%)" : "Desconto (R$)"}</label>
            <input type="number" min="0" step="0.01" value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full px-4 py-3 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pedido mínimo (R$)</label>
            <input type="number" min="0" step="0.01" value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="w-full px-4 py-3 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Limite de usos (opcional)</label>
            <input type="number" min="1" value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="w-full px-4 py-3 border rounded-xl" placeholder="Ilimitado" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Validade (opcional)</label>
            <input type="date" value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full px-4 py-3 border rounded-xl" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Cupom ativo
        </label>
        <div className="flex gap-2">
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 text-white rounded-xl font-medium disabled:opacity-50" style={{ backgroundColor: "var(--btn)" }}>
            {saving ? "Salvando..." : form.id ? "Atualizar cupom" : "Criar cupom"}
          </button>
          {form.id && (
            <button onClick={() => setForm(empty)} className="px-5 py-2.5 bg-gray-100 rounded-xl font-medium">Cancelar</button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {coupons.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum cupom criado.</p>
        ) : coupons.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold">{c.code} {!c.isActive && <span className="text-xs text-gray-400">(inativo)</span>}</p>
              <p className="text-sm text-gray-500">
                {c.discountType === "percent" ? `${c.value}%` : `R$ ${c.value.toFixed(2)}`} de desconto
                {c.minOrder > 0 && ` • mínimo R$ ${c.minOrder.toFixed(2)}`}
                {c.maxUses != null && ` • ${c.usedCount}/${c.maxUses} usos`}
                {c.expiresAt && ` • até ${new Date(c.expiresAt).toLocaleDateString("pt-BR")}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(c)} className="text-sm text-blue-600 font-medium">Editar</button>
              <button onClick={() => remove(c.id)} className="text-sm text-red-500 font-medium">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
