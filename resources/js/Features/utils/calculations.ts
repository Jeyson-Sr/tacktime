/**
 * ============================================
 * CALCULATIONS.TS - Funciones de Cálculo
 * ============================================
 * 
 * Centraliza toda la lógica de cálculos del sistema.
 * Funciones puras sin efectos secundarios.
 */

import { HourlyProduction, KPI, ProductionStatus } from '../types';

// ============================================
// CÁLCULOS DE STATUS
// ============================================

/**
 * Calcula el status de producción basado en porcentaje alcanzado
 * - Blue (🔵): 100% o más de producción
 * - Yellow (🟡): 90-99% de producción
 * - Red (🔴): Menos de 90% de producción
 * 
 * @param producido - Pallets producidos
 * @param estimado - Pallets estimados
 * @returns Status para código de colores
 */
export const calculateStatus = (
  producido: number, 
  estimado: number
): ProductionStatus => {
  // Evitar división por cero
  if (estimado === 0) return 'blue';
  
  // Calcular porcentaje de cumplimiento
  const percentage = (producido / estimado) * 100;
  
  if (percentage >= 100) return 'blue';    // Cumplido o superado
  if (percentage >= 90) return 'yellow';   // Casi cumplido
  return 'red';                            // Bajo cumplimiento
};

/**
 * Calcula minutos a justificar cuando no se alcanza la meta
 * 
 * Fórmula: (Estimado - Producido) / Estimado * 60 minutos
 * 
 * Ejemplo:
 * - Estimado: 35 pallets
 * - Producido: 30 pallets
 * - Diferencia: 5 pallets
 * - Minutos a justificar: (5 / 35) * 60 = 8.57 minutos
 * 
 * @param estimado - Pallets estimados
 * @param producido - Pallets producidos
 * @returns Minutos que deben ser justificados
 */
export const calculateJustificar = (
  estimado: number, 
  producido: number
): number => {
  // Si se produjo lo estimado o más, no hay nada que justificar
  if (producido >= estimado) return 0;
  
  // Calcular diferencia
  const diff = estimado - producido;
  
  // Convertir diferencia de pallets a minutos
  const minutosNoProductivos = (diff / estimado) * 60;
  
  return minutosNoProductivos;
};

/**
 * Calcula total de minutos justificados con paradas
 * 
 * Cada parada contribuye: tiempoMinutos * frecuencia
 * 
 * Ejemplo:
 * - Parada 1: 10 min x 2 veces = 20 min
 * - Parada 2: 5 min x 3 veces = 15 min
 * - Total justificado: 35 min
 * 
 * @param stops - Array de paradas registradas
 * @returns Total de minutos justificados
 */
// export const calculateJustificado = (
//   stops: Array<{ tiempoMinutos: number; frecuencia: number }>
// ): number => {
//   return stops.reduce((total, stop) => {
//     return total + (stop.tiempoMinutos * stop.frecuencia);
//   }, 0);
// };
// ============================================
// CÁLCULOS DE KPIs ACTUALIZADOS
// ============================================

/**
 * Calcula todos los KPIs basados en los nuevos tipos de parada:
 * EQ, OPD, OR, PD, QD, RD, TNP
 */
