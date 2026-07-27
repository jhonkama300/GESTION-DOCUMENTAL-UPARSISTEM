export const formatDate = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export const formatCurrency = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n || 0)

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

export const avatarColor = (name = '') => {
  const palette = [
    { bg: 'bg-brand-100 dark:bg-brand-900/40',     text: 'text-brand-700 dark:text-brand-300' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
    { bg: 'bg-amber-100 dark:bg-amber-900/40',     text: 'text-amber-700 dark:text-amber-300' },
    { bg: 'bg-violet-100 dark:bg-violet-900/40',   text: 'text-violet-700 dark:text-violet-300' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/40',       text: 'text-cyan-700 dark:text-cyan-300' },
    { bg: 'bg-rose-100 dark:bg-rose-900/40',       text: 'text-rose-700 dark:text-rose-300' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/40',   text: 'text-indigo-700 dark:text-indigo-300' },
    { bg: 'bg-teal-100 dark:bg-teal-900/40',       text: 'text-teal-700 dark:text-teal-300' },
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return palette[hash % palette.length]
}
