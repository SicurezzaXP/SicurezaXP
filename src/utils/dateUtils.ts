import { QuickDatePreset } from '../types/case';

/**
 * Utilitarios de Fechas respetando la zona horaria oficial de Perú: America/Lima (UTC-5)
 * Sicurezza Atención al Cliente
 */

// Formatear una fecha en YYYY-MM-DD según la hora de Perú
export function getPeruDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // Retorna formato 'YYYY-MM-DD'
}

// Obtener fecha y hora actual en formato para input datetime-local: YYYY-MM-DDTHH:mm
export function getPeruDateTimeLocalString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

// Retorna objeto Date ajustado a medianoche de Perú
export function parseDateAtMidnightPeru(dateStr: string): Date {
  // dateStr: "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-').map(Number);
  // America/Lima es UTC-5 sin cambio de horario de verano
  return new Date(Date.UTC(year, month - 1, day, 5, 0, 0));
}

// Retorna fecha final a las 23:59:59.999 en Perú
export function parseDateAtEndOfDayPeru(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1, 4, 59, 59, 999));
}

// Sumar o restar días a una fecha YYYY-MM-DD de forma segura
export function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dt = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

// Calcular rangos rápidos de fecha según la hora de Perú
export function calculateDatePresetRange(preset: QuickDatePreset): { inicio: string; fin: string } {
  const todayStr = getPeruDateString(new Date());
  const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);
  const todayUtc = new Date(Date.UTC(todayYear, todayMonth - 1, todayDay));

  switch (preset) {
    case 'hoy':
      return { inicio: todayStr, fin: todayStr };

    case 'ultimos_7_dias':
      // 7 días incluyendo hoy: desde (hoy - 6 días) hasta hoy
      return {
        inicio: addDaysToDateString(todayStr, -6),
        fin: todayStr,
      };

    case 'ultimos_14_dias':
      // 14 días incluyendo hoy: desde (hoy - 13 días) hasta hoy
      return {
        inicio: addDaysToDateString(todayStr, -13),
        fin: todayStr,
      };

    case 'ultimos_30_dias':
      return {
        inicio: addDaysToDateString(todayStr, -29),
        fin: todayStr,
      };

    case 'esta_semana': {
      // Semana de Lunes a Domingo
      // getUTCDay(): 0 es domingo, 1 lunes, ..., 6 sábado
      const dayOfWeek = todayUtc.getUTCDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const mondayStr = addDaysToDateString(todayStr, diffToMonday);
      const sundayStr = addDaysToDateString(mondayStr, 6);
      return { inicio: mondayStr, fin: sundayStr };
    }

    case 'semana_anterior': {
      const dayOfWeek = todayUtc.getUTCDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const thisMondayStr = addDaysToDateString(todayStr, diffToMonday);
      const prevMondayStr = addDaysToDateString(thisMondayStr, -7);
      const prevSundayStr = addDaysToDateString(prevMondayStr, 6);
      return { inicio: prevMondayStr, fin: prevSundayStr };
    }

    case 'este_mes': {
      const firstDay = `${todayYear}-${String(todayMonth).padStart(2, '0')}-01`;
      // Último día de este mes
      const lastDayOfCurrentMonth = new Date(Date.UTC(todayYear, todayMonth, 0)).getUTCDate();
      const lastDay = `${todayYear}-${String(todayMonth).padStart(2, '0')}-${String(lastDayOfCurrentMonth).padStart(2, '0')}`;
      return { inicio: firstDay, fin: lastDay };
    }

    case 'mes_anterior': {
      let prevMonth = todayMonth - 1;
      let prevYear = todayYear;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
      }
      const firstDay = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
      const lastDayOfMonth = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();
      const lastDay = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
      return { inicio: firstDay, fin: lastDay };
    }

    case 'personalizado':
    default:
      // Por defecto últimos 30 días
      return {
        inicio: addDaysToDateString(todayStr, -29),
        fin: todayStr,
      };
  }
}

// Evaluar si una fecha de caso (string YYYY-MM-DD o YYYY-MM-DDTHH:mm) cae dentro del rango [fechaInicio, fechaFin]
export function isDateInPeruRange(caseDateStr: string, fechaInicioStr: string, fechaFinStr: string): boolean {
  if (!caseDateStr) return false;
  // Extraer la parte YYYY-MM-DD
  const datePart = caseDateStr.includes('T') ? caseDateStr.split('T')[0] : caseDateStr.substring(0, 10);
  return datePart >= fechaInicioStr && datePart <= fechaFinStr;
}

// Formatear para mostrar al usuario en español: ej. "14 Oct 2026, 15:30"
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const dateObj = new Date(dateStr);
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch {
    return dateStr;
  }
}

// Formatear solo fecha en español: ej. "14 Octubre 2026"
export function formatDisplayDateOnly(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.substring(0, 10);
    const [y, m, d] = datePart.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(dateObj);
  } catch {
    return dateStr;
  }
}
