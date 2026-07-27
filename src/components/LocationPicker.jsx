import { useEffect, useRef, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Controller } from 'react-hook-form'
import { PAISES } from '../utils/colombia.js'

/* Paleta para badge del toggle — gradiente brand consistente con el resto */
const COUNTRY_PALETTE = {
  CO: 'bg-gradient-to-br from-brand-500 to-brand-700',
  VE: 'bg-gradient-to-br from-amber-500 to-amber-700',
  EC: 'bg-gradient-to-br from-amber-500 to-amber-700',
  PE: 'bg-gradient-to-br from-rose-500 to-rose-700',
  BR: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
  AR: 'bg-gradient-to-br from-cyan-500 to-cyan-700',
  MX: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
  US: 'bg-gradient-to-br from-blue-500 to-blue-700',
  ES: 'bg-gradient-to-br from-amber-500 to-amber-700',
}

/* ── Formato del valor guardado:
     "Colombia - Valledupar - Cesar"  (País - Ciudad - Depto)        ── */
function formatLocationDisplay(value) {
  if (!value) return ''
  const parts = String(value).split(' - ').map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 3) return `${parts[1]} - ${parts[2]} - ${parts[0]}`  // Ciudad - Depto - País
  if (parts.length === 2) return `${parts[1]} - ${parts[0]}`                // Depto - País
  if (parts.length === 1) return parts[0]
  return ''
}

