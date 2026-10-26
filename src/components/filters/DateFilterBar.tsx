import React, { useState } from 'react';
import {
  Calendar,
  RotateCcw,
  Filter,
  CheckCircle2,
  Building2,
  Tag,
  AlertCircle,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { CaseFilterState, QuickDatePreset } from '../../types/case';
import { calculateDatePresetRange } from '../../utils/dateUtils';
import {
  ORIGENES_VENTA,
  CANALES_ATENCION,
  TIPOS_CASO,
  MOTIVOS,
  ESTADOS_CASO,
  CIERRES_CASO,
} from '../../config/formFields';

interface DateFilterBarProps {
  filters: CaseFilterState;
  onApplyFilters: (newFilters: CaseFilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  totalAllCount: number;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
  totalFilteredCount,
  totalAllCount,
}) => {
  const [timeViewMode, setTimeViewMode] = useState<'dia' | 'mes'>('dia');

  const handlePresetSelect = (preset: QuickDatePreset) => {
    const range = calculateDatePresetRange(preset);
    const updated: CaseFilterState = {
      ...filters,
      preset,
      fechaInicio: range.inicio,
      fechaFin: range.fin,
    };
    onApplyFilters(updated);
  };

  const handleDateChange = (field: 'fechaInicio' | 'fechaFin', val: string) => {
    onApplyFilters({
      ...filters,
      [field]: val,
      preset: 'personalizado',
    });
  };

  const handleFilterSelect = (field: keyof CaseFilterState, val: string) => {
    onApplyFilters({
      ...filters,
      [field]: val,
    });
  };

  const hasActiveFilters =
    Boolean(filters.origenVenta) ||
    Boolean(filters.tipoCaso) ||
    Boolean(filters.motivo) ||
    Boolean(filters.estado) ||
    Boolean(filters.canal) ||
    Boolean(filters.cierre) ||
    filters.preset !== 'ultimos_30_dias';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 mb-6 space-y-4">
      {/* 1. Top row: PERÍODO (Format from image_a57a0a97.png) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            PERÍODO
          </span>

          {/* Día / Mes toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setTimeViewMode('dia');
                handlePresetSelect('ultimos_7_dias');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeViewMode === 'dia'
                  ? 'bg-[#161c36] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Día
            </button>
            <button
              type="button"
              onClick={() => {
                setTimeViewMode('mes');
                handlePresetSelect('ultimos_30_dias');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeViewMode === 'mes'
                  ? 'bg-[#161c36] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mes
            </button>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs">
            <input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => handleDateChange('fechaInicio', e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none"
            />
            <span className="text-slate-400 font-bold">—</span>
            <input
              type="date"
              value={filters.fechaFin}
              onChange={(e) => handleDateChange('fechaFin', e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePresetSelect('hoy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filters.preset === 'hoy'
                  ? 'bg-[#161c36] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('ultimos_7_dias')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filters.preset === 'ultimos_7_dias'
                  ? 'bg-[#161c36] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('ultimos_30_dias')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filters.preset === 'ultimos_30_dias'
                  ? 'bg-[#161c36] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              Últimos 30 días
            </button>
          </div>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Mostrando <span className="font-bold text-slate-900">{totalFilteredCount}</span> de{' '}
            <span className="font-bold text-slate-900">{totalAllCount}</span> casos
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Bottom row: Dropdown filters in rectangular cards (image_a57a0a97.png format) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* TIPO DE CASO */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Tipo de Caso
          </label>
          <select
            value={filters.tipoCaso}
            onChange={(e) => handleFilterSelect('tipoCaso', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {TIPOS_CASO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* CANAL */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Canal
          </label>
          <select
            value={filters.canal}
            onChange={(e) => handleFilterSelect('canal', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los canales</option>
            {CANALES_ATENCION.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* ORIGEN DE VENTA (Sedes) */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Origen de Venta
          </label>
          <select
            value={filters.origenVenta || filters.tienda || ''}
            onChange={(e) => handleFilterSelect('origenVenta', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las sedes</option>
            {ORIGENES_VENTA.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* MOTIVO */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Motivo
          </label>
          <select
            value={filters.motivo || filters.categoria || ''}
            onChange={(e) => handleFilterSelect('motivo', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los motivos</option>
            {MOTIVOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* ESTADO */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Estado
          </label>
          <select
            value={filters.estado}
            onChange={(e) => handleFilterSelect('estado', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_CASO.map((es) => (
              <option key={es} value={es}>
                {es}
              </option>
            ))}
          </select>
        </div>

        {/* CIERRE */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Cierre
          </label>
          <select
            value={filters.cierre}
            onChange={(e) => handleFilterSelect('cierre', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los cierres</option>
            {CIERRES_CASO.map((ci) => (
              <option key={ci} value={ci}>
                {ci}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
