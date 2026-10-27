import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  Edit,
  Archive,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Tag,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Filter,
  Download,
  Trash2,
  Database,
} from 'lucide-react';
import { CaseItem } from '../../types/case';
import { formatDisplayDateOnly } from '../../utils/dateUtils';
import { CaseDetailModal } from './CaseDetailModal';
import { CaseEditModal } from './CaseEditModal';
import { archiveCase, deleteCase } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import {
  ORIGENES_VENTA,
  TIPOS_CASO,
  MOTIVOS,
  ESTADOS_CASO,
  CIERRES_CASO,
  getMasterOptions,
  MASTER_OPTIONS_UPDATED_EVENT,
} from '../../config/formFields';

interface CaseExplorerViewProps {
  cases: CaseItem[];
  onExportFiltered?: (casesToExport: CaseItem[]) => void;
}

type SortField = 'id' | 'fechaIngreso' | 'cliente' | 'origenVenta' | 'motivo' | 'estado';
type SortOrder = 'asc' | 'desc';

export const CaseExplorerView: React.FC<CaseExplorerViewProps> = ({ cases, onExportFiltered }) => {
  const { user, permissions } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedMotive, setSelectedMotive] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCierre, setSelectedCierre] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [masterOptions, setMasterOptions] = useState(() => getMasterOptions());

  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setMasterOptions(e.detail);
    };
    window.addEventListener(MASTER_OPTIONS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(MASTER_OPTIONS_UPDATED_EVENT, handleUpdate);
  }, []);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('fechaIngreso');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals
  const [viewingCase, setViewingCase] = useState<CaseItem | null>(null);
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);
  const [caseToArchive, setCaseToArchive] = useState<CaseItem | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<CaseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filter & Search logic
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Archive check
      if (!showArchived && c.isArchived) return false;
      if (showArchived && !c.isArchived) return false;

      // Dropdowns
      if (selectedStore && (c.origenVenta !== selectedStore && c.tienda !== selectedStore)) return false;
      if (selectedTipo && c.tipoCaso !== selectedTipo) return false;
      if (selectedMotive && (c.motivo !== selectedMotive && c.categoria !== selectedMotive)) return false;
      if (selectedStatus && c.estado !== selectedStatus) return false;
      if (selectedCierre && c.cierre !== selectedCierre) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const clientName = (c.nombresApellidos || c.clienteNombre || '').toLowerCase();
        const clientDoc = (c.nroCasoDni || c.clienteDocumento || '').toLowerCase();
        const clientTel = (c.telefonoCliente || c.clienteTelefono || '').toLowerCase();
        const clientEmail = (c.correoCliente || c.clienteEmail || '').toLowerCase();
        const orderNum = (c.numeroPedido || '').toLowerCase();
        const boletaNum = (c.numeroBoleta || '').toLowerCase();
        const prod = (c.producto || '').toLowerCase();
        const sol = (c.solicitudCliente || c.descripcion || '').toLowerCase();
        const store = (c.origenVenta || c.tienda || '').toLowerCase();
        const mot = (c.motivo || c.categoria || '').toLowerCase();
        const id = (c.id || '').toLowerCase();

        const matches =
          id.includes(term) ||
          clientName.includes(term) ||
          clientDoc.includes(term) ||
          clientTel.includes(term) ||
          clientEmail.includes(term) ||
          orderNum.includes(term) ||
          boletaNum.includes(term) ||
          prod.includes(term) ||
          sol.includes(term) ||
          store.includes(term) ||
          mot.includes(term);

        if (!matches) return false;
      }

      return true;
    });
  }, [
    cases,
    showArchived,
    selectedStore,
    selectedTipo,
    selectedMotive,
    selectedStatus,
    selectedCierre,
    searchTerm,
  ]);

  // Sort logic
  const sortedCases = useMemo(() => {
    return [...filteredCases].sort((a, b) => {
      let valA: string = '';
      let valB: string = '';

      switch (sortField) {
        case 'id':
          valA = a.id || '';
          valB = b.id || '';
          break;
        case 'fechaIngreso':
          valA = a.fechaIngreso || '';
          valB = b.fechaIngreso || '';
          break;
        case 'cliente':
          valA = a.nombresApellidos || a.clienteNombre || '';
          valB = b.nombresApellidos || b.clienteNombre || '';
          break;
        case 'origenVenta':
          valA = a.origenVenta || a.tienda || '';
          valB = b.origenVenta || b.tienda || '';
          break;
        case 'motivo':
          valA = a.motivo || a.categoria || '';
          valB = b.motivo || b.categoria || '';
          break;
        case 'estado':
          valA = a.estado || '';
          valB = b.estado || '';
          break;
      }

      const comparison = valA.localeCompare(valB, 'es', { numeric: true });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredCases, sortField, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(sortedCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCases.slice(start, start + pageSize);
  }, [sortedCases, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleArchiveConfirm = async () => {
    if (!caseToArchive) return;
    setIsArchiving(true);
    try {
      await archiveCase(caseToArchive.id, !caseToArchive.isArchived);
      setFeedbackMsg(
        caseToArchive.isArchived
          ? `Caso ${caseToArchive.id} desarchivado y devuelto a la base activa.`
          : `Caso ${caseToArchive.id} archivado correctamente.`
      );
      setCaseToArchive(null);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Error archivando caso:', err);
      alert('Error al archivar el caso');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!caseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCase(caseToDelete.id);
      setFeedbackMsg(`El caso ${caseToDelete.id} fue eliminado permanentemente.`);
      setCaseToDelete(null);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Error eliminando caso:', err);
      setFeedbackMsg('Error al eliminar el caso.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Feedback banner */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Search and Filters Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                Base Centralizada
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {cases.length} casos registrados en total
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Explorador y Gestión de Casos ATC
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onExportFiltered && (
              <button
                type="button"
                onClick={() => onExportFiltered(filteredCases)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                title="Exportar vista actual a Excel"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Exportar Filtrados ({filteredCases.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                showArchived
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>{showArchived ? 'Viendo Archivados' : 'Ver Archivados'}</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por DNI, nombres de cliente, número de pedido, boleta, producto o detalle de solicitud..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
          {/* Sede / Origen Venta */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sede / Origen Venta
            </label>
            <select
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              value={selectedTipo}
              onChange={(e) => {
                setSelectedTipo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              value={selectedMotive}
              onChange={(e) => {
                setSelectedMotive(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              {ESTADOS_CASO.map((es) => (
                <option key={es} value={es}>
                  {es}
                </option>
              ))}
            </select>
          </div>

          {/* Cierre */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cierre
            </label>
            <select
              value={selectedCierre}
              onChange={(e) => {
                setSelectedCierre(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Main Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#161c36] text-white uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Código</span>
                    {sortField === 'id' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fechaIngreso')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Fecha Ingreso</span>
                    {sortField === 'fechaIngreso' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cliente')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Cliente (DNI)</span>
                    {sortField === 'cliente' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('origenVenta')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Sede / Canal</span>
                    {sortField === 'origenVenta' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('motivo')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tipo & Motivo</span>
                    {sortField === 'motivo' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>
                <th className="px-4 py-3.5">Producto & Pedido</th>
                <th
                  onClick={() => handleSort('estado')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Estado / Cierre</span>
                    {sortField === 'estado' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-xs text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <Database className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm mb-1">
                      No hay casos registrados en el sistema
                    </p>
                    <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                      La base de datos refleja exclusivamente los registros reales de tu proyecto Firebase Cloud Firestore. Los casos que ingreses desde el formulario de registro se guardarán y mostrarán aquí.
                    </p>
                  </td>
                </tr>
              ) : paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-slate-400">
                    No se encontraron casos con los filtros o término de búsqueda indicado.
                  </td>
                </tr>
              ) : (
                paginatedCases.map((c) => {
                  const clientName = c.nombresApellidos || c.clienteNombre || 'Sin nombre';
                  const clientDni = c.nroCasoDni || c.clienteDocumento || '';
                  const store = (c.origenVenta || c.tienda || 'No especificada').replace('Tda. ', '');
                  const channel = c.canal || 'WhatsApp';
                  const motive = c.motivo || c.categoria || 'Producto';
                  const tipo = c.tipoCaso || 'Solicitud';
                  const isOpen = c.estado === 'Abierto' || c.estado === 'Pendiente' || c.estado === 'En gestión';

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        c.isArchived ? 'bg-slate-50/70 opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {c.id}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-medium">
                        {formatDisplayDateOnly(c.fechaIngreso)}
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
                        <span className="font-semibold text-slate-800 block truncate max-w-[130px]" title={store}>
                          {store}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {channel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="truncate block max-w-[160px] font-bold text-slate-800" title={tipo}>
                          {tipo}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[160px]">
                          {motive}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="truncate block max-w-[160px] font-medium text-slate-800" title={c.producto}>
                          {c.producto || '-'}
                        </span>
                        {c.numeroPedido && (
                          <span className="text-[10px] text-blue-600 block truncate max-w-[160px] font-mono">
                            {c.numeroPedido}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isOpen
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {c.estado || 'Abierto'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Cierre: <strong className="text-slate-700">{c.cierre || 'Pendiente'}</strong>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingCase(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Ver detalles completos del caso"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCase(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Editar estado y resolución del caso"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCaseToArchive(c)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              c.isArchived
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title={c.isArchived ? 'Desarchivar caso' : 'Archivar caso'}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCaseToDelete(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar caso permanentemente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Mostrando página <strong className="text-slate-900">{currentPage}</strong> de{' '}
            <strong className="text-slate-900">{totalPages}</strong> ({filteredCases.length} casos encontrados)
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewingCase && (
        <CaseDetailModal
          caseItem={viewingCase}
          onClose={() => setViewingCase(null)}
          onEdit={(c) => {
            setViewingCase(null);
            setEditingCase(c);
          }}
          onDelete={(c) => {
            setViewingCase(null);
            setCaseToDelete(c);
          }}
        />
      )}

      {editingCase && (
        <CaseEditModal
          caseItem={editingCase}
          onClose={() => setEditingCase(null)}
          onUpdated={() => {
            setEditingCase(null);
            setFeedbackMsg('Caso actualizado exitosamente.');
            setTimeout(() => setFeedbackMsg(null), 3000);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {caseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                ¿Eliminar permanentemente este caso?
              </h3>
              <p className="text-xs text-slate-500">
                Se eliminará el caso <strong className="font-mono text-slate-900">{caseToDelete.id}</strong> del cliente <strong className="text-slate-800">{caseToDelete.nombresApellidos || caseToDelete.clienteNombre || 'Sin nombre'}</strong> de la base de datos de Firestore. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCaseToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      {caseToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Archive className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                {caseToArchive.isArchived ? '¿Desarchivar Caso?' : '¿Archivar Caso?'}
              </h3>
              <p className="text-xs text-slate-500">
                {caseToArchive.isArchived
                  ? `El caso ${caseToArchive.id} volverá a mostrarse en los listados activos y reportes.`
                  : `El caso ${caseToArchive.id} se ocultará de la vista diaria, pero se mantendrá en el historial para auditoría.`}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCaseToArchive(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isArchiving}
                onClick={handleArchiveConfirm}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isArchiving ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
