with open('src/app/loja/[slug]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for SorveteBuilder
old_import = 'import Image from "next/image"'
new_import = 'import Image from "next/image"\nimport SorveteBuilder from "@/components/SorveteBuilder"'

content = content.replace(old_import, new_import)

# Add state for SorveteBuilder
old_state = 'const [selectedProduct, setSelectedProduct] = useState<any>(null)'
new_state = 'const [selectedProduct, setSelectedProduct] = useState<any>(null)\n  const [showSorveteBuilder, setShowSorveteBuilder] = useState(false)'

content = content.replace(old_state, new_state)

# Add SorveteBuilder rendering before the ProductModal
old_modal = '      {selectedProduct && (\n        <ProductModal'
new_modal = '      {showSorveteBuilder && (\n        <SorveteBuilder\n          store={store}\n          onAdd={addToCart}\n          onClose={() => setShowSorveteBuilder(false)}\n        />\n      )}\n\n      {selectedProduct && (\n        <ProductModal'

content = content.replace(old_modal, new_modal)

with open('src/app/loja/[slug]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK - SorveteBuilder integrated')
