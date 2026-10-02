export type BusinessHourLike = {
  dayOfWeek: number
  isOpen: boolean
  openTime?: string | null
  closeTime?: string | null
  openTime2?: string | null
  closeTime2?: string | null
}

// Returns the current day-of-week and minutes-since-midnight in America/Sao_Paulo,
// independent of the runtime timezone (works on Vercel/UTC and in the browser).
export function getBrazilNow(at: Date = new Date()) {
  const brazilTime = new Date(at.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  return {
    dayOfWeek: brazilTime.getDay(),
    currentTime: brazilTime.getHours() * 60 + brazilTime.getMinutes(),
  }
}

function isWithinShift(currentTime: number, open?: string | null, close?: string | null) {
  if (!open || !close) return false
  const [openH, openM] = open.split(':').map(Number)
  const [closeH, closeM] = close.split(':').map(Number)
  if ([openH, openM, closeH, closeM].some((n) => Number.isNaN(n))) return false
  const openMin = openH * 60 + openM
  const closeMin = closeH * 60 + closeM
  return currentTime >= openMin && currentTime < closeMin
}

// Whether the store is inside its configured business hours right now.
// Returns false when there are no hours configured or the current day is marked closed.
export function isWithinBusinessHours(businessHours: BusinessHourLike[] | null | undefined, at: Date = new Date()) {
  if (!businessHours || businessHours.length === 0) return false

  const { dayOfWeek, currentTime } = getBrazilNow(at)
  const todayHours = businessHours.find((h) => h.dayOfWeek === dayOfWeek)
  if (!todayHours || !todayHours.isOpen) return false

  return (
    isWithinShift(currentTime, todayHours.openTime, todayHours.closeTime) ||
    isWithinShift(currentTime, todayHours.openTime2, todayHours.closeTime2)
  )
}
