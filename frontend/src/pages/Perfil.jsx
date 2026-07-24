import { useState } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputMask } from 'primereact/inputmask'
import { TabView, TabPanel } from 'primereact/tabview'
import { Avatar } from 'primereact/avatar'
import { Tag } from 'primereact/tag'
import { ToggleButton } from 'primereact/togglebutton'
import { useAuth } from '../context/AuthContext.jsx'
import { initials } from '../utils/format.js'
import { fieldInputClass } from '../utils/styles.js'

export default function Perfil() {
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [data, setData] = useState({
    nombre: user?.name || 'Administrador',
    email: user?.email || 'admin@gth.com',
    telefono: '+57 300 123 4567',
    cargo: 'Director de Talento Humano',
    area: 'Talento Humano',
    sede: 'Bogotá',
  })
  const [pwd, setPwd] = useState({ actual: '', nueva: '', confirma: '' })
  const [notif, setNotif] = useState({ email: true, sms: false, push: true, venc: true })

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }))

  return (
    <div>
      <div className="card overflow-hidden mb-4">
        <div
          className="h-32 relative"
          style={{ background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)' }}
        >
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots-p" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots-p)" />
            </svg>
          </div>
        </div>
        <div className="px-6 pb-5 -mt-14 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="relative">
            <Avatar
              label={initials(data.nombre)}
              shape="circle"
              size="xlarge"
              className="bg-white text-brand-700 ring-4 ring-white dark:ring-slate-800"
              style={{ width: 100, height: 100, fontSize: 32 }}
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-600 hover:text-brand-600">
              <i className="pi pi-camera text-xs" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.nombre}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {data.cargo} · {data.area} · {data.sede}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Tag value={user?.role || 'Administrador'} severity="success" rounded />
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">Activo desde mar 2024</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button label="Cancelar" outlined size="small" />
            <Button label="Guardar cambios" icon="pi pi-save" severity="info" size="small" />
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <TabView activeIndex={tab} onTabChange={(e) => setTab(e.index)}>
          <TabPanel header="Información personal" leftIcon="pi pi-user mr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              <Field label="Nombre completo">
                <InputText value={data.nombre} onChange={(e) => update('nombre', e.target.value)} className={fieldInputClass} />
              </Field>
              <Field label="Correo electrónico">
                <InputText value={data.email} onChange={(e) => update('email', e.target.value)} className={fieldInputClass} />
              </Field>
              <Field label="Teléfono">
                <InputMask value={data.telefono} onChange={(e) => update('telefono', e.target.value)} mask="+57 999 999 9999" className={fieldInputClass} />
              </Field>
              <Field label="Cargo">
                <InputText value={data.cargo} onChange={(e) => update('cargo', e.target.value)} className={fieldInputClass} />
              </Field>
              <Field label="Área">
                <InputText value={data.area} onChange={(e) => update('area', e.target.value)} className={fieldInputClass} />
              </Field>
              <Field label="Sede">
                <InputText value={data.sede} onChange={(e) => update('sede', e.target.value)} className={fieldInputClass} />
              </Field>
            </div>
          </TabPanel>

          <TabPanel header="Seguridad" leftIcon="pi pi-shield mr-2">
            <div className="space-y-4 p-2 max-w-md">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Cambiar contraseña</h3>
              <Field label="Contraseña actual">
                <InputText type="password" value={pwd.actual} onChange={(e) => setPwd({ ...pwd, actual: e.target.value })} className={fieldInputClass} />
              </Field>
              <Field label="Nueva contraseña">
                <InputText type="password" value={pwd.nueva} onChange={(e) => setPwd({ ...pwd, nueva: e.target.value })} className={fieldInputClass} />
              </Field>
              <Field label="Confirmar contraseña">
                <InputText type="password" value={pwd.confirma} onChange={(e) => setPwd({ ...pwd, confirma: e.target.value })} className={fieldInputClass} />
              </Field>
              <Button label="Actualizar contraseña" icon="pi pi-lock" severity="info" size="small" />
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="space-y-3 pt-2">
                <Row title="Autenticación 2FA" desc="Código extra al iniciar sesión">
                  <ToggleButton checked={true} onChange={() => {}} onLabel="Activo" offLabel="Inactivo" />
                </Row>
                <Row title="Cerrar sesión en otros dispositivos" desc="Por seguridad al cambiar contraseña">
                  <Button label="Cerrar" outlined severity="danger" size="small" />
                </Row>
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Notificaciones" leftIcon="pi pi-bell mr-2">
            <div className="space-y-3 p-2">
              <Row title="Notificaciones por email" desc="Recibe alertas en tu correo corporativo">
                <ToggleButton checked={notif.email} onChange={(e) => setNotif({ ...notif, email: e.value })} onLabel="Activado" offLabel="Desactivado" />
              </Row>
              <Row title="Notificaciones SMS" desc="Para firmas electrónicas urgentes">
                <ToggleButton checked={notif.sms} onChange={(e) => setNotif({ ...notif, sms: e.value })} onLabel="Activado" offLabel="Desactivado" />
              </Row>
              <Row title="Notificaciones push" desc="En el navegador cuando estés conectado">
                <ToggleButton checked={notif.push} onChange={(e) => setNotif({ ...notif, push: e.value })} onLabel="Activado" offLabel="Desactivado" />
              </Row>
              <Row title="Alertas de vencimiento" desc="Documentos por vencer en 7 días">
                <ToggleButton checked={notif.venc} onChange={(e) => setNotif({ ...notif, venc: e.value })} onLabel="Activado" offLabel="Desactivado" />
              </Row>
            </div>
          </TabPanel>

          <TabPanel header="Actividad" leftIcon="pi pi-history mr-2">
            <ul className="space-y-3 p-2">
              {[
                { a: 'Inicio de sesión', f: '2025-11-12 10:24', ip: '192.168.1.10' },
                { a: 'Firmaste contrato de Carlos Méndez', f: '2025-11-11 16:20' },
                { a: 'Actualizaste tu perfil', f: '2025-10-28 11:05' },
                { a: 'Subiste documento de identidad', f: '2025-09-15 14:48' },
                { a: 'Cambiaste tu contraseña', f: '2025-08-20 09:15' },
              ].map((x, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="text-slate-700 dark:text-slate-300 flex-1">{x.a}</span>
                  <span className="text-xs text-slate-400">{x.f}</span>
                </li>
              ))}
            </ul>
          </TabPanel>
        </TabView>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  )
}

function Row({ title, desc, children }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
      {children}
    </div>
  )
}
