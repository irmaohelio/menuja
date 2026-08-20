with open('src/app/loja/[slug]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = """        {/* TAB: Carrinho */}
        {tab === "carrinho" && (
          <div>
            {cart.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-3">🛒</p>
                <p>Seu carrinho está vazio</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">"""

new = """        {/* TAB: Carrinho */}
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
                <div className="space-y-3 mb-6">"""

content = content.replace(old, new)

with open('src/app/loja/[slug]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK')
