with open('src/app/admin/pedidos/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = """                {selected.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{item.quantity}x {item.productName} {item.sizeName ? `(${item.sizeName})` : ""}</span>
                    <span>R$ {item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}"""

new = """                {selected.items?.map((item: any, i: number) => (
                  <div key={i} className="py-2 border-b last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.quantity}x {item.productName} {item.sizeName ? `(${item.sizeName})` : ""}</span>
                      <span className="font-bold">R$ {item.totalPrice.toFixed(2)}</span>
                    </div>
                    {item.options?.length > 0 && (
                      <div className="mt-1 ml-2 space-y-0.5">
                        {item.options.map((opt: any, j: number) => (
                          <p key={j} className="text-xs text-gray-500">
                            {opt.quantity > 1 ? `${opt.quantity}x` : '+'} {opt.name} {opt.price > 0 ? `(R$ ${opt.price.toFixed(2)})` : ''}
                          </p>
                        ))}
                      </div>
                    )}
                    {item.notes && <p className="text-xs text-gray-400 italic mt-1">Obs: {item.notes}</p>}
                  </div>
                ))}"""

content = content.replace(old, new)

with open('src/app/admin/pedidos/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK')
