'use client'
import { useState } from 'react'

interface SorveteBuilderProps {
  store: any
  onAdd: (item: any) => void
  onClose: () => void
}

const SABORES = [
  { name: 'Chocolate', color: '#5C3317' },
  { name: 'Morango', color: '#FF6B6B' },
  { name: 'Creme', color: '#FFFDD0' },
  { name: 'Pistache', color: '#93C572' },
  { name: 'Napolitano', color: '#FFB6C1' },
]

const COBERTURAS = [
  { name: 'Calda de Groselha', color: '#8B0000' },
  { name: 'Calda de Morango', color: '#FF1493' },
  { name: 'Calda de Chocolate', color: '#3E2723' },
]

const EXTRAS = [
  { name: 'Granola', price: 3 },
  { name: 'Leite Condensado', price: 3 },
  { name: 'Chocolate Granulado', price: 4 },
  { name: 'Amendoim', price: 3 },
  { name: 'Banana', price: 2 },
]

export default function SorveteBuilder({ store, onAdd, onClose }: SorveteBuilderProps) {
  const [scoops, setScoops] = useState<Record<string, number>>({})
  const [cobertura, setCobertura] = useState<string | null>(null)
  const [extras, setExtras] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')

  const totalScoops = Object.values(scoops).reduce((sum, qty) => sum + qty, 0)
  const scoopsPrice = totalScoops * 4
  const extrasPrice = Object.entries(extras).reduce((sum, [name, qty]) => {
    const extra = EXTRAS.find(e => e.name === name)
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

  const addExtra = (extra: string) => {
    setExtras(prev => ({
      ...prev,
      [extra]: (prev[extra] || 0) + 1
    }))
  }

  const removeExtra = (extra: string) => {
    setExtras(prev => {
      const newExtras = { ...prev }
      if (newExtras[extra] > 1) {
        newExtras[extra]--
      } else {
        delete newExtras[extra]
      }
      return newExtras
    })
  }

  const handleAdd = () => {
    if (totalScoops === 0) return

    const scoopsList = Object.entries(scoops)
      .map(([name, qty]) => `${qty}x ${name}`)
      .join(', ')

    const extrasList = Object.entries(extras)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => `${qty}x ${name}`)
      .join(', ')

    const description = [
      `${totalScoops} bola${totalScoops > 1 ? 's' : ''}: ${scoopsList}`,
      cobertura && `Cobertura: ${cobertura}`,
      extrasList && `Extras: ${extrasList}`,
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
          price: 0,
          quantity: qty,
        })),
        ...(cobertura ? [{ name: `Cobertura: ${cobertura}`, price: 0, quantity: 1 }] : []),
        ...Object.entries(extras).filter(([_, qty]) => qty > 0).map(([name, qty]) => ({
          name: `Extra: ${name}`,
          price: EXTRAS.find(e => e.name === name)?.price || 0,
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
      const flavorData = SABORES.find(s => s.name === flavor)
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

          {/* Pot Visualization */}
          <div className="flex justify-center mb-6">
            <svg width="100" height="120" viewBox="0 0 100 120">
              {/* Pot body */}
              <path d="M15 40 L25 110 L75 110 L85 40 Z" fill="#E8E8E8" stroke="#CCC" strokeWidth="2"/>
              {/* Pot rim */}
              <ellipse cx="50" cy="40" rx="40" ry="8" fill="#D4D4D4" stroke="#CCC" strokeWidth="2"/>
              
              {/* Scoops */}
              {scoopPositions.map((scoop, i) => (
                <g key={i}>
                  <circle
                    cx={scoop.x}
                    cy={scoop.y}
                    r="18"
                    fill={scoop.color}
                    stroke="#00000020"
                    strokeWidth="1"
                  />
                  <circle
                    cx={scoop.x - 5}
                    cy={scoop.y - 5}
                    r="4"
                    fill="#FFFFFF40"
                  />
                </g>
              ))}
              
              {/* Cobertura drip */}
              {cobertura && (
                <path
                  d="M30 40 Q35 50 30 60 M50 40 Q55 55 50 65 M70 40 Q75 50 70 60"
                  fill="none"
                  stroke={COBERTURAS.find(c => c.name === cobertura)?.color || '#000'}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>

          {/* Total display */}
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500">
              {totalScoops} bola{totalScoops !== 1 ? 's' : ''} • R$ {scoopsPrice.toFixed(2)}
            </div>
            <div className="text-2xl font-bold" style={{ color: store.primaryColor }}>
              R$ {totalPrice.toFixed(2)}
            </div>
          </div>

          {/* Sabores */}
          <div className="mb-6">
            <h4 className="font-bold text-base mb-3">🍫 Sabores</h4>
            <div className="space-y-2">
              {SABORES.map(sabor => (
                <div key={sabor.name} className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: sabor.color }}/>
                    <span className="font-medium">{sabor.name}</span>
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
          </div>

          {/* Cobertura */}
          <div className="mb-6">
            <h4 className="font-bold text-base mb-3">🍫 Cobertura (1 por pote)</h4>
            <div className="space-y-2">
              {COBERTURAS.map(cob => (
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
          <div className="mb-6">
            <h4 className="font-bold text-base mb-3">✨ Extras (cobrado por cada)</h4>
            <div className="space-y-2">
              {EXTRAS.map(extra => (
                <div key={extra.name} className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200">
                  <div>
                    <span className="font-medium">{extra.name}</span>
                    <span className="text-sm text-gray-500 ml-2">R$ {extra.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeExtra(extra.name)}
                      disabled={!extras[extra.name]}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold">{extras[extra.name] || 0}</span>
                    <button
                      onClick={() => addExtra(extra.name)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: store.primaryColor }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
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
