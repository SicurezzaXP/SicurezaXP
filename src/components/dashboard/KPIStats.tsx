import React from 'react';
import {
  Inbox,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Building2,
  Tag,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { CaseItem } from '../../types/case';

interface KPIStatsProps {
  currentCases: CaseItem[];
  previousPeriodCases: CaseItem[];
  onSelectStatus?: (status: string) => void;
  onSelectStore?: (store: string) => void;
}

export const KPIStats: React.FC<KPIStatsProps> = ({
  currentCases,
  previousPeriodCases,
  onSelectStatus,
  onSelectStore,
}) => {
  const totalCurrent = currentCases.length;
  const totalPrevious = previousPeriodCases.length;

  // % change vs previous period
  const totalChangePercent =
    totalPrevious === 0
      ? totalCurrent > 0 ? 100 : 0
      : Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100);

  // Status breakdown: Abierto vs Cerrado (official Google Form statuses)
  const openCases = currentCases.filter(
    (c) => c.estado === 'Abierto' || c.estado === 'Pendiente' || c.estado === 'En gestión'
  ).length;
  const closedCases = currentCases.filter(
    (c) => c.estado === 'Cerrado' || c.estado === 'Resuelto'
  ).length;

  // FCR Rate
  const fcrCases = currentCases.filter((c) => c.cerroEnFcr === 'Sí').length;
  const fcrRate = totalCurrent === 0 ? 0 : Math.round((fcrCases / totalCurrent) * 100);

  // Cierre Procede
  const procedeCases = currentCases.filter((c) => c.cierre === 'Procede').length;
  const procedeRate = totalCurrent === 0 ? 0 : Math.round((procedeCases / totalCurrent) * 100);

  // Top Sede / Origen Venta
  const storeCounts: Record<string, number> = {};
  currentCases.forEach((c) => {
    const storeName = c.origenVenta || c.tienda;
    if (storeName) storeCounts[storeName] = (storeCounts[storeName] || 0) + 1;
  });
  const topStoreEntry = Object.entries(storeCounts).sort((a, b) => b[1] - a[1])[0];
  const topStore = topStoreEntry ? topStoreEntry[0].replace('Tda. ', '') : 'N/A';
  const topStoreCount = topStoreEntry ? topStoreEntry[1] : 0;

  // Top Motivo
  const motiveCounts: Record<string, number> = {};
  currentCases.forEach((c) => {
    const mot = c.motivo || c.categoria;
    if (mot) motiveCounts[mot] = (motiveCounts[mot] || 0) + 1;
  });
  const topMotiveEntry = Object.entries(motiveCounts).sort((a, b) => b[1] - a[1])[0];
  const topMotive = topMotiveEntry ? topMotiveEntry[0] : 'N/A';
  const topMotiveCount = topMotiveEntry ? topMotiveEntry[1] : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Casos (Format from screenshot) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold text-slate-600">Total Casos</span>
          <Info className="w-3.5 h-3.5 text-cyan-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          {totalCurrent.toLocaleString()}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            {totalChangePercent >= 0 ? `+${totalChangePercent}%` : `${totalChangePercent}%`}
          </span>
          <span className="text-[11px] text-slate-400">vs período ant.</span>
        </div>
      </div>

      {/* 2. Casos Abiertos */}
      <div
        onClick={() => onSelectStatus && onSelectStatus('Abierto')}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold text-slate-600">Casos Abiertos</span>
          <Info className="w-3.5 h-3.5 text-cyan-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          {openCases.toLocaleString()}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            {totalCurrent > 0 ? Math.round((openCases / totalCurrent) * 100) : 0}%
          </span>
          <span className="text-[11px] text-slate-400">del período</span>
        </div>
      </div>

      {/* 3. Casos Cerrados */}
      <div
        onClick={() => onSelectStatus && onSelectStatus('Cerrado')}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-emerald-400 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold text-slate-600">Casos Cerrados</span>
          <Info className="w-3.5 h-3.5 text-cyan-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          {closedCases.toLocaleString()}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            {totalCurrent > 0 ? Math.round((closedCases / totalCurrent) * 100) : 0}%
          </span>
          <span className="text-[11px] text-slate-400">tasa resolución</span>
        </div>
      </div>

      {/* 4. Tasa FCR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold text-slate-600">Resolución 1er Contacto</span>
          <Info className="w-3.5 h-3.5 text-cyan-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          {fcrRate}%
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500">
            {fcrCases} de {totalCurrent} casos FCR
          </span>
        </div>
      </div>

      {/* 5. Cierre: Procede */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold text-slate-600">Cierre: Procede</span>
          <Info className="w-3.5 h-3.5 text-cyan-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          {procedeRate}%
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500">
            {procedeCases} casos aprobados
          </span>
        </div>
      </div>

      {/* 6. Sede con más Casos */}
      <div
        onClick={() => onSelectStore && topStoreEntry && onSelectStore(topStoreEntry[0])}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold text-slate-600">Sede con Mayor Flujo</span>
          <Info className="w-3.5 h-3.5 text-cyan-500" />
        </div>
        <div className="text-lg sm:text-xl font-bold text-[#111827] truncate" title={topStore}>
          {topStore}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500">
            {topStoreCount} casos registrados
          </span>
        </div>
      </div>
    </div>
  );
};
