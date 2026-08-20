'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Item {
  name: string
  color?: string
  price?: number
}

interface SorveteConfig {
  sabores: Item[]
  coberturas: Item[]
  extras: Item[]
}

const DEFAULT_CONFIG: SorveteConfig = {
  sabores: [
    { name: 'Chocolate', color: '#5C3317' },
    { name: 'Morango', color: '#FF6B6B' },
    { name: 'Creme', color: '#FFFDD0' },
    { name: 'Pistache', color: '#93C572' },
    { name: 'Napolitano', color: '#FFB6C1' },
  ],
  coberturas: [
    { name: 'Calda de Groselha', color: '#8B0000' },
    { name: 'Calda de Morango', color: '#FF1493' },
    { name: 'Calda de Chocolate', color: '#3E2723' },
  ],
  extras: [
    { name: 'Granola', price: 3 },
    { name: 'Leite Condensado', price: 3 },
    { name: 'Chocolate Granulado', price: 4 },
    { name: 'Amendoim', price: 3 },
    { name: 'Banana', price: 2 },
  ],
}

export default function SorvetePage() {
  const router = useRouter()
  const [config, setConfig] = useState<SorveteConfig>(DEFAULT_CONFIG)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('unauthorized'); return r.json() })
      .then(data => {
        if (data.store) {
          setStoreId(data.store.id)
          if (data.store.sorveteConfig) {
            setConfig(data.store.sorveteConfig)
          }
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  const save = async () => {
    if (!storeId) return
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/sorvete-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, config }),
      })
      if (res.ok) {
        setMsg('✅ Salvo com sucesso!')
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) {
      setMsg('❌ Erro ao salvar')
    }
    setSaving(false)
  }

  // Sabores
  const addSabor = () => {
    setConfig({ ...config, sabores: [...config.sabores, { name: 'Novo Sabor', color: '#CCCCCC' }] })
  }
  const updateSabor = (i: number, field: string, value: string) => {
    const sabores = [...config.sabores]
    sabores[i] = { ...sabores[i], [field]: value }
    setConfig({ ...config, sabores })
  }
  const removeSabor = (i: number) => {
    setConfig({ ...config, sabores: config.sabores.filter((_, idx) => idx !== i) })
  }

  // Coberturas
  const addCobertura = () => {
    setConfig({ ...config, coberturas: [...config.coberturas, { name: 'Nova Cobertura', color: '#CCCCCC' }] })
  }
  const updateCobertura = (i: number, field: string, value: string) => {
    const coberturas = [...config.coberturas]
    coberturas[i] = { ...coberturas[i], [field]: value }
    setConfig({ ...config, coberturas })
  }
  const removeCobertura = (i: number) => {
    setConfig({ ...config, coberturas: config.coberturas.filter((_, idx) => idx !== i) })
  }

  // Extras
  const addExtra = () => {
    setConfig({ ...config, extras: [...config.extras, { name: 'Novo Extra', price: 0 }] })
  }
  const updateExtra = (i: number, field: string, value: string | number) => {
    const extras = [...config.extras]
    extras[i] = { ...extras[i], [field]: value }
    setConfig({ ...config, extras })
  }
  const removeExtra = (i: number) => {
    setConfig({ ...config, extras: config.extras.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold">🍦 Configurar Sorvete</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {msg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm">
            {msg}
          </div>
        )}

        {/* Sabores */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">🍫 Sabores</h2>
            <button onClick={addSabor} className="text-sm font-medium px-3 py-1 rounded-full bg-pink-50 text-pink-600">
              + Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {config.sabores.map((sabor, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded-xl">
                <input type="color" value={sabor.color || '#CCCCCC'}
                  onChange={e => updateSabor(i, 'color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer" />
                <input value={sabor.name}
                  onChange={e => updateSabor(i, 'name', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm" />
                <button onClick={() => removeSabor(i)} className="text-red-400 text-sm">🗑️</button>
              </div>
            ))}
          </div>
        </div>

        {/* Coberturas */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">🍫 Coberturas</h2>
            <button onClick={addCobertura} className="text-sm font-medium px-3 py-1 rounded-full bg-pink-50 text-pink-600">
              + Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {config.coberturas.map((cob, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded-xl">
                <input type="color" value={cob.color || '#CCCCCC'}
                  onChange={e => updateCobertura(i, 'color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer" />
                <input value={cob.name}
                  onChange={e => updateCobertura(i, 'name', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm" />
                <button onClick={() => removeCobertura(i)} className="text-red-400 text-sm">🗑️</button>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 rounded-xl font-bold text-white bg-pink-600 hover:bg-pink-700 transition"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  )
}
