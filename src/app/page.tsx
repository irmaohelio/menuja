"use client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

const features = [
  { icon: "🏪", title: "Crie sua loja em minutos", desc: "Sem saber programação. Cadastre nome, logo e comece a vender." },
  { icon: "📦", title: "Produtos organizados", desc: "Categorias, fotos, preços, tamanhos e adicionais." },
  { icon: "🔔", title: "Pedidos em tempo real", desc: "Receba notificações instantâneas no painel e no celular." },
  { icon: "💬", title: "WhatsApp integrado", desc: "Seus clientes falam direto com você pelo WhatsApp." },
  { icon: "⏰", title: "Horários flexíveis", desc: "Abra e feche quando quiser. Controle total do funcionamento." },
  { icon: "📊", title: "Relatórios de vendas", desc: "Acompanhe pedidos, faturamento e performance da loja." },
]

const steps = [
  { num: "01", title: "Crie sua conta", desc: "Grátis por 14 dias" },
  { num: "02", title: "Configure sua loja", desc: "Nome, logo e cores" },
  { num: "03", title: "Cadastre produtos", desc: "Fotos, preços e categorias" },
  { num: "04", title: "Compartilhe o link", desc: "WhatsApp e redes sociais" },
  { num: "05", title: "Receba pedidos", desc: "Notificações instantâneas" },
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
      "Link personalizado",
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
    savings: "Economia de R$ 9,50",
    features: [
      "Produtos ilimitados",
      "Pedidos ilimitados",
      "Link personalizado",
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
    savings: "Economia de R$ 43,90",
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
  { emoji: "🍕", label: "Pizzaria" },
  { emoji: "🍔", label: "Lanches" },
  { emoji: "🌮", label: "Salgados" },
  { emoji: "🍱", label: "Marmitas" },
  { emoji: "🍨", label: "Açaí" },
  { emoji: "🎂", label: "Doces" },
  { emoji: "🍺", label: "Bebidas" },
  { emoji: "📦", label: "Outros" },
]

const testimonials = [
  { name: "Maria Silva", business: "Pizzaria do Zé", text: "Aumentei 40% nas vendas. Meus clientes adoram o cardápio digital!", avatar: "👩", rating: 5 },
  { name: "João Santos", business: "Açaí Tropical", text: "Em 10 minutos minha loja estava pronta. Simples demais!", avatar: "👨", rating: 5 },
  { name: "Ana Oliveira", business: "Lanche Express", text: "Melhor custo-benefício. Suporte rápido e sistema fácil.", avatar: "👩‍🍳", rating: 5 },
]

const previewItems = [
  { emoji: "🍕", name: "Pizza Margherita", price: "R$ 39,90", tag: null },
  { emoji: "🥤", name: "Coca-Cola 2L", price: "R$ 14,90", tag: null },
  { emoji: "🍨", name: "Açaí 500ml", price: "R$ 22,90", tag: "Popular" },
]

function CountUp({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const animate = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.origin : ""
    if (navigator.share) {
      navigator.share({ title: "MenuJá - Crie sua loja online", url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/25">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">MenuJá</span>
          </Link>
          <div className="flex gap-2 items-center">
            <Link href="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-gray-600 hover:text-rose-600 transition">Entrar</Link>
            <Link href="/cadastro" className="px-5 py-2.5 text-sm font-bold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition shadow-sm">
              Criar loja grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/80 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-rose-200/40 to-pink-200/40 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              14 dias grátis • sem cartão de crédito
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight mb-6">
              Seu cardápio digital{" "}
              <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">pronto em minutos</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Crie sua loja online, cadastre seus produtos e receba pedidos pelo WhatsApp. Simples, rápido e sem complicação.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/cadastro" className="group px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition shadow-xl shadow-gray-900/20 flex items-center justify-center gap-2">
                Começar agora
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="/login" className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition">
                Já tenho conta
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-gray-400">
              <span>✓ Sem taxa de adesão</span>
              <span>✓ Cancele quando quiser</span>
              <span>✓ Suporte no WhatsApp</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute -inset-8 bg-gradient-to-br from-rose-300/30 to-pink-300/30 rounded-[3rem] blur-2xl" />
              {/* Phone frame */}
              <div className="relative w-[300px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl shadow-gray-900/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  {/* App header */}
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-5 pt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl backdrop-blur-sm">🍕</div>
                      <div>
                        <p className="font-bold text-white text-sm leading-tight">Pizzaria do Zé</p>
                        <span className="text-[10px] bg-emerald-400/30 text-emerald-50 px-2 py-0.5 rounded-full font-medium">● Aberta agora</span>
                      </div>
                    </div>
                  </div>
                  {/* Products */}
                  <div className="p-4 space-y-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Destaques</p>
                    {previewItems.map((it) => (
                      <div key={it.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">{it.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight truncate">{it.name}</p>
                          <p className="text-xs font-bold text-rose-600 mt-0.5">{it.price}</p>
                        </div>
                        {it.tag && <span className="text-[9px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">{it.tag}</span>}
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold shrink-0">+</div>
                      </div>
                    ))}
                  </div>
                  {/* Notification */}
                  <div className="px-4 pb-5">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3 flex items-center gap-2.5 font-medium">
                      <span className="text-base animate-bounce">🔔</span>
                      <div>
                        <p className="font-bold">Novo pedido!</p>
                        <p className="text-emerald-600/70 text-[10px]">#128 • R$ 67,80</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="py-10 px-4 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900"><CountUp end={500} suffix="+" /></p>
              <p className="text-sm text-gray-500 mt-1 font-medium">Lojas criadas</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900"><CountUp end={12} suffix="k+" /></p>
              <p className="text-sm text-gray-500 mt-1 font-medium">Pedidos feitos</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900"><CountUp end={98} suffix="%" /></p>
              <p className="text-sm text-gray-500 mt-1 font-medium">Satisfação</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900"><CountUp end={5} suffix=" min" /></p>
              <p className="text-sm text-gray-500 mt-1 font-medium">Para configurar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Segmentos */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-3">Para todo tipo de negócio</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Qual é o seu?</h2>
          <p className="text-gray-500 mb-10 max-w-md mx-auto">Funciona para qualquer tipo de delivery ou cardápio digital.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {segments.map((s, i) => (
              <div key={i} className="group p-5 bg-gray-50 hover:bg-rose-50 rounded-2xl border border-gray-100 hover:border-rose-200 transition-all duration-300 cursor-default hover:-translate-y-1">
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-300">{s.emoji}</span>
                <p className="font-semibold text-gray-700 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-3">Recursos</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Tudo que você precisa</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">Ferramentas completas pra gerenciar seu negócio online.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {features.map((f, i) => (
              <div key={i} className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-1.5 text-gray-900">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Do zero ao primeiro pedido</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">5 passos simples. Nenhuma complicação.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center group">
                {i < steps.length - 1 && <div className="hidden md:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />}
                <div className="relative z-10 w-14 h-14 mx-auto rounded-2xl bg-gray-900 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-gray-900/20 group-hover:scale-105 group-hover:bg-rose-600 transition-all duration-300">
                  {s.num}
                </div>
                <p className="mt-3 font-bold text-gray-900 text-sm">{s.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-semibold mb-5 backdrop-blur-sm">
              🎁 14 dias grátis para testar
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Planos simples e transparentes</h2>
            <p className="text-gray-400 mt-3">Sem surpresas. Cancele quando quiser.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-7 text-gray-800 shadow-2xl flex flex-col h-full transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular ? "ring-2 ring-rose-500 sm:-mt-4 sm:mb-[-1rem]" : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg shadow-rose-500/30">
                    ⭐ MAIS POPULAR
                  </span>
                )}
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl mb-4">{plan.icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold text-gray-900">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
                  <span className="text-gray-400 text-sm">/{plan.period}</span>
                </div>
                {plan.savings ? (
                  <p className="text-xs font-semibold text-emerald-600 mt-2 bg-emerald-50 px-3 py-1 rounded-full inline-block">💰 {plan.savings}</p>
                ) : (
                  <p className="text-xs text-transparent mt-2 select-none">.</p>
                )}
                <ul className="text-sm text-gray-600 space-y-3 my-6 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2.5 items-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro"
                  className={`text-center px-6 py-3.5 rounded-xl font-bold transition-all duration-300 ${
                    plan.popular
                      ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-3">Depoimentos</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Quem usa, recomenda</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 hover:-translate-y-1">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">Pronto para vender mais?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">Junte-se a centenas de lojistas que já estão recebendo pedidos online.</p>
              <Link href="/cadastro" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg hover:bg-gray-100 transition shadow-xl">
                Começar agora — é grátis
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <p className="mt-4 text-gray-500 text-sm">14 dias grátis • Sem cartão de crédito</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 px-4 py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2.5 justify-center md:justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <span className="text-lg font-extrabold text-white">MenuJá</span>
              </div>
              <p className="text-sm mt-3 max-w-xs text-gray-500">Seu cardápio digital e delivery em minutos.</p>
            </div>
            <div className="flex gap-12 text-center md:text-left">
              <div>
                <p className="text-white font-semibold text-sm mb-3">Produto</p>
                <div className="space-y-2">
                  <Link href="/cadastro" className="block text-sm hover:text-rose-400 transition">Criar loja</Link>
                  <Link href="/login" className="block text-sm hover:text-rose-400 transition">Entrar</Link>
                  <Link href="/cadastro" className="block text-sm hover:text-rose-400 transition">Preços</Link>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-3">Suporte</p>
                <div className="space-y-2">
                  <a href="https://wa.me/5533999421853?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20MenuJ%C3%A1" target="_blank" rel="noopener noreferrer" className="block text-sm hover:text-rose-400 transition">WhatsApp</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-10 pt-8 text-center text-xs text-gray-600">
            © 2026 MenuJá. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}