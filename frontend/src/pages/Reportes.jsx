import { useState } from 'react'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import PageHeader from '../components/PageHeader.jsx'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler, ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler, ArcElement,
)

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
}

const dataEmpleados = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'],
  datasets: [
    { label: 'Ingresos', data: [5, 8, 4, 10, 7, 12, 6, 9, 11, 8, 5], backgroundColor: 'rgba(168, 207, 69, 0.8)', borderRadius: 4 },
    { label: 'Retiros', data: [2, 3, 1, 4, 2, 5, 3, 2, 4, 3, 2], backgroundColor: 'rgba(244, 63, 94, 0.7)', borderRadius: 4 },
  ],
}

const dataContratos = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [{
    data: [12, 18, 22, 15, 28, 32],
    borderColor: '#A8CF45',
    backgroundColor: 'rgba(168, 207, 69, 0.18)',
    fill: true,
    tension: 0.4,
  }],
}

const dataAreas = {
  labels: ['Tecnología', 'Operaciones', 'Comercial', 'Financiera', 'RRHH', 'Marketing'],
  datasets: [{
    data: [24, 18, 15, 12, 9, 7],
    backgroundColor: ['#A8CF45', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'],
    borderWidth: 0,
  }],
}

export default function Reportes() {
  const [periodo, setPeriodo] = useState({ label: 'Últimos 6 meses', value: '6m' })

  return (
    <div>
      <PageHeader
        icon="pi-chart-bar"
        title="Reportes"
        subtitle="Indicadores y métricas de gestión humana"
        actions={
          <div className="flex gap-2">
            <Dropdown
              value={periodo}
              options={[
                { label: 'Este mes', value: '1m' },
                { label: 'Últimos 3 meses', value: '3m' },
                { label: 'Últimos 6 meses', value: '6m' },
                { label: 'Este año', value: '1y' },
              ]}
              onChange={(e) => setPeriodo(e.value)}
              className="w-44"
            />
            <Button label="Exportar PDF" icon="pi pi-file-pdf" outlined size="small" />
            <Button label="Exportar Excel" icon="pi pi-file-excel" severity="info" size="small" />
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Empleados', value: 85, change: '+8.5%', positive: true },
          { label: 'Contratos', value: 78, change: '+12%', positive: true },
          { label: 'Rotación', value: '4.2%', change: '-0.8%', positive: true },
          { label: 'Antigüedad prom.', value: '3.4 años', change: '+0.3', positive: true },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-1">{s.value}</p>
            <p className={`text-[11px] mt-1 ${s.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <i className={`pi ${s.positive ? 'pi-arrow-up' : 'pi-arrow-down'} text-[9px]`} /> {s.change} vs período anterior
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Ingresos vs retiros</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Movimiento de personal mensual</p>
          <div className="h-72"><Bar data={dataEmpleados} options={options} /></div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Tendencia de contratos</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Contratos generados por mes</p>
          <div className="h-72"><Line data={dataContratos} options={options} /></div>
        </div>
      </div>

      <div className="card p-5 mt-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Distribución por área</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Headcount organizacional</p>
        <div className="h-72 max-w-md mx-auto"><Doughnut data={dataAreas} options={{ ...options, cutout: '65%' }} /></div>
      </div>
    </div>
  )
}
