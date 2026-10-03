import { del } from '@vercel/blob'

const isBlobUrl = (u?: string | null): u is string =>
  !!u && u.startsWith('http') && u.includes('blob.vercel-storage.com')

// Remove arquivos do Vercel Blob com segurança (ignora URLs que não são do Blob).
// Tenta em lote e, se falhar, cai para remoção individual.
export async function deleteBlobs(urls: (string | null | undefined)[]) {
  const list = urls.filter(isBlobUrl)
  if (list.length === 0) return 0

  try {
    await del(list)
    return list.length
  } catch (e) {
    console.log('[BLOB] Falha ao excluir em lote, tentando individual:', e)
    let removed = 0
    for (const url of list) {
      try { await del(url); removed++ } catch (err) { console.error('[BLOB] Falha ao excluir:', url, err) }
    }
    return removed
  }
}
