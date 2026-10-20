const day = 86_400_000

export const now = () => new Date()
export const iso = (d: Date) => d.toISOString()
export const daysAgo = (n: number, hour = 17) => {
  const d = new Date(Date.now() - n * day)
  d.setHours(hour, 12, 0, 0)
  return d.toISOString()
}
export const daysFrom = (n: number) => {
  const d = new Date(Date.now() + n * day)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

const short = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const long = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

export const fmtDate = (v: string | Date) => short.format(new Date(v))
export const fmtLong = (v: string | Date) => long.format(new Date(v))
export const fmtTime = (v: string | Date) => time.format(new Date(v))

export function relative(v: string | Date) {
  const diff = Math.round((+startOfDay(new Date()) - +startOfDay(new Date(v))) / day)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff > 1 && diff < 7) return `${diff} days ago`
  if (diff < 0) {
    const n = -diff
    return n === 1 ? 'Tomorrow' : n < 7 ? `In ${n} days` : fmtDate(v)
  }
  return fmtDate(v)
}

export function startOfDay(d: Date) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

export function daysUntil(v: string | Date) {
  return Math.round((+startOfDay(new Date(v)) - +startOfDay(new Date())) / day)
}

export function greeting() {
  const h = new Date().getHours()
  return h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
export const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`
