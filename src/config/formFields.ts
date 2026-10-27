import { FormFieldConfig } from '../types/case';

/**
 * SICUREZZA XP — Configuración Oficial de Preguntas, Variables y Listas
 * Extraído 1:1 de Google Forms "Registro de casos ATC" con soporte dinámico para personalización
 */

export const FORM_FIELDS_STORAGE_KEY = 'sicurezza_xp_fields_v5';
export const FORM_FIELDS_UPDATED_EVENT = 'sicurezza_xp_fields_updated';

export const MASTER_OPTIONS_STORAGE_KEY = 'sicurezza_xp_master_options_v2';
export const MASTER_OPTIONS_UPDATED_EVENT = 'sicurezza_xp_options_updated';

// Secciones del formulario oficial
export const FORM_SECTIONS = [
  'Registro datos cliente',
  'Datos de la compra',
  'Registro Caso',
  'Queja ATC',
  'Finalización del caso',
] as const;

export interface MasterOptionsConfig {
  tiendas: string[];
  canales: string[];
  consultaMotivos: string[];
  motivos: string[];
  submotivos: string[];
  tiposPago: string[];
  tallas: string[];
  colores: string[];
  soluciones: string[];
  sucursalesQueja: string[];
}

export const DEFAULT_MASTER_OPTIONS: MasterOptionsConfig = {
  tiendas: [
    'Canales Digitales / Web',
    'Tda. Jockey Plaza',
    'Tda. El Polo',
    'Tda. Pza Norte',
    'Tda. Mall Ave. Trujillo',
    'Tda. Salaverry',
    'Tda. Mall Pza. Arequipa',
    'Tda. San Miguel',
    'Tda. Angamos',
    'Tda. Ica',
    'Tda. Piura',
    'Sicurezza.pe',
  ],
  canales: [
    'WhatsApp',
    'Instagram',
    'info@sicurezza.pe',
    'TikTok',
    'Presencial Tienda',
    'Libro de Reclamaciones',
  ],
  consultaMotivos: [
    'Stock y Disponibilidad de Producto',
    'Guía de Tallas y Asesoría de Medidas',
    'Ubicación y Horarios de Tiendas Físicas',
    'Tiempos y Costos de Envío / Courier',
    'Promociones, Descuentos y Cupones',
    'Consulta de Pedido Existente',
    'Otra Consulta General',
  ],
  motivos: [
    'Producto',
    'Pedido',
    'Calidad',
    'Publicidad o promoción',
    'Atención al cliente',
    'No le gusta/No le queda',
    'Error de bot',
  ],
  submotivos: [
    'Producto - Características erradas',
    'Producto - Daño mal uso',
    'Producto - Stock de producto',
    'Pedido - Entrega incompleta',
    'Pedido - Pendiente de entrega',
    'Pedido - Estado de pedido',
    'Pedido - Desconocimiento de entrega',
    'Pedido - Dirección de entrega',
    'Pedido - Pzos. de entrega',
    'Pedido - Parcialmente entregado',
    'Pedido - Error de pago',
    'Calidad - Falla de fábrica',
    'Calidad - Mal olor',
    'Calidad - Heridas/Alergia',
    'Calidad - Material',
    'Calidad - Problemas guía de tallas.',
    'Promoción y publicidad - Precio errado',
    'Promoción y publicidad - Promoción incumplida',
    'Promoción y publicidad - Publicidad engañosa',
    'ATC - Mala atención',
    'ATC - Tiempo de espera',
    'ATC - Tiempo de resolución',
    'Cambio - Talla Color Modelo',
    'Devolución - Extorno',
    'Nota de crédito',
  ],
  tiposPago: [
    'Yape',
    'Efectivo',
    'Tarjeta',
    'Agente',
    'Plin / Transferencia',
  ],
  tallas: [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    '2XL',
    'N/A',
  ],
  colores: [
    'Negro',
    'Blanco',
    'Beige',
    'Dark beige',
    'Rosado',
    'Gris',
    'Gris claro',
    'Azul',
    'Terracota',
    'Café',
    'Invisible',
    'N/A',
  ],
  sucursalesQueja: [
    'WhatsApp',
    'Instagram',
    'Tda. Jockey Plaza',
    'Tda. El Polo',
    'Tda. Pza. Norte',
    'Tda. Salaverry',
    'Tda. San Miguel',
    'Tda. Mall Arequipa',
    'Tda. Trujillo',
    'Tda. Angamos',
    'Courier',
    'N/A',
  ],
  soluciones: [
    'Cambio - Talla',
    'Cambio - Color',
    'Cambio - Modelo',
    'Cambio prenda',
    'Devolución - Medio de pago tarjeta',
    'Devolución - Efectivo transferencia',
    'Devolución - Yape transferencia',
    'Nota de crédito',
    'Entrega de pedido',
    'Entrega de información',
    'Otro',
  ],
};

