with open('src/app/loja/[slug]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '<p key={j} className="text-xs text-gray-500">+ {o.name} {o.price > 0 ? `(R$ ${o.price.toFixed(2)})` : ""}</p>'
new = '<p key={j} className="text-xs text-gray-500">+ {o.quantity > 1 ? `${o.quantity}x ` : ""}{o.name} {o.price > 0 ? `(R$ ${(o.price * (o.quantity || 1)).toFixed(2)})` : ""}</p>'

content = content.replace(old, new)

with open('src/app/loja/[slug]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK')
