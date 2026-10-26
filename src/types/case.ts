/**
 * SICUREZZA XP — Modelo de Datos de Casos ATC
 * Estructura oficial extraída 1:1 de Google Forms original "Registro datos cliente"
 */

export type CaseStatus = 'Abierto' | 'Cerrado';
export type CaseCierre = 'Procede' | 'No procede' | 'Pendiente';
export type CaseFCR = 'Sí' | 'No';
export type CasePriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';
export type CaseChannel = string;
export type CaseStore = string;
export type CaseCategory = string;
export type CaseSubcategory = string;

export interface CaseItem {
  id: string; // e.g. "SIC-2026-0001"
  
  // 1. Registro datos cliente
  nroCasoDni: string; // 1. Nro. caso (DNI cliente) *
  nombresApellidos: string; // 2. Nombres/Apellidos *
  fechaIngreso: string; // 3. Fecha ingreso caso * (YYYY-MM-DD o YYYY-MM-DDTHH:mm)
  canal: string; // 4. Canal de atención * (WhatsApp, Instagram, info@sicurezza.pe, TikTok, Libro de Reclamaciones)
  telefonoCliente: string; // 5. Teléfono cliente *
  correoCliente: string; // 6. Correo cliente *

  // 2. Datos de la compra
  numeroPedido: string; // 7. Número de pedido *
  numeroBoleta: string; // 8. Número boleta *
  campanaMkt: string; // 9. Campaña MKT *
  origenVenta: string; // 10. Origen de venta * (Tda. Jockey Plaza, Tda. El Polo, etc.)
  fechaVenta: string; // 11. Fecha de venta *
  tipoPago: string; // 12. Tipo de pago * (Yape, Efectivo, Tarjeta, Agente)
  producto: string; // 13. Producto *
  sku: string; // 14. SKU *
  cantidad: string | number; // 15. Cantidad *
  talla: string; // 16. Talla * (XS, S, M, L, XL, 2XL, N/A)
  color: string; // 17. Color * (Negro, Blanco, Beige, Dark beige, Rosado, etc.)

  // 3. Registro Caso
  tipoCaso: string; // 18. Tipo de caso * (Solicitud, Reclamo, Consulta, Queja, Libro de Reclamaciones)
  motivo: string; // 19. Motivo * (Producto, Pedido, Calidad, Publicidad o promoción, etc.)
  submotivo?: string; // 20. Sub motivo (Dropdown con 25 submotivos)
  fechaDerivacion?: string; // 21. Fecha de derivación
  solicitudCliente: string; // 22. Solicitud de cliente *

  // 4. Queja ATC
  quejaPersonalInvolucrado: string; // 23. Nombre/Apellido - Personal involucrado * (o N/A)
  sucursalQueja: string; // 24. Sucursal de queja *
  fechaAtencion?: string; // 25. Fecha de atención
  horarioAtencion?: string; // 26. Horario de atención (ej: 8:30 a.m.)

  // 5. Finalización del caso
  solucionBrindada: string; // 27. Solución brindada * (Cambio - Talla, Devolución, Nota de crédito, etc.)
  cerroEnFcr: CaseFCR | string; // 28. ¿Se cerró en FCR? First Contact Resolutions *
  fechaRespuesta?: string; // 29. Fecha de respuesta
  detalleSolucion: string; // 30. Detalle de solución brindada o si queda abierto indicar el seguimiento *
  sustentosAtencion?: string; // 31. Sustentos de atención (Archivos enviados)
  estado: CaseStatus | string; // 32. Estado * (Abierto, Cerrado)
  cierre: CaseCierre | string; // 33. Cierre * (Procede, No procede, Pendiente)
  fechaCierre?: string; // 34. Fecha de cierre

  // Auditoría y trazabilidad
  isArchived?: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Campos adicionales dinámicos
  customFields?: Record<string, any>;

  // Retrocompatibilidad con esquemas previos
  tienda?: string;
  categoria?: string;
  subcategory?: string;
  prioridad?: CasePriority | string;
  clienteNombre?: string;
  clienteDocumento?: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  descripcion?: string;
  solucionAccion?: string;
  asesorResponsable?: string;
  clienteConforme?: string;
}

export type QuickDatePreset = 
  | 'hoy'
  | 'ultimos_7_dias'
  | 'ultimos_14_dias'
  | 'ultimos_30_dias'
  | 'esta_semana'
  | 'semana_anterior'
  | 'este_mes'
  | 'mes_anterior'
  | 'personalizado';

export interface CaseFilterState {
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  preset: QuickDatePreset;
  origenVenta: string; // '' para todas
  tipoCaso: string; // '' para todos
  motivo: string; // '' para todos
  estado: string; // '' para todos
  canal: string; // '' para todos
  cierre: string; // '' para todos
  searchTerm: string;

  // Retrocompatibilidad
  tienda?: string;
  categoria?: string;
  prioridad?: string;
}

export interface FormFieldConfig {
  id: string;
  section: string;
  label: string;
  description?: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'time' | 'datetime-local' | 'number';
  required: boolean;
  options?: string[];
  placeholder?: string;
  isCustom?: boolean;
  disabled?: boolean;
}
