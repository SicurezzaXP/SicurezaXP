import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { CaseItem } from '../../types/case';
import { getCaseFollowUpInfo } from '../../utils/followUpUtils';

interface AlertsDropdownProps {
  cases: CaseItem[];
  onOpenFollowUpsView: () => void;
  onViewCaseDetail: (item: CaseItem) => void;
}

export const AlertsDropdown: React.FC<AlertsDropdownProps> = ({
  cases,
  onOpenFollowUpsView,
  onViewCaseDetail,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter urgent and pending follow-ups
  const pendingAlerts = cases
    .filter((c) => !c.isArchived)
    .map((c) => ({
      caseItem: c,
      followUp: getCaseFollowUpInfo(c),
    }))
    .filter(({ followUp }) => followUp.isNeeded)
    .sort((a, b) => {
      // Prioritize 'vencido' then 'hoy' then 'proximo'
      const order = { vencido: 0, hoy: 1, proximo: 2, cumplido: 3, ninguno: 4 };
      return (order[a.followUp.urgency] ?? 5) - (order[b.followUp.urgency] ?? 5);
    });

  const overdueCount = pendingAlerts.filter((a) => a.followUp.urgency === 'vencido').length;
  const todayCount = pendingAlerts.filter((a) => a.followUp.urgency === 'hoy').length;
  const totalCount = pendingAlerts.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
          totalCount > 0
            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
        }`}
        title={`${totalCount} casos en seguimiento o con alerta`}
      >
        <Bell className="w-4 h-4" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white ring-2 ring-white">
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="bg-[#161c36] text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs">Alertas de Seguimiento</span>
            </div>
            {overdueCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                {overdueCount} vencido{overdueCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* List of alerts */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {pendingAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                <Check className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="font-bold text-slate-800">¡Todos los seguimientos al día!</p>
                <p className="text-[11px] text-slate-400">
                  No hay casos vencidos ni alertas pendientes para hoy.
                </p>
              </div>
            ) : (
              pendingAlerts.slice(0, 6).map(({ caseItem, followUp }) => {
                const isOverdue = followUp.urgency === 'vencido';
                const isToday = followUp.urgency === 'hoy';

                return (
                  <div
                    key={caseItem.id}
                    className="p-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">
                          {caseItem.id}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : isToday
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {followUp.urgency === 'vencido' ? `Vencido (${followUp.daysDiff}d)` : followUp.urgency === 'hoy' ? 'Hoy' : 'En plazo'}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 truncate text-[11px]">
                        {caseItem.nombresApellidos || 'Cliente'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {caseItem.tipoCaso} · {caseItem.motivo}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onViewCaseDetail(caseItem);
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Ver
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenFollowUpsView();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <span>Ver Bandeja de Seguimientos ({totalCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
