"use client"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import SorveteBuilder from "@/components/SorveteBuilder"

type CartItem = {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  sizeName?: string
  crustName?: string
  halfHalf?: boolean
  flavor1?: string
  flavor2?: string
  notes?: string
  options: { name: string; price: number; quantity: number }[]
}

export default function LojaPage() {
  const params = useParams()
  const slug = params.slug as string
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"cardapio" | "carrinho" | "pedidos">("cardapio")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart")
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showSorveteBuilder, setShowSorveteBuilder] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [checkoutForm, setCheckoutForm] = useState({
    name: "", phone: "", address: "", number: "", complement: "", neighborhood: "", reference: "",
    deliveryType: "delivery", paymentMethod: "cash", changeFor: "", notes: "",
  })
  const [showProfile, setShowProfile] = useState(false)
  const featuredScrollRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPausedRef = useRef(false)

  // Auto-scroll for featured items
  useEffect(() => {
    const el = featuredScrollRef.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const speed = 1 // px per frame
    const interval = 30 // ms
    scrollIntervalRef.current = setInterval(() => {
      if (isPausedRef.current) return
      el.scrollLeft += speed
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        el.scrollLeft = 0
      }
    }, interval)
    return () => { if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current) }
  }, [store])

  const handleTouchStart = () => { isPausedRef.current = true }
  const handleTouchEnd = () => { isPausedRef.current = false }
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("customer_profile")
      return saved ? JSON.parse(saved) : { name: "", phone: "", address: "", number: "", neighborhood: "", city: "", reference: "" }
    } catch { return { name: "", phone: "", address: "", number: "", neighborhood: "", city: "", reference: "" } }
  })

  useEffect(() => {
    fetch(`/api/store/${slug}`).then(r => r.json()).then(data => {
      if (data.success) {
        setStore(data.store)
        // Set first category as active
        const cats = data.store.categories?.filter((c: any) => c.products.length > 0)
        if (cats?.length > 0) setActiveCategory(cats[0].id)
      }
      setLoading(false)
    })
  }, [slug])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: CartItem) => {
    setCart([...cart, item])
    setSelectedProduct(null)
    setShowSorveteBuilder(false)
    setTab("carrinho")
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const updateQty = (index: number, delta: number) => {
    const updated = [...cart]
    updated[index].quantity = Math.max(1, updated[index].quantity + delta)
    setCart(updated)
  }

  const saveProfile = () => {
    localStorage.setItem("customer_profile", JSON.stringify(profile))
    setShowProfile(false)
    // Auto-fill checkout form
    setCheckoutForm(prev => ({
      ...prev,
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      number: profile.number,
      neighborhood: profile.neighborhood,
      reference: profile.reference,
    }))
  }

  const cartTotal = cart.reduce((sum, item) => {
    const optsTotal = item.options.reduce((s, o) => s + o.price * (o.quantity || 1), 0)
    return sum + (item.unitPrice + optsTotal) * item.quantity
  }, 0)

  const submitOrder = async () => {
    if (cart.length === 0) { alert("Carrinho vazio"); return }
    if (!checkoutForm.name) { alert("Informe seu nome"); return }
    if (checkoutForm.deliveryType === "delivery") {
      if (!checkoutForm.address) { alert("Informe seu endereço"); return }
      if (!checkoutForm.number) { alert("Informe o número"); return }
      if (!checkoutForm.neighborhood) { alert("Informe o bairro"); return }
      if (!profile.city) { alert("Informe a cidade no seu perfil"); setShowProfile(true); return }
      if (!checkoutForm.reference) { alert("Informe um ponto de referência"); return }
    }

    const res = await fetch("/api/orders/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeSlug: slug,
        customerName: checkoutForm.name,
        customerPhone: checkoutForm.phone,
        deliveryType: checkoutForm.deliveryType,
        paymentMethod: checkoutForm.paymentMethod,
        changeFor: checkoutForm.changeFor ? parseFloat(checkoutForm.changeFor) : null,
        customerAddress: checkoutForm.address,
        customerNumber: checkoutForm.number,
        customerComplement: checkoutForm.complement,
        customerNeighborhood: checkoutForm.neighborhood,
        customerReference: checkoutForm.reference,
        customerCity: profile.city,
        notes: checkoutForm.notes,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          sizeName: item.sizeName,
          crustName: item.crustName,
          halfHalf: item.halfHalf,
          flavor1: item.flavor1,
          flavor2: item.flavor2,
          notes: item.notes,
          options: item.options,
        })),
      }),
    })
    const data = await res.json()
    if (data.success) {
      setOrderResult(data.order)
      setCart([])
      setTab("pedidos")
      try { localStorage.removeItem(`cart_${slug}`) } catch {}
    } else {
      alert(data.error || "Erro ao enviar pedido")
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" />
    </div>
  )

  if (!store) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="text-5xl mb-4">🏪</p>
        <p className="text-lg">Loja não encontrada</p>
      </div>
    </div>
  )

  const isStoreOpen = store.isOpen && !store.isTempClosed

  return (
    <div className="min-h-screen bg-gray-50 pb-20" style={{ "--primary": store.primaryColor, "--secondary": store.secondaryColor, "--button": store.buttonColor } as any}>
      {/* Header + Category Tabs - sticky together */}
      <div className="sticky top-0 z-30">
        <header style={{ background: `linear-gradient(135deg, ${store.primaryColor || '#e74c3c'}, ${store.secondaryColor || store.primaryColor || '#c0392b'})` }}>
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            {store.logo && <Image src={store.logo} alt={store.name} width={48} height={48} className="rounded-full object-cover border-2 border-white/30 shadow-lg" />}
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-white text-lg truncate drop-shadow-md">{store.name}</h1>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${isStoreOpen ? "bg-white/20 text-white" : "bg-red-900/30 text-red-200"}`}>
                {isStoreOpen ? "🟢 Aberta" : store.isTempClosed ? "🔴 " + (store.tempClosedMsg || "Fechada temporariamente") : "🔴 Fechada"}
              </span>
            </div>
            <button onClick={() => setShowProfile(true)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg hover:bg-white/30 transition">
              👤
            </button>
          </div>
        </header>

        {/* Category Tabs - below header, inside sticky */}
        {tab === "cardapio" && store.categories?.filter((c: any) => c.products.length > 0 || c.type === 'sorvete' || c.type === 'acai').length > 1 && (
          <div className="bg-white/95 backdrop-blur-sm border-t border-gray-100">
            <div className="max-w-lg mx-auto px-4 flex gap-2 overflow-x-auto py-2.5 scrollbar-hide">
              {store.categories?.filter((c: any) => c.products.length > 0 || c.type === 'sorvete' || c.type === 'acai').map((cat: any) => (
                <button key={cat.id} onClick={() => {
                  setActiveCategory(cat.id)
                  const el = document.getElementById(`cat-${cat.id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                } active:scale-95`} style={activeCategory === cat.id ? { backgroundColor: store.primaryColor } : {}}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Banner */}
      {store.banner && (
        <div className="max-w-lg mx-auto px-3 pt-3">
          <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: '780/160', maxHeight: '140px' }}>
            <Image src={store.banner} alt={store.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute inset-0 text-left">
              <div className="absolute left-4 top-1/2 -translate-y-[calc(50%+1.5rem)]">
                <h2 className="text-white font-bold text-xl drop-shadow-lg">{store.name}</h2>
                {store.description && (
                  <div className="text-white/90 text-xs mt-1 drop-shadow">
                    {store.description.split('\n').map((line: string, i: number) => (
                      <p key={i}>{line || '\u00A0'}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* TAB: Cardápio */}
        {tab === "cardapio" && (
          <div>
            {/* Destaques */}
            {store.categories?.some((c: any) => c.products.some((p: any) => p.isFeatured)) && (() => {
              const featured = store.categories.flatMap((c: any) => c.products).filter((p: any) => p.isFeatured)
              const hasScroll = featured.length > 2
              return (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-8 rounded-full bg-yellow-400" />
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">⭐ Destaques</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Os mais pedidos</p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-2" />
                </div>
                <div
                  ref={featuredScrollRef}
                  className={hasScroll ? "flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide" : "grid grid-cols-2 gap-3"}
                  onTouchStart={hasScroll ? handleTouchStart : undefined}
                  onTouchEnd={hasScroll ? handleTouchEnd : undefined}
                  onMouseDown={hasScroll ? handleTouchStart : undefined}
                  onMouseUp={hasScroll ? handleTouchEnd : undefined}
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {featured.map((p: any) => (
                    <div key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={hasScroll ? "min-w-[18vw] snap-start bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.97] transition-all hover:shadow-md border border-gray-100" : "bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.97] transition-all hover:shadow-md border border-gray-100"}>
                      {p.image && <img src={p.image} alt={p.name} className="w-full h-20 object-cover" />}
                      <div className="p-1.5">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-xs font-bold mt-1" style={{ color: store.primaryColor }}>
                          {p.pizzaSizes?.length > 0
                            ? `a partir de R$ ${Math.min(...p.pizzaSizes.map((s: any) => s.price)).toFixed(2)}`
                            : `R$ ${(p.promoPrice || p.price).toFixed(2)}`
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )
            })()}

            {/* Categorias e Produtos */}
            {store.categories?.filter((c: any) => c.products.length > 0 || c.type === 'sorvete' || c.type === 'acai').map((cat: any) => (
              <div key={cat.id} id={`cat-${cat.id}`} className="mb-5 scroll-mt-24">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 rounded-full" style={{ backgroundColor: store.primaryColor }} />
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">{cat.name}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.type === 'sorvete' ? 'Monte seu sorvete' : `${cat.products.length} ${cat.products.length === 1 ? 'produto' : 'produtos'}`}</p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {cat.type === 'sorvete' ? (
                    <div className="col-span-2">
                      <button
                        onClick={() => setShowSorveteBuilder(true)}
                        className="w-full py-4 rounded-2xl font-bold text-white text-lg"
                        style={{ backgroundColor: store.primaryColor }}
                      >
                        🍦 Montar Sorvete
                      </button>
                    </div>
                  ) : (
                    cat.products.map((p: any) => (
                      <div key={p.id} onClick={() => setSelectedProduct(p)}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.97] transition-all hover:shadow-md border border-gray-100">
                        {p.image && <Image src={p.image} alt={p.name} width={250} height={250} className="w-full aspect-square object-cover" />}
                        <div className="p-2.5">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          {p.description && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.description}</p>}
                          <p className="text-sm font-bold mt-1.5" style={{ color: store.primaryColor }}>
                            {p.pizzaSizes?.length > 0
                              ? `a partir de R$ ${Math.min(...p.pizzaSizes.map((s: any) => s.price)).toFixed(2)}`
                              : p.promoPrice
                                ? `R$ ${p.promoPrice.toFixed(2)}`
                                : `R$ ${p.price.toFixed(2)}`
                            }
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Carrinho */}
        {tab === "carrinho" && (
          <div>
            {cart.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-3">🛒</p>
                <p>Seu carrinho está vazio</p>
                <button onClick={() => setTab("cardapio")} className="mt-4 px-6 py-2 rounded-xl text-sm font-medium" style={{ color: store.primaryColor, border: `2px solid ${store.primaryColor}` }}>
                  ← Voltar ao cardápio
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setTab("cardapio")} className="mb-4 flex items-center gap-2 text-sm font-medium" style={{ color: store.primaryColor }}>
                  ← Continuar comprando
                </button>
                <div className="space-y-3 mb-6">
                  {cart.map((item, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          {item.sizeName && <p className="text-xs text-gray-500">Tamanho: {item.sizeName}</p>}
                          {item.crustName && <p className="text-xs text-gray-500">Borda: {item.crustName}</p>}
                          {item.halfHalf && <p className="text-xs text-gray-500">Meio a meio: {item.flavor1} / {item.flavor2}</p>}
                          {/* Group options by type for sorvete */}
                          {item.productId === 'sorvete-custom' ? (
                            <>
                              {/* Sabores */}
                              {item.options.filter((o: any) => o.name.startsWith('Sabor:')).length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-semibold text-gray-600">Sabores</p>
                                  {item.options.filter((o: any) => o.name.startsWith('Sabor:')).map((o: any, j: number) => (
                                    <p key={j} className="text-xs text-gray-500">{o.quantity}x bola sabor {o.name.replace('Sabor: ', '')} (R$ {(o.price * o.quantity).toFixed(2)})</p>
                                  ))}
                                </div>
                              )}
                              {/* Cobertura */}
                              {item.options.filter((o: any) => o.name.startsWith('Cobertura:')).length > 0 && (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold text-gray-600">Cobertura</p>
                                  {item.options.filter((o: any) => o.name.startsWith('Cobertura:')).map((o: any, j: number) => (
                                    <p key={j} className="text-xs text-gray-500">{o.name.replace('Cobertura: ', '')}</p>
                                  ))}
                                </div>
                              )}
                              {/* Extras */}
                              {item.options.filter((o: any) => o.name.startsWith('Extra:')).length > 0 && (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold text-gray-600">Extras</p>
                                  {item.options.filter((o: any) => o.name.startsWith('Extra:')).map((o: any, j: number) => (
                                    <p key={j} className="text-xs text-gray-500">{o.quantity}x {o.name.replace('Extra: ', '')} (R$ {(o.price * o.quantity).toFixed(2)})</p>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            item.options.map((o, j) => (
                              <p key={j} className="text-xs text-gray-500">+ {o.quantity > 1 ? `${o.quantity}x ` : ""}{o.name} {o.price > 0 ? `(R$ ${(o.price * (o.quantity || 1)).toFixed(2)})` : ""}</p>
                            ))
                          )}
                        </div>
                        <button onClick={() => removeFromCart(i)} className="text-red-400 text-sm">🗑️</button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(i, -1)} className="w-7 h-7 bg-gray-100 rounded-full font-bold text-sm">-</button>
                          <span className="font-medium">{item.quantity}</span>
                          <button onClick={() => updateQty(i, 1)} className="w-7 h-7 bg-gray-100 rounded-full font-bold text-sm">+</button>
                        </div>
                        <span className="font-bold text-sm">R$ {((item.unitPrice + item.options.reduce((s, o) => s + o.price * (o.quantity || 1), 0)) * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Form */}
                <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3 mb-4">
                  <h3 className="font-bold">Seus dados</h3>
                  <input placeholder="Seu nome *" value={checkoutForm.name}
                    onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl text-sm" />
                  <input placeholder="Telefone" value={checkoutForm.phone}
                    onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl text-sm" />

                  <div className="flex gap-2">
                    {store.settings?.deliveryEnabled && (
                      <button onClick={() => setCheckoutForm({...checkoutForm, deliveryType: "delivery"})}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 ${
                          checkoutForm.deliveryType === "delivery" ? "border-gray-400 bg-gray-50" : "border-gray-200"
                        }`}>🛵 Entrega</button>
                    )}
                    {store.settings?.pickupEnabled && (
                      <button onClick={() => setCheckoutForm({...checkoutForm, deliveryType: "pickup"})}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 ${
                          checkoutForm.deliveryType === "pickup" ? "border-gray-400 bg-gray-50" : "border-gray-200"
                        }`}>🏪 Retirada</button>
                    )}
                  </div>

                  {checkoutForm.deliveryType === "delivery" && (
                    <>
                      <input placeholder="Endereço" value={checkoutForm.address}
                        onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})}
                        className="w-full px-4 py-3 border rounded-xl text-sm" />
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="Número" value={checkoutForm.number}
                          onChange={e => setCheckoutForm({...checkoutForm, number: e.target.value})}
                          className="px-4 py-3 border rounded-xl text-sm" />
                        <input placeholder="Complemento" value={checkoutForm.complement}
                          onChange={e => setCheckoutForm({...checkoutForm, complement: e.target.value})}
                          className="px-4 py-3 border rounded-xl text-sm" />
                      </div>
                      <input placeholder="Bairro" value={checkoutForm.neighborhood}
                        onChange={e => setCheckoutForm({...checkoutForm, neighborhood: e.target.value})}
                        className="w-full px-4 py-3 border rounded-xl text-sm" />
                      <input placeholder="Ponto de referência" value={checkoutForm.reference}
                        onChange={e => setCheckoutForm({...checkoutForm, reference: e.target.value})}
                        className="w-full px-4 py-3 border rounded-xl text-sm" />
                    </>
                  )}

                  <h3 className="font-bold pt-2">Pagamento</h3>
                  <div className="flex gap-2 flex-wrap">
                    {store.settings?.cashEnabled && (
                      <button onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: "cash"})}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 ${
                          checkoutForm.paymentMethod === "cash" ? "border-gray-400 bg-gray-50" : "border-gray-200"
                        }`}>💵 Dinheiro</button>
                    )}
                    {store.settings?.pixEnabled && (
                      <button onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: "pix"})}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 ${
                          checkoutForm.paymentMethod === "pix" ? "border-gray-400 bg-gray-50" : "border-gray-200"
                        }`}>📱 PIX</button>
                    )}
                    {store.settings?.cardEnabled && (
                      <button onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: "card"})}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 ${
                          checkoutForm.paymentMethod === "card" ? "border-gray-400 bg-gray-50" : "border-gray-200"
                        }`}>💳 Cartão</button>
                    )}
                  </div>

                  {checkoutForm.paymentMethod === "cash" && (
                    <input placeholder="Troco para quanto?" type="number" value={checkoutForm.changeFor}
                      onChange={e => setCheckoutForm({...checkoutForm, changeFor: e.target.value})}
                      className="w-full px-4 py-3 border rounded-xl text-sm" />
                  )}

                  {checkoutForm.paymentMethod === "pix" && store.settings?.pixKey && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-xs text-green-700 font-medium mb-1">📱 Chave PIX:</p>
                      <p className="text-sm font-mono text-green-900 break-all select-all">{store.settings.pixKey}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(store.settings.pixKey)}
                        className="mt-2 text-xs text-green-600 underline"
                      >
                        Copiar chave
                      </button>
                    </div>
                  )}

                  <textarea placeholder="Observações" value={checkoutForm.notes}
                    onChange={e => setCheckoutForm({...checkoutForm, notes: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl text-sm" rows={2} />
                </div>

                {/* Totais */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <div className="flex justify-between text-sm mb-1"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                  {checkoutForm.deliveryType === "delivery" && store.settings?.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm mb-1"><span>Taxa de entrega</span><span>R$ {store.settings.deliveryFee.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span style={{ color: store.primaryColor }}>
                      R$ {(cartTotal + (checkoutForm.deliveryType === "delivery" ? (store.settings?.deliveryFee || 0) : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button onClick={submitOrder} disabled={!isStoreOpen}
                  className="w-full py-4 rounded-xl font-bold text-white text-lg disabled:opacity-50 disabled:grayscale"
                  style={{ backgroundColor: store.buttonColor }}>
                  {isStoreOpen ? "Finalizar pedido" : "Loja fechada"}
                </button>
              </>
            )}
          </div>
        )}

        {/* TAB: Pedidos */}
        {tab === "pedidos" && (
          <div>
            {orderResult ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                <p className="text-5xl mb-4">✅</p>
                <h2 className="text-xl font-bold mb-2">Pedido #{orderResult.orderNumber} enviado!</h2>
                <p className="text-gray-500 mb-4">Aguardando confirmação da loja</p>
                <div className="text-left space-y-2 text-sm border-t pt-4">
                  <p><strong>Cliente:</strong> {orderResult.customerName}</p>
                  <p><strong>Total:</strong> R$ {orderResult.total.toFixed(2)}</p>
                  <p><strong>Pagamento:</strong> {orderResult.paymentMethod === "cash" ? "Dinheiro" : orderResult.paymentMethod === "pix" ? "PIX" : "Cartão"}</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <a href={`/pedido/${orderResult.id}`} className="flex-1 py-3 text-white rounded-xl font-bold text-center" style={{ backgroundColor: store.buttonColor }}>
                    Acompanhar pedido
                  </a>
                  <button onClick={() => setOrderResult(null)} className="px-6 py-3 bg-gray-100 rounded-xl font-medium">
                    Novo pedido
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-3">📋</p>
                <p>Nenhum pedido recente</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showSorveteBuilder && (
        <SorveteBuilder
          store={store}
          onAdd={addToCart}
          onClose={() => setShowSorveteBuilder(false)}
        />
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          store={store}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowProfile(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold">👤 Seu Perfil</h2>
              <button onClick={() => setShowProfile(false)} className="text-2xl text-gray-400">×</button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-500 mb-2">Preencha seus dados para agilizar seus pedidos</p>
              <input placeholder="Nome completo *" value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl text-sm" />
              <input placeholder="Telefone / WhatsApp" value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl text-sm" />
              <input placeholder="Endereço *" value={profile.address}
                onChange={e => setProfile({...profile, address: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Número *" value={profile.number}
                  onChange={e => setProfile({...profile, number: e.target.value})}
                  className="px-4 py-3 border rounded-xl text-sm" />
                <input placeholder="Bairro *" value={profile.neighborhood}
                  onChange={e => setProfile({...profile, neighborhood: e.target.value})}
                  className="px-4 py-3 border rounded-xl text-sm" />
              </div>
              <input placeholder="Cidade *" value={profile.city}
                onChange={e => setProfile({...profile, city: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl text-sm" />
              <input placeholder="Ponto de referência *" value={profile.reference}
                onChange={e => setProfile({...profile, reference: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl text-sm" />
              <button onClick={saveProfile}
                className="w-full py-3 rounded-xl font-bold text-white mt-4"
                style={{ backgroundColor: store.primaryColor }}>
                Salvar perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-30">
        <div className="max-w-lg mx-auto flex">
          {[
            { id: "cardapio" as const, icon: "📋", label: "Cardápio" },
            { id: "carrinho" as const, icon: "🛒", label: `Carrinho${cart.length > 0 ? ` (${cart.length})` : ""}` },
            { id: "pedidos" as const, icon: "📦", label: "Pedidos" },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex-1 py-3 text-center text-xs font-medium ${
                tab === item.id ? "" : "text-gray-500"
              }`}>
              <span className="text-lg block">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function ProductModal({ product, store, onClose, onAdd }: {
  product: any; store: any; onClose: () => void; onAdd: (item: CartItem) => void
}) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any[]>>({})
  const [selectedSize, setSelectedSize] = useState<any>(product.pizzaSizes?.find((s: any) => s.isActive !== false) || product.pizzaSizes?.[0] || null)
  const [selectedCrust, setSelectedCrust] = useState<any>(null)
  const [halfHalf, setHalfHalf] = useState(false)
  const [flavor2, setFlavor2] = useState<any>(null)

  // Get all pizza products from the store for meio a meio
  const allPizzas = store.categories?.flatMap((c: any) => c.products).filter((p: any) => p.isPizza) || []
  const otherPizzas = allPizzas.filter((p: any) => p.id !== product.id)

  const [extraFlavors, setExtraFlavors] = useState(0) // sabores extras além do maxQty

  const toggleOption = (groupId: string, option: any, maxQty?: number, groupName?: string) => {
    const current = selectedOptions[groupId] || []
    const exists = current.find(o => o.name === option.name)
    if (exists) {
      setSelectedOptions({ ...selectedOptions, [groupId]: current.filter(o => o.name !== option.name) })
      // Se removeu um sabor extra, decrementar
      if (groupName === 'Sabores' && current.length > (maxQty || 0) + extraFlavors) {
        setExtraFlavors(Math.max(0, extraFlavors - 1))
      }
    } else {
      // Para Sabores: permitir além do maxQty se extraFlavors > 0
      if (groupName === 'Sabores' && maxQty && current.length >= maxQty + extraFlavors) return
      // Para outros grupos: respeitar maxQty normalmente
      if (groupName !== 'Sabores' && maxQty && current.length >= maxQty) return
      setSelectedOptions({ ...selectedOptions, [groupId]: [...current, option] })
    }
  }

  const addExtraFlavor = () => {
    setExtraFlavors(extraFlavors + 1)
  }

  const basePrice = selectedSize?.price || product.promoPrice || product.price
  const crustPrice = selectedCrust?.price || 0
  const optionsPrice = Object.values(selectedOptions).flat().reduce((s: number, o: any) => s + (o.price || 0), 0)
  const extraFlavorsCost = extraFlavors * 4 // R$4 por sabor extra

  // For meio a meio: use the price of the most expensive half
  const halfHalfPrice = halfHalf && flavor2
    ? Math.max(
        selectedSize?.price || product.promoPrice || product.price,
        selectedSize?.price || flavor2.promoPrice || flavor2.price
      )
    : 0
  const effectivePrice = halfHalf && flavor2 ? halfHalfPrice : basePrice

  const handleAdd = () => {
    const allOptions = Object.values(selectedOptions).flat().map((o: any) => ({
      name: o.name, price: o.price || 0, quantity: 1,
    }))
    if (selectedCrust) {
      allOptions.push({ name: `Borda: ${selectedCrust.name}`, price: selectedCrust.price || 0, quantity: 1 })
    }

    onAdd({
      productId: product.id,
      productName: halfHalf && flavor2 ? `${product.name} / ${flavor2.name}` : product.name,
      unitPrice: effectivePrice + extraFlavorsCost,
      quantity,
      sizeName: selectedSize?.name,
      crustName: selectedCrust?.name,
      halfHalf: halfHalf && !!flavor2,
      flavor1: halfHalf ? product.name : undefined,
      flavor2: halfHalf ? flavor2?.name : undefined,
      notes: notes || undefined,
      options: allOptions,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        {product.image && <Image src={product.image} alt={product.name} width={400} height={225} className="w-full aspect-video object-cover" />}
        <div className="p-5">
          <h3 className="text-xl font-bold">{product.name}</h3>
          {product.description && <p className="text-gray-500 text-sm mt-1">{product.description}</p>}
          <p className="text-xl font-bold mt-2" style={{ color: store.primaryColor }}>
            R$ {basePrice.toFixed(2)}
          </p>

          {/* Pizza sizes */}
          {product.pizzaSizes?.filter((s: any) => s.isActive !== false).length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-sm mb-2">📏 Tamanho</h4>
              <div className="grid grid-cols-3 gap-2">
                {product.pizzaSizes.map((size: any) => {
                  const inactive = size.isActive === false
                  return (
                    <button key={size.id} onClick={() => !inactive && setSelectedSize(size)}
                      disabled={inactive}
                      className={`py-2 rounded-lg text-xs font-bold border-2 transition ${
                        inactive
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                          : selectedSize?.id === size.id
                            ? "text-white border-transparent"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                      style={!inactive && selectedSize?.id === size.id ? { backgroundColor: 'var(--primary, #e11d48)' } : undefined}>
                      <span className="block text-base">{size.name.toUpperCase()}</span>
                      <span className={`block text-[10px] mt-0.5 ${inactive ? "text-gray-400" : selectedSize?.id === size.id ? "text-white/70" : "text-gray-500"}`}>
                        {inactive ? "Indisponível" : `R$ ${size.price.toFixed(2)}`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pizza crusts (borda recheada) */}
          {product.isPizza && product.pizzaSizes?.length > 0 && store.pizzaCrusts?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-sm mb-2">🧀 Borda recheada</h4>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setSelectedCrust(null)}
                  className={`py-2 rounded-lg text-xs font-bold border-2 transition ${
                    !selectedCrust
                      ? "text-white border-transparent"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                  style={!selectedCrust ? { backgroundColor: 'var(--primary, #e11d48)' } : undefined}>
                  <span className="block">Sem</span>
                  <span className={`block text-[10px] mt-0.5 ${!selectedCrust ? "text-white/70" : "text-gray-500"}`}>R$ 0,00</span>
                </button>
                {store.pizzaCrusts.map((crust: any) => (
                  <button key={crust.id} onClick={() => setSelectedCrust(crust)}
                    className={`py-2 rounded-lg text-xs font-bold border-2 transition ${
                      selectedCrust?.id === crust.id
                        ? "text-white border-transparent"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                    style={selectedCrust?.id === crust.id ? { backgroundColor: 'var(--primary, #e11d48)' } : undefined}>
                    <span className="block">{crust.name}</span>
                    <span className={`block text-[10px] mt-0.5 ${selectedCrust?.id === crust.id ? "text-white/70" : "text-gray-500"}`}>
                      +R$ {crust.price.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Half and half */}
          {product.isPizza && product.pizzaSizes?.length > 0 && allPizzas.length > 1 && (
            <div className="mt-4">
              <button onClick={(e) => {
                e.stopPropagation()
                setHalfHalf(!halfHalf)
                if (halfHalf) setFlavor2(null)
              }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition ${
                  halfHalf ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍕</span>
                  <span className="text-sm font-medium">Meio a Meio</span>
                </div>
                <div className={`w-10 h-6 rounded-full transition flex items-center ${
                  halfHalf ? "justify-end" : "bg-gray-300 justify-start"
                }`}>
                  <div className="w-5 h-5 bg-white rounded-full shadow mx-0.5" />
                </div>
              </button>
              {halfHalf && (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">1ª metade</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-2 rounded-xl text-xs font-medium border-2 text-white" style={{ backgroundColor: store.primaryColor, borderColor: store.primaryColor }}>
                        {product.name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">2ª metade</p>
                    <div className="flex flex-wrap gap-2">
                      {otherPizzas.map((p: any) => (
                        <button key={p.id} onClick={(e) => { e.stopPropagation(); setFlavor2(p) }}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition ${
                            flavor2?.id === p.id ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                          style={flavor2?.id === p.id ? { backgroundColor: 'var(--primary, #e11d48)' } : undefined}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Option groups */}
          {product.optionGroups?.map((group: any) => (
            <div key={group.id} className="mt-5 border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-base">
                  {group.name} {group.required && <span className="text-red-500 text-xs">(obrigatório)</span>}
                    {group.name === 'Sabores' && group.maxQty && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({(selectedOptions[group.id] || []).length}/{group.maxQty + extraFlavors})
                      </span>
                    )}
                </h4>
                {(selectedOptions[group.id] || []).length > 0 && (
                  <span className="text-xs font-medium" style={{ color: store.primaryColor }}>
                    +R$ {(selectedOptions[group.id] || []).reduce((s: number, o: any) => s + (o.price || 0), 0).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {group.options.map((opt: any) => {
                  const isSelected = (selectedOptions[group.id] || []).find((o: any) => o.name === opt.name)
                  return (
                    <label key={opt.id} onClick={() => toggleOption(group.id, opt, group.maxQty, group.name)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition ${
                        isSelected ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                        isSelected ? "" : "border-gray-300"
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="flex-1 text-sm font-medium">{opt.name}</span>
                      {opt.price > 0 && (
                        <span className={`text-sm font-medium ${isSelected ? "" : "text-gray-500"}`}>
                          +R$ {opt.price.toFixed(2)}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
              {/* Botão Adicionar outro sabor - apenas para grupo Sabores */}
              {group.name === 'Sabores' && group.maxQty && (
                <button
                  onClick={addExtraFlavor}
                  className="mt-3 w-full py-2 px-4 rounded-xl border-2 border-dashed text-sm font-medium transition hover:bg-gray-50"
                  style={{ borderColor: store.primaryColor, color: store.primaryColor }}
                >
                  + Adicionar outro sabor (R$ 4.00)
                </button>
              )}
            </div>
          ))}

          {/* Notes */}
          <div className="mt-4">
            <textarea placeholder="Observação para o estabelecimento" value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm" rows={2} />
          </div>

          {/* Qty + Add */}
          <div className="flex items-center gap-4 mt-5">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="py-2 px-1 font-bold">-</button>
              <span className="font-bold w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="py-2 px-1 font-bold">+</button>
            </div>
            <button onClick={handleAdd}
              disabled={halfHalf && !flavor2}
              className={`flex-1 py-3 rounded-xl font-bold text-white ${
                halfHalf && !flavor2 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: store.buttonColor }}>
              {halfHalf && !flavor2 ? "Escolha a 2ª metade" : `Adicionar • R$ ${((effectivePrice + crustPrice + optionsPrice + extraFlavorsCost) * quantity).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