export default function LocationPicker({ control, name, label, required, error, defaultValue }) {
  const [paisCode, setPaisCode] = useState(defaultValue?.paisCode || '')
  const [deptoCode, setDeptoCode] = useState(defaultValue?.deptoCode || '')
  const [search, setSearch] = useState('')
  const op = useRef(null)
  const [hovered, setHovered] = useState('')
  let fieldInternal = { onChange: null }

  const pais = PAISES.find((p) => p.code === paisCode)
  const deptos = pais?.departamentos || []
  const depto = deptos.find((d) => d.code === deptoCode)
  const ciudades = depto?.ciudades || []

  useEffect(() => {
    if (!paisCode) return
    if (deptoCode && !deptos.find((d) => d.code === deptoCode)) {
      setDeptoCode('')
    }
  }, [paisCode])

  const commit = (text) => {
    op.current?.hide()
    setSearch('')
    setHovered('')
    fieldInternal.onChange?.({ target: { value: text, name } })
  }

  const selectPais = (p) => setPaisCode(p.code)
  const selectDepto = (d) => setDeptoCode(d.code)

  const selectCiudad = (c) => commit(`${pais?.name || ''} - ${c} - ${depto?.name || ''}`)

  // Navegación inteligente
  const handleClick = (type, value, parentPais, parentDepto) => {
    if (type === 'ciudad' && parentPais && parentDepto) {
      setPaisCode(parentPais.code)
      setDeptoCode(parentDepto.code)
      commit(`${parentPais.name} - ${value} - ${parentDepto.name}`)
    } else if (type === 'depto' && parentPais) {
      setPaisCode(parentPais.code)
      setDeptoCode(value.code)
    } else if (type === 'pais') {
      selectPais(value)
    }
  }

  const goBackPais = () => { setPaisCode(''); setDeptoCode(''); setHovered('') }
  const goBackDepto = () => { setDeptoCode(''); setHovered('') }

  const clear = () => {
    setPaisCode('')
    setDeptoCode('')
    setHovered('')
    fieldInternal.onChange?.({ target: { value: '', name } })
  }

  const q = search.toLowerCase().trim()

  // Búsqueda unificada
  const matchesPaises = !q ? PAISES : PAISES.filter((p) => p.name.toLowerCase().includes(q))
  const matchesDeptos = []
  const matchesCiudades = []
  PAISES.forEach((p) => {
    p.departamentos.forEach((d) => {
      if (!q || d.name.toLowerCase().includes(q)) {
        matchesDeptos.push({ depto: d, pais: p })
      }
      if (q) {
        d.ciudades.forEach((c) => {
          if (c.toLowerCase().includes(q)) matchesCiudades.push({ ciudad: c, depto: d, pais: p })
        })
      }
    })
  })
  const deptosFiltrados = q
    ? matchesDeptos
    : (pais ? pais.departamentos.map((d) => ({ depto: d, pais })) : [])

  const hasMatches = matchesPaises.length + matchesDeptos.length + matchesCiudades.length > 0
  const showUnified = !!q && (matchesPaises.length || matchesDeptos.length || matchesCiudades.length)

  // Etapas: 1 = país, 2 = depto, 3 = ciudad
  const stage = !paisCode ? 1 : !deptoCode ? 2 : 3

  const stageTitle = {
    1: 'Selecciona un país',
    2: 'Selecciona un departamento',
    3: 'Selecciona una ciudad',
  }[stage]

  const stageSub = (() => {
    if (stage === 1) return 'Origen geográfico · país de nacimiento'
    if (stage === 2) return pais ? `${pais.flag} ${pais.name}` : ''
    if (stage === 3 && pais && depto) return `${pais.flag} ${pais.name} · ${depto.name}`
    return ''
  })()

  const stageCount = {
    1: PAISES.length,
    2: deptos.length,
    3: ciudades.length,
  }[stage]

  const badgeClass = pais ? (COUNTRY_PALETTE[pais.code] || 'bg-gradient-to-br from-slate-500 to-slate-700') : 'bg-slate-300 dark:bg-slate-600'

  /* ── Stepper crumbs ── */
  const Stepper = () => (
    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
      <span className={stage >= 1 ? 'text-brand-700 dark:text-brand-300 font-bold' : ''}>1. País</span>
      <i className="pi pi-angle-right text-[8px]" />
      <span className={stage >= 2 ? 'text-brand-700 dark:text-brand-300 font-bold' : ''}>2. Depto</span>
      <i className="pi pi-angle-right text-[8px]" />
      <span className={stage >= 3 ? 'text-brand-700 dark:text-brand-300 font-bold' : ''}>3. Ciudad</span>
    </div>
  )

  /* ── Tarjeta seleccionable — patrón EntityPopoverField ── */
  const PickCard = ({ isSel, isHover, onClick, onMouseEnter, onMouseLeave, badge, title, sub, rightLabel, rightValue, palette }) => (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`w-full text-left rounded-lg p-2.5 flex items-center gap-3 transition border ${
        isSel
          ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-700 ring-2 ring-brand-200 dark:ring-brand-800'
          : isHover
            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            : 'bg-transparent border-transparent'
      }`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm ${palette || 'bg-gradient-to-br from-brand-500 to-brand-700'}`}>
        {badge}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{title}</p>
          {isSel && <i className="pi pi-check-circle text-brand-600 dark:text-brand-400 text-xs" />}
        </div>
        {sub && <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{sub}</p>}
      </div>
      {rightLabel && (
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 leading-tight">{rightLabel}</p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{rightValue}</p>
        </div>
      )}
    </button>
  )

  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
        <i className="pi pi-map-marker text-[10px] text-brand-600" />
        {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        rules={required ? { required: 'Requerido' } : {}}
        render={({ field }) => {
          fieldInternal = field
          return (
            <>
              <button
                type="button"
                onClick={(e) => op.current?.toggle(e)}
                className={`w-full text-left rounded-xl border-2 transition px-3.5 py-3 flex items-center gap-3 ${
                  field.value || pais
                    ? 'border-brand-300 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-700'
                    : 'border-slate-200 bg-white dark:bg-slate-800/60 dark:border-slate-700 hover:border-slate-300'
                } ${error ? 'border-rose-400 dark:border-rose-600' : ''}`}
              >
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl shrink-0 shadow-sm ${badgeClass}`}>
                  {pais?.flag || '?'}
                </span>
                <div className="flex-1 min-w-0">
                  {(() => {
                    if (field.value) {
                      return (
                        <>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {formatLocationDisplay(field.value) || (depto && pais ? `${depto.name}, ${pais.name}` : '')}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {depto ? `${ciudades.length} ciudades disponibles` : 'Selecciona una ciudad'}
                          </p>
                        </>
                      )
                    }
                    if (depto && pais) {
                      return (
                        <>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {`${depto.name}, ${pais.name}`}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {`${ciudades.length} ciudades disponibles`}
                          </p>
                        </>
                      )
                    }
                    if (pais) {
                      return (
                        <>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {`${pais.flag || ''} ${pais.name}`}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {`${pais.departamentos.length} departamentos disponibles`}
                          </p>
                        </>
                      )
                    }
                    return (
                      <>
                        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">{label}…</p>
                        <p className="text-[11px] text-slate-400">Click para seleccionar país</p>
                      </>
                    )
                  })()}
                </div>
                <i className={`pi ${(field.value || pais || depto) ? 'pi-pencil' : 'pi-chevron-down'} text-[10px] text-slate-400 shrink-0`} />
              </button>
              <input type="hidden" {...field} value={field.value ?? ''} />

              <OverlayPanel ref={op} showCloseIcon={false} className="location-popover" style={{ width: 480 }}>
                <div className="-m-4">
                  {/* Header con stepper */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-brand-50/60 to-white dark:from-brand-900/20 dark:to-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{stageTitle}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{stageSub}</p>
                        <Stepper />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-900/40 px-2 py-1 rounded">
                        {stageCount} opciones
                      </span>
                    </div>
                  </div>

                  {/* Buscador (solo cuando hay selección de país) */}
                  {paisCode && !showUnified && (
                    <div className="px-3 pt-3">
                      <div className="relative">
                        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <InputText
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Buscar..."
                          className="w-full pl-9 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Buscador global (sin país) */}
                  {!paisCode && (
                    <div className="px-3 pt-3">
                      <div className="relative">
                        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <InputText
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Buscar país, depto o ciudad..."
                          className="w-full pl-9 text-sm"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  <div className="px-3 pb-2 pt-2 max-h-72 overflow-y-auto">
                    {/* MODO BÚSQUEDA GLOBAL */}
                    {showUnified && (
                      <div className="space-y-3">
                        {matchesCiudades.length > 0 && (
                          <div>
                            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
                              <i className="pi pi-map text-[9px]" />
                              Ciudades ({matchesCiudades.length})
                            </p>
                            <div className="space-y-1">
                              {matchesCiudades.slice(0, 6).map((m, i) => (
                                <PickCard
                                  key={`c-${m.pais.code}-${m.depto.code}-${m.ciudad}-${i}`}
                                  isSel={false}
                                  isHover={false}
                                  onClick={() => handleClick('ciudad', m.ciudad, m.pais, m.depto)}
                                  badge={<i className="pi pi-map-marker text-xs" />}
                                  title={m.ciudad}
                                  sub={`${m.depto.name}, ${m.pais.name}`}
                                  rightLabel="Ir"
                                  rightValue={<i className="pi pi-arrow-right text-xs" />}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {matchesDeptos.length > 0 && (
                          <div>
                            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <i className="pi pi-map text-[9px]" />
                              Departamentos ({matchesDeptos.length})
                            </p>
                            <div className="grid grid-cols-2 gap-1">
                              {matchesDeptos.slice(0, 8).map((m, i) => (
                                <PickCard
                                  key={`d-${m.pais.code}-${m.depto.code}-${i}`}
                                  isSel={false}
                                  isHover={false}
                                  onClick={() => handleClick('depto', m.depto, m.pais)}
                                  badge={<i className="pi pi-map text-[10px]" />}
                                  title={m.depto.name}
                                  sub={m.pais.name}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {matchesPaises.length > 0 && (
                          <div>
                            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <i className="pi pi-globe text-[9px]" />
                              Países ({matchesPaises.length})
                            </p>
                            <div className="grid grid-cols-2 gap-1">
                              {matchesPaises.map((p) => (
                                <PickCard
                                  key={`p-${p.code}`}
                                  isSel={false}
                                  isHover={false}
                                  onClick={() => handleClick('pais', p)}
                                  badge={<span className="text-base">{p.flag}</span>}
                                  title={p.name}
                                  sub={`${p.departamentos.length} deptos`}
                                  palette={COUNTRY_PALETTE[p.code] || 'bg-gradient-to-br from-slate-500 to-slate-700'}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ETAPA 1: País */}
                    {!showUnified && stage === 1 && (
                      <div className="space-y-1">
                        {matchesPaises.map((p) => (
                          <PickCard
                            key={`ps-${p.code}`}
                            isSel={false}
                            isHover={hovered === p.code}
                            onMouseEnter={() => setHovered(p.code)}
                            onMouseLeave={() => setHovered('')}
                            onClick={() => handleClick('pais', p)}
                            badge={<span className="text-base">{p.flag}</span>}
                            title={p.name}
                            sub={`${p.departamentos.length} departamentos`}
                            rightLabel="Deptos"
                            rightValue={p.departamentos.length}
                            palette={COUNTRY_PALETTE[p.code] || 'bg-gradient-to-br from-slate-500 to-slate-700'}
                          />
                        ))}
                      </div>
                    )}

                    {/* ETAPA 2: Departamento */}
                    {!showUnified && stage === 2 && (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={goBackPais}
                          className="mb-2 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
                        >
                          <i className="pi pi-arrow-left text-[10px]" />
                          Cambiar país: <span className="text-base">{pais?.flag}</span> {pais?.name}
                        </button>
                        {deptosFiltrados.map((m) => (
                          <PickCard
                            key={`ds-${m.pais.code}-${m.depto.code}`}
                            isSel={false}
                            isHover={hovered === m.depto.code}
                            onMouseEnter={() => setHovered(m.depto.code)}
                            onMouseLeave={() => setHovered('')}
                            onClick={() => handleClick('depto', m.depto, m.pais)}
                            badge={<i className="pi pi-map text-xs" />}
                            title={m.depto.name}
                            sub={`${m.depto.ciudades.length} ciudades`}
                            rightLabel="Ciudades"
                            rightValue={m.depto.ciudades.length}
                          />
                        ))}
                      </div>
                    )}

                    {/* ETAPA 3: Ciudad */}
                    {!showUnified && stage === 3 && (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={goBackDepto}
                          className="mb-2 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
                        >
                          <i className="pi pi-arrow-left text-[10px]" />
                          Cambiar depto: {depto?.name}
                        </button>
                        {ciudades.map((c) => (
                          <PickCard
                            key={`cs-${c}`}
                            isSel={false}
                            isHover={hovered === c}
                            onMouseEnter={() => setHovered(c)}
                            onMouseLeave={() => setHovered('')}
                            onClick={() => selectCiudad(c)}
                            badge={<i className="pi pi-map-marker text-xs" />}
                            title={c}
                            sub={`${pais?.name} · ${depto?.name}`}
                            rightLabel="Sel."
                            rightValue={<i className="pi pi-check text-xs" />}
                          />
                        ))}
                        {ciudades.length === 0 && (
                          <div className="p-6 text-center text-sm text-slate-500">
                            <i className="pi pi-info-circle text-2xl text-slate-300 block mb-2" />
                            Este departamento no tiene ciudades registradas.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sin resultados de búsqueda */}
                    {q && !hasMatches && (
                      <div className="p-8 text-center text-sm text-slate-500">
                        <i className="pi pi-search text-2xl text-slate-300 block mb-2" />
                        Sin resultados para "{search}"
                      </div>
                    )}
                  </div>

                  {/* Footer Vista rápida */}
                  <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                        Vista rápida
                      </span>
                      <div className="flex-1 grid grid-cols-3 gap-2 text-[11px]">
                        <div className="rounded px-2 py-1 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 leading-tight">País</p>
                          <p className="text-xs font-bold leading-tight text-slate-700 dark:text-slate-200 truncate">
                            {pais ? `${pais.flag} ${pais.name}` : '—'}
                          </p>
                        </div>
                        <div className="rounded px-2 py-1 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 leading-tight">Depto</p>
                          <p className="text-xs font-bold leading-tight text-slate-700 dark:text-slate-200 truncate">
                            {depto ? depto.name : '—'}
                          </p>
                        </div>
                        <div className="rounded px-2 py-1 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 leading-tight">Ciudad</p>
                          <p className="text-xs font-bold leading-tight text-slate-700 dark:text-slate-200 truncate">
                            {field.value?.split(' - ')?.[1] || '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <i className="pi pi-info-circle" />
                        Navega país → depto → ciudad o usa el buscador
                      </span>
                      {(pais || field.value) && (
                        <button
                          type="button"
                          onClick={clear}
                          className="text-rose-500 hover:text-rose-700 font-bold inline-flex items-center gap-1"
                        >
                          <i className="pi pi-times text-[9px]" />
                          Limpiar
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              </OverlayPanel>
            </>
          )
        }}
      />
      {error && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><i className="pi pi-exclamation-circle" />{error.message}</p>}
    </div>
  )
}
