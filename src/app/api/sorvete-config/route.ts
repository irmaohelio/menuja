import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULT_CONFIG = {
  sabores: [
    { name: 'Chocolate', color: '#5C3317' },
    { name: 'Morango', color: '#FF6B6B' },
    { name: 'Creme', color: '#FFFDD0' },
    { name: 'Pistache', color: '#93C572' },
    { name: 'Napolitano', color: '#FFB6C1' },
  ],
  coberturas: [
    { name: 'Calda de Groselha', color: '#8B0000' },
    { name: 'Calda de Morango', color: '#FF1493' },
    { name: 'Calda de Chocolate', color: '#3E2723' },
  ],
  extras: [
    { name: 'Granola', price: 3 },
    { name: 'Leite Condensado', price: 3 },
    { name: 'Chocolate Granulado', price: 4 },
    { name: 'Amendoim', price: 3 },
    { name: 'Banana', price: 2 },
  ],
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json({ error: 'storeId required' }, { status: 400 })
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { sorveteConfig: true },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const config = store.sorveteConfig || DEFAULT_CONFIG
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching sorvete config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const store = await getCurrentStore()
    if (!store) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { config } = body

    if (!config) {
      return NextResponse.json({ error: 'config required' }, { status: 400 })
    }

    // Merge with existing config (preserve extras if not provided)
    const existing = (store.sorveteConfig as any) || DEFAULT_CONFIG
    const merged = { ...existing, ...config }

    await prisma.store.update({
      where: { id: store.id },
      data: { sorveteConfig: merged },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating sorvete config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
