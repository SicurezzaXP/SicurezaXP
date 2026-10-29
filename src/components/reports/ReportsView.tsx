import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckSquare,
  Square,
  Filter,
  CheckCircle2,
  FileText,
  BarChart3,
  Layers,
  Search,
  RotateCcw,
} from 'lucide-react';
import { CaseFilterState, CaseItem } from '../../types/case';
import {
  isDateInPeruRange,
  formatDisplayDateOnly,
  getPeruDateString,
  calculateDatePresetRange,
} from '../../utils/dateUtils';
import {
  ORIGENES_VENTA,
  TIPOS_CASO,
  MOTIVOS,
  ESTADOS_CASO,
  CIERRES_CASO,
  getStoredFormFields,
  getMasterOptions,
  MASTER_OPTIONS_UPDATED_EVENT,
} from '../../config/formFields';

interface ReportsViewProps {
  allCases: CaseItem[];
  defaultFilters: CaseFilterState;
}

interface ColumnOption {
  key: keyof CaseItem | string;
  label: string;
  defaultSelected: boolean;
}

const OFFICIAL_34_COLUMNS: ColumnOption[] = [
  { key: 'id', label: 'Código Caso', defaultSelected: true },
  { key: 'nroCasoDni', label: '1. Nro. caso (DNI cliente)', defaultSelected: true },
  { key: 'nombresApellidos', label: '2. Nombres/Apellidos', defaultSelected: true },
  { key: 'fechaIngreso', label: '3. Fecha ingreso caso', defaultSelected: true },
  { key: 'canal', label: '4. Canal de atención', defaultSelected: true },
  { key: 'telefonoCliente', label: '5. Teléfono cliente', defaultSelected: true },
  { key: 'correoCliente', label: '6. Correo cliente', defaultSelected: true },
  { key: 'numeroPedido', label: '7. Número de pedido', defaultSelected: true },
  { key: 'numeroBoleta', label: '8. Número boleta', defaultSelected: true },
  { key: 'campanaMkt', label: '9. Campaña MKT', defaultSelected: true },
  { key: 'origenVenta', label: '10. Origen de venta', defaultSelected: true },
  { key: 'fechaVenta', label: '11. Fecha de venta', defaultSelected: true },
  { key: 'tipoPago', label: '12. Tipo de pago', defaultSelected: true },
  { key: 'producto', label: '13. Producto', defaultSelected: true },
  { key: 'sku', label: '14. SKU', defaultSelected: true },
  { key: 'cantidad', label: '15. Cantidad', defaultSelected: true },
  { key: 'talla', label: '16. Talla', defaultSelected: true },
  { key: 'color', label: '17. Color', defaultSelected: true },
  { key: 'tipoCaso', label: '18. Tipo de caso', defaultSelected: true },
  { key: 'motivo', label: '19. Motivo', defaultSelected: true },
  { key: 'submotivo', label: '20. Sub motivo', defaultSelected: true },
  { key: 'fechaDerivacion', label: '21. Fecha de derivación', defaultSelected: false },
  { key: 'solicitudCliente', label: '22. Solicitud de cliente', defaultSelected: true },
  { key: 'quejaPersonalInvolucrado', label: '23. Personal involucrado', defaultSelected: false },
  { key: 'sucursalQueja', label: '24. Sucursal de queja', defaultSelected: false },
  { key: 'fechaAtencion', label: '25. Fecha de atención', defaultSelected: false },
  { key: 'horarioAtencion', label: '26. Horario de atención', defaultSelected: false },
  { key: 'solucionBrindada', label: '27. Solución brindada', defaultSelected: true },
  { key: 'cerroEnFcr', label: '28. ¿Se cerró en FCR?', defaultSelected: true },
  { key: 'fechaRespuesta', label: '29. Fecha de respuesta', defaultSelected: false },
  { key: 'detalleSolucion', label: '30. Detalle de solución brindada', defaultSelected: true },
  { key: 'sustentosAtencion', label: '31. Sustentos de atención', defaultSelected: false },
  { key: 'estado', label: '32. Estado', defaultSelected: true },
  { key: 'cierre', label: '33. Cierre', defaultSelected: true },
  { key: 'fechaCierre', label: '34. Fecha de cierre', defaultSelected: true },
  { key: 'createdAt', label: 'Fecha Registro Sistema', defaultSelected: false },
  { key: 'createdBy', label: 'Registrado Por', defaultSelected: false },
];

