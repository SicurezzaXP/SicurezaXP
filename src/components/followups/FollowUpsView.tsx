import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Send,
  User,
  Phone,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { CaseItem } from '../../types/case';
import { getCaseFollowUpInfo, FollowUpUrgency, addDaysToDate } from '../../utils/followUpUtils';
import { getPeruDateString } from '../../utils/dateUtils';
import { updateCase, addCaseFollowUpNote } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface FollowUpsViewProps {
  cases: CaseItem[];
  onViewCaseDetail: (item: CaseItem) => void;
  onRefreshCases?: () => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  cases,
  onViewCaseDetail,
  onRefreshCases,
}) => {
  const { user } = useAuth();
  const today = getPeruDateString();

  // Selected filter tab
  const [filterTab, setFilterTab] = useState<'todos_pendientes' | 'vencidos' | 'hoy' | 'proximos' | 'cumplidos' | 'todos'>('todos_pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Note Modal State
  const [activeCaseForNote, setActiveCaseForNote] = useState<CaseItem | null>(null);
  const [noteText, setNoteText] = useState('');
  const [nextActionDays, setNextActionDays] = useState<number>(2);
  const [markResolved, setMarkResolved] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Compute follow-up data for all non-archived cases
  const enrichedCases = useMemo(() => {
    return cases
      .filter((c) => !c.isArchived)
      .map((c) => {
        const followUp = getCaseFollowUpInfo(c);
        return {
          caseItem: c,
          followUp,
        };
      });
  }, [cases]);

  // Statistics
  const stats = useMemo(() => {
    let vencidos = 0;
    let hoy = 0;
    let proximos = 0;
    let cumplidos = 0;
    let totalPendientes = 0;

    enrichedCases.forEach(({ followUp }) => {
      if (followUp.isNeeded) {
        totalPendientes++;
        if (followUp.urgency === 'vencido') vencidos++;
        else if (followUp.urgency === 'hoy') hoy++;
        else if (followUp.urgency === 'proximo') proximos++;
      } else if (followUp.urgency === 'cumplido') {
        cumplidos++;
      }
    });

    return { vencidos, hoy, proximos, cumplidos, totalPendientes };
  }, [enrichedCases]);

  // Filtered list
  const filteredCases = useMemo(() => {
    return enrichedCases.filter(({ caseItem, followUp }) => {
      // Tab filter
      if (filterTab === 'todos_pendientes' && !followUp.isNeeded) return false;
      if (filterTab === 'vencidos' && followUp.urgency !== 'vencido') return false;
      if (filterTab === 'hoy' && followUp.urgency !== 'hoy') return false;
      if (filterTab === 'proximos' && followUp.urgency !== 'proximo') return false;
      if (filterTab === 'cumplidos' && followUp.urgency !== 'cumplido') return false;

      // Type filter
      if (selectedType && caseItem.tipoCaso !== selectedType) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchCode = caseItem.id.toLowerCase().includes(q);
        const matchName = (caseItem.nombresApellidos || '').toLowerCase().includes(q);
        const matchPhone = (caseItem.telefonoCliente || '').toLowerCase().includes(q);
        const matchOrder = (caseItem.numeroPedido || '').toLowerCase().includes(q);
        const matchDni = (caseItem.nroCasoDni || '').toLowerCase().includes(q);
        const matchDesc = (caseItem.solicitudCliente || '').toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchPhone && !matchOrder && !matchDni && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedCases, filterTab, selectedType, searchTerm]);

  // Handle Quick Resolve (1 click)
  const handleQuickResolve = async (c: CaseItem) => {
    const ok = window.confirm(`¿Marcar el caso ${c.id} como RESUELTO y cerrar el seguimiento?`);
    if (!ok) return;

    try {
      await updateCase(
        c.id,
        {
          estado: 'Cerrado',
          cierre: 'Procede',
          seguimientoCumplido: true,
          fechaCierre: today,
        },
        user?.email || 'info@sicurezza.pe'
      );
      if (onRefreshCases) onRefreshCases();
    } catch (e) {
      console.error('Error cerrando caso:', e);
      alert('Error al actualizar el caso.');
    }
  };

  // Handle Save Note
  const handleSaveFollowUp = async () => {
    if (!activeCaseForNote) return;
    if (!noteText.trim()) {
      alert('Por favor ingresa un detalle o nota de lo conversado/gestionado con el cliente.');
      return;
    }

    setIsSavingNote(true);
    try {
      const proximaFecha = markResolved ? '' : addDaysToDate(today, nextActionDays);
      await addCaseFollowUpNote(
        activeCaseForNote.id,
        noteText.trim(),
        user?.displayName || 'Administrador SICUREZZA XP',
        markResolved,
        proximaFecha
      );

      if (markResolved) {
        await updateCase(
          activeCaseForNote.id,
          {
            estado: 'Cerrado',
            cierre: 'Procede',
            seguimientoCumplido: true,
            fechaCierre: today,
          },
          user?.email || 'info@sicurezza.pe'
        );
      }

      setActiveCaseForNote(null);
      setNoteText('');
      setMarkResolved(false);
      if (onRefreshCases) onRefreshCases();
    } catch (e) {
      console.error('Error guardando seguimiento:', e);
      alert('Error al registrar seguimiento.');
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Bell className="w-3 h-3 text-blue-600" />
              Gestión de Seguimiento Activo
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Alertas cada 2 días
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Casos en Seguimiento & Alertas Internas
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Control centralizado para solicitudes, quejas y reclamos pendientes. El sistema monitorea los plazos de respuesta y alerta cuando un caso requiere contacto con el cliente.
          </p>
        </div>

        {/* Total Badge */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#161c36] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {stats.totalPendientes}
          </div>
          <div className="text-left">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">
              Pendientes de Atención
            </span>
            <span className="text-xs text-slate-800 font-semibold">
              Requieren seguimiento
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards (Urgency) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Vencidos */}
        <button
          type="button"
          onClick={() => setFilterTab('vencidos')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            filterTab === 'vencidos'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
              : 'bg-white hover:bg-rose-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Vencidos (&gt; 2 días)
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-2">
            {stats.vencidos}
          </div>
          <span className="text-[11px] text-rose-600/80 font-medium block mt-0.5">
            Superaron el plazo de 48h
          </span>
        </button>

        {/* Para Hoy */}
        <button
          type="button"
          onClick={() => setFilterTab('hoy')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            filterTab === 'hoy'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white hover:bg-amber-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Para Hoy (Alerta)
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">
            {stats.hoy}
          </div>
          <span className="text-[11px] text-amber-600/80 font-medium block mt-0.5">
            Cumplen plazo hoy
          </span>
        </button>

        {/* En Plazo */}
        <button
          type="button"
          onClick={() => setFilterTab('proximos')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            filterTab === 'proximos'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
              : 'bg-white hover:bg-blue-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              En Plazo (Próximos)
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">
            {stats.proximos}
          </div>
          <span className="text-[11px] text-blue-600/80 font-medium block mt-0.5">
            Dentro de las primeras 48h
          </span>
        </button>

        {/* Cumplidos */}
        <button
          type="button"
          onClick={() => setFilterTab('cumplidos')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            filterTab === 'cumplidos'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400'
              : 'bg-white hover:bg-emerald-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Resueltos / Cumplidos
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
            {stats.cumplidos}
          </div>
          <span className="text-[11px] text-emerald-600/80 font-medium block mt-0.5">
            Seguimientos finalizados
          </span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterTab('todos_pendientes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'todos_pendientes'
                ? 'bg-[#161c36] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todos los Pendientes ({stats.totalPendientes})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('vencidos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'vencidos'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            🔴 Vencidos ({stats.vencidos})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('hoy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'hoy'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            🟡 Para Hoy ({stats.hoy})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('proximos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'proximos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            🟢 En Plazo ({stats.proximos})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('cumplidos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'cumplidos'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Cumplidos ({stats.cumplidos})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'todos'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Ver Todos
          </button>
        </div>

        {/* Search Input & Type Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, caso, pedido..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700"
          >
            <option value="">Todos los tipos</option>
            <option value="Solicitud">Solicitud</option>
            <option value="Reclamo">Reclamo</option>
            <option value="Queja">Queja ATC</option>
            <option value="Libro de Reclamaciones">Libro Recl.</option>
            <option value="Consulta">Consulta</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            ¡No hay casos en este estado de seguimiento!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Todos los seguimientos están al día o no se encontraron casos que coincidan con los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCases.map(({ caseItem, followUp }) => {
            const isOverdue = followUp.urgency === 'vencido';
            const isToday = followUp.urgency === 'hoy';
            const isResolved = followUp.urgency === 'cumplido' || caseItem.estado === 'Cerrado';

            return (
              <div
                key={caseItem.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isOverdue
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isToday
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 tracking-tight">
                        {caseItem.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          caseItem.tipoCaso === 'Reclamo'
                            ? 'bg-rose-100 text-rose-800'
                            : caseItem.tipoCaso === 'Queja'
                            ? 'bg-purple-100 text-purple-800'
                            : caseItem.tipoCaso === 'Libro de Reclamaciones'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {caseItem.tipoCaso}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Ingreso: <strong>{caseItem.fechaIngreso}</strong> · {caseItem.canal}
                    </span>
                  </div>

                  {/* Urgency Badge */}
                  <div
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                      isOverdue
                        ? 'bg-rose-600 text-white animate-pulse'
                        : isToday
                        ? 'bg-amber-500 text-white'
                        : isResolved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {followUp.label}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 text-xs">
                  {/* Client info */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">
                          {caseItem.nombresApellidos || 'Cliente Sin Nombre'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          DNI: {caseItem.nroCasoDni || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {caseItem.telefonoCliente && caseItem.telefonoCliente !== 'N/A' && (
                      <a
                        href={`https://wa.me/51${caseItem.telefonoCliente.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-2xs transition-colors"
                        title="Abrir chat de WhatsApp con el cliente"
                      >
                        <Phone className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* Motivo & Solicitud */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700">Motivo:</span>
                      <span className="text-slate-600 font-medium">
                        {caseItem.motivo} {caseItem.submotivo ? `· ${caseItem.submotivo}` : ''}
                      </span>
                    </div>

                    {caseItem.numeroPedido && caseItem.numeroPedido !== 'N/A' && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">N° Pedido:</span>
                        <span className="font-mono text-slate-700 font-bold">{caseItem.numeroPedido}</span>
                      </div>
                    )}

                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Solicitud / Caso:
                      </span>
                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg line-clamp-2 border border-slate-100 italic">
                        "{caseItem.solicitudCliente || caseItem.detalleSolucion || 'Sin descripción'}"
                      </p>
                    </div>
                  </div>

                  {/* History Preview */}
                  {caseItem.historialSeguimientos && caseItem.historialSeguimientos.length > 0 && (
                    <div className="pt-1 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Última acción ({caseItem.historialSeguimientos.length} registradas):
                      </span>
                      <div className="text-[11px] bg-blue-50/60 p-2 rounded-lg border border-blue-100 text-blue-900">
                        <span className="font-bold text-[10px] text-blue-700 block">
                          {new Date(caseItem.historialSeguimientos[0].fecha).toLocaleDateString('es-PE')} · {caseItem.historialSeguimientos[0].usuario}:
                        </span>
                        <span>{caseItem.historialSeguimientos[0].nota}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer / Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onViewCaseDetail(caseItem)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Ver Detalle</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => handleQuickResolve(caseItem)}
                        className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                        title="Marcar el caso como resuelto y cerrar"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Resolver</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setActiveCaseForNote(caseItem);
                        setNoteText('');
                        setMarkResolved(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Registrar Acción</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Register Follow-up Action / Note */}
      {activeCaseForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#161c36] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Seguimiento de Caso
                </span>
                <h3 className="text-base font-bold flex items-center gap-2">
                  Registrar Acción en {activeCaseForNote.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCaseForNote(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-sm">
                  {activeCaseForNote.nombresApellidos}
                </div>
                <div className="text-slate-500">
                  {activeCaseForNote.tipoCaso} · {activeCaseForNote.motivo} · {activeCaseForNote.canal}
                </div>
              </div>

              {/* Note input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Detalle de la acción / Contacto realizado:</span>
                  <span className="text-rose-500">* Obligatorio</span>
                </label>
                <textarea
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Ej: Se contactó por WhatsApp a la clienta. Se le brindó el código de seguimiento de Olva Courier y confirmó que esperará la entrega mañana."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Next Alert / Resolve Option */}
              <div className="space-y-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="font-bold text-blue-950 text-xs">
                  Próximo paso para este caso:
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="next_action"
                      checked={!markResolved}
                      onChange={() => setMarkResolved(false)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      Mantener en seguimiento y programar nueva alerta en:
                    </span>
                  </label>

                  {!markResolved && (
                    <div className="pl-6 flex items-center gap-2">
                      {[1, 2, 3, 5, 7].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setNextActionDays(days)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            nextActionDays === days
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {days} día{days > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-emerald-800 pt-1">
                    <input
                      type="radio"
                      name="next_action"
                      checked={markResolved}
                      onChange={() => setMarkResolved(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold">
                      ✅ Caso solucionado: Marcar seguimiento como cumplido y cerrar caso
                    </span>
                  </label>
                </div>
              </div>

              {/* Previous History */}
              {activeCaseForNote.historialSeguimientos && activeCaseForNote.historialSeguimientos.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800 text-[11px] block">
                    Historial previo de acciones:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {activeCaseForNote.historialSeguimientos.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]"
                      >
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span>{item.usuario}</span>
                          <span>{new Date(item.fecha).toLocaleString('es-PE')}</span>
                        </div>
                        <p className="text-slate-800 mt-1 font-sans">{item.nota}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveCaseForNote(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveFollowUp}
                disabled={isSavingNote || !noteText.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSavingNote ? 'Guardando...' : 'Guardar Acción'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
