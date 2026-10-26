import React from 'react';
import { CaseItem } from '../../types/case';
import { formatDisplayDateOnly } from '../../utils/dateUtils';
import { Eye, ExternalLink, ShieldCheck } from 'lucide-react';

interface ExecutiveSummaryTableProps {
  cases: CaseItem[];
  onViewCase: (c: CaseItem) => void;
  onGoToExplorer: () => void;
}

export const ExecutiveSummaryTable: React.FC<ExecutiveSummaryTableProps> = ({
  cases,
  onViewCase,
  onGoToExplorer,
}) => {
  const displayCases = cases.slice(0, 8); // Top 8 most recent in filtered period

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Resumen de Casos en el Período Analizado
          </h3>
          <p className="text-xs text-slate-400">
            Mostrando {displayCases.length} de {cases.length} casos del filtro activo
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToExplorer}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
        >
          <span>Ver todos en Base de Casos</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {cases.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          No hay casos que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Fecha Ingreso</th>
                <th className="px-4 py-3">Sede / Canal</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo / Motivo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Cierre</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayCases.map((c) => {
                const clientName = c.nombresApellidos || c.clienteNombre || 'Sin nombre';
                const clientDni = c.nroCasoDni || c.clienteDocumento || '';
                const store = (c.origenVenta || c.tienda || 'No especificada').replace('Tda. ', '');
                const channel = c.canal || 'WhatsApp';
                const motive = c.motivo || c.categoria || 'Producto';
                const tipo = c.tipoCaso || 'Solicitud';
                const isOpen = c.estado === 'Abierto' || c.estado === 'Pendiente' || c.estado === 'En gestión';

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {c.id}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDisplayDateOnly(c.fechaIngreso)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800 block truncate max-w-[130px]" title={store}>
                        {store}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block truncate max-w-[150px]" title={clientName}>
                        {clientName}
                      </span>
                      {clientDni && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          DNI: {clientDni}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="truncate block max-w-[180px] font-semibold text-slate-800" title={tipo}>
                        {tipo}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                        {motive}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isOpen
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {c.estado || 'Abierto'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.cierre === 'Procede'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : c.cierre === 'No procede'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {c.cierre || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onViewCase(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer inline-flex items-center"
                        title="Ver detalle del caso"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