// Aliases para compatibilidad con código existente
export const CANALES_ATENCION = DEFAULT_MASTER_OPTIONS.canales;
export const ORIGENES_VENTA = DEFAULT_MASTER_OPTIONS.tiendas;
export const TIPOS_PAGO = DEFAULT_MASTER_OPTIONS.tiposPago;
export const TALLAS = DEFAULT_MASTER_OPTIONS.tallas;
export const COLORES = DEFAULT_MASTER_OPTIONS.colores;
export const MOTIVOS = DEFAULT_MASTER_OPTIONS.motivos;
export const SUBMOTIVOS = DEFAULT_MASTER_OPTIONS.submotivos;
export const SUCURSALES_QUEJA = DEFAULT_MASTER_OPTIONS.sucursalesQueja;
export const SOLUCIONES_BRINDADAS = DEFAULT_MASTER_OPTIONS.soluciones;

export const TIPOS_CASO = [
  'Solicitud',
  'Reclamo',
  'Consulta',
  'Queja',
  'Libro de Reclamaciones',
];

export const ESTADOS_CASO = ['Abierto', 'Cerrado'];
export const CIERRES_CASO = ['Procede', 'No procede', 'Pendiente'];
export const FCR_OPCIONES = ['Sí', 'No'];
export const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Urgente'];

export const STORES_LIST = ORIGENES_VENTA;
export const CHANNELS_LIST = CANALES_ATENCION;
export const CATEGORIES_LIST = MOTIVOS;
export const SUBCATEGORIES_LIST = SUBMOTIVOS;
export const STATUS_LIST = ESTADOS_CASO;
export const PRIORITY_LIST = PRIORIDADES;

/**
 * Obtener opciones maestras guardadas (tiendas, canales, motivos de consulta, etc.)
 */
export function getMasterOptions(): MasterOptionsConfig {
  if (typeof window === 'undefined') return DEFAULT_MASTER_OPTIONS;
  try {
    const raw = localStorage.getItem(MASTER_OPTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MASTER_OPTIONS_STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_OPTIONS));
      return DEFAULT_MASTER_OPTIONS;
    }
    const parsed = JSON.parse(raw);
    return {
      tiendas: Array.isArray(parsed.tiendas) && parsed.tiendas.length > 0 ? parsed.tiendas : DEFAULT_MASTER_OPTIONS.tiendas,
      canales: Array.isArray(parsed.canales) && parsed.canales.length > 0 ? parsed.canales : DEFAULT_MASTER_OPTIONS.canales,
      consultaMotivos: Array.isArray(parsed.consultaMotivos) && parsed.consultaMotivos.length > 0 ? parsed.consultaMotivos : DEFAULT_MASTER_OPTIONS.consultaMotivos,
      motivos: Array.isArray(parsed.motivos) && parsed.motivos.length > 0 ? parsed.motivos : DEFAULT_MASTER_OPTIONS.motivos,
      submotivos: Array.isArray(parsed.submotivos) && parsed.submotivos.length > 0 ? parsed.submotivos : DEFAULT_MASTER_OPTIONS.submotivos,
      tiposPago: Array.isArray(parsed.tiposPago) && parsed.tiposPago.length > 0 ? parsed.tiposPago : DEFAULT_MASTER_OPTIONS.tiposPago,
      tallas: Array.isArray(parsed.tallas) && parsed.tallas.length > 0 ? parsed.tallas : DEFAULT_MASTER_OPTIONS.tallas,
      colores: Array.isArray(parsed.colores) && parsed.colores.length > 0 ? parsed.colores : DEFAULT_MASTER_OPTIONS.colores,
      soluciones: Array.isArray(parsed.soluciones) && parsed.soluciones.length > 0 ? parsed.soluciones : DEFAULT_MASTER_OPTIONS.soluciones,
      sucursalesQueja: Array.isArray(parsed.sucursalesQueja) && parsed.sucursalesQueja.length > 0 ? parsed.sucursalesQueja : DEFAULT_MASTER_OPTIONS.sucursalesQueja,
    };
  } catch (e) {
    console.error('Error al leer master options:', e);
    return DEFAULT_MASTER_OPTIONS;
  }
}

