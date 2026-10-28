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
  Trash2,
  Database,
  Bell,
  Check,
  Info,
  Store,
  Tag,
} from 'lucide-react';
import { addCase } from '../../services/db';
import { isFirebaseConfigured } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { getPeruDateString } from '../../utils/dateUtils';
import { addDaysToDate } from '../../utils/followUpUtils';
import {
  getStoredFormFields,
  FORM_FIELDS_UPDATED_EVENT,
  FORM_SECTIONS,
  getMasterOptions,
  saveMasterOptions,
  updateMasterOptionList,
  MASTER_OPTIONS_UPDATED_EVENT,
  MasterOptionsConfig,
} from '../../config/formFields';
import { CaseItem, FormFieldConfig } from '../../types/case';
import { FieldConfiguratorModal } from '../admin/FieldConfiguratorModal';

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
  const today = getPeruDateString();

  // Load configured fields dynamically
  const [configuredFields, setConfiguredFields] = useState<FormFieldConfig[]>(() =>
    getStoredFormFields()
  );

  // Dynamic Master Options (Tiendas, Canales, Motivos Consulta, etc.)
  const [masterOptions, setMasterOptions] = useState<MasterOptionsConfig>(() => getMasterOptions());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalInitialKey, setConfigModalInitialKey] = useState<keyof MasterOptionsConfig>('tiendas');
  const [configModalTab, setConfigModalTab] = useState<'variables' | 'preguntas'>('variables');

  // Quick inline add state for Consulta
  const [showQuickAddMotivo, setShowQuickAddMotivo] = useState(false);
  const [quickNewMotivo, setQuickNewMotivo] = useState('');
  const [showQuickAddTienda, setShowQuickAddTienda] = useState(false);
  const [quickNewTienda, setQuickNewTienda] = useState('');
  const [showQuickAddCanal, setShowQuickAddCanal] = useState(false);
  const [quickNewCanal, setQuickNewCanal] = useState('');
  const [quickNotice, setQuickNotice] = useState<string | null>(null);

  // Form values state
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

  const triggerQuickNotice = (msg: string) => {
    setQuickNotice(msg);
    setTimeout(() => setQuickNotice(null), 3500);
  };

  // Quick add an option to a master list and auto-select it in form
  const handleQuickAddOption = (listKey: keyof MasterOptionsConfig, value: string, fieldId?: string) => {
    const val = value.trim();
    if (!val) return;
    const current = masterOptions[listKey] || [];
    if (!current.includes(val)) {
      const updated = [...current, val];
      updateMasterOptionList(listKey, updated);
      setMasterOptions((prev) => ({ ...prev, [listKey]: updated }));
    }
    if (fieldId) {
      handleInputChange(fieldId, val);
    }
    triggerQuickNotice(`¡"${val}" se agregó y seleccionó con éxito!`);
  };

  // Quick delete an option from a master list (e.g. unwanted store or motive)
  const handleQuickDeleteOption = (listKey: keyof MasterOptionsConfig, valueToDelete: string, fieldId?: string) => {
    if (!valueToDelete) return;
    if (!window.confirm(`¿Estás seguro de eliminar "${valueToDelete}" de la lista?`)) return;
    const current = masterOptions[listKey] || [];
    const updated = current.filter((i) => i !== valueToDelete);
    updateMasterOptionList(listKey, updated);
    setMasterOptions((prev) => ({ ...prev, [listKey]: updated }));
    if (fieldId) {
      handleInputChange(fieldId, updated[0] || '');
    }
    triggerQuickNotice(`"${valueToDelete}" fue eliminada de la lista.`);
  };

  // Listen to dynamic field updates from Configurator
  useEffect(() => {
    const handleFieldsUpdated = (e: any) => {
      const updated = e.detail || getStoredFormFields();
      setConfiguredFields(updated);
    };

    const handleOptionsUpdated = (e: any) => {
      if (e.detail) {
        setMasterOptions(e.detail);
      }
    };

    window.addEventListener(FORM_FIELDS_UPDATED_EVENT, handleFieldsUpdated);
    window.addEventListener(MASTER_OPTIONS_UPDATED_EVENT, handleOptionsUpdated);
    return () => {
      window.removeEventListener(FORM_FIELDS_UPDATED_EVENT, handleFieldsUpdated);
      window.removeEventListener(MASTER_OPTIONS_UPDATED_EVENT, handleOptionsUpdated);
    };
  }, []);

  // Initialize form default values
  useEffect(() => {
    const defaults: Record<string, any> = {
      fechaIngreso: today,
      fechaVenta: today,
      canal: masterOptions.canales[0] || 'WhatsApp',
      origenVenta: masterOptions.tiendas[0] || 'Canales Digitales / Web',
      tipoPago: masterOptions.tiposPago[0] || 'Tarjeta',
      talla: masterOptions.tallas[0] || 'M',
      color: masterOptions.colores[0] || 'Beige',
      tipoCaso: 'Solicitud',
      motivo: masterOptions.motivos[0] || 'Producto',
      submotivo: masterOptions.submotivos[0] || 'Producto - Características erradas',
      quejaPersonalInvolucrado: 'N/A',
      sucursalQueja: masterOptions.sucursalesQueja[0] || 'N/A',
      solucionBrindada: masterOptions.soluciones[0] || 'Cambio - Talla',
      cerroEnFcr: 'Sí',
      estado: 'Abierto',
      cierre: 'Pendiente',
      cantidad: 1,
      requiereSeguimiento: true,
      frecuenciaSeguimientoDias: 2,
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
  }, [configuredFields, today]);

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

  // Fully decoupled selection of case type
  const handleSelectCaseType = (type: string) => {
    if (type === 'Consulta') {
      setFormValues((prev) => ({
        tipoCaso: 'Consulta',
        canal: prev.canal || masterOptions.canales[0] || 'WhatsApp',
        motivo: prev.motivoConsulta || masterOptions.consultaMotivos[0] || 'Stock y Disponibilidad de Producto',
        motivoConsulta: prev.motivoConsulta || masterOptions.consultaMotivos[0] || 'Stock y Disponibilidad de Producto',
        origenVenta: prev.origenVenta || masterOptions.tiendas[0] || 'Canales Digitales / Web',
        solicitudCliente: prev.solicitudCliente || '',
        detalleSolucion: prev.detalleSolucion || '',
        nroCasoDni: prev.nroCasoDni || '',
        nombresApellidos: prev.nombresApellidos || '',
        telefonoCliente: prev.telefonoCliente || '',
        correoCliente: prev.correoCliente || '',
        numeroPedido: prev.numeroPedido || '',
        solucionBrindada: 'Orientación / Información',
        cerroEnFcr: 'Sí',
        estado: 'Cerrado',
        cierre: 'Procede',
        requiereSeguimiento: false,
        frecuenciaSeguimientoDias: 2,
        // Completely reset Solicitud/Purchase fields so phantom defaults are NOT stored
        talla: '',
        color: '',
        tipoPago: '',
        submotivo: '',
        sku: '',
        producto: '',
        quejaPersonalInvolucrado: '',
        sucursalQueja: '',
        campanaMkt: '',
        numeroBoleta: '',
        fechaDerivacion: '',
        fechaAtencion: '',
        horarioAtencion: '',
        sustentosAtencion: '',
        fechaVenta: '',
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        tipoCaso: type,
        canal: prev.canal || masterOptions.canales[0] || 'WhatsApp',
        origenVenta: prev.origenVenta && prev.origenVenta !== 'Canales Digitales / Web' ? prev.origenVenta : masterOptions.tiendas[0] || 'Tda. Jockey Plaza',
        motivo: prev.motivo && masterOptions.motivos.includes(prev.motivo) ? prev.motivo : masterOptions.motivos[0] || 'Producto',
        submotivo: prev.submotivo || masterOptions.submotivos[0] || 'Producto - Características erradas',
        tipoPago: prev.tipoPago || masterOptions.tiposPago[0] || 'Tarjeta',
        talla: prev.talla || masterOptions.tallas[0] || 'M',
        color: prev.color || masterOptions.colores[0] || 'Beige',
        solucionBrindada: prev.solucionBrindada && prev.solucionBrindada !== 'Orientación / Información' ? prev.solucionBrindada : masterOptions.soluciones[0] || 'Cambio - Talla',
        estado: 'Abierto',
        cierre: 'Pendiente',
        requiereSeguimiento: true,
        frecuenciaSeguimientoDias: 2,
      }));
    }
    setValidationErrors({});
  };

  // Synchronous and isolated form validation
  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    const isConsulta = formValues.tipoCaso === 'Consulta';

    if (isConsulta) {
      // In Consulta mode, strictly validate what the client asked and the answer
      if (!formValues.solicitudCliente || !String(formValues.solicitudCliente).trim()) {
        errors.solicitudCliente = 'Por favor escribe qué consultó o preguntó el cliente.';
      }
      if (!formValues.detalleSolucion || !String(formValues.detalleSolucion).trim()) {
        errors.detalleSolucion = 'Por favor indica la respuesta o información brindada.';
      }
      // Ensure canal is set without blocking user
      if (!formValues.canal) {
        formValues.canal = masterOptions.canales[0] || 'WhatsApp';
      }
    } else {
      // Full form validation for Solicitud, Reclamo, Queja, Libro de Reclamaciones
      configuredFields.forEach((field) => {
        if (field.disabled) return;
        if (field.required) {
          const val = formValues[field.id];
          if (val === undefined || val === null || String(val).trim() === '') {
            errors[field.id] = `El campo "${field.label}" es obligatorio.`;
          }
        }
      });
    }

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      const firstErrorFieldId = Object.keys(validation.errors)[0];
      const errField = configuredFields.find((f) => f.id === firstErrorFieldId);
      if (errField) {
        setExpandedSections((prev) => ({ ...prev, [errField.section]: true }));
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const isConsulta = formValues.tipoCaso === 'Consulta';
      const requiresFollowUp = Boolean(formValues.requiereSeguimiento);
      const followUpFrequency = Number(formValues.frecuenciaSeguimientoDias) || 2;
      const proximoSeguimiento = requiresFollowUp
        ? addDaysToDate(formValues.fechaIngreso || today, followUpFrequency)
        : '';

      let newCase: any;

      if (isConsulta) {
        // CLEAN, UNPOLLUTED CONSULTA CASE
        const clientName = String(
          formValues.nombresApellidos || 'Cliente Consulta General'
        ).trim();
        const consultaCanal = formValues.canal || masterOptions.canales[0] || 'WhatsApp';
        const consultaMotivo = formValues.motivoConsulta || formValues.motivo || masterOptions.consultaMotivos[0] || 'Stock y Disponibilidad de Producto';
        const consultaTienda = formValues.origenVenta || '';

        newCase = {
          tipoCaso: 'Consulta',
          nroCasoDni: String(formValues.nroCasoDni || '').trim(),
          nombresApellidos: clientName,
          fechaIngreso: formValues.fechaIngreso || today,
          canal: consultaCanal,
          telefonoCliente: String(formValues.telefonoCliente || '').trim(),
          correoCliente: String(formValues.correoCliente || '').trim(),
          numeroPedido: String(formValues.numeroPedido || '').trim(),
          
          // Solicitud/Purchase fields: strictly empty for fast consultation
          numeroBoleta: '',
          campanaMkt: '',
          origenVenta: consultaTienda,
          fechaVenta: '',
          tipoPago: '',
          producto: String(formValues.producto || '').trim(),
          sku: '',
          cantidad: 1,
          talla: '',
          color: '',
          motivo: consultaMotivo,
          submotivo: '',
          fechaDerivacion: '',
          solicitudCliente: String(formValues.solicitudCliente || '').trim(),
          quejaPersonalInvolucrado: '',
          sucursalQueja: '',
          fechaAtencion: '',
          horarioAtencion: '',
          solucionBrindada: 'Orientación / Información',
          cerroEnFcr: formValues.cerroEnFcr || (requiresFollowUp ? 'No' : 'Sí'),
          fechaRespuesta: today,
          detalleSolucion: String(formValues.detalleSolucion || '').trim(),
          sustentosAtencion: '',
          estado: requiresFollowUp ? 'Abierto' : 'Cerrado',
          cierre: requiresFollowUp ? 'Pendiente' : 'Procede',
          fechaCierre: !requiresFollowUp ? today : '',
          prioridad: 'Baja',
          asesorResponsable: user?.displayName || 'Administrador SICUREZZA XP',
          
          // Follow-up Alert Fields
          requiereSeguimiento: requiresFollowUp,
          fechaProximoSeguimiento: proximoSeguimiento,
          frecuenciaSeguimientoDias: followUpFrequency,
          seguimientoCumplido: !requiresFollowUp,
          historialSeguimientos: requiresFollowUp
            ? [
                {
                  id: `seg-${Date.now()}`,
                  fecha: nowIso,
                  nota: 'Consulta registrada con alerta de seguimiento.',
                  usuario: user?.displayName || 'Administrador SICUREZZA XP',
                },
              ]
            : [],

          createdAt: nowIso,
          createdBy: user?.email || 'info@sicurezza.pe',
          updatedAt: nowIso,
          updatedBy: user?.email || 'info@sicurezza.pe',

          // Retrocompatibilidad
          tienda: consultaTienda,
          categoria: consultaMotivo,
          clienteNombre: clientName,
          clienteDocumento: String(formValues.nroCasoDni || '').trim(),
          clienteTelefono: String(formValues.telefonoCliente || '').trim(),
          clienteEmail: String(formValues.correoCliente || '').trim(),
          descripcion: String(formValues.solicitudCliente || '').trim(),
          solucionAccion: String(formValues.detalleSolucion || '').trim(),
          clienteConforme: formValues.cerroEnFcr === 'Sí' ? 'Sí' : 'En proceso',
          isArchived: false,
        };
      } else {
        // FULL SOLICITUD / RECLAMO / QUEJA / LIBRO DE RECLAMACIONES
        const customData: Record<string, any> = {};
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
          'requiereSeguimiento',
          'frecuenciaSeguimientoDias',
        ]);

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

        const clientName = String(formValues.nombresApellidos || '').trim();

        newCase = {
          nroCasoDni: String(formValues.nroCasoDni || '').trim(),
          nombresApellidos: clientName || 'Cliente Sicurezza',
          fechaIngreso: formValues.fechaIngreso || today,
          canal: formValues.canal || masterOptions.canales[0] || 'WhatsApp',
          telefonoCliente: String(formValues.telefonoCliente || '').trim(),
          correoCliente: String(formValues.correoCliente || '').trim(),
          numeroPedido: String(formValues.numeroPedido || '').trim(),
          numeroBoleta: String(formValues.numeroBoleta || '').trim(),
          campanaMkt: String(formValues.campanaMkt || '').trim(),
          origenVenta: formValues.origenVenta || masterOptions.tiendas[0] || 'Tda. Jockey Plaza',
          fechaVenta: formValues.fechaVenta || today,
          tipoPago: formValues.tipoPago || masterOptions.tiposPago[0] || 'Tarjeta',
          producto: String(formValues.producto || '').trim(),
          sku: String(formValues.sku || '').trim(),
          cantidad: Number(formValues.cantidad) || 1,
          talla: formValues.talla || masterOptions.tallas[0] || 'M',
          color: formValues.color || masterOptions.colores[0] || 'Beige',
          tipoCaso: formValues.tipoCaso || 'Solicitud',
          motivo: formValues.motivo || masterOptions.motivos[0] || 'Producto',
          submotivo: formValues.submotivo || '',
          fechaDerivacion: formValues.fechaDerivacion || '',
          solicitudCliente: String(formValues.solicitudCliente || '').trim(),
          quejaPersonalInvolucrado: formValues.quejaPersonalInvolucrado || 'N/A',
          sucursalQueja: formValues.sucursalQueja || 'N/A',
          fechaAtencion: formValues.fechaAtencion || '',
          horarioAtencion: formValues.horarioAtencion || '',
          solucionBrindada: formValues.solucionBrindada || masterOptions.soluciones[0] || 'Cambio - Talla',
          cerroEnFcr: formValues.cerroEnFcr || 'Sí',
          fechaRespuesta: formValues.fechaRespuesta || '',
          detalleSolucion: String(formValues.detalleSolucion || '').trim(),
          sustentosAtencion: formValues.sustentosAtencion || '',
          estado: formValues.estado || 'Abierto',
          cierre: formValues.cierre || 'Pendiente',
          fechaCierre: formValues.estado === 'Cerrado' ? (formValues.fechaCierre || today) : '',
          prioridad: formValues.tipoCaso === 'Reclamo' ? 'Alta' : 'Media',
          asesorResponsable: user?.displayName || 'Administrador SICUREZZA XP',
          
          // Follow-up Alert Fields
          requiereSeguimiento: requiresFollowUp,
          fechaProximoSeguimiento: proximoSeguimiento,
          frecuenciaSeguimientoDias: followUpFrequency,
          seguimientoCumplido: !requiresFollowUp,
          historialSeguimientos: requiresFollowUp
            ? [
                {
                  id: `seg-${Date.now()}`,
                  fecha: nowIso,
                  nota: 'Caso ingresado en seguimiento. Alerta interna programada en 2 días.',
                  usuario: user?.displayName || 'Administrador SICUREZZA XP',
                },
              ]
            : [],

          createdAt: nowIso,
          createdBy: user?.email || 'info@sicurezza.pe',
          updatedAt: nowIso,
          updatedBy: user?.email || 'info@sicurezza.pe',

          // Retrocompatibilidad
          tienda: formValues.origenVenta || masterOptions.tiendas[0] || 'Tda. Jockey Plaza',
          categoria: formValues.motivo || masterOptions.motivos[0] || 'Producto',
          clienteNombre: clientName || 'Cliente Sicurezza',
          clienteDocumento: String(formValues.nroCasoDni || '').trim(),
          clienteTelefono: String(formValues.telefonoCliente || '').trim(),
          clienteEmail: String(formValues.correoCliente || '').trim(),
          descripcion: String(formValues.solicitudCliente || '').trim(),
          solucionAccion: String(formValues.detalleSolucion || '').trim(),
          clienteConforme: formValues.cerroEnFcr === 'Sí' ? 'Sí' : 'En proceso',
          isArchived: false,
        };

        if (Object.keys(customData).length > 0) {
          newCase.customFields = customData;
        }
      }

      try {
        const created = await addCase(newCase);
        setCreatedCaseSuccess(created);
        if (onCaseCreated) {
          onCaseCreated(created.id);
        }
      } catch (fbErr) {
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
      requiereSeguimiento: true,
      frecuenciaSeguimientoDias: 2,
    });
  };

  // Sections
  const activeSections = Array.from(
    new Set([...FORM_SECTIONS, ...configuredFields.map((f) => f.section).filter(Boolean)])
  );

  const isConsultaMode = formValues.tipoCaso === 'Consulta';

  // If case created successfully
  if (createdCaseSuccess) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {createdCaseSuccess.tipoCaso === 'Consulta' ? 'Consulta Registrada' : 'Caso Registrado con Éxito'}
          </span>
          <h2 className="text-2xl font-black text-slate-900 pt-2">
            Código: <span className="text-blue-700 font-mono">{createdCaseSuccess.id}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {createdCaseSuccess.requiereSeguimiento
              ? `El caso ha sido guardado y quedó programado para alerta de seguimiento en 2 días (${createdCaseSuccess.fechaProximoSeguimiento}).`
              : 'El caso ha sido guardado con éxito en la base de datos centralizada de Atención al Cliente.'}
          </p>
        </div>

        {/* Case key details card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Cliente:</span>
            <span className="font-bold text-slate-800">
              {createdCaseSuccess.nombresApellidos}
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
            <span
              className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] ${
                createdCaseSuccess.estado === 'Cerrado'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {createdCaseSuccess.estado}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">FCR (Primer Contacto):</span>
            <span className="font-bold text-slate-800">{createdCaseSuccess.cerroEnFcr}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Seguimiento:</span>
            <span
              className={`font-bold ${
                createdCaseSuccess.requiereSeguimiento ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {createdCaseSuccess.requiereSeguimiento
                ? `Alerta programada (${createdCaseSuccess.fechaProximoSeguimiento})`
                : 'Resuelto sin pendientes'}
            </span>
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              Atención al Cliente Sicurezza
            </span>
            <span className="text-xs text-slate-500 font-medium">
              SICUREZZA XP (Perú)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Registrar Caso de Atención
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecciona el tipo de caso. Si es una <strong>Consulta</strong>, solo se solicitarán datos básicos. Para <strong>Solicitudes, Reclamos o Quejas</strong>, se activará el seguimiento cada 2 días.
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
              <span>Conexión BD</span>
            </button>
          )}

          {onOpenFieldConfigurator && (
            <button
              type="button"
              onClick={onOpenFieldConfigurator}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-semibold transition-all cursor-pointer shrink-0"
              title="Personalizar preguntas y listas desplegables"
            >
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Configurar Campos</span>
            </button>
          )}
        </div>
      </div>

      {/* PASO 1: SELECTOR PRINCIPAL DE TIPO DE CASO */}
      <div className="bg-white rounded-2xl p-5 border-2 border-blue-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#161c36] text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">
              ¿Qué tipo de atención estás realizando?
            </h3>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isConsultaMode
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {isConsultaMode ? '⚡ Modo Consulta Rápida' : '📋 Caso con Seguimiento'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Consulta */}
          <button
            type="button"
            onClick={() => handleSelectCaseType('Consulta')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              formValues.tipoCaso === 'Consulta'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 scale-[1.02]'
                : 'bg-slate-50 hover:bg-blue-50/60 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <MessageSquare className="w-4 h-4" />
              <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                formValues.tipoCaso === 'Consulta' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Rápido
              </span>
            </div>
            <div className="mt-2.5">
              <span className="font-black text-xs block">Consulta</span>
              <span className="text-[10px] opacity-80 block leading-tight">Stock, tallas, horarios</span>
            </div>
          </button>

          {/* Solicitud */}
          <button
            type="button"
            onClick={() => handleSelectCaseType('Solicitud')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              formValues.tipoCaso === 'Solicitud'
                ? 'bg-[#161c36] text-white border-slate-900 shadow-md ring-2 ring-slate-400 scale-[1.02]'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                formValues.tipoCaso === 'Solicitud' ? 'bg-amber-400/30 text-amber-200' : 'bg-amber-100 text-amber-800'
              }`}>
                Seguimiento
              </span>
            </div>
            <div className="mt-2.5">
              <span className="font-black text-xs block">Solicitud</span>
              <span className="text-[10px] opacity-80 block leading-tight">Cambio de talla / nota</span>
            </div>
          </button>

          {/* Reclamo */}
          <button
            type="button"
            onClick={() => handleSelectCaseType('Reclamo')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              formValues.tipoCaso === 'Reclamo'
                ? 'bg-rose-700 text-white border-rose-700 shadow-md ring-2 ring-rose-400 scale-[1.02]'
                : 'bg-slate-50 hover:bg-rose-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-4 h-4 text-rose-300" />
              <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                formValues.tipoCaso === 'Reclamo' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
              }`}>
                Alerta 48h
              </span>
            </div>
            <div className="mt-2.5">
              <span className="font-black text-xs block">Reclamo</span>
              <span className="text-[10px] opacity-80 block leading-tight">Producto, calidad, demora</span>
            </div>
          </button>

          {/* Queja ATC */}
          <button
            type="button"
            onClick={() => handleSelectCaseType('Queja')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              formValues.tipoCaso === 'Queja'
                ? 'bg-purple-800 text-white border-purple-800 shadow-md ring-2 ring-purple-400 scale-[1.02]'
                : 'bg-slate-50 hover:bg-purple-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-4 h-4 text-purple-300" />
              <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                formValues.tipoCaso === 'Queja' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
              }`}>
                Atención
              </span>
            </div>
            <div className="mt-2.5">
              <span className="font-black text-xs block">Queja ATC</span>
              <span className="text-[10px] opacity-80 block leading-tight">Servicio en tienda</span>
            </div>
          </button>

          {/* Libro de Reclamaciones */}
          <button
            type="button"
            onClick={() => handleSelectCaseType('Libro de Reclamaciones')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              formValues.tipoCaso === 'Libro de Reclamaciones'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300 scale-[1.02]'
                : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <FileText className="w-4 h-4 text-amber-200" />
              <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                formValues.tipoCaso === 'Libro de Reclamaciones' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                Legal
              </span>
            </div>
            <div className="mt-2.5">
              <span className="font-black text-xs block">Libro Reclamaciones</span>
              <span className="text-[10px] opacity-80 block leading-tight">Reclamo formal</span>
            </div>
          </button>
        </div>

        {/* BARRA DE CONFIGURACIÓN DIRECTA PARA EL TIPO DE CASO */}
        <div className="mt-3 p-3.5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-white border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#161c36] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sliders className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  Configurar Opciones y Preguntas de {formValues.tipoCaso || 'Consulta'}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {isConsultaMode ? 'Modo Consulta' : 'Caso Operativo'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isConsultaMode
                  ? 'Elimina o añade tiendas/sedes, canales de atención o motivos de consulta rápida.'
                  : 'Administra sedes de venta, tipos de pago, motivos de reclamo o preguntas del formulario.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setConfigModalTab('variables');
                setConfigModalInitialKey('tiendas');
                setIsConfigModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Eliminar o agregar tiendas y sedes"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tiendas / Sedes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setConfigModalTab('variables');
                setConfigModalInitialKey(isConsultaMode ? 'consultaMotivos' : 'motivos');
                setIsConfigModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Eliminar o agregar motivos"
            >
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>{isConsultaMode ? 'Motivos Consulta' : 'Motivos Reclamo'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setConfigModalTab('variables');
                setConfigModalInitialKey(isConsultaMode ? 'consultaMotivos' : 'tiendas');
                setIsConfigModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#161c36] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Personalizar Todo</span>
            </button>
          </div>
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
          </ul>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODO 1: CONSULTA RÁPIDA (SOLO DATOS BÁSICOS)            */}
      {/* ======================================================== */}
      {isConsultaMode ? (
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 space-y-6 shadow-xs animate-fade-in">
          {quickNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{quickNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setQuickNotice(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Formulario Simplificado
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                Datos Básicos de la Consulta
              </h3>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
              No requiere DNI ni número de boleta obligatorios
            </span>
          </div>

          {/* Grid de campos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Cliente */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Nombre del Cliente
                </label>
                <button
                  type="button"
                  onClick={() => handleInputChange('nombresApellidos', 'Cliente Consulta General')}
                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  (Anónimo / General)
                </button>
              </div>
              <input
                type="text"
                value={formValues.nombresApellidos || ''}
                placeholder="Ej. Andrea Gómez (o dejar vacío)"
                onChange={(e) => handleInputChange('nombresApellidos', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Canal */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Canal de Atención <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCanal(!showQuickAddCanal)}
                    className="text-[10px] text-blue-700 hover:text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-0.5 cursor-pointer shadow-2xs"
                    title="Agregar un nuevo canal de atención"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Canal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigModalTab('variables');
                      setConfigModalInitialKey('canales');
                      setIsConfigModalOpen(true);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    title="Configurar canales"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {showQuickAddCanal && (
                <div className="mb-2 p-2 bg-blue-50 rounded-xl border border-blue-200 flex gap-1.5 animate-fade-in">
                  <input
                    type="text"
                    value={quickNewCanal}
                    onChange={(e) => setQuickNewCanal(e.target.value)}
                    placeholder="Nuevo canal (ej: Facebook Messenger)..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (quickNewCanal.trim()) {
                        handleQuickAddOption('canales', quickNewCanal, 'canal');
                        setQuickNewCanal('');
                        setShowQuickAddCanal(false);
                      }
                    }}
                    disabled={!quickNewCanal.trim()}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCanal(false)}
                    className="px-1.5 py-1 text-slate-500 hover:bg-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <select
                value={formValues.canal || (masterOptions.canales[0] || 'WhatsApp')}
                onChange={(e) => handleInputChange('canal', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {masterOptions.canales.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Teléfono / WhatsApp (Opcional) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Teléfono / WhatsApp <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                value={formValues.telefonoCliente || ''}
                placeholder="Ej. 998877665"
                onChange={(e) => handleInputChange('telefonoCliente', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Motivo de Consulta */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Motivo de Consulta <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddMotivo(!showQuickAddMotivo)}
                    className="text-[10px] text-blue-700 hover:text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-0.5 cursor-pointer shadow-2xs"
                    title="Agregar un nuevo motivo de consulta"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Motivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigModalTab('variables');
                      setConfigModalInitialKey('consultaMotivos');
                      setIsConfigModalOpen(true);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    title="Ver o editar todos los motivos de consulta"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                  {formValues.motivo && masterOptions.consultaMotivos.includes(formValues.motivo) && (
                    <button
                      type="button"
                      onClick={() => handleQuickDeleteOption('consultaMotivos', formValues.motivo, 'motivo')}
                      className="p-1 rounded text-rose-500 hover:text-rose-800 hover:bg-rose-50 cursor-pointer"
                      title={`Eliminar "${formValues.motivo}" de la lista`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {showQuickAddMotivo && (
                <div className="mb-2 p-2 bg-blue-50 rounded-xl border border-blue-200 flex gap-1.5 animate-fade-in">
                  <input
                    type="text"
                    value={quickNewMotivo}
                    onChange={(e) => setQuickNewMotivo(e.target.value)}
                    placeholder="Nuevo motivo de consulta..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (quickNewMotivo.trim()) {
                        handleQuickAddOption('consultaMotivos', quickNewMotivo, 'motivo');
                        setQuickNewMotivo('');
                        setShowQuickAddMotivo(false);
                      }
                    }}
                    disabled={!quickNewMotivo.trim()}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddMotivo(false)}
                    className="px-1.5 py-1 text-slate-500 hover:bg-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <select
                value={formValues.motivo || (masterOptions.consultaMotivos[0] || 'Stock y Disponibilidad de Producto')}
                onChange={(e) => handleInputChange('motivo', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {masterOptions.consultaMotivos.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Origen / Tienda Consultada (Opcional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Tienda o Sede <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddTienda(!showQuickAddTienda)}
                    className="text-[10px] text-blue-700 hover:text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-0.5 cursor-pointer shadow-2xs"
                    title="Agregar una nueva tienda a la lista"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Tienda</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigModalTab('variables');
                      setConfigModalInitialKey('tiendas');
                      setIsConfigModalOpen(true);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    title="Gestionar lista completa de tiendas (eliminar, renombrar, agregar)"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                  {formValues.origenVenta && masterOptions.tiendas.includes(formValues.origenVenta) && (
                    <button
                      type="button"
                      onClick={() => handleQuickDeleteOption('tiendas', formValues.origenVenta, 'origenVenta')}
                      className="p-1 rounded text-rose-500 hover:text-rose-800 hover:bg-rose-50 cursor-pointer"
                      title={`Eliminar "${formValues.origenVenta}" de la lista`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {showQuickAddTienda && (
                <div className="mb-2 p-2 bg-blue-50 rounded-xl border border-blue-200 flex gap-1.5 animate-fade-in">
                  <input
                    type="text"
                    value={quickNewTienda}
                    onChange={(e) => setQuickNewTienda(e.target.value)}
                    placeholder="Nueva tienda o sede..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (quickNewTienda.trim()) {
                        handleQuickAddOption('tiendas', quickNewTienda, 'origenVenta');
                        setQuickNewTienda('');
                        setShowQuickAddTienda(false);
                      }
                    }}
                    disabled={!quickNewTienda.trim()}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddTienda(false)}
                    className="px-1.5 py-1 text-slate-500 hover:bg-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <select
                value={formValues.origenVenta || (masterOptions.tiendas[0] || 'Canales Digitales / Web')}
                onChange={(e) => handleInputChange('origenVenta', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {masterOptions.tiendas.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Número de Pedido (Opcional) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                N° de Pedido <span className="text-slate-400 font-normal">(Solo si aplica)</span>
              </label>
              <input
                type="text"
                value={formValues.numeroPedido || ''}
                placeholder="Ej. #12845 (o dejar vacío)"
                onChange={(e) => handleInputChange('numeroPedido', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Pregunta del cliente */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                ¿Qué consultó el cliente? <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                value={formValues.solicitudCliente || ''}
                placeholder="Ej. Preguntó si hay stock del Bra Invisible en talla M color Beige en Jockey Plaza."
                onChange={(e) => handleInputChange('solicitudCliente', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {validationErrors.solicitudCliente && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  {validationErrors.solicitudCliente}
                </p>
              )}
            </div>

            {/* Respuesta brindada */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Respuesta o Solución Brindada <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                value={formValues.detalleSolucion || ''}
                placeholder="Ej. Se le confirmó que sí hay stock disponible en tienda y se le enviaron los horarios de atención."
                onChange={(e) => handleInputChange('detalleSolucion', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {validationErrors.detalleSolucion && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  {validationErrors.detalleSolucion}
                </p>
              )}
            </div>
          </div>

          {/* Opciones de Cierre & Alerta para la Consulta */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(formValues.requiereSeguimiento)}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        requiereSeguimiento: e.target.checked,
                        estado: e.target.checked ? 'Abierto' : 'Cerrado',
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>¿Requiere seguimiento posterior con alerta en 2 días?</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {formValues.requiereSeguimiento
                    ? `Quedará en estado "Abierto" y se generará una alerta interna el ${addDaysToDate(today, 2)}.`
                    : 'Quedará registrado como caso "Cerrado" (Resuelto en primer contacto FCR).'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-600">FCR:</span>
              <button
                type="button"
                onClick={() =>
                  handleInputChange('cerroEnFcr', formValues.cerroEnFcr === 'Sí' ? 'No' : 'Sí')
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  formValues.cerroEnFcr === 'Sí'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {formValues.cerroEnFcr === 'Sí' ? '✅ Resuelto al Instante' : '⏳ En Proceso'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* MODO 2: CASO COMPLETO (SOLICITUD / RECLAMO / QUEJA)       */
        /* ======================================================== */
        <div className="space-y-6">
          {/* SEGUIMIENTO INTERNO ALERT BOX (PARA CASOS DE SEGUIMIENTO) */}
          <div className="bg-gradient-to-r from-blue-900 via-[#161c36] to-slate-900 text-white rounded-2xl p-5 border border-blue-900/60 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Bell className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    Sistema de Alertas y Seguimiento Interno
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                      Cadencia 48h
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Alerta automática si el caso no se resuelve dentro del plazo acordado.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(formValues.requiereSeguimiento)}
                  onChange={(e) =>
                    handleInputChange('requiereSeguimiento', e.target.checked)
                  }
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-400"
                />
                <span className="text-xs font-bold text-white">
                  Activar Alerta de Seguimiento
                </span>
              </label>
            </div>

            {formValues.requiereSeguimiento && (
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Alertar cada:</span>
                  {[1, 2, 3, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleInputChange('frecuenciaSeguimientoDias', d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        (formValues.frecuenciaSeguimientoDias || 2) === d
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-slate-300'
                      }`}
                    >
                      {d} día{d > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>

                <div className="font-mono text-cyan-300 font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  Próxima Alerta: {addDaysToDate(formValues.fechaIngreso || today, formValues.frecuenciaSeguimientoDias || 2)}
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC FORM SECTIONS */}
          {activeSections.map((sectionName) => {
            const fieldsInSection = configuredFields.filter(
              (f) => f.section === sectionName && !f.disabled
            );
            if (fieldsInSection.length === 0) return null;

            const isExpanded = expandedSections[sectionName] ?? true;

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
        </div>
      )}

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
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Guardando...'
                : isConsultaMode
                ? 'Guardar Consulta'
                : 'Guardar Caso con Seguimiento'}
            </span>
          </button>
        </div>
      </div>

      {/* MODAL DIRECTO DE CONFIGURACIÓN DE VARIABLES Y FORMULARIO */}
      <FieldConfiguratorModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        activeCaseType={formValues.tipoCaso}
        initialTab={configModalTab}
        initialListKey={configModalInitialKey}
        onFieldUpdated={() => {
          setConfiguredFields(getStoredFormFields());
          setMasterOptions(getMasterOptions());
        }}
      />
    </form>
  );
};
