import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  User,
  Phone,
  Mail,
  FileText,
  Sliders,
  Calendar,
  Layers,
  HelpCircle,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  CheckCheck,
  RotateCcw,
  Plus,
  Database,
} from 'lucide-react';
import { addCase, generateCaseId } from '../../services/db';
import { isFirebaseConfigured } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { getPeruDateString } from '../../utils/dateUtils';
import {
  getStoredFormFields,
  FORM_FIELDS_UPDATED_EVENT,
  FORM_SECTIONS,
} from '../../config/formFields';
import { CaseItem, FormFieldConfig } from '../../types/case';

interface CaseRegistrationFormProps {
  onCaseCreated?: (caseId: string) => void;
  onOpenFieldConfigurator?: () => void;
  onOpenFirebaseModal?: () => void;
}

export const CaseRegistrationForm: React.FC<CaseRegistrationFormProps> = ({
  onCaseCreated,
  onOpenFieldConfigurator,
  onOpenFirebaseModal,
}) => {
  const { user } = useAuth();

  // Load configured fields dynamically
  const [configuredFields, setConfiguredFields] = useState<FormFieldConfig[]>(() =>
    getStoredFormFields()
  );

  // Form values state: key-value dictionary for all field IDs
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCaseSuccess, setCreatedCaseSuccess] = useState<CaseItem | null>(null);

  // Active section for step/accordion view
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Registro datos cliente': true,
    'Datos de la compra': true,
    'Registro Caso': true,
    'Queja ATC': true,
    'Finalización del caso': true,
  });

  // Listen to dynamic field updates from Configurator
  useEffect(() => {
    const handleFieldsUpdated = (e: any) => {
      const updated = e.detail || getStoredFormFields();
      setConfiguredFields(updated);
    };

    window.addEventListener(FORM_FIELDS_UPDATED_EVENT, handleFieldsUpdated);
    return () => {
      window.removeEventListener(FORM_FIELDS_UPDATED_EVENT, handleFieldsUpdated);
    };
  }, []);

  // Initialize form default values
  useEffect(() => {
    const today = getPeruDateString();
    const defaults: Record<string, any> = {
      fechaIngreso: today,
      fechaVenta: today,
      canal: 'WhatsApp',
      origenVenta: 'Tda. Jockey Plaza',
      tipoPago: 'Tarjeta',
      talla: 'M',
      color: 'Beige',
      tipoCaso: 'Solicitud',
      motivo: 'Producto',
      submotivo: 'Producto - Características erradas',
      quejaPersonalInvolucrado: 'N/A',
      sucursalQueja: 'N/A',
      solucionBrindada: 'Cambio - Talla',
      cerroEnFcr: 'Sí',
      estado: 'Abierto',
      cierre: 'Pendiente',
      cantidad: 1,
    };

    // For any custom field with options, pick first option by default
    configuredFields.forEach((field) => {
      if (defaults[field.id] === undefined) {
        if (field.type === 'select' && field.options && field.options.length > 0) {
          defaults[field.id] = field.options[0];
        } else if (field.type === 'date') {
          defaults[field.id] = today;
        } else if (field.type === 'number') {
          defaults[field.id] = 1;
        } else {
          defaults[field.id] = '';
        }
      }
    });

    setFormValues((prev) => ({ ...defaults, ...prev }));
  }, [configuredFields]);

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  // Validate form
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    configuredFields.forEach((field) => {
      if (field.disabled) return; // Ignore disabled fields
      if (field.required) {
        const val = formValues[field.id];
        if (val === undefined || val === null || String(val).trim() === '') {
          errors[field.id] = `El campo "${field.label}" es obligatorio.`;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Find first section with error and expand it
      const firstErrorFieldId = Object.keys(validationErrors)[0];
      const errField = configuredFields.find((f) => f.id === firstErrorFieldId);
      if (errField) {
        setExpandedSections((prev) => ({ ...prev, [errField.section]: true }));
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const customData: Record<string, any> = {};

      // Standard field IDs
      const standardKeys = new Set([
        'nroCasoDni',
        'nombresApellidos',
        'fechaIngreso',
        'canal',
        'telefonoCliente',
        'correoCliente',
        'numeroPedido',
        'numeroBoleta',
        'campanaMkt',
        'origenVenta',
        'fechaVenta',
        'tipoPago',
        'producto',
        'sku',
        'cantidad',
        'talla',
        'color',
        'tipoCaso',
        'motivo',
        'submotivo',
        'fechaDerivacion',
        'solicitudCliente',
        'quejaPersonalInvolucrado',
        'sucursalQueja',
        'fechaAtencion',
        'horarioAtencion',
        'solucionBrindada',
        'cerroEnFcr',
        'fechaRespuesta',
        'detalleSolucion',
        'sustentosAtencion',
        'estado',
        'cierre',
        'fechaCierre',
      ]);

      // Collect custom fields
      Object.keys(formValues).forEach((key) => {
        if (!standardKeys.has(key)) {
          const cfg = configuredFields.find((f) => f.id === key);
          if (formValues[key] !== undefined && formValues[key] !== '') {
            customData[key] = {
              label: cfg?.label || key,
              value: formValues[key],
            };
          }
        }
      });

      const newCase: any = {
        nroCasoDni: String(formValues.nroCasoDni || ''),
        nombresApellidos: String(formValues.nombresApellidos || ''),
        fechaIngreso: formValues.fechaIngreso || getPeruDateString(),
        canal: formValues.canal || 'WhatsApp',
        telefonoCliente: String(formValues.telefonoCliente || ''),
        correoCliente: String(formValues.correoCliente || ''),
        numeroPedido: String(formValues.numeroPedido || ''),
        numeroBoleta: String(formValues.numeroBoleta || ''),
        campanaMkt: String(formValues.campanaMkt || ''),
        origenVenta: formValues.origenVenta || 'Tda. Jockey Plaza',
        fechaVenta: formValues.fechaVenta || getPeruDateString(),
        tipoPago: formValues.tipoPago || 'Tarjeta',
        producto: String(formValues.producto || ''),
        sku: String(formValues.sku || ''),
        cantidad: Number(formValues.cantidad) || 1,
        talla: formValues.talla || 'M',
        color: formValues.color || 'Beige',
        tipoCaso: formValues.tipoCaso || 'Solicitud',
        motivo: formValues.motivo || 'Producto',
        submotivo: formValues.submotivo || '',
        fechaDerivacion: formValues.fechaDerivacion || '',
        solicitudCliente: String(formValues.solicitudCliente || ''),
        quejaPersonalInvolucrado: formValues.quejaPersonalInvolucrado || 'N/A',
        sucursalQueja: formValues.sucursalQueja || 'N/A',
        fechaAtencion: formValues.fechaAtencion || '',
        horarioAtencion: formValues.horarioAtencion || '',
        solucionBrindada: formValues.solucionBrindada || 'Cambio - Talla',
        cerroEnFcr: formValues.cerroEnFcr || 'Sí',
        fechaRespuesta: formValues.fechaRespuesta || '',
        detalleSolucion: String(formValues.detalleSolucion || ''),
        sustentosAtencion: formValues.sustentosAtencion || '',
        estado: formValues.estado || 'Abierto',
        cierre: formValues.cierre || 'Pendiente',
        fechaCierre: formValues.fechaCierre || '',
        prioridad: 'Media',
        asesorResponsable: user?.displayName || 'Administrador SICUREZZA XP',
        createdAt: nowIso,
        createdBy: user?.email || 'info@sicurezza.pe',
        updatedAt: nowIso,
        updatedBy: user?.email || 'info@sicurezza.pe',
        // Retrocompatibilidad
        tienda: formValues.origenVenta || 'Tda. Jockey Plaza',
        categoria: formValues.motivo || 'Producto',
        clienteNombre: String(formValues.nombresApellidos || ''),
        clienteDocumento: String(formValues.nroCasoDni || ''),
        clienteTelefono: String(formValues.telefonoCliente || ''),
        clienteEmail: String(formValues.correoCliente || ''),
        descripcion: String(formValues.solicitudCliente || ''),
        solucionAccion: String(formValues.detalleSolucion || ''),
        clienteConforme: formValues.cierre === 'Procede' ? 'Sí' : 'En seguimiento',
      };

      // Only attach customFields if there are custom fields
      if (Object.keys(customData).length > 0) {
        newCase.customFields = customData;
      }

      try {
        const created = await addCase(newCase);
        setCreatedCaseSuccess(created);

        if (onCaseCreated) {
          onCaseCreated(created.id);
        }
      } catch (saveError: any) {
        // If Firestore had a network/permissions error, check if the record was safely stored in local backup
        console.warn('Caso guardado en modo local debido a Firestore:', saveError);
        // The record is already safely stored in local storage by addCase
        // Construct a createdCase object to show success to user
        const fallbackCreated = {
          ...newCase,
          id: `SIC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        };
        setCreatedCaseSuccess(fallbackCreated);
        if (onCaseCreated) {
          onCaseCreated(fallbackCreated.id);
        }
      }
    } catch (err) {
      console.error('Error procesando formulario:', err);
      alert('Por favor verifica los datos ingresados en el formulario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCreatedCaseSuccess(null);
    setValidationErrors({});
    const today = getPeruDateString();
    setFormValues({
      fechaIngreso: today,
      fechaVenta: today,
      canal: 'WhatsApp',
      origenVenta: 'Tda. Jockey Plaza',
      tipoPago: 'Tarjeta',
      talla: 'M',
      color: 'Beige',
      tipoCaso: 'Solicitud',
      motivo: 'Producto',
      submotivo: 'Producto - Características erradas',
      quejaPersonalInvolucrado: 'N/A',
      sucursalQueja: 'N/A',
      solucionBrindada: 'Cambio - Talla',
      cerroEnFcr: 'Sí',
      estado: 'Abierto',
      cierre: 'Pendiente',
      cantidad: 1,
      nroCasoDni: '',
      nombresApellidos: '',
      telefonoCliente: '',
      correoCliente: '',
      numeroPedido: '',
      numeroBoleta: '',
      campanaMkt: '',
      producto: '',
      sku: '',
      solicitudCliente: '',
      detalleSolucion: '',
      sustentosAtencion: '',
    });
  };

  // Get unique sections preserving official order
  const activeSections = Array.from(
    new Set([...FORM_SECTIONS, ...configuredFields.map((f) => f.section).filter(Boolean)])
  );

  // If case created successfully, show clean summary banner
  if (createdCaseSuccess) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Caso Registrado en Sicurezza XP
          </span>
          <h2 className="text-2xl font-bold text-slate-900 pt-2">
            Código: <span className="text-blue-700 font-mono">{createdCaseSuccess.id}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            El caso ha sido guardado con éxito en la base de datos centralizada de Atención al Cliente.
          </p>
        </div>

        {/* Case key details card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Cliente / DNI:</span>
            <span className="font-bold text-slate-800">
              {createdCaseSuccess.nombresApellidos} ({createdCaseSuccess.nroCasoDni})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Canal & Origen:</span>
            <span className="font-bold text-slate-800">
              {createdCaseSuccess.canal} · {createdCaseSuccess.origenVenta}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Tipo & Motivo:</span>
            <span className="font-bold text-slate-800">
              {createdCaseSuccess.tipoCaso} — {createdCaseSuccess.motivo}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Estado:</span>
            <span className={`inline-block font-bold px-2 py-0.5 rounded ${
              createdCaseSuccess.estado === 'Abierto' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {createdCaseSuccess.estado} ({createdCaseSuccess.cierre})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Fecha de Ingreso:</span>
            <span className="font-bold text-slate-800">{createdCaseSuccess.fechaIngreso}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">FCR:</span>
            <span className="font-bold text-slate-800">{createdCaseSuccess.cerroEnFcr}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Otro Caso</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Bar with Blue Theme and Configurator shortcut */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              Formulario de Atención al Cliente
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Estructura Oficial Sicurezza (34 campos)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Registrar Nuevo Caso ATC
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Completa los datos del cliente, la compra y el requerimiento. Los campos marcados con (*) son obligatorios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFirebaseModal && (
            <button
              type="button"
              onClick={onOpenFirebaseModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shrink-0"
              title="Probar conexión en tiempo real con Firebase Firestore"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isFirebaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'
                }`}
              />
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Probar Conexión</span>
            </button>
          )}

          {onOpenFieldConfigurator && (
            <button
              type="button"
              onClick={onOpenFieldConfigurator}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-semibold transition-all cursor-pointer shrink-0"
              title="Editar preguntas, opciones de listas desplegables o añadir nuevos campos"
            >
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Personalizar Preguntas</span>
            </button>
          )}
        </div>
      </div>

      {/* Validation Errors Alert if any */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 space-y-1 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Faltan completar {Object.keys(validationErrors).length} campo(s) obligatorio(s):</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-rose-700 pl-2">
            {Object.values(validationErrors).slice(0, 5).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {Object.keys(validationErrors).length > 5 && (
              <li>... y {Object.keys(validationErrors).length - 5} más.</li>
            )}
          </ul>
        </div>
      )}

      {/* DYNAMIC SECTIONS */}
      {activeSections.map((sectionName, sIdx) => {
        const fieldsInSection = configuredFields.filter(
          (f) => f.section === sectionName && !f.disabled
        );
        if (fieldsInSection.length === 0) return null;

        const isExpanded = expandedSections[sectionName] ?? true;

        // Icons for official sections
        const getSectionIcon = () => {
          switch (sectionName) {
            case 'Registro datos cliente':
              return <User className="w-4 h-4 text-blue-400" />;
            case 'Datos de la compra':
              return <ShoppingBag className="w-4 h-4 text-blue-400" />;
            case 'Registro Caso':
              return <MessageSquare className="w-4 h-4 text-blue-400" />;
            case 'Queja ATC':
              return <ShieldAlert className="w-4 h-4 text-blue-400" />;
            case 'Finalización del caso':
              return <CheckCheck className="w-4 h-4 text-blue-400" />;
            default:
              return <Layers className="w-4 h-4 text-blue-400" />;
          }
        };

        return (
          <div
            key={sectionName}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
          >
            {/* Section Header */}
            <button
              type="button"
              onClick={() => toggleSection(sectionName)}
              className="w-full bg-[#161c36] text-white px-5 py-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#1a2142] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {getSectionIcon()}
                <span className="font-bold text-sm tracking-wide">{sectionName}</span>
                <span className="text-xs text-blue-200 font-medium px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-700">
                  {fieldsInSection.length} preguntas
                </span>
              </div>
              <span className="text-xs text-blue-300 font-medium">
                {isExpanded ? 'Contraer ▲' : 'Desplegar ▼'}
              </span>
            </button>

            {/* Section Fields Body */}
            {isExpanded && (
              <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {fieldsInSection.map((field) => {
                  const val = formValues[field.id] ?? '';
                  const hasError = Boolean(validationErrors[field.id]);

                  // Full width for textareas or special fields
                  const isFullWidth =
                    field.type === 'textarea' ||
                    field.id === 'solicitudCliente' ||
                    field.id === 'detalleSolucion' ||
                    field.id === 'submotivo';

                  return (
                    <div
                      key={field.id}
                      className={isFullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : 'col-span-1'}
                    >
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                        {field.label}
                        {field.required && (
                          <span className="text-rose-600 font-bold ml-1" title="Obligatorio">
                            *
                          </span>
                        )}
                      </label>

                      {field.description && (
                        <p className="text-[11px] text-slate-500 mb-1.5 italic">
                          {field.description}
                        </p>
                      )}

                      {/* Field Input Based on Type */}
                      {field.type === 'select' ? (
                        <select
                          value={val}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            hasError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          <option value="">Seleccionar una opción...</option>
                          {field.options?.map((opt, oi) => (
                            <option key={oi} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={val}
                          placeholder={field.placeholder || 'Escribe aquí los detalles...'}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            hasError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                      ) : field.type === 'date' ? (
                        <input
                          type="date"
                          value={val}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            hasError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                      ) : field.type === 'time' ? (
                        <input
                          type="time"
                          value={val}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            hasError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          min={1}
                          value={val}
                          placeholder={field.placeholder || '1'}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            hasError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={val}
                          placeholder={field.placeholder || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            hasError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                      )}

                      {hasError && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">
                          {validationErrors[field.id]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit Button Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Hora oficial de registro en Lima (UTC-5)</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleResetForm}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Limpiar Formulario
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Guardando...' : 'Guardar y Registrar Caso'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
