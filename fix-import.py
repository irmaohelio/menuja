with open('src/app/admin/categorias/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '"use client"\r\nimport { useState, useEffect }\r\nimport Link from \'next/link\' from "react"'
new = '"use client"\r\nimport { useState, useEffect } from "react"\r\nimport Link from \'next/link\''

content = content.replace(old, new)

with open('src/app/admin/categorias/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK')
