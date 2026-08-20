"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useNotifications } from "@/lib/use-notifications"

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "🔔" },
  { href: "/admin/produtos", label: "Produtos", icon: "📦" },
  { href: "/admin/categorias", label: "Categorias", icon: "📁" },
  { href: "/admin/sorvete", label: "Sorvete", icon: "🍦" },
  { href: "/admin/configuracoes", label: "Config.", icon: "⚙️" },
  { href: "/admin/planos", label: "Planos", icon: "💎" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showStoreMenu, setShowStoreMenu] = useState(false)
  const [trial, setTrial] = useState<any>(null)
  const { unread, notifications, markAllRead } = useNotifications()

  useEffect(() => {
    fetch("/api/auth/me", { credentials: 'include', cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!data.success) { setAuthError(true); setTimeout(() => router.push("/login"), 500); return }
        setUser(data.user)
        setStore(data.store)
        setLoading(false)
      })
      .catch(() => { setAuthError(true); setTimeout(() => router.push("/login"), 500) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetch("/api/trial/status").then(r => r.json()).then(data => {
      if (data.success) setTrial(data)
    })
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const toggleStore = async () => {
    const res = await fetch("/api/store/toggle", { method: "POST" })
    const data = await res.json()
    if (data.success) setStore({ ...store, isOpen: data.isOpen })
  }

  const copyStoreLink = () => {
    const text = `${window.location.origin}/loja/${store?.slug}`
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0"
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    try { document.execCommand("copy") } catch {}
    document.body.removeChild(ta)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading && !authError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
      <p className="text-sm text-gray-400">Carregando...</p>
    </div>
  )

  if (authError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <p className="text-4xl">🔒</p>
      <p className="text-gray-500 text-sm">Sessão expirada. Redirecionando...</p>
    </div>
  )

  // Block access if trial expired and not on plans page
  if (trial?.isBlocked && pathname !== "/admin/planos") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <p className="text-6xl">⛔</p>
        <h1 className="text-2xl font-bold text-red-600">Período de teste expirado</h1>
        <p className="text-gray-500 text-center max-w-md">
          Seu período de teste gratuito de 7 dias acabou. Para continuar usando o MenuJá e recebendo pedidos, escolha um plano.
        </p>
        <Link
          href="/admin/planos"
          className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition"
        >
          Escolher Plano
        </Link>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600 mt-2">
          Sair da conta
        </button>
      </div>
    )
  }

  const storeLink = store?.slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/loja/${store.slug}` : ""

  return (
    <div className="min-h-screen bg-gray-50" style={{ "--primary": store?.primaryColor || "#e11d48", "--secondary": store?.secondaryColor || "#f0abfc", "--btn": store?.buttonColor || "#e11d48" } as any}>
      {/* ===== TOP BAR ===== */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Lado esquerdo */}
          <span className="text-lg font-bold truncate max-w-[160px] sm:max-w-none" style={{ color: "var(--primary)" }}>
            🏪 {store?.name || "Minha Loja"}
          </span>

          {/* Lado direito */}
          <div className="flex items-center gap-2">
            {/* Notificações */}
            <div className="relative">
              <button onClick={() => { setShowNotif(!showNotif); setShowStoreMenu(false) }} className="relative p-1">
                <span className="text-xl">🔔</span>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border max-h-96 overflow-y-auto z-50"
                  onClick={e => e.stopPropagation()}>
                  <div className="p-3 border-b flex items-center justify-between">
                    <span className="font-bold text-sm">Notificações</span>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-xs" style={{ color: "var(--primary)" }}>Marcar como lidas</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-gray-400 text-sm">Nenhuma notificação</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b text-sm ${!n.isRead ? "bg-rose-50" : ""}`}>
                        <p className="font-medium">{n.title}</p>
                        {n.message && <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>}
                        <p className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleString("pt-BR")}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Menu da loja (mobile) */}
            <div className="relative lg:hidden">
              <button onClick={() => { setShowStoreMenu(!showStoreMenu); setShowNotif(false) }}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition ${
                  store?.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                {store?.isOpen ? "🟢" : "🔴"}
              </button>
              {showStoreMenu && (
                <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-lg border z-50 p-2 space-y-1">
                  <button onClick={() => { toggleStore(); setShowStoreMenu(false) }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                    {store?.isOpen ? "🔴 Fechar loja" : "🟢 Abrir loja"}
                  </button>
                  {store?.slug && (
                    <a href={`/loja/${store.slug}`} target="_blank"
                      className="block px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                      👁️ Ver loja
                    </a>
                  )}
                  <button onClick={() => { copyStoreLink(); setShowStoreMenu(false) }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                    {copied ? "✅ Link copiado!" : "🔗 Copiar link da loja"}
                  </button>
                  <hr />
                  <button onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    🚪 Sair
                  </button>
                </div>
              )}
            </div>

            {/* Desktop actions */}
            <button onClick={toggleStore}
              className={`hidden lg:inline-flex px-3 py-1.5 rounded-full text-sm font-medium transition ${
                store?.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
              {store?.isOpen ? "🟢 Aberta" : "🔴 Fechada"}
            </button>
            {store?.slug && (
              <a href={`/loja/${store.slug}`} target="_blank" className="hidden lg:inline text-sm text-gray-500">Ver loja ↗</a>
            )}
            <button onClick={handleLogout} className="hidden lg:inline text-sm text-gray-500 hover:text-red-600">Sair</button>
          </div>
        </div>
      </header>

      {/* ===== DESKTOP: Sidebar ===== */}
      <div className="hidden lg:flex">
        <aside className="sticky top-[52px] left-0 h-[calc(100vh-52px)] w-64 bg-white border-r overflow-y-auto">
          {store?.slug && (
            <div className="p-4 border-b">
              <p className="text-xs text-gray-500 mb-1">Link da sua loja</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1.5 rounded flex-1 truncate select-all" title={storeLink}>
                  /loja/{store.slug}
                </code>
                <button
                  onClick={copyStoreLink}
                  className={`text-xs font-medium px-2 py-1 rounded transition ${
                    copied ? "bg-green-100 text-green-700" : "hover:bg-gray-50"
                  }`}>
                  {copied ? "✓ Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
          )}
          <nav className="p-3 space-y-1">
            {menuItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  pathname === item.href ? "text-white" : "text-gray-700 hover:bg-gray-50"
                }`} style={pathname === item.href ? { backgroundColor: "var(--primary)" } : {}}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6 max-w-5xl min-h-[calc(100vh-52px)]">
          {children}
        </main>
      </div>

      {/* ===== MOBILE: Content + Bottom Nav ===== */}
      <div className="lg:hidden">
        <main className="p-4 pb-20">
          {children}
        </main>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex safe-area-bottom">
          {menuItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`flex-1 flex flex-col items-center py-2 pt-2.5 transition ${
                  active ? "" : "text-gray-400"
                }`} style={active ? { color: "var(--primary)" } : {}}>
                <span className="text-lg leading-none">{item.icon}</span>
                <span className={`text-[10px] mt-0.5 font-medium ${active ? "" : "text-gray-400"}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
