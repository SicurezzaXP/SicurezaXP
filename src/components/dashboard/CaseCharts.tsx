import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { CaseItem } from '../../types/case';
import { formatDisplayDateOnly } from '../../utils/dateUtils';
import { TrendingUp, Info, Building2, Tag, Calendar, PieChart as PieIcon, CheckCircle2 } from 'lucide-react';

interface CaseChartsProps {
  cases: CaseItem[];
  onSelectStatus?: (status: string) => void;
  onSelectStore?: (store: string) => void;
  onSelectCategory?: (category: string) => void;
  activeStatusFilter?: string;
  activeStoreFilter?: string;
  activeCategoryFilter?: string;
}

// Color palette from reference screenshot (Turquoise, Navy Blue, Slate, Emerald, Coral)
const SERIES_COLORS: Record<string, string> = {
  'Solicitud': '#38bdf8', // Cyan / Turquoise
  'Reclamo': '#3b82f6', // Bright Blue
  'Consulta': '#64748b', // Slate Gray
  'Queja': '#10b981', // Emerald Green
  'Libro de Reclamaciones': '#f43f5e', // Rose
};

const PIE_COLORS = ['#38bdf8', '#3b82f6', '#161c36', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const CaseCharts: React.FC<CaseChartsProps> = ({
  cases,
  onSelectStatus,
  onSelectStore,
  onSelectCategory,
  activeStatusFilter,
  activeStoreFilter,
  activeCategoryFilter,
}) => {
  // Visible series toggles
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
    Solicitud: true,
    Reclamo: true,
    Consulta: true,
    Queja: true,
    'Libro de Reclamaciones': true,
  });

  const toggleSeries = (key: string) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showAllSeries = () => {
    setVisibleSeries({
      Solicitud: true,
      Reclamo: true,
      Consulta: true,
      Queja: true,
      'Libro de Reclamaciones': true,
    });
  };

  const hideAllSeries = () => {
    setVisibleSeries({
      Solicitud: false,
      Reclamo: false,
      Consulta: false,
      Queja: false,
      'Libro de Reclamaciones': false,
    });
  };

  // Group cases by day and case type for the stacked bar chart (matching the screenshot format!)
  const timelineData = useMemo(() => {
    const map: Record<string, { date: string; Solicitud: number; Reclamo: number; Consulta: number; Queja: number; 'Libro de Reclamaciones': number; total: number }> = {};

    cases.forEach((c) => {
      const dateKey = c.fechaIngreso ? (c.fechaIngreso.includes('T') ? c.fechaIngreso.split('T')[0] : c.fechaIngreso.substring(0, 10)) : 'Sin fecha';
      if (!map[dateKey]) {
        map[dateKey] = {
          date: dateKey,
          Solicitud: 0,
          Reclamo: 0,
          Consulta: 0,
          Queja: 0,
          'Libro de Reclamaciones': 0,
          total: 0,
        };
      }

      const tipo = c.tipoCaso || 'Solicitud';
      if (tipo.includes('Reclamo')) map[dateKey].Reclamo += 1;
      else if (tipo.includes('Consulta')) map[dateKey].Consulta += 1;
      else if (tipo.includes('Queja')) map[dateKey].Queja += 1;
      else if (tipo.includes('Libro')) map[dateKey]['Libro de Reclamaciones'] += 1;
      else map[dateKey].Solicitud += 1;

      map[dateKey].total += 1;
    });

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [cases]);

  // Group by Store (Sedes)
  const storeData = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach((c) => {
      const st = (c.origenVenta || c.tienda || 'No especificada').replace('Tda. ', '');
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [cases]);

  // Group by Canal
  const channelData = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach((c) => {
      const ch = c.canal || 'WhatsApp';
      counts[ch] = (counts[ch] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [cases]);

  // Group by Motivo
  const motiveData = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach((c) => {
      const mot = c.motivo || c.categoria || 'Otro';
      counts[mot] = (counts[mot] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [cases]);

  return (
    <div className="space-y-6">
      {/* 1. Main Stacked Bar Chart (Format exactly like image_a57a0a97.png) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-blue-50 text-blue-600">
                <Calendar className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Casos en el período
              </span>
              <Info className="w-3.5 h-3.5 text-cyan-500" />
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                {cases.length.toLocaleString()}
              </span>
              <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3 h-3 mr-1 inline" />
                +4.1%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Agrupado por Día y Tipo de Caso ATC · Tiempo Real
            </p>
          </div>

          {/* Series toggle buttons matching screenshot */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pr-2 border-r border-slate-200">
              <button
                type="button"
                onClick={hideAllSeries}
                className="hover:text-slate-900 underline cursor-pointer"
              >
                Ocultar todo
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={showAllSeries}
                className="hover:text-slate-900 underline cursor-pointer"
              >
                Mostrar todo
              </button>
            </div>

            {/* Individual series pills */}
            <div className="flex flex-wrap items-center gap-2">
              {Object.keys(SERIES_COLORS).map((key) => {
                const isVis = visibleSeries[key] ?? true;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSeries(key)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      isVis
                        ? 'bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                        : 'bg-white text-slate-400 border-slate-200 line-through opacity-50'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SERIES_COLORS[key] }}
                    />
                    <span>{key}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stacked Chart Canvas */}
        <div className="h-72 sm:h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={(val) => {
                  try {
                    const parts = val.split('-');
                    return `${parts[2]}/${parts[1]}`;
                  } catch {
                    return val;
                  }
                }}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const totalForDay = payload.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);
                    return (
                      <div className="bg-[#161c36] text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[170px]">
                        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                          {formatDisplayDateOnly(String(label || ''))}
                        </p>
                        {payload.map((entry: any, index: number) => (
                          <div key={index} className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              {entry.name}:
                            </span>
                            <span className="font-bold text-white">{entry.value}</span>
                          </div>
                        ))}
                        <div className="border-t border-slate-700 pt-1 flex justify-between font-bold text-cyan-400">
                          <span>Total del día:</span>
                          <span>{totalForDay}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {visibleSeries['Solicitud'] && (
                <Bar dataKey="Solicitud" stackId="a" fill={SERIES_COLORS['Solicitud']} />
              )}
              {visibleSeries['Reclamo'] && (
                <Bar dataKey="Reclamo" stackId="a" fill={SERIES_COLORS['Reclamo']} />
              )}
              {visibleSeries['Consulta'] && (
                <Bar dataKey="Consulta" stackId="a" fill={SERIES_COLORS['Consulta']} />
              )}
              {visibleSeries['Queja'] && (
                <Bar dataKey="Queja" stackId="a" fill={SERIES_COLORS['Queja']} />
              )}
              {visibleSeries['Libro de Reclamaciones'] && (
                <Bar dataKey="Libro de Reclamaciones" stackId="a" fill={SERIES_COLORS['Libro de Reclamaciones']} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Secondary Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Origen de Venta (Tiendas / Web) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Casos por Origen de Venta (Sedes y Web)
              </h3>
            </div>
            <span className="text-xs text-slate-400">{storeData.length} puntos de venta</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#334155' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} casos`, 'Volumen']}
                  contentStyle={{ backgroundColor: '#161c36', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar
                  dataKey="count"
                  fill="#2563eb"
                  radius={[0, 6, 6, 0]}
                  onClick={(entry: any) => onSelectStore && onSelectStore(String(entry?.name || ''))}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución por Motivo / Requerimiento */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Casos por Motivo Principal
              </h3>
            </div>
            <span className="text-xs text-slate-400">{motiveData.length} categorías</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={motiveData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {motiveData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} casos`, name]}
                  contentStyle={{ backgroundColor: '#161c36', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-[11px] text-slate-600 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
