/* Service worker do MenuJá: notificações push de novos pedidos */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// Alguns navegadores exigem um handler de fetch para considerar o app instalável.
// Deixamos o navegador seguir o fluxo normal (sem interceptar as requisições).
self.addEventListener('fetch', () => {})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'MenuJá', body: event.data ? event.data.text() : '' }
  }
  const title = data.title || '🔔 Novo pedido!'
  const options = {
    body: data.body || 'Você recebeu um novo pedido.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'menuja-order',
    renotify: true,
    data: { url: data.url || '/admin/pedidos' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/admin/pedidos'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes('/admin') && 'focus' in w) return w.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
