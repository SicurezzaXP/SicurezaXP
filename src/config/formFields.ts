import { FormFieldConfig } from '../types/case';

/**
 * SICUREZZA XP — Configuración Oficial de Preguntas y Campos
 * Extraído 1:1 de Google Forms "Registro de casos ATC"
 */

export const FORM_FIELDS_STORAGE_KEY = 'sicurezza_xp_fields_v4';
export const FORM_FIELDS_UPDATED_EVENT = 'sicurezza_xp_fields_updated';

// Secciones del formulario oficial
export const FORM_SECTIONS = [
  'Registro datos cliente',
  'Datos de la compra',
  'Registro Caso',
  'Queja ATC',
  'Finalización del caso',
] as const;

// Listas maestras según formulario original
export const CANALES_ATENCION = [
  'WhatsApp',
  'Instagram',
  'info@sicurezza.pe',
  'TikTok',
  'Libro de Reclamaciones',
];

export const ORIGENES_VENTA = [
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
];

export const TIPOS_PAGO = [
  'Yape',
  'Efectivo',
  'Tarjeta',
  'Agente',
];

export const TALLAS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  'N/A',
];

export const COLORES = [
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
];

export const TIPOS_CASO = [
  'Solicitud',
  'Reclamo',
  'Consulta',
  'Queja',
  'Libro de Reclamaciones',
];

export const MOTIVOS = [
  'Producto',
  'Pedido',
  'Calidad',
  'Publicidad o promoción',
  'Atención al cliente',
  'No le gusta/No le queda',
  'Error de bot',
];

export const SUBMOTIVOS = [
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
];

export const SUCURSALES_QUEJA = [
  'WhatsApp',
  'Instagram',
  'Tda. Jockey Plaza',
  'Tda. El Polo',
  'Tda. Pza. Norte',
  'Tda. Salaverry',
  'Tda. San Miguel',
  'Tda. Mall Aerquipa',
  'Tda. Trujillo',
  'Tda. Angamos',
  'Courier',
  'N/A',
];

export const SOLUCIONES_BRINDADAS = [
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
];

export const ESTADOS_CASO = ['Abierto', 'Cerrado'];
export const CIERRES_CASO = ['Procede', 'No procede', 'Pendiente'];
export const FCR_OPCIONES = ['Sí', 'No'];
export const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Urgente'];

// Alias retrocompatibles para filtros y tablas existentes
export const STORES_LIST = ORIGENES_VENTA;
export const CHANNELS_LIST = CANALES_ATENCION;
export const CATEGORIES_LIST = MOTIVOS;
export const SUBCATEGORIES_LIST = SUBMOTIVOS;
export const STATUS_LIST = ESTADOS_CASO;
export const PRIORITY_LIST = PRIORIDADES;

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
    options: CANALES_ATENCION,
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
    options: ORIGENES_VENTA,
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
    options: TIPOS_PAGO,
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
    options: TALLAS,
  },
  {
    id: 'color',
    section: 'Datos de la compra',
    label: '17. Color',
    type: 'select',
    required: true,
    options: COLORES,
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
    options: MOTIVOS,
  },
  {
    id: 'submotivo',
    section: 'Registro Caso',
    label: '20. Sub motivo',
    type: 'select',
    required: false,
    options: SUBMOTIVOS,
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
    options: SUCURSALES_QUEJA,
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
    options: SOLUCIONES_BRINDADAS,
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
  documentSource: 'Formulario oficial de Google Forms revisado 100% y cargado',
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