export const ReportsView: React.FC<ReportsViewProps> = ({ allCases, defaultFilters }) => {
  // Compute columns including custom fields
  const exportColumns: ColumnOption[] = React.useMemo(() => {
    const customFields = getStoredFormFields().filter((f) => f.isCustom && !f.disabled);
    const customCols: ColumnOption[] = customFields.map((cf) => ({
      key: cf.id as string,
      label: cf.label,
      defaultSelected: true,
    }));
    return [...OFFICIAL_34_COLUMNS, ...customCols];
  }, []);

  // Filter State
  const peruToday = getPeruDateString();
  const [reportStartDate, setReportStartDate] = useState(
    () => defaultFilters.fechaInicio || calculateDatePresetRange('ultimos_30_dias').inicio
  );
  // Guarantee reportEndDate is always at least peruToday (or later if selected)
  const [reportEndDate, setReportEndDate] = useState<string>(() => {
    if (!defaultFilters.fechaFin || defaultFilters.fechaFin < peruToday) {
      return peruToday;
    }
    return defaultFilters.fechaFin;
  });
  const [filterStore, setFilterStore] = useState(defaultFilters.origenVenta || defaultFilters.tienda || '');
  const [filterTipo, setFilterTipo] = useState(defaultFilters.tipoCaso || '');
  const [filterMotive, setFilterMotive] = useState(defaultFilters.motivo || defaultFilters.categoria || '');
  const [filterStatus, setFilterStatus] = useState(defaultFilters.estado || '');
  const [filterCierre, setFilterCierre] = useState(defaultFilters.cierre || '');
  const [masterOptions, setMasterOptions] = useState(() => getMasterOptions());

  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setMasterOptions(e.detail);
    };
    window.addEventListener(MASTER_OPTIONS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(MASTER_OPTIONS_UPDATED_EVENT, handleUpdate);
  }, []);

  // Column selection state
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    exportColumns.forEach((c) => {
      map[c.key] = c.defaultSelected;
    });
    return map;
  });

  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter cases for the report
  const filteredCases = React.useMemo(() => {
    return allCases.filter((c) => {
      if (c.isArchived) return false;
      if (!isDateInPeruRange(c.fechaIngreso, reportStartDate, reportEndDate)) return false;
      if (filterStore && c.origenVenta !== filterStore && c.tienda !== filterStore) return false;
      if (filterTipo && c.tipoCaso !== filterTipo) return false;
      if (filterMotive && c.motivo !== filterMotive && c.categoria !== filterMotive) return false;
      if (filterStatus && c.estado !== filterStatus) return false;
      if (filterCierre && c.cierre !== filterCierre) return false;
      return true;
    });
  }, [
    allCases,
    reportStartDate,
    reportEndDate,
    filterStore,
    filterTipo,
    filterMotive,
    filterStatus,
    filterCierre,
  ]);

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectAllColumns = () => {
    const map: Record<string, boolean> = {};
    exportColumns.forEach((c) => {
      map[c.key] = true;
    });
    setSelectedColumns(map);
  };

  const deselectAllColumns = () => {
    const map: Record<string, boolean> = {};
    exportColumns.forEach((c) => {
      map[c.key] = false;
    });
    setSelectedColumns(map);
  };

  const restoreDefaultColumns = () => {
    const map: Record<string, boolean> = {};
    exportColumns.forEach((c) => {
      map[c.key] = c.defaultSelected;
    });
    setSelectedColumns(map);
  };

  const selectConsultaColumns = () => {
    const consultaKeys = new Set([
      'id',
      'nroCasoDni',
      'nombresApellidos',
      'fechaIngreso',
      'canal',
      'telefonoCliente',
      'correoCliente',
      'numeroPedido',
      'origenVenta',
      'tipoCaso',
      'motivo',
      'solicitudCliente',
      'solucionBrindada',
      'cerroEnFcr',
      'detalleSolucion',
      'estado',
      'cierre',
      'fechaCierre',
      'createdBy',
    ]);
    const map: Record<string, boolean> = {};
    exportColumns.forEach((c) => {
      map[c.key] = consultaKeys.has(c.key as string);
    });
    setSelectedColumns(map);
  };

  const [columnSearch, setColumnSearch] = useState('');

  const generateDataRows = () => {
    const activeCols = exportColumns.filter((c) => selectedColumns[c.key]);

    return filteredCases.map((c) => {
      const isConsulta = c.tipoCaso === 'Consulta';
      const row: Record<string, any> = {};
      activeCols.forEach((col) => {
        let val: any = (c as any)[col.key];

        // Fallbacks for client names, store, motive
        if (col.key === 'nombresApellidos' && !val) val = c.clienteNombre;
        if (col.key === 'nroCasoDni' && !val) val = c.clienteDocumento;
        if (col.key === 'telefonoCliente' && !val) val = c.clienteTelefono;
        if (col.key === 'correoCliente' && !val) val = c.clienteEmail;
        if (col.key === 'origenVenta' && !val) val = c.tienda;
        if (col.key === 'motivo' && !val) val = c.categoria;
        if (col.key === 'solicitudCliente' && !val) val = c.descripcion;
        if (col.key === 'detalleSolucion' && !val) val = c.solucionAccion;

        // Check customFields if value missing
        if (val === undefined && c.customFields && c.customFields[col.key]) {
          val = c.customFields[col.key]?.value ?? c.customFields[col.key];
        }

        // For Consulta Rápida: strictly ensure non-applicable Solicitud fields are exported as blank/empty
        if (isConsulta) {
          const fastConsultationIrrelevantKeys = [
            'tipoPago',
            'talla',
            'color',
            'submotivo',
            'sku',
            'campanaMkt',
            'numeroBoleta',
            'fechaDerivacion',
            'quejaPersonalInvolucrado',
            'sucursalQueja',
            'fechaAtencion',
            'horarioAtencion',
            'sustentosAtencion',
            'fechaVenta',
          ];
          if (fastConsultationIrrelevantKeys.includes(col.key)) {
            val = '';
          }
          if (col.key === 'nroCasoDni' && (val === 'Sin DNI' || val === 'N/A')) val = '';
          if (col.key === 'telefonoCliente' && val === 'N/A') val = '';
          if (col.key === 'correoCliente' && val === 'N/A') val = '';
          if (col.key === 'numeroPedido' && val === 'N/A') val = '';
          if (col.key === 'producto' && val === 'Consulta de Producto') val = '';
          if (col.key === 'solucionBrindada' && (val === 'Cambio - Talla' || !val)) {
            val = 'Orientación / Información';
          }
        }

        row[col.label] = val !== undefined && val !== null ? val : '';
      });
      return row;
    });
  };

  // Export to Excel XLSX
  const exportToExcel = () => {
    if (filteredCases.length === 0) {
      alert('No hay registros que coincidan con los filtros para exportar.');
      return;
    }

    setIsExporting(true);
    try {
      const rows = generateDataRows();
      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Auto-fit column widths
      const colKeys = Object.keys(rows[0] || {});
      worksheet['!cols'] = colKeys.map((key) => {
        let maxLen = key.length;
        rows.slice(0, 50).forEach((r) => {
          const valStr = String(r[key] || '');
          if (valStr.length > maxLen) maxLen = valStr.length;
        });
        return { wch: Math.min(Math.max(maxLen + 2, 12), 45) };
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Casos SAC');

      const fileName = `SicurezzaXP_Casos_ATC_${reportStartDate}_a_${reportEndDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setSuccessMsg(`Archivo "${fileName}" descargado con éxito.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error generando archivo Excel:', err);
      alert('Hubo un error al generar el archivo Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredCases.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }

    setIsExporting(true);
    try {
      const rows = generateDataRows();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SicurezzaXP_Casos_ATC_${reportStartDate}_a_${reportEndDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMsg('Archivo CSV descargado con éxito.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error exportando CSV:', err);
      alert('Error al generar el archivo CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCount = Object.values(selectedColumns).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                Reportería & Descarga
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Exportación en formatos XLSX y CSV
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Generador de Reportes de Atención al Cliente — Sicurezza XP
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtra por período, tiendas o motivos, elige las columnas que requieres y exporta a Excel en un solo clic sin necesidad de Power BI.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isExporting || filteredCases.length === 0 || selectedCount === 0}
              onClick={exportToExcel}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              disabled={isExporting || filteredCases.length === 0 || selectedCount === 0}
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Date Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100 text-xs">
          <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Período Rápido:</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setReportStartDate(peruToday);
              setReportEndDate(peruToday);
            }}
            className={`px-3 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
              reportStartDate === peruToday && reportEndDate === peruToday
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-blue-50/80 hover:bg-blue-100 text-blue-800 border-blue-200'
            }`}
          >
            Hoy ({peruToday.split('-').slice(1).reverse().join('/')})
          </button>
          <button
            type="button"
            onClick={() => {
              const r = calculateDatePresetRange('ultimos_7_dias');
              setReportStartDate(r.inicio);
              setReportEndDate(peruToday);
            }}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            Últimos 7 días
          </button>
          <button
            type="button"
            onClick={() => {
              const r = calculateDatePresetRange('este_mes');
              setReportStartDate(r.inicio);
              setReportEndDate(peruToday);
            }}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            Este Mes
          </button>
          <button
            type="button"
            onClick={() => {
              const r = calculateDatePresetRange('ultimos_30_dias');
              setReportStartDate(r.inicio);
              setReportEndDate(peruToday);
            }}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            Últimos 30 días
          </button>
          <button
            type="button"
            onClick={() => {
              setReportStartDate('2024-01-01');
              setReportEndDate(peruToday);
            }}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            Todo el Histórico
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Fecha Inicial
            </label>
            <input
              type="date"
              value={reportStartDate}
              onChange={(e) => setReportStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Fecha Final
            </label>
            <input
              type="date"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            />
          </div>

          {/* Sede / Origen */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Origen de Venta
            </label>
            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="">Todas las sedes</option>
              {masterOptions.tiendas.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Caso */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tipo de Caso
            </label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="">Todos los tipos</option>
              {TIPOS_CASO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Motivo
            </label>
            <select
              value={filterMotive}
              onChange={(e) => setFilterMotive(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="">Todos los motivos</option>
              {MOTIVOS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="">Todos los estados</option>
              {ESTADOS_CASO.map((es) => (
                <option key={es} value={es}>
                  {es}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Counter Summary */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
          <div>
            Registros encontrados para el reporte:{' '}
            <strong className="text-slate-900 font-bold text-sm">{filteredCases.length}</strong> casos
          </div>
          <div>
            Columnas seleccionadas para el archivo:{' '}
            <strong className="text-blue-700 font-bold">{selectedCount}</strong> de {exportColumns.length}
          </div>
        </div>

        {/* Column Selectors Grid */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Selección de Columnas a Incluir en el Archivo</span>
            </span>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={selectAllColumns}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold cursor-pointer border border-blue-200 transition-colors"
                title="Seleccionar todas las columnas disponibles"
              >
                Marcar todas
              </button>
              <button
                type="button"
                onClick={deselectAllColumns}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold cursor-pointer border border-slate-200 transition-colors"
                title="Desmarcar todas las columnas"
              >
                Desmarcar todas
              </button>
              <button
                type="button"
                onClick={restoreDefaultColumns}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer border border-slate-200 transition-colors"
                title="Restaurar las columnas oficiales predeterminadas"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Por defecto</span>
              </button>
              <button
                type="button"
                onClick={selectConsultaColumns}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold cursor-pointer border border-indigo-200 transition-colors"
                title="Seleccionar únicamente las columnas relevantes para consultas rápidas"
              >
                Solo Consulta Rápida
              </button>
            </div>
          </div>

          {/* Column Search Filter */}
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={columnSearch}
              onChange={(e) => setColumnSearch(e.target.value)}
              placeholder="Buscar columna por nombre..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
            {columnSearch && (
              <button
                type="button"
                onClick={() => setColumnSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Column Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {exportColumns
              .filter((c) =>
                columnSearch.trim() === ''
                  ? true
                  : c.label.toLowerCase().includes(columnSearch.trim().toLowerCase())
              )
              .map((col) => {
                const isChecked = Boolean(selectedColumns[col.key]);
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => toggleColumn(col.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium border text-left cursor-pointer transition-all select-none ${
                      isChecked
                        ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className="truncate flex-1 font-semibold" title={col.label}>
                      {col.label}
                    </span>
                  </button>
                );
              })}
          </div>

          {exportColumns.filter((c) =>
            columnSearch.trim() === ''
              ? true
              : c.label.toLowerCase().includes(columnSearch.trim().toLowerCase())
          ).length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              No se encontraron columnas que coincidan con "{columnSearch}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
