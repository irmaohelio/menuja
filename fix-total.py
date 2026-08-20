with open('src/app/loja/[slug]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '<span className="font-bold text-sm">R$ {((item.unitPrice + item.options.reduce((s, o) => s + o.price, 0)) * item.quantity).toFixed(2)}</span>'
new = '<span className="font-bold text-sm">R$ {((item.unitPrice + item.options.reduce((s, o) => s + o.price * (o.quantity || 1), 0)) * item.quantity).toFixed(2)}</span>'

content = content.replace(old, new)

with open('src/app/loja/[slug]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK')
