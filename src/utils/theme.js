// ── Paletas de colores por sede
//     Cada sede define su paleta brand completa (50-900).
//     Login y selector de sedes usan colores fijos (no dinámico).

export const SEDE_THEMES = {
  1: {
    name: 'Uparsistem',
    brand: {
      50:  '247 252 233',
      100: '238 249 210',
      200: '220 242 165',
      300: '203 236 120',
      400: '185 229 91',
      500: '168 207 69',
      600: '135 168 55',
      700: '103 129 42',
      800: '74 92 30',
      900: '47 58 19',
    },
    primary: '#A8CF45',
    primaryDark: '#87a837',
    primaryText: '#ffffff',
  },
  2: {
    name: 'Jeanpiaget',
    brand: {
      50:  '252 228 236',
      100: '248 187 208',
      200: '244 143 177',
      300: '240 98 146',
      400: '236 64 122',
      500: '233 30 99',
      600: '216 27 96',
      700: '194 24 91',
      800: '173 20 87',
      900: '136 14 79',
    },
    primary: '#e91e63',
    primaryDark: '#c2185b',
    primaryText: '#ffffff',
  },
}

export const DEFAULT_THEME = SEDE_THEMES[1]

export function getThemeBySedeId(sedeId) {
  return SEDE_THEMES[sedeId] || DEFAULT_THEME
}

// ── Aplica el tema al documento (CSS variables)
export function applyThemeToDocument(theme) {
  const root = document.documentElement
  Object.entries(theme.brand).forEach(([shade, color]) => {
    root.style.setProperty(`--brand-${shade}`, color)
  })
  root.style.setProperty('--brand-primary', theme.primary)
  root.style.setProperty('--brand-primary-dark', theme.primaryDark)
  root.style.setProperty('--brand-primary-text', theme.primaryText)
}

export function resetThemeToDocument() {
  const root = document.documentElement
  Object.keys(DEFAULT_THEME.brand).forEach((shade) => {
    root.style.removeProperty(`--brand-${shade}`)
  })
  root.style.removeProperty('--brand-primary')
  root.style.removeProperty('--brand-primary-dark')
  root.style.removeProperty('--brand-primary-text')
}
