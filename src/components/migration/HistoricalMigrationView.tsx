import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Download,
  Info,
  Check,
  X,
} from 'lucide-react';
import { importCasesBatch } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { CaseItem } from '../../types/case';
import { getPeruDateTimeLocalString } from '../../utils/dateUtils';

interface ColumnMapping {
  fechaIngreso: string;
  clienteNombre: string;
  clienteTelefono: string;
  tienda: string;
  categoria: string;
  estado: string;
  descripcion: string;
  numeroPedido: string;
  clienteDocumento: string;
  clienteEmail: string;
  solucionAccion: string;
  asesorResponsable: string;
}

export const HistoricalMigrationView: React.FC = () => {
  const { user } = useAuth();

  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  // Column mapping state
  const [mapping, setMapping] = useState<ColumnMapping>({
    fechaIngreso: '',
    clienteNombre: '',
    clienteTelefono: '',
    tienda: '',
    categoria: '',
    estado: '',
    descripcion: '',
    numeroPedido: '',
    clienteDocumento: '',
    clienteEmail: '',
    solucionAccion: '',
    asesorResponsable: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null);

  // Handle file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const data: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (data.length === 0) {
          alert('El archivo no contiene filas con datos válidos.');
          return;
        }

        const headers = Object.keys(data[0]);
        setRawHeaders(headers);
        setRawRows(data);

        // Auto-match common Google Sheets / Excel column names
        const autoMap: ColumnMapping = {
          fechaIngreso: headers.find((h) => /fecha|marca|timestamp|date|hora/i.test(h)) || '',
          clienteNombre: headers.find((h) => /nombre|client|titular/i.test(h)) || '',
          clienteTelefono: headers.find((h) => /tel|cel|whatsapp|phone/i.test(h)) || '',
          tienda: headers.find((h) => /tienda|sede|sucursal|canal/i.test(h)) || '',
          categoria: headers.find((h) => /categor|motivo|tipo|razon/i.test(h)) || '',
          estado: headers.find((h) => /estado|status/i.test(h)) || '',
          descripcion: headers.find((h) => /descrip|detalle|mensaje|reclamo/i.test(h)) || '',
          numeroPedido: headers.find((h) => /pedido|boleta|orden|ticket/i.test(h)) || '',
          clienteDocumento: headers.find((h) => /dni|documento|ruc|ce/i.test(h)) || '',
          clienteEmail: headers.find((h) => /correo|mail|email/i.test(h)) || '',
          solucionAccion: headers.find((h) => /soluci|accion|respuesta/i.test(h)) || '',
          asesorResponsable: headers.find((h) => /asesor|responsable|atendido/i.test(h)) || '',
        };
        setMapping(autoMap);
      } catch (err: any) {
        console.error('Error leyendo archivo:', err);
        alert(`Error al procesar el archivo: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Validation analysis
  const validationSummary = React.useMemo(() => {
    if (rawRows.length === 0) return null;

    let validCount = 0;
    let missingRequired = 0;

    rawRows.forEach((row) => {
      const nombre = mapping.clienteNombre ? String(row[mapping.clienteNombre] || '').trim() : '';
      const telefono = mapping.clienteTelefono ? String(row[mapping.clienteTelefono] || '').trim() : '';
      const desc = mapping.descripcion ? String(row[mapping.descripcion] || '').trim() : '';

      if (nombre && telefono && desc) {
        validCount++;
      } else {
        missingRequired++;
      }
    });

    return {
      total: rawRows.length,
      valid: validCount,
      incomplete: missingRequired,
    };
  }, [rawRows, mapping]);

  // Execute batch migration
  const handleExecuteImport = async () => {
    if (!validationSummary || validationSummary.valid === 0) {
      alert('Debes mapear los campos obligatorios (Nombre, Teléfono y Descripción) para importar.');
      return;
    }

    const confirmed = window.confirm(
      `¿Deseas confirmar la importación de ${validationSummary.valid} registros históricos válidos al sistema centralizado de Sicurezza?`
    );
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const casesToImport: Array<Omit<CaseItem, 'id' | 'createdAt' | 'updatedAt'>> = [];

      rawRows.forEach((row) => {
        const nombre = mapping.clienteNombre ? String(row[mapping.clienteNombre] || '').trim() : '';
        const telefono = mapping.clienteTelefono ? String(row[mapping.clienteTelefono] || '').trim() : '';
        const desc = mapping.descripcion ? String(row[mapping.descripcion] || '').trim() : '';

        // Only import if required fields exist
        if (!nombre || !telefono || !desc) return;

        // Date extraction
        let fecha = getPeruDateTimeLocalString();
        if (mapping.fechaIngreso && row[mapping.fechaIngreso]) {
          const rawVal = row[mapping.fechaIngreso];
          if (rawVal instanceof Date) {
            fecha = rawVal.toISOString().substring(0, 16);
          } else if (typeof rawVal === 'string' && rawVal.length >= 10) {
            fecha = rawVal.substring(0, 16);
          }
        }

        const docId = mapping.clienteDocumento ? String(row[mapping.clienteDocumento] || '') : '70000000';
        const storeVal = mapping.tienda && row[mapping.tienda] ? String(row[mapping.tienda]) : 'Sicurezza.pe';
        const motiveVal = mapping.categoria && row[mapping.categoria] ? String(row[mapping.categoria]) : 'Producto';
        const statusVal = mapping.estado && row[mapping.estado] ? String(row[mapping.estado]) : 'Cerrado';
        const solVal = mapping.solucionAccion ? String(row[mapping.solucionAccion] || '') : 'Migrado desde base histórica';

        casesToImport.push({
          nroCasoDni: docId,
          nombresApellidos: nombre,
          fechaIngreso: fecha,
          canal: 'WhatsApp',
          telefonoCliente: telefono,
          correoCliente: mapping.clienteEmail ? String(row[mapping.clienteEmail] || '') : '',
          numeroPedido: mapping.numeroPedido ? String(row[mapping.numeroPedido] || '') : '',
          numeroBoleta: '',
          campanaMkt: 'Migración Histórica',
          origenVenta: storeVal,
          fechaVenta: fecha,
          tipoPago: 'Tarjeta',
          producto: 'Prenda Sicurezza',
          sku: 'SIC-HIST',
          cantidad: 1,
          talla: 'M',
          color: 'Beige',
          tipoCaso: 'Solicitud',
          motivo: motiveVal,
          solicitudCliente: desc,
          quejaPersonalInvolucrado: 'N/A',
          sucursalQueja: 'N/A',
          solucionBrindada: 'Entrega de información',
          cerroEnFcr: 'Sí',
          detalleSolucion: solVal,
          estado: statusVal,
          cierre: 'Procede',
          createdBy: user?.email || 'info@sicurezza.pe',
          updatedBy: user?.email || 'info@sicurezza.pe',
          // Retrocompatibilidad
          clienteNombre: nombre,
          clienteTelefono: telefono,
          clienteDocumento: docId,
          clienteEmail: mapping.clienteEmail ? String(row[mapping.clienteEmail] || '') : '',
          tienda: storeVal,
          categoria: motiveVal,
          descripcion: desc,
          solucionAccion: solVal,
          asesorResponsable: mapping.asesorResponsable && row[mapping.asesorResponsable] ? String(row[mapping.asesorResponsable]) : 'Migración Histórica',
          clienteConforme: 'Sí',
        });
      });

      const res = await importCasesBatch(casesToImport);
      setImportResult(res);
      setRawRows([]);
      setRawHeaders([]);
      setFileName(null);
    } catch (err: any) {
      console.error('Error en migración:', err);
      alert(`Error en la migración: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Fecha Ingreso': '2026-10-15 14:30',
        'Canal': 'WhatsApp',
        'Tienda o Sede': 'Jockey Plaza',
        'Nombre Clienta': 'Maria Elena Rodriguez',
        'DNI': '71234567',
        'Telefono': '987654321',
        'Correo': 'maria@gmail.com',
        'Numero Pedido': '#SIC-1092',
        'Motivo o Categoria': 'Cambio de Talla / Modelo',
        'Estado': 'Resuelto',
        'Prioridad': 'Media',
        'Descripcion': 'Clienta solicita cambio de talla 34B a 36B en tienda.',
        'Solucion': 'Cambio efectuado en Jockey Plaza con empaque sellado.',
        'Asesor': 'Valeria Castro',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'Plantilla_Migracion_Casos_Sicurezza.xlsx');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900">
              Migración de Información Histórica
            </h2>
            <p className="text-xs text-stone-400">
              Importación masiva desde Google Sheets y Excel a la base centralizada de Sicurezza
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Descargar Plantilla Excel
        </button>
      </div>

      {/* Success notification */}
      {importResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                ¡Migración finalizada con éxito!
              </p>
              <p className="text-emerald-700 mt-0.5">
                Se importaron correctamente <strong>{importResult.imported}</strong> casos históricos. Los indicadores y gráficos ya están actualizados.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setImportResult(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            1. Seleccionar archivo histórico (XLSX o CSV)
          </label>
          <div className="border-2 border-dashed border-stone-300 hover:border-[#E88069] rounded-2xl p-8 text-center transition-colors bg-stone-50/50">
            <UploadCloud className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-stone-800">
              {fileName ? `Archivo cargado: ${fileName}` : 'Haz clic o arrastra tu archivo aquí'}
            </p>
            <p className="text-[11px] text-stone-400 mt-1">
              Compatible con descargas de Google Sheets, formularios antiguos y reportes de Power BI
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="mt-4 text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E88069] file:text-white hover:file:bg-[#d9725b] cursor-pointer"
            />
          </div>
        </div>

        {/* Preview & Column Mapper */}
        {rawHeaders.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-stone-100">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                  2. Relacionar Columnas de Origen con Campos del Sistema
                </label>
                <span className="text-xs text-stone-400">
                  Total de filas detectadas: <strong>{rawRows.length}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                {/* Nombre */}
                <div>
                  <span className="block text-xs font-medium text-stone-700 mb-1">
                    Nombre del Cliente <span className="text-[#E88069]">*</span>
                  </span>
                  <select
                    value={mapping.clienteNombre}
                    onChange={(e) => setMapping((m) => ({ ...m, clienteNombre: e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="">-- Seleccionar Columna --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Teléfono */}
                <div>
                  <span className="block text-xs font-medium text-stone-700 mb-1">
                    Teléfono / WhatsApp <span className="text-[#E88069]">*</span>
                  </span>
                  <select
                    value={mapping.clienteTelefono}
                    onChange={(e) => setMapping((m) => ({ ...m, clienteTelefono: e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="">-- Seleccionar Columna --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <span className="block text-xs font-medium text-stone-700 mb-1">
                    Descripción / Detalle <span className="text-[#E88069]">*</span>
                  </span>
                  <select
                    value={mapping.descripcion}
                    onChange={(e) => setMapping((m) => ({ ...m, descripcion: e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="">-- Seleccionar Columna --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <span className="block text-xs font-medium text-stone-700 mb-1">
                    Fecha de Ingreso Original
                  </span>
                  <select
                    value={mapping.fechaIngreso}
                    onChange={(e) => setMapping((m) => ({ ...m, fechaIngreso: e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="">-- Usar Fecha Actual --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tienda */}
                <div>
                  <span className="block text-xs font-medium text-stone-700 mb-1">
                    Tienda / Sede
                  </span>
                  <select
                    value={mapping.tienda}
                    onChange={(e) => setMapping((m) => ({ ...m, tienda: e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="">-- Seleccionar Columna --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categoría */}
                <div>
                  <span className="block text-xs font-medium text-stone-700 mb-1">
                    Categoría / Motivo
                  </span>
                  <select
                    value={mapping.categoria}
                    onChange={(e) => setMapping((m) => ({ ...m, categoria: e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="">-- Seleccionar Columna --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Validation Pre-check Box */}
            {validationSummary && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-semibold text-stone-800">
                    Resumen de Validación de Filas:
                  </div>
                  <div className="flex items-center gap-3 text-stone-600">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {validationSummary.valid} filas válidas listas
                    </span>
                    {validationSummary.incomplete > 0 && (
                      <span className="text-amber-700 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {validationSummary.incomplete} incompletas (se omitirán)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isProcessing || validationSummary.valid === 0}
                  onClick={handleExecuteImport}
                  className="px-5 py-2.5 bg-[#E88069] hover:bg-[#d9725b] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isProcessing ? 'Procesando importación...' : `Importar ${validationSummary.valid} Casos`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
