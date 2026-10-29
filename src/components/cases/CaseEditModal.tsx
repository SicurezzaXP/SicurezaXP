import React, { useState } from 'react';
import { X, Save, AlertTriangle, CheckCircle2, Bell } from 'lucide-react';
import { CaseItem } from '../../types/case';
import { updateCase } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { addDaysToDate } from '../../utils/followUpUtils';
import { getPeruDateString } from '../../utils/dateUtils';
import {
  ESTADOS_CASO,
  CIERRES_CASO,
  FCR_OPCIONES,
  SOLUCIONES_BRINDADAS,
  ORIGENES_VENTA,
  TIPOS_CASO,
  MOTIVOS,
  getMasterOptions,
  MASTER_OPTIONS_UPDATED_EVENT,
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
  const today = getPeruDateString();

  const [masterOptions, setMasterOptions] = useState(() => getMasterOptions());

  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setMasterOptions(e.detail);
    };
    window.addEventListener(MASTER_OPTIONS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(MASTER_OPTIONS_UPDATED_EVENT, handleUpdate);
  }, []);

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
  const [canal, setCanal] = useState(caseItem?.canal || 'WhatsApp');
  const [clienteNombre, setClienteNombre] = useState(
    caseItem?.nombresApellidos || caseItem?.clienteNombre || ''
  );
  const [clienteTelefono, setClienteTelefono] = useState(
    caseItem?.telefonoCliente || caseItem?.clienteTelefono || ''
  );

  // Dynamic available motivos depending on tipoCaso
  const availableMotivos = React.useMemo(() => {
    const baseList =
      tipoCaso === 'Consulta' ? masterOptions.consultaMotivos : masterOptions.motivos;
    if (motivo && !baseList.includes(motivo)) {
      return [motivo, ...baseList];
    }
    return baseList;
  }, [tipoCaso, masterOptions, motivo]);

  // Follow-up alert fields
  const [requiereSeguimiento, setRequiereSeguimiento] = useState<boolean>(
    caseItem?.requiereSeguimiento ?? (caseItem?.estado !== 'Cerrado')
  );
  const [fechaProximoSeguimiento, setFechaProximoSeguimiento] = useState<string>(
    caseItem?.fechaProximoSeguimiento || addDaysToDate(caseItem?.fechaIngreso || today, 2)
  );
  const [frecuenciaSeguimientoDias, setFrecuenciaSeguimientoDias] = useState<number>(
    caseItem?.frecuenciaSeguimientoDias || 2
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
      setCanal(caseItem.canal || 'WhatsApp');
      setClienteNombre(caseItem.nombresApellidos || caseItem.clienteNombre || '');
      setClienteTelefono(caseItem.telefonoCliente || caseItem.clienteTelefono || '');
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
        fechaCierre: estado === 'Cerrado' && !fechaCierre ? today : fechaCierre,
        tipoCaso,
        motivo,
        origenVenta,
        solicitudCliente,
        canal,
        nombresApellidos: clienteNombre,
        telefonoCliente: clienteTelefono,
        // Alertas y Seguimiento
        requiereSeguimiento: estado === 'Cerrado' ? false : requiereSeguimiento,
        fechaProximoSeguimiento: estado === 'Cerrado' ? '' : fechaProximoSeguimiento,
        frecuenciaSeguimientoDias,
        seguimientoCumplido: estado === 'Cerrado',
        // Retrocompatibilidad
        solucionAccion: detalleSolucion,
        tienda: origenVenta,
        categoria: motivo,
        descripcion: solicitudCliente,
        clienteNombre,
        clienteTelefono,
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

          {/* Seguimiento y Alerta Interna */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900 text-xs">
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <input
                  type="checkbox"
                  checked={requiereSeguimiento && estado !== 'Cerrado'}
                  disabled={estado === 'Cerrado'}
                  onChange={(e) => setRequiereSeguimiento(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>Activar Alerta de Seguimiento Interno</span>
              </label>

              {estado === 'Cerrado' && (
                <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Caso Cerrado (Sin alertas)
                </span>
              )}
            </div>

            {requiereSeguimiento && estado !== 'Cerrado' && (
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-blue-100 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                    Fecha Próxima Alerta
                  </label>
                  <input
                    type="date"
                    value={fechaProximoSeguimiento}
                    onChange={(e) => setFechaProximoSeguimiento(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                    Cadencia de Alerta
                  </label>
                  <select
                    value={frecuenciaSeguimientoDias}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setFrecuenciaSeguimientoDias(d);
                      setFechaProximoSeguimiento(addDaysToDate(today, d));
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    <option value={1}>Cada 1 día (Diario)</option>
                    <option value={2}>Cada 2 días (Estándar 48h)</option>
                    <option value={3}>Cada 3 días</option>
                    <option value={5}>Cada 5 días</option>
                    <option value={7}>Cada 7 días (Semanal)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Datos del Cliente y Canal */}
          <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Cliente
              </label>
              <input
                type="text"
                value={clienteNombre}
                placeholder="Nombre de la clienta"
                onChange={(e) => setClienteNombre(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={clienteTelefono}
                placeholder="Teléfono"
                onChange={(e) => setClienteTelefono(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Canal de Atención
              </label>
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {masterOptions.canales.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sede / Tipo / Motivo */}
          <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Tipo de Caso
              </label>
              <select
                value={tipoCaso}
                onChange={(e) => {
                  const newTipo = e.target.value;
                  setTipoCaso(newTipo);
                  if (newTipo === 'Consulta') {
                    setMotivo(masterOptions.consultaMotivos[0] || 'Stock y Disponibilidad de Producto');
                  } else {
                    setMotivo(masterOptions.motivos[0] || 'Producto');
                  }
                }}
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
                Motivo ({tipoCaso === 'Consulta' ? 'Consulta' : 'Reclamo/Solicitud'})
              </label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {availableMotivos.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Tienda o Sede
              </label>
              <select
                value={origenVenta}
                onChange={(e) => setOrigenVenta(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
              >
                {masterOptions.tiendas.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Solicitud / Manifestación / Consulta del cliente */}
          <div className="border-t border-slate-200 pt-3">
            <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
              {tipoCaso === 'Consulta'
                ? '¿Qué consultó el cliente? (Manifestación / Detalle) *'
                : 'Solicitud / Manifestación de la Clienta (Descripción) *'}
            </label>
            <textarea
              rows={3}
              value={solicitudCliente}
              onChange={(e) => setSolicitudCliente(e.target.value)}
              placeholder="Detalle de lo que consultó o reclamó la clienta..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
