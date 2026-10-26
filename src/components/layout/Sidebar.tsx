import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  TableProperties,
  FileSpreadsheet,
  Database,
  Sliders,
  ChevronRight,
  ShieldCheck,
  FileQuestion,
  Layers,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 'dashboard' | 'new_case' | 'explorer' | 'followups' | 'configurator' | 'reports' | 'migration';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  totalCasesCount: number;
  followUpsCount?: number;
  onOpenFieldConfigurator: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  totalCasesCount,
  followUpsCount,
  onOpenFieldConfigurator,
}) => {
  const { user } = useAuth();

  const NAV_ITEMS: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }> = [
    {
      id: 'dashboard',
      label: 'Métricas (BI)',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'new_case',
      label: 'Registrar Caso',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      id: 'explorer',
      label: 'Base de Casos',
      icon: <TableProperties className="w-4 h-4" />,
      badge: totalCasesCount,
    },
    {
      id: 'followups',
      label: 'Seguimientos & Alertas',
      icon: <Bell className="w-4 h-4" />,
      badge: followUpsCount,
    },
    {
      id: 'configurator',
      label: 'Configurar Formulario',
      icon: <Sliders className="w-4 h-4" />,
      badge: 'Campos',
    },
    {
      id: 'reports',
      label: 'Reportes & Exportar',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      id: 'migration',
      label: 'Migración Histórica',
      icon: <Database className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#161c36] text-white p-4 flex flex-col shrink-0 border-r border-slate-800 shadow-md">
      {/* Brand in Sidebar */}
      <div className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm text-white shadow-md">
          XP
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-wide text-white leading-tight">
            SICUREZZA <span className="text-cyan-400">XP</span>
          </h1>
          <span className="text-[10px] text-slate-400 font-medium">
            Gestión ATC & Analítica
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1.5 flex-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 py-1 block">
          Módulos
        </span>

        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-cyan-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Info Card */}
      <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 mb-1 text-cyan-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-bold text-[11px]">Usuario Único Maestro</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Acceso total a métricas, registros, edición de preguntas y exportación.
          </p>
        </div>

        <div className="text-[10px] text-slate-500 text-center font-mono pt-1">
          SICUREZZA XP · v2.4 (Perú)
        </div>
      </div>
    </aside>
  );
};
