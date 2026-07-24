import { useAuth } from '../context/AuthContext.jsx'

export { useAuth }

export const ROLES = {
  ADMIN: 'Administrador',
  RRHH: 'RRHH',
  SUPERVISOR: 'Supervisor',
  EMPLEADO: 'Empleado',
}

export const hasRole = (user, ...roles) =>
  !!user && roles.includes(user.role)
