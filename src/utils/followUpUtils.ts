import { CaseItem } from '../types/case';
import { getPeruDateString } from './dateUtils';

export type FollowUpUrgency = 'vencido' | 'hoy' | 'proximo' | 'cumplido' | 'ninguno';

export interface FollowUpInfo {
  isNeeded: boolean;
  dueDate: string; // YYYY-MM-DD
  urgency: FollowUpUrgency;
  daysDiff: number; // positive = days overdue, negative = days until due, 0 = today
  label: string;
}

/**
 * Agrega N días a una fecha en formato YYYY-MM-DD
 */
export function addDaysToDate(dateStr: string, days: number): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return dateStr;
  }
}

/**
 * Calcula días de diferencia entre dos fechas (target - today)
 */
export function diffDays(dateA: string, dateB: string): number {
  try {
    const [yA, mA, dA] = dateA.split('-').map(Number);
    const [yB, mB, dB] = dateB.split('-').map(Number);
    const tA = Date.UTC(yA, mA - 1, dA);
    const tB = Date.UTC(yB, mB - 1, dB);
    return Math.round((tA - tB) / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
}

/**
 * Determina el estado de seguimiento de un caso
 */
export function getCaseFollowUpInfo(item: CaseItem): FollowUpInfo {
  if (item.isArchived) {
    return { isNeeded: false, dueDate: '', urgency: 'ninguno', daysDiff: 0, label: 'Archivado' };
  }

  // Si ya está cerrado y no tiene marca explícita pendiente
  if (item.estado === 'Cerrado' && (item.seguimientoCumplido || !item.requiereSeguimiento)) {
    return { isNeeded: false, dueDate: '', urgency: 'cumplido', daysDiff: 0, label: 'Caso Resuelto / Cerrado' };
  }

  // Es caso de seguimiento si:
  // 1. requiereSeguimiento está explícitamente en true, O
  // 2. El caso está Abierto y no es una consulta simple resuelta en FCR
  const isCandidate =
    item.requiereSeguimiento === true ||
    (item.estado === 'Abierto' && item.tipoCaso !== 'Consulta') ||
    (item.tipoCaso === 'Consulta' && item.requiereSeguimiento === true);

  if (!isCandidate) {
    return { isNeeded: false, dueDate: '', urgency: 'ninguno', daysDiff: 0, label: 'Sin seguimiento' };
  }

  if (item.seguimientoCumplido) {
    return { isNeeded: false, dueDate: '', urgency: 'cumplido', daysDiff: 0, label: 'Seguimiento Realizado' };
  }

  const today = getPeruDateString();
  const freq = item.frecuenciaSeguimientoDias || 2;
  
  // Si no tiene fechaProximoSeguimiento asignada, calculamos fechaIngreso + frecuencia (2 días)
  const dueDate = item.fechaProximoSeguimiento || addDaysToDate(item.fechaIngreso || today, freq);
  const diff = diffDays(dueDate, today);

  if (diff < 0) {
    const daysOverdue = Math.abs(diff);
    return {
      isNeeded: true,
      dueDate,
      urgency: 'vencido',
      daysDiff: daysOverdue,
      label: `Alerta: Vencido hace ${daysOverdue} día${daysOverdue > 1 ? 's' : ''}`,
    };
  } else if (diff === 0) {
    return {
      isNeeded: true,
      dueDate,
      urgency: 'hoy',
      daysDiff: 0,
      label: 'Alerta: Seguimiento para hoy',
    };
  } else {
    return {
      isNeeded: true,
      dueDate,
      urgency: 'proximo',
      daysDiff: -diff,
      label: `En plazo: Toca en ${diff} día${diff > 1 ? 's' : ''}`,
    };
  }
}