/**
 * Guardar opciones maestras actualizadas y sincronizar campos dependientes
 */
export function saveMasterOptions(opts: MasterOptionsConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MASTER_OPTIONS_STORAGE_KEY, JSON.stringify(opts));
    
    // Sincronizar en campos del formulario si están guardados
    const currentFields = getStoredFormFields();
    let fieldsChanged = false;

    const updatedFields = currentFields.map((f) => {
      if (f.id === 'origenVenta') {
        fieldsChanged = true;
        return { ...f, options: opts.tiendas };
      }
      if (f.id === 'canal') {
        fieldsChanged = true;
        return { ...f, options: opts.canales };
      }
      if (f.id === 'motivo') {
        fieldsChanged = true;
        return { ...f, options: opts.motivos };
      }
      if (f.id === 'submotivo') {
        fieldsChanged = true;
        return { ...f, options: opts.submotivos };
      }
      if (f.id === 'tipoPago') {
        fieldsChanged = true;
        return { ...f, options: opts.tiposPago };
      }
      if (f.id === 'talla') {
        fieldsChanged = true;
        return { ...f, options: opts.tallas };
      }
      if (f.id === 'color') {
        fieldsChanged = true;
        return { ...f, options: opts.colores };
      }
      if (f.id === 'solucionBrindada') {
        fieldsChanged = true;
        return { ...f, options: opts.soluciones };
      }
      if (f.id === 'sucursalQueja') {
        fieldsChanged = true;
        return { ...f, options: opts.sucursalesQueja };
      }
      return f;
    });

    if (fieldsChanged) {
      saveStoredFormFields(updatedFields);
    }

    window.dispatchEvent(new CustomEvent(MASTER_OPTIONS_UPDATED_EVENT, { detail: opts }));
  } catch (e) {
    console.error('Error al guardar master options:', e);
  }
}

/**
 * Actualizar una lista específica de opciones (ej: tiendas, motivos, canales)
 */
export function updateMasterOptionList(listKey: keyof MasterOptionsConfig, items: string[]): void {
  const current = getMasterOptions();
  const cleaned = Array.from(new Set(items.map((i) => i.trim()).filter(Boolean)));
  const updated: MasterOptionsConfig = {
    ...current,
    [listKey]: cleaned,
  };
  saveMasterOptions(updated);
}

/**
 * Restablecer todas las opciones maestras a los valores iniciales oficiales
 */
export function resetMasterOptions(): MasterOptionsConfig {
  if (typeof window === 'undefined') return DEFAULT_MASTER_OPTIONS;
  try {
    localStorage.setItem(MASTER_OPTIONS_STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_OPTIONS));
    window.dispatchEvent(new CustomEvent(MASTER_OPTIONS_UPDATED_EVENT, { detail: DEFAULT_MASTER_OPTIONS }));
    return DEFAULT_MASTER_OPTIONS;
  } catch (e) {
    console.error('Error al restablecer master options:', e);
    return DEFAULT_MASTER_OPTIONS;
  }
}

