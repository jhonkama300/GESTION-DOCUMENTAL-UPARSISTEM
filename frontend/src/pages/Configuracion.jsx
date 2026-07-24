import { useState } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputSwitch } from 'primereact/inputswitch'
import { Dropdown } from 'primereact/dropdown'
import PageHeader from '../components/PageHeader.jsx'

export default function Configuracion() {
  const [emailNotif, setEmailNotif] = useState(true)
  const [otpSms, setOtpSms] = useState(true)
  const [hashAlg, setHashAlg] = useState({ label: 'SHA-256', value: 'sha256' })
  const [theme, setTheme] = useState('auto')

  const Section = ({ icon, title, desc, children }) => (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300 flex items-center justify-center">
          <i className={`pi ${icon}`} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )

  const Row = ({ label, hint, children }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</p>
        {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
      {children}
    </div>
  )

  return (
    <div>
      <PageHeader
        icon="pi-cog"
        title="Configuración"
        subtitle="Parámetros generales del sistema"
        actions={<Button label="Guardar cambios" icon="pi pi-save" severity="info" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon="pi-building" title="Información de la empresa" desc="Datos mostrados en contratos y documentos">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Razón social</label>
            <InputText value="GTH S.A.S" className="w-full" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">NIT</label>
            <InputText value="900.123.456-7" className="w-full" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Representante legal</label>
            <InputText value="Juan Pérez" className="w-full" />
          </div>
        </Section>

        <Section icon="pi-bell" title="Notificaciones" desc="Cómo y cuándo se notifica al equipo">
          <Row label="Notificaciones por email" hint="Enviar alertas a usuarios">
            <InputSwitch checked={emailNotif} onChange={(e) => setEmailNotif(e.value)} />
          </Row>
          <Row label="OTP por SMS" hint="Para firma electrónica de contratos">
            <InputSwitch checked={otpSms} onChange={(e) => setOtpSms(e.value)} />
          </Row>
        </Section>

        <Section icon="pi-shield" title="Seguridad" desc="Configuración criptográfica y autenticación">
          <Row label="Algoritmo de hash" hint="Para firma de documentos">
            <Dropdown
              value={hashAlg}
              options={[
                { label: 'SHA-256', value: 'sha256' },
                { label: 'SHA-512', value: 'sha512' },
              ]}
              onChange={(e) => setHashAlg(e.value)}
              className="w-32"
            />
          </Row>
          <Row label="Expiración de sesión" hint="Minutos de inactividad">
            <InputText value="60" className="w-20 text-center" />
          </Row>
          <Row label="Doble factor (2FA)" hint="Para usuarios administradores">
            <InputSwitch checked={true} />
          </Row>
        </Section>

        <Section icon="pi-palette" title="Apariencia" desc="Personaliza la interfaz">
          <Row label="Tema" hint="Automático sigue el sistema">
            <Dropdown
              value={theme}
              options={[
                { label: 'Automático', value: 'auto' },
                { label: 'Claro', value: 'light' },
                { label: 'Oscuro', value: 'dark' },
              ]}
              onChange={(e) => setTheme(e.value)}
              className="w-32"
            />
          </Row>
          <Row label="Color principal" hint="Identidad de marca">
            <div className="flex gap-1.5">
              {['#A8CF45', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((c) => (
                <button key={c} className="w-7 h-7 rounded-full ring-2 ring-white shadow" style={{ background: c }} />
              ))}
            </div>
          </Row>
        </Section>
      </div>
    </div>
  )
}
