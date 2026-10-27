import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  Save,
  Tag,
  ListPlus,
  X,
  FileSpreadsheet,
  HelpCircle,
  FolderPlus,
  Store,
  MessageCircle,
  HelpCircle as QuestionIcon,
  CreditCard,
  ShoppingBag,
  Palette,
  CheckCheck,
  Building,
  Sparkles,
} from 'lucide-react';
import {
  getStoredFormFields,
  saveStoredFormFields,
  resetStoredFormFields,
  getMasterOptions,
  saveMasterOptions,
  updateMasterOptionList,
  resetMasterOptions,
  MasterOptionsConfig,
  FORM_SECTIONS,
  MASTER_OPTIONS_UPDATED_EVENT,
  FORM_FIELDS_UPDATED_EVENT,
} from '../../config/formFields';
import { FormFieldConfig } from '../../types/case';

interface FieldConfiguratorViewProps {
  initialTab?: 'variables' | 'preguntas';
  initialListKey?: keyof MasterOptionsConfig;
  activeCaseType?: string;
  onFieldUpdated?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const FieldConfiguratorView: React.FC<FieldConfiguratorViewProps> = ({
  initialTab = 'variables',
  initialListKey = 'tiendas',
  activeCaseType,
  onFieldUpdated,
  isModal = false,
  onClose,
}) => {
  // Navigation tabs
  const [mainTab, setMainTab] = useState<'variables' | 'preguntas'>(initialTab);

  // Master Options State
  const [masterOptions, setMasterOptions] = useState<MasterOptionsConfig>(getMasterOptions());
  const [selectedListKey, setSelectedListKey] = useState<keyof MasterOptionsConfig>(initialListKey);
  const [newOptionText, setNewOptionText] = useState('');
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [bulkOptionsText, setBulkOptionsText] = useState('');
  const [showBulkOptions, setShowBulkOptions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields State
  const [fields, setFields] = useState<FormFieldConfig[]>([]);
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');

  // Edit field state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editSection, setEditSection] = useState('');
  const [editType, setEditType] = useState<FormFieldConfig['type']>('text');
  const [editRequired, setEditRequired] = useState(false);
  const [editPlaceholder, setEditPlaceholder] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [bulkOptionInput, setBulkOptionInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  // New field state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSection, setNewSection] = useState<string>(FORM_SECTIONS[0]);
  const [customSectionInput, setCustomSectionInput] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<FormFieldConfig['type']>('text');
  const [newRequired, setNewRequired] = useState(false);
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOptionsList, setNewOptionsList] = useState<string[]>([]);
  const [newSingleOptionInput, setNewSingleOptionInput] = useState('');
  const [newBulkOptionInput, setNewBulkOptionInput] = useState('');
  const [showNewBulkInput, setShowNewBulkInput] = useState(false);

  // Banner message
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    setFields(getStoredFormFields());
    setMasterOptions(getMasterOptions());

    const handleOptionsUpdate = (e: any) => {
      if (e.detail) setMasterOptions(e.detail);
    };
    const handleFieldsUpdate = (e: any) => {
      if (e.detail) setFields(e.detail);
    };

    window.addEventListener(MASTER_OPTIONS_UPDATED_EVENT, handleOptionsUpdate);
    window.addEventListener(FORM_FIELDS_UPDATED_EVENT, handleFieldsUpdate);

    return () => {
      window.removeEventListener(MASTER_OPTIONS_UPDATED_EVENT, handleOptionsUpdate);
      window.removeEventListener(FORM_FIELDS_UPDATED_EVENT, handleFieldsUpdate);
    };
  }, []);

