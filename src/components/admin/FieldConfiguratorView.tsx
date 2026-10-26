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
} from 'lucide-react';
import {
  getStoredFormFields,
  saveStoredFormFields,
  resetStoredFormFields,
  FORM_SECTIONS,
} from '../../config/formFields';
import { FormFieldConfig } from '../../types/case';

interface FieldConfiguratorViewProps {
  onFieldUpdated?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const FieldConfiguratorView: React.FC<FieldConfiguratorViewProps> = ({
  onFieldUpdated,
  isModal = false,
  onClose,
}) => {
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

  // Success / error banner
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    setFields(getStoredFormFields());
  }, []);

  const triggerNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setBannerMessage({ text, type });
    setTimeout(() => {
      setBannerMessage(null);
    }, 3500);
  };

  // Get unique sections including any custom ones
  const availableSections = Array.from(
    new Set([...FORM_SECTIONS, ...fields.map((f) => f.section).filter(Boolean)])
  );

  // Start editing a field
  const handleStartEdit = (f: FormFieldConfig) => {
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

  const handleCancelEdit = () => {
    setEditingFieldId(null);
  };

  // Save edited field
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLabel.trim()) {
      alert('El nombre o título de la pregunta es obligatorio.');
      return;
    }

    if (editType === 'select' && editOptions.length === 0) {
      alert('Para un campo de tipo Lista Desplegable debes agregar al menos una opción.');
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
    triggerNotification(`¡Pregunta "${editLabel}" guardada exitosamente! Se reflejará de inmediato en el formulario.`);
    if (onFieldUpdated) onFieldUpdated();
  };

  // Option management for editing
  const handleAddSingleOptionToEdit = () => {
    const val = newOptionInput.trim();
    if (!val) return;
    if (editOptions.includes(val)) {
      alert('Esta opción ya existe en la lista.');
      return;
    }
    setEditOptions([...editOptions, val]);
    setNewOptionInput('');
  };

  const handleAddBulkOptionsToEdit = () => {
    if (!bulkOptionInput.trim()) return;
    const items = bulkOptionInput
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s && !editOptions.includes(s));
    
    if (items.length === 0) return;
    setEditOptions([...editOptions, ...items]);
    setBulkOptionInput('');
    setShowBulkInput(false);
    triggerNotification(`Se agregaron ${items.length} opciones a la lista.`);
  };

  const handleRemoveOptionFromEdit = (index: number) => {
    setEditOptions(editOptions.filter((_, i) => i !== index));
  };

  // Add new field
  const handleAddNewField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      alert('Por favor ingresa el título o pregunta del nuevo campo.');
      return;
    }

    const resolvedSection = newSection === '__custom__' 
      ? (customSectionInput.trim() || 'Campos Adicionales') 
      : newSection;

    if (newType === 'select' && newOptionsList.length === 0) {
      alert('Debes agregar al menos una opción para la lista desplegable.');
      return;
    }

    const newFieldId = `campo_${Date.now()}`;
    const newField: FormFieldConfig = {
      id: newFieldId,
      section: resolvedSection,
      label: newLabel.trim(),
      description: newDescription.trim() || undefined,
      type: newType,
      required: newRequired,
      placeholder: newPlaceholder.trim() || undefined,
      options: newType === 'select' ? newOptionsList : undefined,
      isCustom: true,
      disabled: false,
    };

    const updated = [...fields, newField];
    setFields(updated);
    saveStoredFormFields(updated);

    // Reset inputs
    setNewLabel('');
    setNewDescription('');
    setNewType('text');
    setNewRequired(false);
    setNewPlaceholder('');
    setNewOptionsList([]);
    setNewSingleOptionInput('');
    setNewBulkOptionInput('');
    setShowNewBulkInput(false);
    setIsAddingNew(false);

    triggerNotification(`¡Nuevo campo "${newField.label}" añadido a la sección "${resolvedSection}"!`);
    if (onFieldUpdated) onFieldUpdated();
  };

  const handleAddSingleOptionToNew = () => {
    const val = newSingleOptionInput.trim();
    if (!val) return;
    if (newOptionsList.includes(val)) {
      alert('Esta opción ya existe.');
      return;
    }
    setNewOptionsList([...newOptionsList, val]);
    setNewSingleOptionInput('');
  };

  const handleAddBulkOptionsToNew = () => {
    if (!newBulkOptionInput.trim()) return;
    const items = newBulkOptionInput
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s && !newOptionsList.includes(s));
    
    if (items.length === 0) return;
    setNewOptionsList([...newOptionsList, ...items]);
    setNewBulkOptionInput('');
    setShowNewBulkInput(false);
    triggerNotification(`Se agregaron ${items.length} opciones.`);
  };

  const handleRemoveOptionFromNew = (index: number) => {
    setNewOptionsList(newOptionsList.filter((_, i) => i !== index));
  };

  // Toggle enable/disable
  const handleToggleDisabled = (fieldId: string) => {
    const updated = fields.map((f) => {
      if (f.id === fieldId) {
        return { ...f, disabled: !f.disabled };
      }
      return f;
    });
    setFields(updated);
    saveStoredFormFields(updated);
    if (onFieldUpdated) onFieldUpdated();
  };

  // Remove field
  const handleRemoveField = (fieldId: string, label: string) => {
    const ok = window.confirm(
      `¿Deseas eliminar definitivamente la pregunta "${label}"? No se mostrará en el formulario de registro.`
    );
    if (!ok) return;

    const updated = fields.filter((f) => f.id !== fieldId);
    setFields(updated);
    saveStoredFormFields(updated);
    if (editingFieldId === fieldId) setEditingFieldId(null);
    triggerNotification(`La pregunta "${label}" ha sido eliminada del formulario.`, 'info');
    if (onFieldUpdated) onFieldUpdated();
  };

  // Move field order
  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    setFields(updated);
    saveStoredFormFields(updated);
    if (onFieldUpdated) onFieldUpdated();
  };

  // Reset to original Google Forms questions
  const handleResetDefaults = () => {
    const ok = window.confirm(
      '¿Deseas restablecer todas las preguntas a las 34 oficiales del formulario de Google Forms de Sicurezza? Se restaurarán los campos y opciones predeterminadas.'
    );
    if (ok) {
      const reset = resetStoredFormFields();
      setFields(reset);
      setEditingFieldId(null);
      setIsAddingNew(false);
      triggerNotification('Formulario restablecido a las 34 preguntas oficiales de Google Forms.', 'info');
      if (onFieldUpdated) onFieldUpdated();
    }
  };

  // Filtered fields
  const filteredFields = fields.filter((f) => {
    if (activeSectionFilter === 'all') return true;
    return f.section === activeSectionFilter;
  });

  return (
    <div className={`space-y-6 ${isModal ? 'p-6 max-h-[85vh] overflow-y-auto' : ''}`}>
      {/* Banner message */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-xs transition-all animate-fade-in ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : bannerMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border border-rose-200'
              : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {bannerMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{bannerMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header card with blue theme */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              Formulario Sicurezza XP
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {fields.length} preguntas configuradas
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Configurador y Editor de Preguntas del Formulario
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Puedes editar las preguntas por defecto, modificar las opciones de las listas desplegables, eliminar campos o crear nuevas preguntas personalizadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsAddingNew(true);
              setEditingFieldId(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Nueva Pregunta</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 transition-colors cursor-pointer"
            title="Restablecer preguntas a las 34 originales del PDF de Google Forms"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restablecer Originales</span>
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Section filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSectionFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSectionFilter === 'all'
              ? 'bg-[#161c36] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Todas las Secciones ({fields.length})
        </button>
        {availableSections.map((sec) => {
          const count = fields.filter((f) => f.section === sec).length;
          return (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveSectionFilter(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeSectionFilter === sec
                  ? 'bg-[#161c36] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sec} ({count})
            </button>
          );
        })}
      </div>

      {/* NEW FIELD FORM MODAL / PANEL */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewField}
          className="bg-blue-50/70 border-2 border-blue-300 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Crear y Añadir Nueva Pregunta al Formulario
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Target Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Sección del Formulario *
              </label>
              <select
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FORM_SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
                <option value="__custom__">+ Otra sección personalizada...</option>
              </select>
              {newSection === '__custom__' && (
                <input
                  type="text"
                  placeholder="Nombre de la nueva sección"
                  value={customSectionInput}
                  onChange={(e) => setCustomSectionInput(e.target.value)}
                  className="mt-2 w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                />
              )}
            </div>

            {/* Label */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Título o Pregunta del Campo *
              </label>
              <input
                type="text"
                placeholder="Ej. Nro. de seguimiento secundario o Motivo detallado"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tipo de Entrada *
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Texto corto</option>
                <option value="textarea">Área de texto (Largo)</option>
                <option value="select">Lista desplegable (Opciones múltiples)</option>
                <option value="date">Fecha (YYYY-MM-DD)</option>
                <option value="time">Hora (HH:mm)</option>
                <option value="number">Número</option>
              </select>
            </div>

            {/* Placeholder */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Texto de ayuda / Placeholder (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Ingrese el código..."
                value={newPlaceholder}
                onChange={(e) => setNewPlaceholder(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              />
            </div>

            {/* Required */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="new_required_check"
                checked={newRequired}
                onChange={(e) => setNewRequired(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <label htmlFor="new_required_check" className="text-xs font-bold text-slate-700 cursor-pointer">
                ¿Es campo obligatorio? (*)
              </label>
            </div>
          </div>

          {/* If type is SELECT -> Options manager */}
          {newType === 'select' && (
            <div className="bg-white rounded-xl p-4 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Opciones de la Lista Desplegable ({newOptionsList.length})</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewBulkInput(!showNewBulkInput)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>{showNewBulkInput ? 'Modo individual' : 'Pegar lista masiva (comas o saltos)'}</span>
                </button>
              </div>

              {!showNewBulkInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe una opción y presiona Añadir"
                    value={newSingleOptionInput}
                    onChange={(e) => setNewSingleOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSingleOptionToNew();
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddSingleOptionToNew}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    Añadir
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Pega aquí múltiples opciones separadas por coma o saltos de línea..."
                    value={newBulkOptionInput}
                    onChange={(e) => setNewBulkOptionInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddBulkOptionsToNew}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    Procesar y Agregar Opciones
                  </button>
                </div>
              )}

              {/* Badges preview */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {newOptionsList.map((opt, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-medium"
                  >
                    <span>{opt}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionFromNew(i)}
                      className="text-blue-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {newOptionsList.length === 0 && (
                  <span className="text-xs text-amber-700 italic">
                    Sin opciones todavía. Agrega al menos una opción para esta lista desplegable.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Guardar y Agregar al Formulario
            </button>
          </div>
        </form>
      )}

      {/* EDIT MODAL / FORM INLINE */}
      {editingFieldId && (
        <form
          onSubmit={handleSaveEdit}
          className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Editar Pregunta y Opciones de: <span className="text-amber-800">"{editLabel}"</span>
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Label */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Título o Pregunta del Campo *
              </label>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Sección del Formulario *
              </label>
              <select
                value={editSection}
                onChange={(e) => setEditSection(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {availableSections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tipo de Entrada *
              </label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              >
                <option value="text">Texto corto</option>
                <option value="textarea">Área de texto (Largo)</option>
                <option value="select">Lista desplegable (Opciones múltiples)</option>
                <option value="date">Fecha (YYYY-MM-DD)</option>
                <option value="time">Hora (HH:mm)</option>
                <option value="number">Número</option>
              </select>
            </div>

            {/* Placeholder */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Placeholder / Texto de ayuda
              </label>
              <input
                type="text"
                value={editPlaceholder}
                onChange={(e) => setEditPlaceholder(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              />
            </div>

            {/* Required */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="edit_required_check"
                checked={editRequired}
                onChange={(e) => setEditRequired(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <label htmlFor="edit_required_check" className="text-xs font-bold text-slate-700 cursor-pointer">
                ¿Es campo obligatorio? (*)
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Instrucción o Aclaración de Llenado (Opcional)
            </label>
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Ej. Llenar solo en caso de queja. Colocar N/A si no aplica"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
            />
          </div>

          {/* If SELECT -> Options Editor */}
          {editType === 'select' && (
            <div className="bg-white rounded-xl p-4 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Modificar Opciones de la Lista ({editOptions.length})</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowBulkInput(!showBulkInput)}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>{showBulkInput ? 'Modo individual' : 'Pegar lista masiva (comas o saltos)'}</span>
                </button>
              </div>

              {!showBulkInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe una nueva opción y presiona Añadir"
                    value={newOptionInput}
                    onChange={(e) => setNewOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSingleOptionToEdit();
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddSingleOptionToEdit}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 cursor-pointer"
                  >
                    Añadir Opción
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Pega aquí múltiples opciones separadas por coma o saltos de línea..."
                    value={bulkOptionInput}
                    onChange={(e) => setBulkOptionInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddBulkOptionsToEdit}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 cursor-pointer"
                  >
                    Procesar y Agregar Opciones
                  </button>
                </div>
              )}

              {/* Badges preview */}
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pt-1">
                {editOptions.map((opt, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-medium"
                  >
                    <span>{opt}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionFromEdit(i)}
                      className="text-amber-600 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Eliminar esta opción"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      )}

      {/* LIST OF CONFIGURED FIELDS */}
      <div className="space-y-4">
        {availableSections
          .filter((sec) => activeSectionFilter === 'all' || activeSectionFilter === sec)
          .map((sectionName) => {
            const sectionFields = fields.filter((f) => f.section === sectionName);
            if (sectionFields.length === 0) return null;

            return (
              <div key={sectionName} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {/* Section header */}
                <div className="bg-[#161c36] text-white px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-sm">{sectionName}</span>
                    <span className="text-xs text-blue-200 font-medium px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-700">
                      {sectionFields.length} campos
                    </span>
                  </div>
                </div>

                {/* Fields Table / Rows */}
                <div className="divide-y divide-slate-100">
                  {sectionFields.map((field) => {
                    const globalIndex = fields.findIndex((f) => f.id === field.id);
                    const isBeingEdited = editingFieldId === field.id;

                    return (
                      <div
                        key={field.id}
                        className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                          field.disabled ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50/50'
                        } ${isBeingEdited ? 'bg-amber-50/50' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900">
                              {field.label}
                            </span>
                            {field.required && (
                              <span className="text-rose-600 font-bold text-xs" title="Obligatorio">
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
                            {field.isCustom && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                Personalizado
                              </span>
                            )}
                            {field.disabled && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                Desactivado
                              </span>
                            )}
                          </div>

                          {field.description && (
                            <p className="text-xs text-slate-500 mb-1">{field.description}</p>
                          )}

                          {/* If select: preview options */}
                          {field.type === 'select' && field.options && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {field.options.slice(0, 6).map((opt, oi) => (
                                <span
                                  key={oi}
                                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60"
                                >
                                  {opt}
                                </span>
                              ))}
                              {field.options.length > 6 && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                                  +{field.options.length - 6} más...
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Move up / down */}
                          <div className="flex flex-col mr-1">
                            <button
                              type="button"
                              onClick={() => handleMoveField(globalIndex, 'up')}
                              disabled={globalIndex === 0}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              title="Subir posición"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveField(globalIndex, 'down')}
                              disabled={globalIndex === fields.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              title="Bajar posición"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(field)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                            title="Editar etiqueta y opciones de esta pregunta"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Editar</span>
                          </button>

                          {/* Toggle visibility */}
                          <button
                            type="button"
                            onClick={() => handleToggleDisabled(field.id)}
                            className={`p-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                              field.disabled
                                ? 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={field.disabled ? 'Habilitar en formulario' : 'Ocultar del formulario'}
                          >
                            {field.disabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
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
  );
};
