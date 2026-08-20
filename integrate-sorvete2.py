with open('src/app/loja/[slug]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the section where products are rendered and add special handling for Sorvete
old_section = """                <div className="grid grid-cols-2 gap-3">
                  {cat.products.map((p: any) => (
                    <div key={p.id} onClick={() => setSelectedProduct(p)}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.97] transition-all hover:shadow-md border border-gray-100">
                      {p.image && <Image src={p.image} alt={p.name} width={200} height={200} className="w-full aspect-square object-cover" />}
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
                  ))}
                </div>"""

new_section = """                <div className="grid grid-cols-2 gap-3">
                  {cat.name === 'Sorvete' ? (
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
                        {p.image && <Image src={p.image} alt={p.name} width={200} height={200} className="w-full aspect-square object-cover" />}
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
                </div>"""

content = content.replace(old_section, new_section)

with open('src/app/loja/[slug]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK - Sorvete category handling added')
