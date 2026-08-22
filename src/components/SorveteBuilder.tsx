'use client'
import { useState } from 'react'

interface SorveteBuilderProps {
  store: any
  onAdd: (item: any) => void
  onClose: () => void
}

// Colors for scoops when product has no image
const FLAVOR_COLORS: Record<string, string> = {
  'chocolate': '#5C3317',
  'chocolate branco': '#FFF8E7',
  'morango': '#FF6B6B',
  'creme': '#FFFDD0',
  'pistache': '#93C572',
  'napolitano': '#FFB6C1',
  'baunilha': '#F3E5AB',
  'flocos': '#FFE4B5',
  'misto': '#DDA0DD',
}

function getFlavorColor(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, color] of Object.entries(FLAVOR_COLORS)) {
    if (lower.includes(key)) return color
  }
  // Generate a color from the name hash
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 60%, 65%)`
}

export default function SorveteBuilder({ store, onAdd, onClose }: SorveteBuilderProps) {
  const [scoops, setScoops] = useState<Record<string, number>>({})
  const [cobertura, setCobertura] = useState<string | null>(null)
  const [extras, setExtras] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')

  // Get sabores from products in the Sorvete category
  const sorveteCategory = store.categories?.find((c: any) => c.type === 'sorvete')
  const sabores = (sorveteCategory?.products || []).map((p: any) => ({
    name: p.name,
    price: p.price,
    color: getFlavorColor(p.name),
    image: p.image,
  }))

  // Get coberturas and extras from sorveteConfig
  const sorveteConfig = store.sorveteConfig || {}
  const coberturas = sorveteConfig.coberturas || [
    { name: 'Calda de Groselha', color: '#8B0000' },
    { name: 'Calda de Morango', color: '#FF1493' },
    { name: 'Calda de Chocolate', color: '#3E2723' },
  ]
  const extrasList = sorveteConfig.extras || [
    { name: 'Granola', price: 3 },
    { name: 'Leite Condensado', price: 3 },
    { name: 'Chocolate Granulado', price: 4 },
    { name: 'Amendoim', price: 3 },
    { name: 'Banana', price: 2 },
  ]

  const totalScoops = Object.values(scoops).reduce((sum, qty) => sum + qty, 0)
  const scoopsPrice = Object.entries(scoops).reduce((sum, [name, qty]) => {
    const sabor = sabores.find((s: any) => s.name === name)
    return sum + (sabor ? sabor.price * qty : 0)
  }, 0)
  const extrasPrice = Object.entries(extras).reduce((sum, [name, qty]) => {
    const extra = extrasList.find((e: any) => e.name === name)
    return sum + (extra ? extra.price * qty : 0)
  }, 0)
  const totalPrice = scoopsPrice + extrasPrice

  const addScoop = (flavor: string) => {
    setScoops(prev => ({
      ...prev,
      [flavor]: (prev[flavor] || 0) + 1
    }))
  }

  const removeScoop = (flavor: string) => {
    setScoops(prev => {
      const newScoops = { ...prev }
      if (newScoops[flavor] > 1) {
        newScoops[flavor]--
      } else {
        delete newScoops[flavor]
      }
      return newScoops
    })
  }

  const toggleExtra = (extra: string) => {
    setExtras(prev => {
      const newExtras = { ...prev }
      if (newExtras[extra]) {
        delete newExtras[extra]
      } else {
        newExtras[extra] = 1
      }
      return newExtras
    })
  }

  const handleAdd = () => {
    if (totalScoops === 0) return

    const scoopsList = Object.entries(scoops)
      .map(([name, qty]) => `${qty}x ${name}`)
      .join(', ')

    const extrasListStr = Object.entries(extras)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => `${qty}x ${name}`)
      .join(', ')

    const description = [
      `${totalScoops} bola${totalScoops > 1 ? 's' : ''}: ${scoopsList}`,
      cobertura && `Cobertura: ${cobertura}`,
      extrasListStr && `Extras: ${extrasListStr}`,
    ].filter(Boolean).join(' | ')

    onAdd({
      productId: 'sorvete-custom',
      productName: `Sorvete ${totalScoops} Bola${totalScoops > 1 ? 's' : ''}`,
      unitPrice: totalPrice,
      quantity: 1,
      notes: description + (notes ? ` | Obs: ${notes}` : ''),
      options: [
        ...Object.entries(scoops).map(([name, qty]) => ({
          name: `Sabor: ${name}`,
          price: sabores.find((s: any) => s.name === name)?.price || 0,
          quantity: qty,
        })),
        ...(cobertura ? [{ name: `Cobertura: ${cobertura}`, price: 0, quantity: 1 }] : []),
        ...Object.entries(extras).filter(([_, qty]) => qty > 0).map(([name, qty]) => ({
          name: `Extra: ${name}`,
          price: extrasList.find((e: any) => e.name === name)?.price || 0,
          quantity: qty,
        })),
      ],
    })
  }

  // Generate scoop positions for the pot visualization
  const getScoopPositions = () => {
    const positions: { flavor: string; color: string; x: number; y: number }[] = []
    let index = 0
    
    Object.entries(scoops).forEach(([flavor, qty]) => {
      const flavorData = sabores.find((s: any) => s.name === flavor)
      if (!flavorData) return
      
      for (let i = 0; i < qty; i++) {
        const row = Math.floor(index / 2)
        const col = index % 2
        positions.push({
          flavor,
          color: flavorData.color,
          x: 30 + col * 40,
          y: 60 - row * 25
        })
        index++
      }
    })
    
    return positions
  }

  const scoopPositions = getScoopPositions()

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">🍦 Monte seu Sorvete</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>

          {/* Resumo do Pedido */}
          <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wide">📋 Seu Pedido</h4>

            {totalScoops === 0 && !cobertura && Object.keys(extras).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Escolha os sabores abaixo para montar seu sorvete</p>
            ) : (
              <div className="space-y-2">
                {/* Sabores */}
                {Object.entries(scoops).filter(([_, qty]) => qty > 0).map(([name, qty]) => {
                  const sabor = sabores.find((s: any) => s.name === name)
                  return (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sabor?.color || '#ccc' }} />
                        <span className="font-medium">{qty}x {name}</span>
                      </div>
                      <span className="text-gray-500">R$ {((sabor?.price || 0) * qty).toFixed(2)}</span>
                    </div>
                  )
                })}

                {/* Cobertura */}
                {cobertura && (
                  <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span>🍫</span>
                      <span className="font-medium">{cobertura}</span>
                    </div>
                    <span className="text-gray-500">incluso</span>
                  </div>
                )}

                {/* Extras */}
                {Object.entries(extras).filter(([_, qty]) => qty > 0).map(([name, qty]) => {
                  const extra = extrasList.find((e: any) => e.name === name)
                  return (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>✨</span>
                        <span className="font-medium">{qty}x {name}</span>
                      </div>
                      <span className="text-gray-500">R$ {((extra?.price || 0) * qty).toFixed(2)}</span>
                    </div>
                  )
                })}

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg" style={{ color: store.primaryColor }}>R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sabores - from products in Sorvete category */}
          <div className="mb-6">
            <h4 className="font-bold text-base mb-3">🍫 Sabores</h4>
            {sabores.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum sabor cadastrado. Adicione produtos na categoria Sorvete.</p>
            ) : (
              <div className="space-y-2">
                {sabores.map((sabor: any) => (
                  <div key={sabor.name} className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: sabor.color }}/>
                      <span className="font-medium">{sabor.name}</span>
                      <span className="text-xs text-gray-400">R$ {sabor.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeScoop(sabor.name)}
                        disabled={!scoops[sabor.name]}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold">{scoops[sabor.name] || 0}</span>
                      <button
                        onClick={() => addScoop(sabor.name)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: store.primaryColor }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cobertura */}
          <div className="mb-6 border-t pt-4">
            <h4 className="font-bold text-base mb-3">🍫 Cobertura (1 por pote)</h4>
            <div className="space-y-2">
              {coberturas.map((cob: any) => (
                <button
                  key={cob.name}
                  onClick={() => setCobertura(cobertura === cob.name ? null : cob.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                    cobertura === cob.name ? 'border-gray-400 bg-gray-50' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    cobertura === cob.name ? 'border-gray-400' : 'border-gray-300'
                  }`}>
                    {cobertura === cob.name && <span className="text-xs">✓</span>}
                  </div>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cob.color }}/>
                  <span className="font-medium">{cob.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div className="mb-6 border-t pt-4">
            <h4 className="font-bold text-base mb-3">✨ Extras (cobrado por cada)</h4>
            <div className="space-y-2">
              {extrasList.map((extra: any) => {
                const isSelected = !!extras[extra.name]
                return (
                  <button
                    key={extra.name}
                    onClick={() => toggleExtra(extra.name)}
                    className={`flex items-center justify-between w-full p-3 rounded-xl border-2 transition ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        isSelected 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium">{extra.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">R$ {extra.price.toFixed(2)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <textarea
              placeholder="Observação para o estabelecimento"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm"
              rows={2}
            />
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={totalScoops === 0}
            className={`w-full py-3 rounded-xl font-bold text-white text-lg ${
              totalScoops === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: store.primaryColor }}
          >
            Adicionar • R$ {totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}
