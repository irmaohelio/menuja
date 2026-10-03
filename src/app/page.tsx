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

const plans = [
  {
    id: "monthly",
    name: "Mensal",
    price: 34.9,
    period: "mês",
    icon: "📅",
    popular: false,
    savings: null as string | null,
    features: [
      "Produtos ilimitados",
      "Pedidos ilimitados",
      "Link da loja personalizado",
      "Suporte por WhatsApp",
      "Relatórios de vendas",
      "Sem marca d'água",
    ],
  },
  {
    id: "semiannual",
    name: "Semestral",
    price: 199.9,
    period: "6 meses",
    icon: "⭐",
    popular: true,
    savings: "Economia de R$ 1,58/mês",
    features: [
      "Produtos ilimitados",
      "Pedidos ilimitados",
      "Link da loja personalizado",
      "Suporte prioritário",
      "Relatórios avançados",
      "Sem marca d'água",
    ],
  },
  {
    id: "annual",
    name: "Anual",
    price: 374.9,
    period: "ano",
    icon: "🏢",
    popular: false,
    savings: "Economia de R$ 3,66/mês",
    features: [
      "Produtos ilimitados",
      "Pedidos ilimitados",
      "Domínio próprio",
      "Suporte prioritário",
      "Relatórios avançados",
      "Sem marca d'água",
    ],
  },
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
          <div className="flex gap-2 items-center">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition">Entrar</Link>
            <Link href="/cadastro" className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition">Criar minha loja</Link>
            <button onClick={() => {
              const url = window.location.origin
              if (navigator.share) {
                navigator.share({ title: 'MenuJá - Crie sua loja online', url })
              } else {
                navigator.clipboard.writeText(url)
                alert('Link copiado!')
              }
            }} className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition" title="Compartilhar">
              📤
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-600 to-pink-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold mb-4">🎁 Teste grátis por 14 dias</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Crie sua loja online e venda para seus clientes</h1>
          <p className="text-xl text-rose-100 mb-8">Simples, rápido e sem complicação. Tenha seu próprio cardápio digital em minutos.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" className="px-8 py-4 bg-white text-rose-600 rounded-xl font-bold text-lg hover:bg-rose-50 transition shadow-lg">🚀 Criar minha loja grátis</Link>
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

      {/* Depoimentos */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">O que nossos clientes dizem</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Maria Silva", business: "Pizzaria do Zé", text: "Aumentei 40% nas vendas depois que comecei a usar o MenuJá. Meus clientes adoram o cardápio digital!", avatar: "👩" },
              { name: "João Santos", business: "Açaí Tropical", text: "Muito prático! Em 10 minutos minha loja estava pronta. Recomendo para todos os empreendedores.", avatar: "👨" },
              { name: "Ana Oliveira", business: "Lanche Express", text: "O melhor custo-benefício do mercado. Suporte rápido e sistema muito fácil de usar.", avatar: "👩‍🍳" },
            ].map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{t.avatar}</span>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.business}</p>
                  </div>
                </div>
                <p className="text-gray-600">"{t.text}"</p>
                <div className="mt-3 text-yellow-400">⭐⭐⭐⭐⭐</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para aumentar suas vendas?</h2>
          <p className="text-gray-300 text-lg mb-8">Junte-se a centenas de lojistas que já estão vendendo mais com o MenuJá.</p>
          <Link href="/cadastro" className="inline-block px-10 py-4 bg-rose-600 text-white rounded-xl font-bold text-xl hover:bg-rose-700 transition shadow-lg">
            🚀 Começar agora - É grátis!
          </Link>
          <p className="mt-4 text-gray-400 text-sm">Sem cartão de crédito • Cancele quando quiser</p>
        </div>
      </section>

      {/* Preços */}
      <section className="py-16 px-4 bg-gradient-to-br from-rose-600 to-pink-500 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold mb-4">🎁 14 dias grátis para testar</div>
            <h2 className="text-3xl font-extrabold mb-2">Escolha seu plano</h2>
            <p className="text-rose-100">Sem taxa de adesão • Cancele quando quiser</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-6 text-gray-800 shadow-xl flex flex-col h-full ${
                  plan.popular ? "ring-4 ring-white/60 sm:-mt-3" : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    MAIS POPULAR
                  </span>
                )}
                <div className="text-3xl mb-1">{plan.icon}</div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
                  <span className="text-gray-500 text-sm">/{plan.period}</span>
                </div>
                {plan.savings ? (
                  <p className="text-xs font-medium text-emerald-600 mt-1">💰 {plan.savings}</p>
                ) : (
                  <p className="text-xs text-transparent mt-1 select-none">.</p>
                )}
                <ul className="text-sm text-gray-600 space-y-2 my-5 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-500">✅</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro"
                  className={`text-center px-6 py-3 rounded-xl font-bold transition ${
                    plan.popular
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                  }`}
                >
                  Começar grátis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© 2026 MenuJá. Todos os direitos reservados. Desenvolvido por Helio Santos.</p>
      </footer>
    </div>
  )
}
