with open('src/components/SorveteBuilder.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add border-top and more margin to Cobertura section
old_cobertura = """          {/* Cobertura */}
          <div className="mb-6">"""
new_cobertura = """          {/* Cobertura */}
          <div className="mb-6 pt-6 border-t border-gray-200">"""
content = content.replace(old_cobertura, new_cobertura)

# Add border-top and more margin to Extras section
old_extras = """          {/* Extras */}
          <div className="mb-6">"""
new_extras = """          {/* Extras */}
          <div className="mb-6 pt-6 border-t border-gray-200">"""
content = content.replace(old_extras, new_extras)

with open('src/components/SorveteBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK')