  const triggerNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setBannerMessage({ text, type });
    setTimeout(() => {
      setBannerMessage(null);
    }, 3500);
  };

  // Definitions for list selector in Variables Tab
  const listDefinitions: Array<{
    key: keyof MasterOptionsConfig;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      key: 'tiendas',
      label: 'Tiendas y Sedes',
      description: 'Sedes físicas, módulos y canales online de Sicurezza',
      icon: <Store className="w-4 h-4 text-emerald-600" />,
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
    },
    {
      key: 'consultaMotivos',
      label: 'Motivos de Consulta',
      description: 'Opciones específicas para el formulario de Consulta Rápida',
      icon: <QuestionIcon className="w-4 h-4 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50/40 text-blue-900',
    },
    {
      key: 'canales',
      label: 'Canales de Atención',
      description: 'WhatsApp, Instagram, Correo, TikTok, Presencial, etc.',
      icon: <MessageCircle className="w-4 h-4 text-indigo-600" />,
      color: 'border-indigo-200 bg-indigo-50/40 text-indigo-900',
    },
    {
      key: 'motivos',
      label: 'Motivos de Casos',
      description: 'Categorías principales (Producto, Calidad, Pedido, etc.)',
      icon: <Tag className="w-4 h-4 text-amber-600" />,
      color: 'border-amber-200 bg-amber-50/40 text-amber-900',
    },
    {
      key: 'submotivos',
      label: 'Submotivos de Casos',
      description: 'Detalle específico del reclamo o solicitud',
      icon: <Layers className="w-4 h-4 text-violet-600" />,
      color: 'border-violet-200 bg-violet-50/40 text-violet-900',
    },
    {
      key: 'tiposPago',
      label: 'Tipos de Pago',
      description: 'Yape, Tarjeta, Efectivo, Agente, Transferencia',
      icon: <CreditCard className="w-4 h-4 text-teal-600" />,
      color: 'border-teal-200 bg-teal-50/40 text-teal-900',
    },
    {
      key: 'tallas',
      label: 'Tallas de Prenda',
      description: 'XS, S, M, L, XL, 2XL, N/A',
      icon: <ShoppingBag className="w-4 h-4 text-purple-600" />,
      color: 'border-purple-200 bg-purple-50/40 text-purple-900',
    },
    {
      key: 'colores',
      label: 'Colores de Prenda',
      description: 'Negro, Blanco, Beige, Terracota, etc.',
      icon: <Palette className="w-4 h-4 text-rose-600" />,
      color: 'border-rose-200 bg-rose-50/40 text-rose-900',
    },
    {
      key: 'soluciones',
      label: 'Soluciones Brindadas',
      description: 'Cambio de talla, extorno, nota de crédito, etc.',
      icon: <CheckCheck className="w-4 h-4 text-cyan-600" />,
      color: 'border-cyan-200 bg-cyan-50/40 text-cyan-900',
    },
    {
      key: 'sucursalesQueja',
      label: 'Sucursales Queja ATC',
      description: 'Punto donde ocurrió la queja por atención',
      icon: <Building className="w-4 h-4 text-orange-600" />,
      color: 'border-orange-200 bg-orange-50/40 text-orange-900',
    },
  ];

  // Current list items
  const currentListItems = masterOptions[selectedListKey] || [];
  const filteredListItems = currentListItems.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // --- Handlers for Master Options (Variables) ---
  const handleAddOption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = newOptionText.trim();
    if (!val) return;

    if (currentListItems.some((i) => i.toLowerCase() === val.toLowerCase())) {
      triggerNotification(`La opción "${val}" ya existe en esta lista.`, 'info');
      return;
    }

    const updated = [...currentListItems, val];
    updateMasterOptionList(selectedListKey, updated);
    setNewOptionText('');
    triggerNotification(`¡"${val}" se agregó exitosamente!`);
    if (onFieldUpdated) onFieldUpdated();
  };

  const handleDeleteOption = (index: number, itemValue: string) => {
    const updated = currentListItems.filter((_, i) => i !== index);
    updateMasterOptionList(selectedListKey, updated);
    triggerNotification(`"${itemValue}" fue eliminada de la lista.`);
    if (onFieldUpdated) onFieldUpdated();
  };

  const handleStartEditItem = (index: number, text: string) => {
    setEditingItemIndex(index);
    setEditingItemText(text);
  };

  const handleSaveEditItem = (index: number) => {
    const val = editingItemText.trim();
    if (!val) return;

    const updated = [...currentListItems];
    updated[index] = val;
    updateMasterOptionList(selectedListKey, updated);
    setEditingItemIndex(null);
    setEditingItemText('');
    triggerNotification(`Opción actualizada a "${val}".`);
    if (onFieldUpdated) onFieldUpdated();
  };

  const handleAddBulkMasterOptions = () => {
    if (!bulkOptionsText.trim()) return;
    const lines = bulkOptionsText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s && !currentListItems.some((i) => i.toLowerCase() === s.toLowerCase()));

    if (lines.length === 0) {
      triggerNotification('No hay nuevas opciones para agregar.', 'info');
      return;
    }

    const updated = [...currentListItems, ...lines];
    updateMasterOptionList(selectedListKey, updated);
    setBulkOptionsText('');
    setShowBulkOptions(false);
    triggerNotification(`Se agregaron ${lines.length} nuevas opciones a la lista.`);
    if (onFieldUpdated) onFieldUpdated();
  };

  const handleResetCurrentList = () => {
    if (
      window.confirm(
        `¿Deseas restablecer la lista "${selectedListKey}" a los valores predeterminados oficiales?`
      )
    ) {
      resetMasterOptions();
      triggerNotification('Lista restablecida a los valores oficiales.');
      if (onFieldUpdated) onFieldUpdated();
    }
  };

  // --- Handlers for Form Fields (Preguntas) ---
  const availableSections = Array.from(
    new Set([...FORM_SECTIONS, ...fields.map((f) => f.section).filter(Boolean)])
  );

  const handleStartEditField = (f: FormFieldConfig) => {
    setEditingFieldId(f.id);
    setEditLabel(f.label);
    setEditSection(f.section);
    setEditType(f.type);
    setEditRequired(Boolean(f.required));
    setEditPlaceholder(f.placeholder || '');
    setEditDescription(f.description || '');
    setEditOptions(f.options ? [...f.options] : []);
    setNewOptionInput('');
    setBulkOptionInput('');
    setShowBulkInput(false);
    setIsAddingNew(false);
  };

  const handleCancelEditField = () => {
    setEditingFieldId(null);
  };

  const handleSaveEditField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLabel.trim()) {
      alert('El nombre o título de la pregunta es obligatorio.');
      return;
    }

    const updated = fields.map((f) => {
      if (f.id === editingFieldId) {
        return {
          ...f,
          label: editLabel.trim(),
          section: editSection || f.section,
          type: editType,
          required: editRequired,
          placeholder: editPlaceholder.trim() || undefined,
          description: editDescription.trim() || undefined,
          options: editType === 'select' ? editOptions : undefined,
        };
      }
      return f;
    });

    setFields(updated);
    saveStoredFormFields(updated);
    setEditingFieldId(null);
    triggerNotification(`Pregunta "${editLabel}" guardada exitosamente.`);
    if (onFieldUpdated) onFieldUpdated();
  };

  const handleToggleDisabled = (fieldId: string) => {
    const updated = fields.map((f) => {
      if (f.id === fieldId) {
        const nextDisabled = !f.disabled;
        triggerNotification(
          nextDisabled ? `Campo "${f.label}" desactivado.` : `Campo "${f.label}" habilitado.`
        );
        return { ...f, disabled: nextDisabled };
      }
      return f;
    });
    setFields(updated);
    saveStoredFormFields(updated);
    if (onFieldUpdated) onFieldUpdated();
  };

  const handleRemoveField = (fieldId: string, label: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el campo "${label}"?`)) {
      const updated = fields.filter((f) => f.id !== fieldId);
      setFields(updated);
      saveStoredFormFields(updated);
      triggerNotification(`El campo "${label}" ha sido eliminado.`);
      if (onFieldUpdated) onFieldUpdated();
    }
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    )
      return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newFields = [...fields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, moved);

    setFields(newFields);
    saveStoredFormFields(newFields);
    if (onFieldUpdated) onFieldUpdated();
  };

  return (
    <div
      className={`bg-slate-50 text-slate-900 flex flex-col ${
        isModal ? 'h-full max-h-[90vh]' : 'rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#161c36] text-white flex items-center justify-center shadow-xs">
            <Sliders className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Personalizar Formulario y Variables
              </h2>
              {activeCaseType && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {activeCaseType}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Edita tiendas, canales, motivos de consulta o agrega y oculta preguntas sin complicaciones.
            </p>
          </div>
        </div>

        {/* Tab Switcher & Modal Close */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMainTab('variables')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mainTab === 'variables'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Variables y Tiendas</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 font-semibold">
                {listDefinitions.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMainTab('preguntas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mainTab === 'preguntas'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Preguntas del Formulario</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 font-semibold">
                {fields.length}
              </span>
            </button>
          </div>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Banner Notifications */}
      {bannerMessage && (
        <div
          className={`px-6 py-2.5 flex items-center justify-between text-xs font-semibold animate-fade-in shrink-0 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
              : bannerMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-b border-rose-200'
              : 'bg-blue-50 text-blue-800 border-b border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{bannerMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: VARIABLES Y LISTAS DESPLEGABLES (TIENDAS, ETC.)     */}
        {/* ========================================================= */}
        {mainTab === 'variables' && (
          <div className="space-y-6">
            {/* Quick Helper Banner */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <span className="font-bold">Control total de opciones:</span> Selecciona la lista que
                desees modificar abajo (por ejemplo <strong>Tiendas y Sedes</strong> o{' '}
                <strong>Motivos de Consulta</strong>). Puedes eliminar opciones con un clic (🗑️),
                cambiarles el nombre directamente (✏️) o agregar nuevas opciones. Los cambios se
                aplican al instante en toda la aplicación.
              </div>
            </div>

            {/* List Selector Badges / Grid */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Selecciona la variable o lista que deseas editar:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {listDefinitions.map((def) => {
                  const isSelected = selectedListKey === def.key;
                  const count = masterOptions[def.key]?.length || 0;

                  return (
                    <button
                      key={def.key}
                      type="button"
                      onClick={() => {
                        setSelectedListKey(def.key);
                        setEditingItemIndex(null);
                        setSearchTerm('');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                          {def.icon}
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {count}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {def.label}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {def.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active List Detail & Manager Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Header */}
              <div className="bg-[#161c36] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm">
                    {listDefinitions.find((d) => d.key === selectedListKey)?.label}
                  </span>
                  <span className="text-xs text-blue-200 px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-700">
                    {currentListItems.length} opciones en total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkOptions(!showBulkOptions)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer transition-colors"
                  >
                    <ListPlus className="w-3.5 h-3.5 text-blue-300" />
                    <span>{showBulkOptions ? 'Cerrar Pegado Masivo' : 'Pegar Varias'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCurrentList}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium cursor-pointer transition-colors"
                    title="Restablecer a valores oficiales"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restablecer</span>
                  </button>
                </div>
              </div>

              {/* Add New Option Input Form */}
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <form onSubmit={handleAddOption} className="flex gap-2">
                  <input
                    type="text"
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    placeholder={`Escribe el nombre de la nueva opción (ej: nueva tienda, nuevo motivo)...`}
                    className="flex-1 bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newOptionText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar a la lista</span>
                  </button>
                </form>

                {/* Bulk paste drawer */}
                {showBulkOptions && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200 space-y-2 animate-fade-in">
                    <p className="text-[11px] font-semibold text-slate-600">
                      Pega varias opciones separadas por salto de línea o comas:
                    </p>
                    <textarea
                      rows={3}
                      value={bulkOptionsText}
                      onChange={(e) => setBulkOptionsText(e.target.value)}
                      placeholder="Ej:&#10;Tda. Real Plaza Puruchuco&#10;Tda. Mall del Sur&#10;Tda. Cusco"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkOptions(false)}
                        className="px-3 py-1 rounded-lg text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddBulkMasterOptions}
                        className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Agregar Todas
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search & Filter inside list */}
              {currentListItems.length > 6 && (
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar dentro de esta lista..."
                    className="w-full max-w-xs bg-slate-100/80 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-500">
                    Mostrando {filteredListItems.length} de {currentListItems.length}
                  </span>
                </div>
              )}

              {/* Items List Rows */}
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {filteredListItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No se encontraron opciones en esta lista.
                  </div>
                ) : (
                  filteredListItems.map((item, idx) => {
                    const originalIndex = currentListItems.indexOf(item);
                    const isEditing = editingItemIndex === originalIndex;

                    return (
                      <div
                        key={idx}
                        className="p-3 px-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                      >
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editingItemText}
                              onChange={(e) => setEditingItemText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditItem(originalIndex);
                                if (e.key === 'Escape') setEditingItemIndex(null);
                              }}
                              className="flex-1 bg-white border border-blue-400 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditItem(originalIndex)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingItemIndex(null)}
                              className="px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-200 text-xs cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-[11px] font-mono text-slate-400 w-5">
                                {idx + 1}.
                              </span>
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {item}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Rename button */}
                              <button
                                type="button"
                                onClick={() => handleStartEditItem(originalIndex, item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Editar nombre"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteOption(originalIndex, item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Eliminar de la lista"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PREGUNTAS Y CAMPOS DEL FORMULARIO                  */}
        {/* ========================================================= */}
        {mainTab === 'preguntas' && (
          <div className="space-y-6">
            {/* Section filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 mr-1">Sección:</span>
                <button
                  type="button"
                  onClick={() => setActiveSectionFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeSectionFilter === 'all'
                      ? 'bg-[#161c36] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Todas ({fields.length})
                </button>
                {availableSections.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setActiveSectionFilter(sec)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      activeSectionFilter === sec
                        ? 'bg-[#161c36] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Restablecer las preguntas a las 34 oficiales originales de Google Forms?'
                    )
                  ) {
                    resetStoredFormFields();
                    triggerNotification('Preguntas restablecidas a la plantilla oficial.');
                    if (onFieldUpdated) onFieldUpdated();
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Preguntas</span>
              </button>
            </div>

            {/* Editing field box */}
            {editingFieldId && (
              <form
                onSubmit={handleSaveEditField}
                className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-sm text-amber-950">
                      Editando Pregunta: {editLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEditField}
                    className="text-amber-800 hover:text-amber-950"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Texto de la Pregunta / Etiqueta:
                    </label>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Ejemplo o Placeholder:
                    </label>
                    <input
                      type="text"
                      value={editPlaceholder}
                      onChange={(e) => setEditPlaceholder(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editRequired}
                      onChange={(e) => setEditRequired(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>¿Es campo obligatorio (*)?</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEditField}
                    className="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of configured fields */}
            <div className="space-y-4">
              {availableSections
                .filter((sec) => activeSectionFilter === 'all' || activeSectionFilter === sec)
                .map((sectionName) => {
                  const sectionFields = fields.filter((f) => f.section === sectionName);
                  if (sectionFields.length === 0) return null;

                  return (
                    <div
                      key={sectionName}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                    >
                      <div className="bg-[#161c36] text-white px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-400" />
                          <span className="font-bold text-sm">{sectionName}</span>
                          <span className="text-xs text-blue-200 font-medium px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-700">
                            {sectionFields.length} campos
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {sectionFields.map((field) => {
                          const globalIndex = fields.findIndex((f) => f.id === field.id);
                          const isBeingEdited = editingFieldId === field.id;

                          return (
                            <div
                              key={field.id}
                              className={`p-3.5 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                                field.disabled ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50/50'
                              } ${isBeingEdited ? 'bg-amber-50/50' : ''}`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                                    {field.label}
                                  </span>
                                  {field.required && (
                                    <span
                                      className="text-rose-600 font-bold text-xs"
                                      title="Obligatorio"
                                    >
                                      *
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                    {field.type === 'select'
                                      ? 'Lista Desplegable'
                                      : field.type === 'textarea'
                                      ? 'Texto Largo'
                                      : field.type === 'date'
                                      ? 'Fecha'
                                      : field.type === 'time'
                                      ? 'Hora'
                                      : field.type === 'number'
                                      ? 'Número'
                                      : 'Texto'}
                                  </span>
                                  {field.disabled && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                      Desactivado
                                    </span>
                                  )}
                                </div>
                                {field.description && (
                                  <p className="text-[11px] text-slate-500 mb-1">
                                    {field.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditField(field)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Editar</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleDisabled(field.id)}
                                  className={`p-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                                    field.disabled
                                      ? 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                  title={
                                    field.disabled
                                      ? 'Habilitar en formulario'
                                      : 'Ocultar del formulario'
                                  }
                                >
                                  {field.disabled ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveField(field.id, field.label)}
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                                  title="Eliminar pregunta"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
