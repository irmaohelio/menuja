# MenuJá - Status do Projeto

## ✅ Concluído
- [x] Setup Next.js 16 + Prisma 6 + SQLite + Tailwind
- [x] Schema do banco (20 tabelas, multi-tenant)
- [x] Auth: cadastro, login, JWT, logout
- [x] Landing page profissional
- [x] Painel ADM: dashboard, pedidos, produtos, categorias, configurações
- [x] Loja pública: cardápio, carrinho, checkout, pedido
- [x] Admin master: stats, gerenciar lojas
- [x] Upload de imagens
- [x] Seed: admin@lojadigital.com / admin123

## 🔧 Pendente
- [ ] Carrinho com localStorage (persistir entre refreshes)
- [ ] Pedidos do cliente com tracking em tempo real
- [ ] Notificações de novos pedidos (polling a cada 10s)
- [ ] Onboarding wizard pós-cadastro
- [ ] Relatórios detalhados
- [ ] Combos e promoções
- [ ] Ajustes finos de UX

## 🚀 Como rodar
```bash
cd D:\loja-digital
npm run dev
```
→ http://localhost:3000

## 📁 Estrutura
```
D:\loja-digital\
├── prisma/schema.prisma     # Schema do banco
├── src/
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── login/           # Login
│   │   ├── cadastro/        # Cadastro
│   │   ├── admin/           # Painel ADM
│   │   ├── master/          # Admin master
│   │   ├── loja/[slug]/     # Loja pública
│   │   └── api/             # Rotas API
│   └── lib/
│       ├── prisma.ts        # Prisma client
│       ├── auth.ts          # JWT helpers
│       ├── api.ts           # Response helpers
│       └── utils.ts         # Slugify, formatCurrency
```

## 🔑 Credenciais Master
- Email: admin@lojadigital.com
- Senha: admin123