export const DEFAULT_FORM_FIELDS: FormFieldConfig[] = [
  // 1. Registro datos cliente
  {
    id: 'nroCasoDni',
    section: 'Registro datos cliente',
    label: '1. Nro. caso (DNI cliente)',
    type: 'text',
    required: true,
    placeholder: 'Ingresa el DNI o identificador único del cliente',
  },
  {
    id: 'nombresApellidos',
    section: 'Registro datos cliente',
    label: '2. Nombres/Apellidos',
    type: 'text',
    required: true,
    placeholder: 'Nombres y apellidos completos de la clienta',
  },
  {
    id: 'fechaIngreso',
    section: 'Registro datos cliente',
    label: '3. Fecha ingreso caso',
    type: 'date',
    required: true,
  },
  {
    id: 'canal',
    section: 'Registro datos cliente',
    label: '4. Canal de atención',
    type: 'select',
    required: true,
    options: DEFAULT_MASTER_OPTIONS.canales,
  },
  {
    id: 'telefonoCliente',
    section: 'Registro datos cliente',
    label: '5. Teléfono cliente',
    type: 'text',
    required: true,
    placeholder: 'Ej. 987654321',
  },
  {
    id: 'correoCliente',
    section: 'Registro datos cliente',
    label: '6. Correo cliente',
    type: 'text',
    required: true,
    placeholder: 'cliente@ejemplo.com',
  },
  {
    id: 'numeroPedido',
    section: 'Registro datos cliente',
    label: '7. Número de pedido',
    type: 'text',
    required: true,
    placeholder: 'Ej. #SIC-18450',
  },
  {
    id: 'numeroBoleta',
    section: 'Registro datos cliente',
    label: '8. Número boleta',
    type: 'text',
    required: true,
    placeholder: 'Ej. B003-004812',
  },
  {
    id: 'campanaMkt',
    section: 'Registro datos cliente',
    label: '9. Campaña MKT',
    type: 'text',
    required: true,
    placeholder: 'Ej. Cyber Wow, Verano 2026, Campaña Bra Magic, Orgánico',
  },

  // 2. Datos de la compra
  {
    id: 'origenVenta',
    section: 'Datos de la compra',
    label: '10. Origen de venta',
    type: 'select',
    required: true,
    options: DEFAULT_MASTER_OPTIONS.tiendas,
  },
  {
    id: 'fechaVenta',
    section: 'Datos de la compra',
    label: '11. Fecha de venta',
    type: 'date',
    required: true,
  },
  {
    id: 'tipoPago',
    section: 'Datos de la compra',
    label: '12. Tipo de pago',
    type: 'select',
    required: true,
    options: DEFAULT_MASTER_OPTIONS.tiposPago,
  },
  {
    id: 'producto',
    section: 'Datos de la compra',
    label: '13. Producto',
    type: 'text',
    required: true,
    placeholder: 'Ej. Bra Invisible Seamless Strapless',
  },
  {
    id: 'sku',
    section: 'Datos de la compra',
    label: '14. SKU',
    type: 'text',
    required: true,
    placeholder: 'Ej. BRA-INV-001',
  },
  {
    id: 'cantidad',
    section: 'Datos de la compra',
    label: '15. Cantidad',
    type: 'number',
    required: true,
    placeholder: '1',
  },
  {
    id: 'talla',
    section: 'Datos de la compra',
    label: '16. Talla',
    type: 'select',
    required: true,
    options: DEFAULT_MASTER_OPTIONS.tallas,
  },
  {
    id: 'color',
    section: 'Datos de la compra',
    label: '17. Color',
    type: 'select',
    required: true,
    options: DEFAULT_MASTER_OPTIONS.colores,
  },

  // 3. Registro Caso
  {
    id: 'tipoCaso',
    section: 'Registro Caso',
    label: '18. Tipo de caso',
    type: 'select',
    required: true,
    options: TIPOS_CASO,
  },
  {
    id: 'motivo',
    section: 'Registro Caso',
    label: '19. Motivo',
    type: 'select',
    required: true,
    options: DEFAULT_MASTER_OPTIONS.motivos,
  },
  {
    id: 'submotivo',
    section: 'Registro Caso',
    label: '20. Sub motivo',
    type: 'select',
    required: false,
    options: DEFAULT_MASTER_OPTIONS.submotivos,
  },
  {
    id: 'fechaDerivacion',
    section: 'Registro Caso',
    label: '21. Fecha de derivación',
    type: 'date',
    required: false,
  },
  {
    id: 'solicitudCliente',
    section: 'Registro Caso',
    label: '22. Solicitud de cliente',
    type: 'textarea',
    required: true,
    placeholder: 'Describe detalladamente la solicitud o manifestación del cliente...',
  },

  // 4. Queja ATC
  {
    id: 'quejaPersonalInvolucrado',
    section: 'Queja ATC',
    label: '23. Nombre/Apellido - Personal involucrado',
    type: 'text',
    required: true,
    description: 'Llenar solo en caso que sea una queja por mala atención. Colocar N/A si no aplica',
    placeholder: 'N/A o Nombre del asesor / personal',
  },
  {
    id: 'sucursalQueja',
    section: 'Queja ATC',
    label: '24. Sucursal de queja',
    type: 'select',
    required: true,
    options: DEFAULT_MASTER_OPTIONS.sucursalesQueja,
  },
  {
    id: 'fechaAtencion',
    section: 'Queja ATC',
    label: '25. Fecha de atención',
    type: 'date',
    required: false,
  },
  {
    id: 'horarioAtencion',
    section: 'Queja ATC',
    label: '26. Horario de atención',
    type: 'text',
    required: false,
    placeholder: 'Ejemplo: 8:30 a.m.',
  },

  // 5. Finalización del caso
  {
    id: 'solucionBrindada',
    section: 'Finalización del caso',
    label: '27. Solución brindada',
    type: 'select',
    required: true,
    options: DEFAULT_MASTER_OPTIONS.soluciones,
  },
  {
    id: 'cerroEnFcr',
    section: 'Finalización del caso',
    label: '28. ¿Se cerró en FCR? First Contact Resolutions',
    type: 'select',
    required: true,
    options: FCR_OPCIONES,
  },
  {
    id: 'fechaRespuesta',
    section: 'Finalización del caso',
    label: '29. Fecha de respuesta',
    type: 'date',
    required: false,
  },
  {
    id: 'detalleSolucion',
    section: 'Finalización del caso',
    label: '30. Detalle de solución brindada o si queda abierto indicar el seguimiento al requerimiento',
    type: 'textarea',
    required: true,
    placeholder: 'Escribe el detalle de la solución o seguimiento acordado...',
  },
  {
    id: 'sustentosAtencion',
    section: 'Finalización del caso',
    label: '31. Sustentos de atención',
    type: 'text',
    required: false,
    placeholder: 'Archivos enviados, enlaces de soporte o documentos',
  },
  {
    id: 'estado',
    section: 'Finalización del caso',
    label: '32. Estado',
    type: 'select',
    required: true,
    options: ESTADOS_CASO,
  },
  {
    id: 'cierre',
    section: 'Finalización del caso',
    label: '33. Cierre',
    type: 'select',
    required: true,
    options: CIERRES_CASO,
  },
  {
    id: 'fechaCierre',
    section: 'Finalización del caso',
    label: '34. Fecha de cierre',
    type: 'date',
    required: false,
  },
];

