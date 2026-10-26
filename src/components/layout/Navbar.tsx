import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flame,
  Shield,
  User,
  Sliders,
  Sparkles,
  HelpCircle,
  Database,
  Download,
  Github,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenFirebaseModal: () => void;
  onOpenFieldConfigurator: () => void;
  onOpenDownloadModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenFirebaseModal,
  onOpenFieldConfigurator,
  onOpenDownloadModal,
}) => {
  const { user, isFirebaseActive } = useAuth();
  const [peruTime, setPeruTime] = useState<string>('');

  // Clock America/Lima
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setPeruTime(timeStr);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Title (when sidebar collapsed or mobile) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#161c36] text-white flex items-center justify-center font-black text-sm shadow-xs border border-blue-600/30">
              XP
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-slate-900 font-sans">
                  SICUREZZA <span className="text-blue-600">XP</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  SAC
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-tight font-medium hidden sm:inline">
                Sistema Web de Gestión y Analítica de Atención al Cliente
              </span>
            </div>
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Peru Time Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] text-slate-500 font-medium">Hora Lima:</span>
            <span className="font-mono font-bold text-slate-900">{peruTime || '19:30:00'}</span>
          </div>

          {/* Database Connection Pill */}
          <button
            type="button"
            onClick={onOpenFirebaseModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            title="Ver estado de conexión a Firestore y credenciales"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isFirebaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'
              }`}
            />
            <span className="hidden sm:inline">
              {isFirebaseActive ? 'Firestore Conectado' : 'Base Local Reactiva'}
            </span>
            <Database className="w-3.5 h-3.5 text-blue-600" />
          </button>

          {/* Field Configurator shortcut */}
          <button
            type="button"
            onClick={onOpenFieldConfigurator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
            title="Gestor de preguntas y opciones del formulario"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Configurar Campos</span>
          </button>

          {/* Descargar Proyecto / GitHub button */}
          {onOpenDownloadModal && (
            <button
              type="button"
              onClick={onOpenDownloadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Descargar código fuente en ZIP y subir a GitHub"
            >
              <Github className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Descargar & GitHub</span>
            </button>
          )}

          {/* Single User Avatar (Administrador SICUREZZA XP) */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#161c36] text-white flex items-center justify-center font-bold text-xs shadow-xs border-2 border-blue-400">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user.displayName}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold leading-none">
                Acceso Total (Master)
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
