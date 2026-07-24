import { useState } from 'react'
import { Button } from 'primereact/button'
import { InputTextarea } from 'primereact/inputtextarea'
import { Tag } from 'primereact/tag'
import PageHeader from '../components/PageHeader.jsx'

const FAQS = [
  { q: '¿Cómo genero un contrato desde una plantilla?', a: 'Ve a Contratos > Nuevo > Selecciona plantilla > Completa variables > Vista previa > Generar. El sistema generará el PDF y lo enviará a firma electrónica.' },
  { q: '¿Cómo firmo un documento electrónicamente?', a: 'Ve a Firma Electrónica > Selecciona documento pendiente > Ingresa OTP > Dibuja tu firma en el canvas > Confirma. Recibirás un PDF firmado con hash SHA-256.' },
  { q: '¿Qué pasa si un empleado olvida su contraseña?', a: 'En la pantalla de login, haz click en "¿Olvidaste tu contraseña?" e ingresa el email. Recibirás un enlace de recuperación válido por 30 minutos.' },
  { q: '¿Cómo cambio el rol de un usuario?', a: 'Solo los Administradores pueden: Ve a Usuarios > Selecciona > Editar > Cambia el rol en el dropdown > Guardar.' },
  { q: '¿Puedo ver el historial de cambios de un documento?', a: 'Sí, en Documentos > Click en cualquier archivo > Sección "Historial de versiones" muestra todas las versiones anteriores con opción de restaurar.' },
  { q: '¿Cómo exporto un reporte a PDF?', a: 'En Reportes > Click en "Exportar PDF" (esquina superior). El sistema generará un PDF con todos los gráficos y métricas del período.' },
]

const SHORTCUTS = [
  { keys: ['⌘', 'K'], desc: 'Abrir command palette' },
  { keys: ['G', 'D'], desc: 'Ir al dashboard' },
  { keys: ['G', 'E'], desc: 'Ir a empleados' },
  { keys: ['G', 'C'], desc: 'Ir a contratos' },
  { keys: ['N', 'C'], desc: 'Nuevo contrato' },
  { keys: ['N', 'E'], desc: 'Nuevo empleado' },
  { keys: ['?'], desc: 'Mostrar atajos' },
  { keys: ['Esc'], desc: 'Cerrar diálogos' },
]

export default function Ayuda() {
  const [open, setOpen] = useState(0)
  const [msg, setMsg] = useState('')

  return (
    <div>
      <PageHeader
        icon="pi-question-circle"
        title="Ayuda y Soporte"
        subtitle="Documentación, atajos y contacto con el equipo"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── FAQs */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <i className="pi pi-comments text-brand-600" />
            Preguntas frecuentes
          </h2>
          <div className="space-y-2">
            {FAQS.map((f, i) => (
              <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{f.q}</span>
                  <i className={`pi ${open === i ? 'pi-chevron-up' : 'pi-chevron-down'} text-xs text-slate-400`} />
                </button>
                {open === i && (
                  <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Lateral */}
        <div className="space-y-4">
          {/* Atajos */}
          <div className="card p-5">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <i className="pi pi-bolt text-amber-500" />
              Atajos de teclado
            </h2>
            <ul className="space-y-2">
              {SHORTCUTS.map((s, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{s.desc}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, j) => (
                      <kbd key={j} className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)',
              boxShadow: '0 8px 20px -6px rgba(135,168,55,0.5)',
            }}
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative">
              <h3 className="font-bold mb-1">¿Necesitas ayuda?</h3>
              <p className="text-xs text-white/85 mb-3">
                Nuestro equipo responde en menos de 24h.
              </p>
              <InputTextarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={3}
                placeholder="Cuéntanos tu duda..."
                className="w-full text-sm rounded-lg border-0"
              />
              <Button
                label="Enviar mensaje"
                icon="pi pi-send"
                className="w-full mt-2 border-0 bg-white text-brand-700 font-semibold hover:bg-slate-50"
                size="small"
                onClick={() => { setMsg(''); alert('Mensaje enviado') }}
              />
              <div className="mt-3 pt-3 border-t border-white/20 text-[11px] space-y-1">
                <p className="flex items-center gap-2">
                  <i className="pi pi-envelope" /> soporte@gth.com
                </p>
                <p className="flex items-center gap-2">
                  <i className="pi pi-phone" /> +57 601 555 1234
                </p>
                <p className="flex items-center gap-2">
                  <i className="pi pi-clock" /> Lun-Vie 8am-6pm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
