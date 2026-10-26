import React, { useState } from 'react';
import { X, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CaseItem } from '../../types/case';
import { updateCase } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import {
  ESTADOS_CASO,
  CIERRES_CASO,
  FCR_OPCIONES,
  SOLUCIONES_BRINDADAS,
  ORIGENES_VENTA,
  TIPOS_CASO,
  MOTIVOS,
} from '../../config/formFields';

interface CaseEditModalProps {
  caseItem: CaseItem | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const CaseEditModal: React.FC<CaseEditModalProps> = ({
  caseItem,
  onClose,
  onUpdated,
}) => {
  const { user } = useAuth();

  // Form states
  const [estado, setEstado] = useState<string>(caseItem?.estado || 'Abierto');
  const [cierre, setCierre] = useState<string>(caseItem?.cierre || 'Pendiente');
  const [cerroEnFcr, setCerroEnFcr] = useState<string>(caseItem?.cerroEnFcr || 'Sí');
  const [solucionBrindada, setSolucionBrindada] = useState<string>(
    caseItem?.solucionBrindada || 'Cambio - Talla'
  );
  const [detalleSolucion, setDetalleSolucion] = useState<string>(
    caseItem?.detalleSolucion || caseItem?.solucionAccion || ''
  );
  const [fechaRespuesta, setFechaRespuesta] = useState<string>(caseItem?.fechaRespuesta || '');
  const [fechaCierre, setFechaCierre] = useState<string>(caseItem?.fechaCierre || '');

  // Admin editable core fields
  const [tipoCaso, setTipoCaso] = useState(caseItem?.tipoCaso || 'Solicitud');
  const [motivo, setMotivo] = useState(caseItem?.motivo || caseItem?.categoria || 'Producto');
  const [origenVenta, setOrigenVenta] = useState(
    caseItem?.origenVenta || caseItem?.tienda || 'Tda. Jockey Plaza'
  );
  const [solicitudCliente, setSolicitudCliente] = useState(
    caseItem?.solicitudCliente || caseItem?.descripcion || ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync draft
  React.useEffect(() => {
    if (caseItem) {
      setEstado(caseItem.estado || 'Abierto');
      setCierre(caseItem.cierre || 'Pendiente');
      setCerroEnFcr(caseItem.cerroEnFcr || 'Sí');
      setSolucionBrindada(caseItem.solucionBrindada || 'Cambio - Talla');
      setDetalleSolucion(caseItem.detalleSolucion || caseItem.solucionAccion || '');
      setFechaRespuesta(caseItem.fechaRespuesta || '');
      setFechaCierre(caseItem.fechaCierre || '');
      setTipoCaso(caseItem.tipoCaso || 'Solicitud');
      setMotivo(caseItem.motivo || caseItem.categoria || 'Producto');
      setOrigenVenta(caseItem.origenVenta || caseItem.tienda || 'Tda. Jockey Plaza');
      setSolicitudCliente(caseItem.solicitudCliente || caseItem.descripcion || '');
    }
  }, [caseItem]);

  if (!caseItem) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const updates: Partial<CaseItem> = {
        estado,
        cierre,
        cerroEnFcr,
        solucionBrindada,
        detalleSolucion,
        fechaRespuesta,
        fechaCierre: estado === 'Cerrado' && !fechaCierre ? new Date().toISOString().split('T')[0] : fechaCierre,
        tipoCaso,
        motivo,
        origenVenta,
        solicitudCliente,
        // Retrocompatibilidad
        solucionAccion: detalleSolucion,
        tienda: origenVenta,
        categoria: motivo,
        descripcion: solicitudCliente,
        clienteConforme: cierre === 'Procede' ? 'Sí' : 'En seguimiento',
      };

      await updateCase(caseItem.id, updates, user?.email || 'info@sicurezza.pe');
      onUpdated();
      onClose();
    } catch (err: any) {
      console.error('Error al actualizar el caso:', err);
      setErrorMsg(`No se pudo actualizar el caso: ${err.message || 'Error en base de datos'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Blue Theme */}
        <div className="bg-[#161c36] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold">
              {caseItem.id}
            </span>
            <span className="text-sm font-bold text-white">
              Gestionar y Editar Caso ATC
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Estado */}
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Estado *
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ESTADOS_CASO.map((es) => (
                  <option key={es} value={es}>
                    {es}
                  </option>
                ))}
              </select>
            </div>

            {/* Cierre */}
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Cierre *
              </label>
              <select
                value={cierre}
                onChange={(e) => setCierre(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CIERRES_CASO.map((ci) => (
                  <option key={ci} value={ci}>
                    {ci}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* FCR */}
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                ¿Se cerró en FCR? *
              </label>
              <select
                value={cerroEnFcr}
                onChange={(e) => setCerroEnFcr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FCR_OPCIONES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Solución Brindada */}
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Solución Brindada *
              </label>
              <select
                value={solucionBrindada}
                onChange={(e) => setSolucionBrindada(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SOLUCIONES_BRINDADAS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha Respuesta */}
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Fecha de Respuesta
              </label>
              <input
                type="date"
                value={fechaRespuesta}
                onChange={(e) => setFechaRespuesta(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>

            {/* Fecha Cierre */}
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Fecha de Cierre
              </label>
              <input
                type="date"
                value={fechaCierre}
                onChange={(e) => setFechaCierre(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Detalle Solución */}
          <div>
            <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
              Detalle de Solución Brindada o Seguimiento *
            </label>
            <textarea
              rows={3}
              required
              value={detalleSolucion}
              onChange={(e) => setDetalleSolucion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sede / Tipo / Motivo */}
          <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Tipo de Caso
              </label>
              <select
                value={tipoCaso}
                onChange={(e) => setTipoCaso(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
              >
                {TIPOS_CASO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Motivo
              </label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
              >
                {MOTIVOS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
