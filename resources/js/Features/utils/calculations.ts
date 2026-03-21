/**
 * ============================================
 * CALCULATIONS.TS - Lógica de Producción y KPIs
 * ============================================
 */

import { HourlyProduction, KPI, ProductionStatus } from '../types';

// ============================================
// CÁLCULOS DE STATUS Y JUSTIFICACIÓN
// ============================================

/**
 * Calcula el status de producción basado en el porcentaje alcanzado.
 */
export const calculateStatus = (
  producido: number, 
  estimado: number
): ProductionStatus => {
  if (estimado === 0) return 'gray';
  
  const percentage = (producido / estimado) * 100;
  
  if (percentage >= 100) return 'green'; 
  if (percentage >= 80) return 'yellow';
  return 'red';
};

/**
 * Calcula minutos a justificar (Diferencia entre meta y realidad)
 */
export const calculateJustificar = (
  estimado: number, 
  producido: number
): number => {
  if (producido >= estimado) return 0;
  const diff = estimado - producido;
  return (diff / estimado) * 60;
};

/**
 * Calcula total de minutos justificados (Suma simple)
 * Requerimiento: No multiplica por frecuencia.
 */
export const calculateJustificado = (
  stops: Array<{ tiempoMinutos: number }>
): number => {
  return stops.reduce((total, stop) => total + stop.tiempoMinutos, 0);
};

// ============================================
// CÁLCULOS DE KPIs (CON AJUSTE POR TNP)
// ============================================

/**
 * Calcula KPIs ajustando la base de tiempo según el Tiempo No Programado (TNP).
 */
export const calculateKPIs = (hourlyRecords: HourlyProduction[]): KPI[] => {
  const closedHours = hourlyRecords.filter(h => h.closed);
  
  if (closedHours.length === 0) {
    return getDefaultKPIs();
  }
  
  // Función auxiliar: Suma simple de minutos por tipo
  const sumMinutosPorTipo = (tipo: string) => {
    return closedHours.reduce((sum, h) => {
      return sum + h.stops
        .filter(s => s.tipo === tipo)
        .reduce((s, stop) => s + stop.tiempoMinutos, 0);
    }, 0);
  };

  // 1. Obtención de minutos por categoría
  const minsEQ  = sumMinutosPorTipo('EQUIPO');
  const minsOPD = sumMinutosPorTipo('OPERATIVAS');
  const minsOR  = sumMinutosPorTipo('ORGANIZACIONALES');
  const minsPD  = sumMinutosPorTipo('PLANIFICADAS');
  const minsQD  = sumMinutosPorTipo('PERDIDAS DE CALIDAD');
  const minsRD  = sumMinutosPorTipo('RUTINARIAS');
  const minsTNP = sumMinutosPorTipo('TIEMPO NO PROGRAMADO');
  
  // 2. Definición de Tiempos Base
  const tiempoTotalBruto = closedHours.length * 60; // Base total (ej. 480 min por turno)
  const tiempoEfectivo = tiempoTotalBruto - minsTNP; // Base real para OEE e Impactos

  // 3. Totales de producción
  const totalEstimadoBruto = closedHours.reduce((sum, h) => sum + h.estimado, 0);
  const totalProducido = closedHours.reduce((sum, h) => sum + h.producido, 0);

  /**
   * AJUSTE DE OEE:
   * El estimado se reduce proporcionalmente al tiempo que NO estuvo programado.
   */
  const factorTiempoEfectivo = tiempoTotalBruto > 0 ? (tiempoEfectivo / tiempoTotalBruto) : 0;
  const totalEstimadoAjustado = totalEstimadoBruto * factorTiempoEfectivo;

  const oee = totalEstimadoAjustado > 0 
    ? (totalProducido / totalEstimadoAjustado) * 100 
    : 0;

  // 4. Cálculo de impactos (Sobre el tiempo efectivo disponible)
  const calcImpacto = (mins: number) => 
    tiempoEfectivo > 0 ? (mins / tiempoEfectivo) * 100 : 0;

  return [
    { 
      label: 'OEE', 
      value: Math.min(oee, 100), // Capado a 100% para evitar excedentes visuales
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
      status: 'warning' 
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
      label: 'TOTAL', 
      value: 100, 
      status: 'total' 
    }
  ];
};

/**
 * KPIs por defecto
 */
const getDefaultKPIs = (): KPI[] => {
  const labels = ['OEE', 'EQ', 'OPD', 'OR', 'PD', 'QD', 'RD', 'TOTAL'];
  return labels.map(l => ({
    label: l,
    value: l === 'TOTAL' ? 100 : 0,
    status: l === 'OEE' ? 'danger' : 'success'
  }));
};

// ============================================
// UTILIDADES GENERALES
// ============================================

export const generateId = (prefix: string = 'item'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatNumber = (num: number): string => {
  return num.toFixed(2);
};

export const calculatePercentage = (producido: number, estimado: number): number => {
  if (estimado === 0) return 0;
  return (producido / estimado) * 100;
};

export const calculatePallets = (bph: number, um: number, paqPallet: number): number => {
  if (!um || !paqPallet) return 0;
  return Math.round(bph / um / paqPallet);
};