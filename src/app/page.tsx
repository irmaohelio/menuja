"use client"
import Link from "next/link"

const features = [
  { icon: "🏪", title: "Crie sua loja rapidamente", desc: "Em poucos minutos, sem saber programação" },
  { icon: "📦", title: "Cadastre seus produtos", desc: "Organize por categorias com fotos e preços" },
  { icon: "🔔", title: "Receba pedidos", desc: "Notificações em tempo real no painel" },
  { icon: "🔗", title: "Compartilhe seu link", desc: "Envie para clientes pelo WhatsApp" },
  { icon: "⏰", title: "Controle seus horários", desc: "Abra e feche quando quiser" },
  { icon: "📊", title: "Acompanhe suas vendas", desc: "Dashboard com relatórios completos" },
]

const steps = [
  "Crie sua conta",
  "Configure sua loja",
  "Cadastre seus produtos",
  "Compartilhe seu link",
  "Receba seus pedidos",
]

const segments = [
  "🍕 Pizzaria", "🍔 Lanche Delivery", "🌮 Salgados", "🍱 Marmitas",
  "🍨 Açaí", "🎂 Doces", "🍺 Bebidas", "📦 Outros",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md">📋</div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent tracking-tight">MenuJá</span>
          </div>
          <div className="flex gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition">Entrar</Link>
            <Link href="/cadastro" className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition">Criar minha loja</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-600 to-pink-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Crie sua loja online e venda para seus clientes</h1>
          <p className="text-xl text-rose-100 mb-8">Simples, rápido e sem complicação. Tenha seu próprio cardápio digital em minutos.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" className="px-8 py-4 bg-white text-rose-600 rounded-xl font-bold text-lg hover:bg-rose-50 transition shadow-lg">🚀 Criar minha loja</Link>
            <Link href="/login" className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition">Entrar</Link>
          </div>
        </div>
      </section>

      {/* Segmentos */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">Ideal para qualquer tipo de negócio</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {segments.map((s, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl text-lg font-medium">{s}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Tudo que você precisa</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-12">Como funciona</h2>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                <span className="text-lg font-medium">{s}</span>
              </div>
            ))}
          </div>
          <Link href="/cadastro" className="inline-block mt-10 px-8 py-4 bg-rose-600 text-white rounded-xl font-bold text-lg hover:bg-rose-700 transition">Começar agora</Link>
        </div>
      </section>

      {/* Preço */}
      <section className="py-16 px-4 bg-gradient-to-br from-rose-600 to-pink-500 text-white">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Plano Mensal</h2>
          <div className="text-6xl font-extrabold mb-2">R$34,99</div>
          <p className="text-rose-100 text-lg mb-8">/mês • sem taxa de adesão • cancele quando quiser</p>
          <div className="bg-white/10 rounded-xl p-6 mb-8 text-left space-y-3">
            <p>✅ Cardápio digital ilimitado</p>
            <p>✅ Pedidos em tempo real</p>
            <p>✅ Relatórios de vendas</p>
            <p>✅ Link personalizado para WhatsApp</p>
            <p>✅ Controle de horários</p>
            <p>✅ Suporte prioritário</p>
          </div>
          <Link href="/cadastro" className="inline-block px-8 py-4 bg-white text-rose-600 rounded-xl font-bold text-lg hover:bg-rose-50 transition shadow-lg">Começar agora</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© 2026 MenuJá. Todos os direitos reservados. Desenvolvido por Helio Santos.</p>
      </footer>
    </div>
  )
}
