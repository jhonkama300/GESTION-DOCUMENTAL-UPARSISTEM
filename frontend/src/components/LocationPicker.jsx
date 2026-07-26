import { useEffect, useRef, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Controller } from 'react-hook-form'
import { PAISES } from '../utils/colombia.js'
import { fieldInputClass } from '../utils/styles.js'

export default function LocationPicker({ control, name, label, required, error, defaultValue }) {
  const [paisCode, setPaisCode] = useState(defaultValue?.paisCode || '')
  const [deptoCode, setDeptoCode] = useState(defaultValue?.deptoCode || '')
  const [search, setSearch] = useState('')
  const op = useRef(null)
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
    fieldInternal.onChange?.({ target: { value: text, name } })
  }

  const selectPais = (code) => {
    setPaisCode(code)
    setDeptoCode('')
  }

  const selectDepto = (code) => {
    setDeptoCode(code)
  }

  const selectCiudad = (ciudad) => {
    const text = `${pais.name} - ${ciudad} - ${depto.name}`
    commit(text)
  }

  // ── Smart click: navega al paso correcto según el nivel
  const handleClick = (type, value, parentPais, parentDepto) => {
    if (type === 'ciudad' && parentPais && parentDepto) {
      setPaisCode(parentPais.code)
      setDeptoCode(parentDepto.code)
      const text = `${parentPais.name} - ${value} - ${parentDepto.name}`
      commit(text)
    } else if (type === 'depto' && parentPais) {
      setPaisCode(parentPais.code)
      setDeptoCode(value.code)
    } else if (type === 'pais') {
      selectPais(value.code)
    }
  }

  const clear = () => {
    setPaisCode('')
    setDeptoCode('')
    fieldInternal.onChange?.({ target: { value: '', name } })
  }

  const q = search.toLowerCase().trim()

  // ── Resultados unificados: país, departamento, ciudad
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
          if (c.toLowerCase().includes(q)) {
            matchesCiudades.push({ ciudad: c, depto: d, pais: p })
          }
        })
      }
    })
  })
  const deptosFiltrados = q
    ? matchesDeptos
    : (pais ? pais.departamentos.map((d) => ({ depto: d, pais })) : [])

  const hasMatches = matchesPaises.length + matchesDeptos.length + matchesCiudades.length > 0
  const showUnified = !!q && (matchesPaises.length || matchesDeptos.length || matchesCiudades.length)

  const displayValue = depto && pais
    ? `${depto.name} - ${pais.name}`
    : pais
      ? pais.name
      : ''

  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
        <i className="pi pi-map-marker text-[10px] text-brand-600" />
        {label} {required && <span className="text-rose-500">*</span>}
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
                className={`${fieldInputClass} flex items-center justify-between gap-2 text-left ${error ? 'border-rose-400' : ''}`}
              >
                <span className="flex items-center gap-2 truncate">
                  {pais ? (
                    <>
                      <span className="text-base">{pais.flag}</span>
                      <span className="text-sm font-medium truncate">
                        {field.value || displayValue || (depto ? `${depto.name}, ${pais.name}` : pais.name)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <i className="pi pi-search text-xs" />
                      Buscar país, departamento o ciudad...
                    </span>
                  )}
                </span>
                <i className="pi pi-chevron-down text-[10px] text-slate-400 shrink-0" />
              </button>
              <input type="hidden" {...field} value={field.value ?? ''} />

              <OverlayPanel ref={op} className="w-[22rem] max-w-[92vw] p-0" showCloseIcon={false} dismissable>
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Seleccionar ubicación
                  </p>
                  <div className="relative">
                    <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <InputText
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Escribe país, depto o ciudad..."
                      className="w-full pl-9 text-sm"
                      autoFocus
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <i className="pi pi-times text-xs" />
                      </button>
                    )}
                  </div>
                  {q && (
                    <p className="text-[10px] text-slate-500">
                      <i className="pi pi-bolt text-amber-500 mr-1" />
                      Click en una ciudad para selección rápida
                    </p>
                  )}
                </div>

                <div className="max-h-[22rem] overflow-y-auto">
                  {/* ── Modo búsqueda global (con texto) */}
                  {showUnified && (
                    <div className="p-2 space-y-3">
                      {/* Ciudades — selección rápida */}
                      {matchesCiudades.length > 0 && (
                        <div>
                          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
                            <i className="pi pi-map text-[9px]" />
                            Ciudades ({matchesCiudades.length})
                          </p>
                          <div className="space-y-0.5">
                            {matchesCiudades.slice(0, 8).map((m, i) => (
                              <button
                                key={`${m.pais.code}-${m.depto.code}-${m.ciudad}-${i}`}
                                type="button"
                                onClick={() => handleClick('ciudad', m.ciudad, m.pais, m.depto)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors group"
                              >
                                <i className="pi pi-map-marker text-[10px] text-slate-400 group-hover:text-brand-600" />
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                  {m.ciudad}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate">
                                  · {m.depto.name}, {m.pais.name}
                                </span>
                                <i className="pi pi-arrow-right text-[10px] text-slate-300 ml-auto opacity-0 group-hover:opacity-100" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Departamentos */}
                      {matchesDeptos.length > 0 && (
                        <div>
                          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <i className="pi pi-map text-[9px]" />
                            Departamentos ({matchesDeptos.length})
                          </p>
                          <div className="grid grid-cols-2 gap-0.5">
                            {matchesDeptos.slice(0, 12).map((m, i) => (
                              <button
                                key={`${m.pais.code}-${m.depto.code}-${i}`}
                                type="button"
                                onClick={() => handleClick('depto', m.depto, m.pais)}
                                className="text-left px-2 py-1.5 rounded-md text-[12px] text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors flex items-center gap-1"
                              >
                                <i className="pi pi-map text-[9px] text-slate-400" />
                                {m.depto.name}
                                <span className="text-[9px] text-slate-400 truncate ml-auto">
                                  {m.pais.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Países */}
                      {matchesPaises.length > 0 && (
                        <div>
                          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <i className="pi pi-globe text-[9px]" />
                            Países ({matchesPaises.length})
                          </p>
                          <div className="grid grid-cols-2 gap-0.5">
                            {matchesPaises.map((p) => (
                              <button
                                key={p.code}
                                type="button"
                                onClick={() => handleClick('pais', p)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                              >
                                <span className="text-base">{p.flag}</span>
                                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">
                                  {p.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Modo manual step-by-step (sin búsqueda) */}
                  {!showUnified && (
                    <>
                      {/* Step 1: País */}
                      {!paisCode && (
                  <div className="p-1.5">
                      {matchesPaises.map((p) => (
                        <button
                          key={p.code}
                          type="button"
                          onClick={() => handleClick('pais', p)}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <span className="text-base">{p.flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                            <p className="text-[9px] text-slate-500">{p.departamentos.length} departamentos</p>
                          </div>
                          <i className="pi pi-chevron-right text-[10px] text-slate-400" />
                        </button>
                      ))}
                    </div>
                      )}

                      {/* Step 2: Departamento */}
                      {paisCode && !deptoCode && (
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => { setPaisCode(''); setSearch('') }}
                            className="mb-2 text-[11px] font-semibold text-brand-600 hover:underline flex items-center gap-1"
                          >
                            <i className="pi pi-arrow-left text-[10px]" />
                            Cambiar país: {pais.flag} {pais.name}
                          </button>
                          <div className="grid grid-cols-2 gap-1">
                            {deptosFiltrados.map((m, i) => (
                              <button
                                key={`${m.pais.code}-${m.depto.code}-${i}`}
                                type="button"
                                onClick={() => handleClick('depto', m.depto, m.pais)}
                                className="text-left px-3 py-2 rounded-md text-[12px] text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                              >
                                <i className="pi pi-map-marker text-[9px] mr-1 text-slate-400" />
                                {m.depto.name}
                                <span className="text-[10px] text-slate-400 ml-1">({m.depto.ciudades.length})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Ciudad */}
                      {paisCode && deptoCode && ciudades.length > 0 && (
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => { setDeptoCode(''); setSearch('') }}
                            className="mb-2 text-[11px] font-semibold text-brand-600 hover:underline flex items-center gap-1"
                          >
                            <i className="pi pi-arrow-left text-[10px]" />
                            Cambiar depto: {depto.name}
                          </button>
                          <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto">
                            {ciudades.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => selectCiudad(c)}
                                className="text-left px-3 py-2 rounded-md text-[12px] text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-700 transition-colors flex items-center gap-1.5"
                              >
                                <i className="pi pi-map text-[9px] text-slate-400" />
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {paisCode && deptoCode && ciudades.length === 0 && (
                        <div className="p-6 text-center text-sm text-slate-500">
                          Este departamento no tiene ciudades registradas.
                        </div>
                      )}
                    </>
                  )}

                  {/* Sin resultados */}
                  {q && !hasMatches && (
                    <div className="p-8 text-center text-sm text-slate-500">
                      <i className="pi pi-search text-2xl text-slate-300 block mb-2" />
                      Sin resultados para "{search}"
                    </div>
                  )}
                </div>

                {pais && (
                  <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <p className="text-[11px] text-slate-500">
                      {depto
                        ? `${depto.ciudades.length} ciudades en ${depto.name}`
                        : `${deptos.length} departamentos en ${pais.name}`}
                    </p>
                    <button
                      type="button"
                      onClick={clear}
                      className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1"
                    >
                      <i className="pi pi-times text-[9px]" />
                      Limpiar
                    </button>
                  </div>
                )}
              </OverlayPanel>
            </>
          )
        }}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error.message}</p>}
    </div>
  )
}
