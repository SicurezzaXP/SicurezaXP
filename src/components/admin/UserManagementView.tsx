import React from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  Check,
  X,
  UserCheck,
  Building2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, ROLE_PERMISSIONS } from '../../types/user';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  store: string;
  status: 'Activo' | 'Inactivo';
}

const MOCK_TEAM: UserRecord[] = [
  {
    id: 'u1',
    name: 'Admin SAC Sicurezza',
    email: 'administrador@sicurezza.pe',
    role: 'admin',
    store: 'Central / Todas',
    status: 'Activo',
  },
  {
    id: 'u2',
    name: 'Analista de BI - SAC',
    email: 'analitica@sicurezza.pe',
    role: 'analyst',
    store: 'Central / Todas',
    status: 'Activo',
  },
  {
    id: 'u3',
    name: 'Valeria Castro - SAC',
    email: 'valeria.castro@sicurezza.pe',
    role: 'agent',
    store: 'Jockey Plaza',
    status: 'Activo',
  },
  {
    id: 'u4',
    name: 'Luciana Torres - SAC',
    email: 'luciana.torres@sicurezza.pe',
    role: 'agent',
    store: 'Real Plaza Salaverry',
    status: 'Activo',
  },
  {
    id: 'u5',
    name: 'Rodrigo Huamán - SAC',
    email: 'rodrigo.huaman@sicurezza.pe',
    role: 'agent',
    store: 'Tienda Online / E-commerce',
    status: 'Activo',
  },
];

export const UserManagementView: React.FC = () => {
  const { user, role, setDemoRole } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900">
              Administración de Usuarios, Roles y Permisos (RBAC)
            </h2>
            <p className="text-xs text-stone-400">
              Control de acceso basado en roles para el equipo de Atención al Cliente de Sicurezza
            </p>
          </div>
        </div>

        {/* Quick Role Tester */}
        <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-xl border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 pl-2">
            Simular Rol Activo:
          </span>
          <button
            type="button"
            onClick={() => setDemoRole('admin')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setDemoRole('analyst')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              role === 'analyst'
                ? 'bg-[#E88069] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Analista
          </button>
          <button
            type="button"
            onClick={() => setDemoRole('agent')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              role === 'agent'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Registrador
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900">
            Personal Registrado en el Sistema SAC
          </h3>
          <span className="text-xs text-stone-400">
            {MOCK_TEAM.length} usuarios autorizados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="px-5 py-3">Nombre / Asesor</th>
                <th className="px-5 py-3">Correo Corporativo</th>
                <th className="px-5 py-3">Rol Asignado</th>
                <th className="px-5 py-3">Sede de Acceso</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {MOCK_TEAM.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="px-5 py-3 font-semibold text-stone-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-stone-400" />
                    {u.name}
                  </td>
                  <td className="px-5 py-3 text-stone-500 font-mono">
                    {u.email}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : u.role === 'analyst'
                          ? 'bg-rose-50 text-[#E88069] border-rose-200'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {u.role === 'admin' ? 'Administrador' : u.role === 'analyst' ? 'Analista' : 'Registrador'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-stone-700">
                    {u.store}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#E88069]" />
          Matriz de Privilegios por Rol
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 font-semibold text-[11px]">
              <tr>
                <th className="p-3">Funcionalidad / Acción</th>
                <th className="p-3 text-center">Administrador</th>
                <th className="p-3 text-center">Analista</th>
                <th className="p-3 text-center">Registrador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="p-3 font-medium text-stone-800">Registrar Casos en Formulario</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-800">Visualizar Dashboard BI & Gráficos</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-stone-300 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-800">Exportar a Excel y CSV</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-stone-300 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-800">Editar Cualquier Registro</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-stone-300 mx-auto" /></td>
                <td className="p-3 text-center text-stone-500 text-[10px]">Solo propios/estado</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-800">Archivar Casos (Soft Delete)</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-stone-300 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-stone-300 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-800">Migración Masiva de Históricos</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-stone-300 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-stone-300 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-800">Configuración de Campos y Firebase</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-stone-300 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-stone-300 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
