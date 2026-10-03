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

const testimonials = [
  { name: "Maria Silva", business: "Pizzaria do Zé", text: "Aumentei 40% nas vendas depois que comecei a usar o MenuJá. Meus clientes adoram o cardápio digital!", avatar: "👩", color: "bg-rose-100" },
  { name: "João Santos", business: "Açaí Tropical", text: "Muito prático! Em 10 minutos minha loja estava pronta. Recomendo para todos os empreendedores.", avatar: "👨", color: "bg-amber-100" },
  { name: "Ana Oliveira", business: "Lanche Express", text: "O melhor custo-benefício do mercado. Suporte rápido e sistema muito fácil de usar.", avatar: "👩‍🍳", color: "bg-emerald-100" },
]

const previewItems = [
  { emoji: "🍕", name: "Pizza Margherita", price: "R$ 39,90" },
  { emoji: "🥤", name: "Coca-Cola 2L", price: "R$ 14,90" },
  { emoji: "🍨", name: "Açaí 500ml", price: "R$ 22,90" },
]

export default function LandingPage() {
  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.origin : ""
    if (navigator.share) {
      navigator.share({ title: "MenuJá - Crie sua loja online", url })
    } else {
      navigator.clipboard.writeText(url)
      alert("Link copiado!")
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md">📋</div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent tracking-tight">MenuJá</span>
          </Link>
          <div className="flex gap-1.5 items-center">
            <button onClick={handleShare} title="Compartilhar"
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition">Entrar</Link>
            <Link href="/cadastro" className="px-4 py-2 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition shadow-sm">
              <span className="hidden sm:inline">Criar minha loja</span>
              <span className="sm:hidden">Criar loja</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-14 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
              🎁 14 dias grátis • sem cartão de crédito
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
              Crie sua loja online e venda para seus clientes
            </h1>
            <p className="text-lg md:text-xl text-rose-50/90 mb-8 max-w-xl mx-auto lg:mx-0">
              Simples, rápido e sem complicação. Tenha seu próprio cardápio digital e receba pedidos pelo WhatsApp em minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/cadastro" className="px-8 py-4 bg-white text-rose-600 rounded-xl font-bold text-lg hover:bg-rose-50 transition shadow-lg hover:-translate-y-0.5">
                🚀 Criar minha loja grátis
              </Link>
              <Link href="/login" className="px-8 py-4 border-2 border-white/80 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition">
                Entrar
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-rose-50/90">
              <span className="flex items-center gap-1.5">✅ Sem taxa de adesão</span>
              <span className="flex items-center gap-1.5">✅ Cancele quando quiser</span>
              <span className="flex items-center gap-1.5">✅ Suporte no WhatsApp</span>
            </div>
          </div>

          {/* Mock do app */}
          <div className="hidden lg:block">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-6 bg-white/10 rounded-[2.5rem] blur-2xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden text-gray-800 rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🍕</div>
                    <div>
                      <p className="font-bold leading-tight">Pizzaria do Zé</p>
                      <span className="text-[11px] bg-emerald-400/30 text-emerald-50 px-2 py-0.5 rounded-full">🟢 Aberta agora</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {previewItems.map((it) => (
                    <div key={it.name} className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl">{it.emoji}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-tight">{it.name}</p>
                        <p className="text-xs font-bold text-rose-600">{it.price}</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-sm font-bold">+</div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-2.5 flex items-center gap-2 font-medium">
                    <span className="animate-pulse">🔔</span> Novo pedido #128 recebido!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Segmentos */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-bold text-rose-600 uppercase tracking-wide mb-2">Para todo tipo de negócio</p>
          <h2 className="text-3xl font-extrabold mb-10">Ideal para qualquer tipo de negócio</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {segments.map((s, i) => (
              <div key={i} className="p-4 bg-gray-50 hover:bg-rose-50 rounded-2xl text-lg font-medium border border-gray-100 hover:border-rose-200 transition hover:-translate-y-0.5">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-rose-600 uppercase tracking-wide mb-2">Recursos</p>
            <h2 className="text-3xl font-extrabold">Tudo que você precisa</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-2xl mb-4 shadow-md">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-rose-600 uppercase tracking-wide mb-2">Em 5 passos</p>
            <h2 className="text-3xl font-extrabold">Como funciona</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-extrabold text-xl shadow-lg">
                  {i + 1}
                </div>
                <p className="mt-3 font-medium">{s}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/cadastro" className="inline-block px-8 py-4 bg-rose-600 text-white rounded-xl font-bold text-lg hover:bg-rose-700 transition shadow-lg hover:-translate-y-0.5">
              Começar agora
            </Link>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section className="py-16 px-4 bg-gradient-to-br from-rose-600 to-pink-500 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold mb-4">🎁 14 dias grátis para testar</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Escolha seu plano</h2>
            <p className="text-rose-100">Sem taxa de adesão • Cancele quando quiser</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 text-gray-800 shadow-xl flex flex-col h-full transition hover:-translate-y-1 ${
                  plan.popular ? "ring-4 ring-white/60 sm:-mt-4" : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-md">
                    MAIS POPULAR
                  </span>
                )}
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl mb-3">{plan.icon}</div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-extrabold">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
                  <span className="text-gray-500 text-sm">/{plan.period}</span>
                </div>
                {plan.savings ? (
                  <p className="text-xs font-semibold text-emerald-600 mt-1">💰 {plan.savings}</p>
                ) : (
                  <p className="text-xs text-transparent mt-1 select-none">.</p>
                )}
                <ul className="text-sm text-gray-600 space-y-2.5 my-5 flex-1">
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
                      ? "bg-rose-600 text-white hover:bg-rose-700 shadow-lg"
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

      {/* Depoimentos */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-rose-600 uppercase tracking-wide mb-2">Depoimentos</p>
            <h2 className="text-3xl font-extrabold">O que nossos clientes dizem</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                <div className="text-yellow-400 mb-3">⭐⭐⭐⭐⭐</div>
                <p className="text-gray-700 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-5">
                  <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center text-2xl`}>{t.avatar}</div>
                  <div>
                    <p className="font-bold leading-tight">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Pronto para aumentar suas vendas?</h2>
          <p className="text-gray-300 text-lg mb-8">Junte-se a centenas de lojistas que já estão vendendo mais com o MenuJá.</p>
          <Link href="/cadastro" className="inline-block px-10 py-4 bg-rose-600 text-white rounded-xl font-bold text-xl hover:bg-rose-700 transition shadow-lg hover:-translate-y-0.5">
            🚀 Começar agora — É grátis!
          </Link>
          <p className="mt-4 text-gray-400 text-sm">Sem cartão de crédito • Cancele quando quiser</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 px-4 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm">📋</div>
              <span className="text-lg font-extrabold text-white">MenuJá</span>
            </div>
            <p className="text-sm mt-2 max-w-xs">Seu cardápio digital e delivery em minutos.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 text-center sm:text-left">
            <div>
              <p className="text-white font-semibold mb-2">Comece agora</p>
              <Link href="/cadastro" className="block text-sm hover:text-rose-400 transition">Criar minha loja</Link>
              <Link href="/login" className="block text-sm hover:text-rose-400 transition mt-1">Entrar na conta</Link>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Suporte</p>
              <a href="https://wa.me/5533999421853?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20MenuJ%C3%A1" target="_blank" className="block text-sm hover:text-rose-400 transition">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-white/10 mt-8 pt-6 text-center text-xs">
          © 2026 MenuJá. Todos os direitos reservados. Desenvolvido por Helio Santos.
        </div>
      </footer>
    </div>
  )
}
