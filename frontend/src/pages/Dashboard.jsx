import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import PageHeader from '../components/PageHeader.jsx'
import KpiCard from '../components/KpiCard.jsx'
import { KpiSkeleton } from '../components/Skeleton.jsx'
import { dashboardService } from '../services/mock.data.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useSede } from '../context/SedeContext.jsx'
import { formatDate } from '../utils/format.js'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler,
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.95)',
      padding: 10,
      cornerRadius: 8,
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(148,163,184,0.15)' },
      ticks: { color: '#94a3b8', font: { size: 11 } },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } },
  },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { currentSede } = useSede()
  const [kpis, setKpis] = useState(null)
  const [actividad, setActividad] = useState([])
  const [charts, setCharts] = useState(null)

  useEffect(() => {
    if (!currentSede) return
    dashboardService.kpis(currentSede.id).then(setKpis)
    dashboardService.actividad().then(setActividad)
    dashboardService.charts(currentSede.id).then(setCharts)
  }, [currentSede])

  const empleadosPorArea = charts ? {
    labels: charts.empleadosPorArea.map((c) => c.area),
    datasets: [{
      data: charts.empleadosPorArea.map((c) => c.total),
      backgroundColor: 'rgba(168, 207, 69, 0.85)',
      hoverBackgroundColor: 'rgba(168, 207, 69, 1)',
      borderRadius: 6,
      maxBarThickness: 28,
    }],
  } : null

  const contratosPorMes = charts ? {
    labels: charts.contratosPorMes.map((c) => c.mes),
    datasets: [
      {
        label: 'Generados',
        data: charts.contratosPorMes.map((c) => c.generados),
        borderColor: '#A8CF45',
        backgroundColor: 'rgba(168, 207, 69, 0.18)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Firmados',
        data: charts.contratosPorMes.map((c) => c.firmados),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.10)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  } : null

  const distribucionSedes = charts ? {
    labels: charts.distribucionSedes.map((s) => s.sede),
    datasets: [{
      data: charts.distribucionSedes.map((s) => s.total),
      backgroundColor: ['#A8CF45', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }],
  } : null

  return (
    <div>
      <PageHeader
        title={`Hola, ${user?.name?.split(' ')[0] || ''} 👋`}
        subtitle={`Resumen de ${currentSede?.nombre || 'la sede'} · hoy`}
        actions={
          <div className="flex gap-2">
            <Button label="Exportar" icon="pi pi-download" outlined size="small" />
            <Button label="Nuevo contrato" icon="pi pi-plus" severity="info" size="small" />
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis ? (
          <>
            <KpiCard icon="pi-users" label="Empleados activos" value={kpis.empleadosActivos} color="brand" trend={{ positive: true, value: '+4 este mes' }} />
            <KpiCard icon="pi-file-edit" label="Contratos vigentes" value={kpis.contratosVigentes} color="emerald" trend={{ positive: true, value: '+12%' }} />
            <KpiCard icon="pi-verified" label="Certificaciones" value={kpis.certificaciones} color="violet" />
            <KpiCard icon="pi-folder-open" label="Documentos" value={kpis.documentos} color="amber" />
            <KpiCard icon="pi-clock" label="Por vencer" value={kpis.proximosVencer} color="rose" trend={{ positive: false, value: 'Atención' }} />
          </>
        ) : (
          Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Contratos por mes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Generados vs firmados en los últimos 6 meses</p>
            </div>
            <Tag value="+18%" severity="success" rounded />
          </div>
          <div className="h-64 mt-4">
            {contratosPorMes && <Line data={contratosPorMes} options={chartOptions} />}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Distribución por sede física</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Empleados activos</p>
          <div className="h-64 mt-4">
            {distribucionSedes && <Doughnut data={distribucionSedes} options={doughnutOptions} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Empleados por área</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribución organizacional</p>
            </div>
            <Link to="/empleados" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              Ver todos <i className="pi pi-arrow-right text-xs" />
            </Link>
          </div>
          <div className="h-64">
            {empleadosPorArea && <Bar data={empleadosPorArea} options={chartOptions} />}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Actividad reciente</h3>
          <ul className="space-y-3 max-h-72 overflow-y-auto">
            {actividad.map((a) => (
              <li key={a.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
                  {a.usuario.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 dark:text-slate-100">
                    <span className="font-medium">{a.usuario}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{a.accion}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{a.fecha}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Próximos vencimientos</h3>
            <Tag value="6" severity="warning" rounded />
          </div>
          <ul className="space-y-2">
            {[
              { tipo: 'Contrato', nombre: 'Carlos Méndez', dias: 5, sev: 'rose' },
              { tipo: 'Certificación', nombre: 'SOAT Vehículo #3', dias: 8, sev: 'amber' },
              { tipo: 'Examen médico', nombre: 'Diego Ramírez', dias: 12, sev: 'amber' },
              { tipo: 'Curso SST', nombre: 'Andrés López', dias: 18, sev: 'emerald' },
              { tipo: 'Contrato', nombre: 'Sofía Castro', dias: 25, sev: 'emerald' },
            ].map((v, i) => (
              <li
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full bg-${v.sev}-500`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{v.nombre}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{v.tipo}</p>
                </div>
                <span className={`badge bg-${v.sev}-50 text-${v.sev}-700 dark:bg-${v.sev}-900/30 dark:text-${v.sev}-300`}>
                  {v.dias} días
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Accesos rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/empleados', icon: 'pi-user-plus', label: 'Nuevo empleado', color: 'from-brand-500 to-brand-700' },
              { to: '/contratos', icon: 'pi-file-edit', label: 'Crear contrato', color: 'from-emerald-500 to-emerald-700' },
              { to: '/plantillas', icon: 'pi-clone', label: 'Plantillas', color: 'from-amber-500 to-amber-600' },
              { to: '/documentos', icon: 'pi-upload', label: 'Subir documento', color: 'from-rose-500 to-rose-600' },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-sm transition-all"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${a.color} text-white flex items-center justify-center`}>
                  <i className={`pi ${a.icon}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-300">
                    {a.label}
                  </p>
                </div>
                <i className="pi pi-arrow-right text-xs text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