export const calculateKPIs = (hourlyRecords: HourlyProduction[]): KPI[] => {
  const closedHours = hourlyRecords.filter(h => h.closed);
  
  if (closedHours.length === 0) {
    return getDefaultKPIs();
  }

  // Totales de producción
  const totalEstimado = closedHours.reduce((sum, h) => sum + h.estimado, 0);
  const totalProducido = closedHours.reduce((sum, h) => sum + h.producido, 0);
  const tiempoTotalDisponible = closedHours.length * 60; // Minutos totales

  // Función auxiliar para sumar minutos por tipo de parada
  const sumMinutosPorTipo = (tipo: string) => {
    return closedHours.reduce((sum, h) => {
      return sum + h.stops
        .filter(s => s.tipo === tipo)
        .reduce((s, stop) => s + (stop.tiempoMinutos * stop.frecuencia), 0);
    }, 0);
  };

  // 1. Sumatoria de minutos por los nuevos tipos de la imagen
  const minsEQ  = sumMinutosPorTipo('EQUIPO');
  const minsOPD = sumMinutosPorTipo('OPERATIVAS');
  const minsOR  = sumMinutosPorTipo('ORGANIZACIONALES');
  const minsPD  = sumMinutosPorTipo('PLANIFICADAS');
  const minsQD  = sumMinutosPorTipo('PERDIDAS DE CALIDAD');
  const minsRD  = sumMinutosPorTipo('RUTINARIAS');
  const minsTNP = sumMinutosPorTipo('TIEMPO NO PROGRAMADO');

  // 2. Cálculo de porcentajes de impacto (Pérdidas)
  const calcImpacto = (mins: number) => tiempoTotalDisponible > 0 ? (mins / tiempoTotalDisponible) * 100 : 0;

  // OEE: Eficiencia General (Producción real vs estimada)
  const oee = totalEstimado > 0 ? (totalProducido / totalEstimado) * 100 : 0;

  return [
    { 
      label: 'OEE', 
      value: oee, 
      status: oee >= 85 ? 'success' : oee >= 70 ? 'warning' : 'danger' 
    },
    { 
      label: 'EQ', 
      value: calcImpacto(minsEQ), 
      status: calcImpacto(minsEQ) <= 5 ? 'success' : 'danger' 
    },
    { 
      label: 'OPD', 
      value: calcImpacto(minsOPD), 
      status: calcImpacto(minsOPD) <= 5 ? 'success' : 'danger' 
    },
    { 
      label: 'OR', 
      value: calcImpacto(minsOR), 
      status: calcImpacto(minsOR) <= 2 ? 'success' : 'warning' 
    },
    { 
      label: 'PD', 
      value: calcImpacto(minsPD), 
      status: 'warning' // Las planificadas suelen ser neutrales
    },
    { 
      label: 'QD', 
      value: calcImpacto(minsQD), 
      status: calcImpacto(minsQD) <= 2 ? 'success' : 'danger' 
    },
    { 
      label: 'RD', 
      value: calcImpacto(minsRD), 
      status: 'success' 
    },
    { 
      label: 'TNP', 
      value: calcImpacto(minsTNP), 
      status: calcImpacto(minsTNP) === 0 ? 'success' : 'danger' 
    },
    { 
      label: 'TOTAL', 
      value: 100, 
      status: 'total' 
    }
  ];
};

/**
 * KPIs por defecto actualizados
 */
const getDefaultKPIs = (): KPI[] => {
  const labels = ['OEE', 'EQ', 'OPD', 'OR', 'PD', 'QD', 'RD', 'TNP', 'TOTAL'];
  return labels.map(l => ({
    label: l,
    value: l === 'TOTAL' ? 100 : 0,
    status: l === 'OEE' ? 'danger' : 'success'
  }));
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Genera un ID único para registros
 * Formato: prefijo_timestamp
 * 
 * @param prefix - Prefijo para el ID (ej: 'stop', 'prod')
 * @returns ID único
 */
export const generateId = (prefix: string = 'item'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Formatea número a 2 decimales
 * 
 * @param num - Número a formatear
 * @returns String con 2 decimales
 */
export const formatNumber = (num: number): string => {
  return num.toFixed(2);
};

/**
 * Calcula porcentaje de cumplimiento
 * 
 * @param producido - Valor producido
 * @param estimado - Valor estimado
 * @returns Porcentaje (0-100+)
 */
export const calculatePercentage = (producido: number, estimado: number): number => {
  if (estimado === 0) return 0;
  return (producido / estimado) * 100;
};


/**
 * Calcula total de minutos justificados (Suma simple de tiempos)
 * No multiplica por frecuencia por requerimiento del usuario.
 */
export const calculateJustificado = (
  stops: Array<{ tiempoMinutos: number }>
): number => {
  return stops.reduce((total, stop) => total + stop.tiempoMinutos, 0);
};



// Helper de cálculo
export const calculatePallets = (bph: number, um: number, paqPallet: number): number => {
  if (!um || !paqPallet) return 0;
  const PalletsEnteros = Math.round(bph / um / paqPallet);
  return PalletsEnteros;
};