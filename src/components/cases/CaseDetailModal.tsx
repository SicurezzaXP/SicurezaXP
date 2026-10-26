import React from 'react';
import {
  X,
  Calendar,
  Building2,
  Tag,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  Shield,
  Edit,
  Archive,
  CheckCircle2,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  CheckCheck,
  Trash2,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { CaseItem } from '../../types/case';
import { formatDisplayDateOnly } from '../../utils/dateUtils';
import { getCaseFollowUpInfo } from '../../utils/followUpUtils';

interface CaseDetailModalProps {
  caseItem: CaseItem | null;
  onClose: () => void;
  onEdit?: (c: CaseItem) => void;
  onArchive?: (c: CaseItem) => void;
  onDelete?: (c: CaseItem) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  onClose,
  onEdit,
  onArchive,
  onDelete,
}) => {
  if (!caseItem) return null;

  const clientName = caseItem.nombresApellidos || caseItem.clienteNombre || 'Sin nombre';
  const clientDni = caseItem.nroCasoDni || caseItem.clienteDocumento || '-';
  const clientTel = caseItem.telefonoCliente || caseItem.clienteTelefono || '-';
  const clientEmail = caseItem.correoCliente || caseItem.clienteEmail || '-';
  const store = caseItem.origenVenta || caseItem.tienda || '-';
  const tipo = caseItem.tipoCaso || 'Solicitud';
  const motive = caseItem.motivo || caseItem.categoria || '-';
  const isOpen = caseItem.estado === 'Abierto' || caseItem.estado === 'Pendiente' || caseItem.estado === 'En gestión';
  const followUp = getCaseFollowUpInfo(caseItem);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Blue Theme */}
        <div className="bg-[#161c36] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold">
              {caseItem.id}
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Detalle del Caso de Atención</h3>
              <p className="text-[11px] text-slate-300">
                Registrado el {formatDisplayDateOnly(caseItem.fechaIngreso)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Top Status & Closure Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Estado:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isOpen
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {caseItem.estado || 'Abierto'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Cierre:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  caseItem.cierre === 'Procede'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : caseItem.cierre === 'No procede'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                {caseItem.cierre || 'Pendiente'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">FCR (Primer Contacto):</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white border border-slate-300 text-slate-800">
                {caseItem.cerroEnFcr || 'Sí'}
              </span>
            </div>
          </div>

          {/* Follow-up / Alerta Status Card */}
          {followUp.isNeeded && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-fade-in ${
                followUp.urgency === 'vencido'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : followUp.urgency === 'hoy'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 shrink-0 text-current" />
                <div>
                  <span className="font-extrabold text-xs block">
                    {followUp.label} (Alerta programada cada {caseItem.frecuenciaSeguimientoDias || 2} días)
                  </span>
                  <span className="text-[11px] opacity-80">
                    Fecha límite para contactar al cliente: <strong>{caseItem.fechaProximoSeguimiento || 'En proceso'}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Datos Cliente */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 uppercase text-[11px] tracking-wider text-blue-900">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Registro Datos del Cliente</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Cliente:</span>
                <span className="font-bold text-slate-900">{clientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">DNI / Documento:</span>
                <span className="font-semibold text-slate-800 font-mono">{clientDni}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Canal de Atención:</span>
                <span className="font-semibold text-slate-800">{caseItem.canal}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Teléfono:</span>
                <span className="font-medium text-slate-800">{clientTel}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Correo Electrónico:</span>
                <span className="font-medium text-slate-800">{clientEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Campaña MKT:</span>
                <span className="font-medium text-slate-800">{caseItem.campanaMkt || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Datos de la Compra */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 uppercase text-[11px] tracking-wider text-blue-900">
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Datos de la Compra</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Origen de Venta:</span>
                <span className="font-bold text-slate-900">{store}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Fecha de Venta:</span>
                <span className="font-medium text-slate-800">{caseItem.fechaVenta || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Nro. Pedido:</span>
                <span className="font-bold text-blue-700 font-mono">{caseItem.numeroPedido || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Nro. Boleta:</span>
                <span className="font-mono text-slate-800">{caseItem.numeroBoleta || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Producto:</span>
                <span className="font-semibold text-slate-800">{caseItem.producto || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">SKU:</span>
                <span className="font-mono text-slate-800">{caseItem.sku || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Cantidad & Talla:</span>
                <span className="font-medium text-slate-800">
                  {caseItem.cantidad || 1} un. · Talla {caseItem.talla || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Color:</span>
                <span className="font-medium text-slate-800">{caseItem.color || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Registro Caso */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 uppercase text-[11px] tracking-wider text-blue-900">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>3. Registro del Caso y Solicitud</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Tipo de Caso:</span>
                <span className="font-bold text-slate-900">{tipo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Motivo:</span>
                <span className="font-bold text-slate-800">{motive}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Sub Motivo:</span>
                <span className="font-medium text-slate-800">{caseItem.submotivo || '-'}</span>
              </div>
            </div>
            <div className="pt-1">
              <span className="text-slate-400 block text-[10px] font-medium mb-1">
                Solicitud / Manifestación de la Clienta:
              </span>
              <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                {caseItem.solicitudCliente || caseItem.descripcion || 'Sin detalle especificado.'}
              </p>
            </div>
          </div>

          {/* Section 4: Queja ATC */}
          {(caseItem.quejaPersonalInvolucrado && caseItem.quejaPersonalInvolucrado !== 'N/A') || caseItem.sucursalQueja !== 'N/A' ? (
            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-2">
              <h4 className="font-bold text-rose-900 flex items-center gap-2 uppercase text-[11px] tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>4. Información de Queja ATC</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-rose-500 block text-[10px] font-medium">Personal involucrado:</span>
                  <span className="font-bold text-rose-900">{caseItem.quejaPersonalInvolucrado}</span>
                </div>
                <div>
                  <span className="text-rose-500 block text-[10px] font-medium">Sucursal de queja:</span>
                  <span className="font-medium text-rose-900">{caseItem.sucursalQueja}</span>
                </div>
                <div>
                  <span className="text-rose-500 block text-[10px] font-medium">Fecha atención:</span>
                  <span className="font-medium text-rose-900">{caseItem.fechaAtencion || '-'}</span>
                </div>
                <div>
                  <span className="text-rose-500 block text-[10px] font-medium">Horario atención:</span>
                  <span className="font-medium text-rose-900">{caseItem.horarioAtencion || '-'}</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Section 5: Finalización del Caso */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 uppercase text-[11px] tracking-wider text-blue-900">
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>5. Finalización y Solución Brindada</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Solución Brindada:</span>
                <span className="font-bold text-slate-900">{caseItem.solucionBrindada || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Fecha de Respuesta:</span>
                <span className="font-medium text-slate-800">{caseItem.fechaRespuesta || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Fecha de Cierre:</span>
                <span className="font-medium text-slate-800">{caseItem.fechaCierre || '-'}</span>
              </div>
            </div>
            <div className="pt-1">
              <span className="text-slate-400 block text-[10px] font-medium mb-1">
                Detalle de Solución o Seguimiento:
              </span>
              <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                {caseItem.detalleSolucion || caseItem.solucionAccion || 'Sin detalle de solución registrado.'}
              </p>
            </div>
            {caseItem.sustentosAtencion && (
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Sustentos de atención:</span>
                <span className="font-mono text-slate-700">{caseItem.sustentosAtencion}</span>
              </div>
            )}
          </div>

          {/* Custom Fields if any */}
          {caseItem.customFields && Object.keys(caseItem.customFields).length > 0 && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-2">
              <h4 className="font-bold text-blue-900 text-[11px] uppercase tracking-wider">
                Campos Personalizados Adicionales
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(caseItem.customFields).map(([k, v]: any) => (
                  <div key={k}>
                    <span className="text-blue-500 block text-[10px] font-medium">
                      {v?.label || k}:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {String(v?.value ?? v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            ID: {caseItem.id}
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(caseItem);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(caseItem);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar Caso</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