export const FORM_SYNC_STATUS = {
  isConfirmed: true,
  documentSource: 'Formulario oficial de Google Forms sincronizado con Sicurezza XP',
};

/**
 * Obtener campos guardados en almacenamiento local o devolver la plantilla predeterminada oficial
 */
export function getStoredFormFields(): FormFieldConfig[] {
  if (typeof window === 'undefined') return DEFAULT_FORM_FIELDS;
  try {
    const raw = localStorage.getItem(FORM_FIELDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FORM_FIELDS_STORAGE_KEY, JSON.stringify(DEFAULT_FORM_FIELDS));
      return DEFAULT_FORM_FIELDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_FORM_FIELDS;
  } catch (e) {
    console.error('Error al leer campos configurados:', e);
    return DEFAULT_FORM_FIELDS;
  }
}

/**
 * Guardar campos modificados y notificar a toda la aplicación
 */
export function saveStoredFormFields(fields: FormFieldConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FORM_FIELDS_STORAGE_KEY, JSON.stringify(fields));
    window.dispatchEvent(new CustomEvent(FORM_FIELDS_UPDATED_EVENT, { detail: fields }));
  } catch (e) {
    console.error('Error al guardar campos:', e);
  }
}

/**
 * Restablecer campos a los 34 originales del formulario oficial de Google Forms
 */
export function resetStoredFormFields(): FormFieldConfig[] {
  if (typeof window === 'undefined') return DEFAULT_FORM_FIELDS;
  try {
    localStorage.setItem(FORM_FIELDS_STORAGE_KEY, JSON.stringify(DEFAULT_FORM_FIELDS));
    window.dispatchEvent(new CustomEvent(FORM_FIELDS_UPDATED_EVENT, { detail: DEFAULT_FORM_FIELDS }));
    return DEFAULT_FORM_FIELDS;
  } catch (e) {
    console.error('Error al restablecer campos:', e);
    return DEFAULT_FORM_FIELDS;
  }
}
