/**
 * ============================================
 * DATABASE.TS - Base de Datos Simulada
 * ============================================
 * 
 * Este archivo simula una base de datos y API REST para el sistema de producción.
 * Facilita la migración futura a una API real manteniendo la misma interfaz.
 * 
 * Características:
 * - Configuración completa de productos (Formato → Marca → Sabor)
 * - Personal (Ingenieros y Operadores)
 * - Turnos de producción con horarios
 * - Simulación de delay de red (300ms)
 * - Funciones async que imitan fetch()
 */

import { 
  ProductConfig, 
  Engineer, 
  Operator, 
  ProductionShift, 
  StopCode
} from './types';

// ============================================
// CONFIGURACIÓN DE PRODUCTOS
// ============================================

/**
 * Base de datos de productos con cascada:
 * Linea → Formato → Marca → Sabor → Pallets/Hora
 */
const productDatabase: ProductConfig[] = 
[
  {
    "sku": 408462,
    "descripcion": "CIELO AGUA SIN GAS PET NO RETORNABLE 625 ml 15 pack",
    "um": 15,
    "formato": 0.625,
    "marca": "CIELO",
    "sabor": "AGUA",
    "bph": 60000,
    "clasificacion": "AGUA",
    "material": "PET",
    "unidadNegocio": "COLD FILL",
    "mercado": "PERU",
    "nivel": 7,
    "paqCama": 20,
    "cartones": 8,
    "paqPallet": 140,
    "gramaje": 13,
    "lineaBm": "LINEA 1 (INDONESIA)",
    "compania": "AJE CARAL",
    "familia": "AGUA",
    "productoJarabe": "",
    "linea": "LINEA 1"
  },
  {
    "sku": 408961,
    "descripcion": "VIDA AGUA PET NO RETORNABLE 625 ML 15",
    "um": 15,
    "formato": 0.625,
    "marca": "VIDA",
    "sabor": "AGUA",
    "bph": 60000,
    "clasificacion": "AGUA",
    "material": "PET",
    "unidadNegocio": "COLD FILL",
    "mercado": "PERU",
    "nivel": 7,
    "paqCama": 20,
    "cartones": 8,
    "paqPallet": 140,
    "gramaje": 13,
    "lineaBm": "LINEA 1 (INDONESIA)",
    "compania": "AJE CARAL",
    "familia": "AGUA",
    "productoJarabe": "",
    "linea": "LINEA 1"
  },
  {
    "sku": 422387,
    "descripcion": "KR KOLITA PET NO RETORNABLE 400 ML 15 MA",
    "um": 15,
    "formato": 0.400,
    "marca": "KR",
    "sabor": "KOLITA",
    "bph": 55000,
    "clasificacion": "GASEOSA",
    "material": "PET",
    "unidadNegocio": "COLD FILL",
    "mercado": "PERU",
    "nivel": 8,
    "paqCama": 25,
    "cartones": 8,
    "paqPallet": 200,
    "gramaje": 16,
    "lineaBm": "LINEA 1 (INDONESIA)",
    "compania": "AJE CARAL",
    "familia": "CARBONATADA",
    "productoJarabe": "KR KOLITA",
    "linea": "LINEA 1"
  },
  {
    "sku": 408469,
    "descripcion": "CIELO AGUA SIN GAS PET NO RETORNABLE 1000 ml 6 pack",
    "um": 6,
    "formato": 1.0,
    "marca": "CIELO",
    "sabor": "AGUA",
    "bph": 27700,
    "clasificacion": "AGUA",
    "material": "PET",
    "unidadNegocio": "COLD FILL",
    "mercado": "PERU",
    "nivel": 6,
    "paqCama": 28,
    "cartones": 4,
    "paqPallet": 168,
    "gramaje": 22,
    "lineaBm": "LINEA 2 (SIDEL NUEVA)",
    "compania": "AJE CARAL",
    "familia": "AGUA",
    "productoJarabe": "",
    "linea": "LINEA 2",
    "linOut": "L02"
  },
  {
    "sku": 422783,
    "descripcion": "VOLT GAMER PONCHE DE FRUTAS PET NO RETORNABLE 300 ML 12 MA",
    "um": 12,
    "formato": 0.3,
    "marca": "VOLT",
    "sabor": "GAMER PONCHE DE FRUTA",
    "bph": 34200,
    "clasificacion": "ENERGIZANTE",
    "material": "PET",
    "unidadNegocio": "COLD FILL",
    "mercado": "PERU",
    "nivel": 8,
    "paqCama": 32,
    "cartones": 8,
    "paqPallet": 256,
    "gramaje": 16,
    "lineaBm": "LINEA 5",
    "compania": "AJE CARAL",
    "familia": "CARBONATADA",
    "productoJarabe": "",
    "linea": "LINEA 5",
    "linOut": "L05"
  },
  {
    "sku": 422376,
    "descripcion": "CIFRUT FRUIT PUNCH PET NO RETORNABLE 350 ML 15 MA",
    "um": 15,
    "formato": 0.35,
    "marca": "CIFRUT",
    "sabor": "FRUIT PUNCH",
    "bph": 21000,
    "clasificacion": "REFRESCOS",
    "material": "PET",
    "unidadNegocio": "COLD FILL",
    "mercado": "PERU",
    "nivel": 8,
    "paqCama": 25,
    "cartones": 8,
    "paqPallet": 200,
    "gramaje": 13,
    "lineaBm": "LINEA 8",
    "compania": "AJE CARAL",
    "familia": "JUGOS Y REFRESCOS",
    "productoJarabe": "",
    "linea": "LINEA 8",
    "linOut": "L08"
  }
]

// ============================================
// PERSONAL DE PRODUCCIÓN
// ============================================

/**
 * Lista de ingenieros disponibles
 */
const engineers: Engineer[] = [
  { id: 1, name: 'MIGUEL P.' },
  { id: 2, name: 'JUAN C.' },
  { id: 3, name: 'MARIA R.' },
  { id: 4, name: 'CARLOS S.' },
  { id: 5, name: 'ANDREA M.' },
  { id: 6, name: 'JOSE L.' }
];

/**
 * Lista de operadores disponibles
 */
const operators: Operator[] = [
  { id: 1, name: 'GIOVANI' },
  { id: 2, name: 'PEDRO' },
  { id: 3, name: 'LUIS' },
  { id: 4, name: 'CARLOS' },
  { id: 5, name: 'MARIO' },
  { id: 6, name: 'ROSA' },
  { id: 7, name: 'JUANA' },
  { id: 8, name: 'MIGUEL' }
];

// ============================================
// TURNOS DE PRODUCCIÓN
// ============================================

/**
 * Configuración de turnos con horarios de 12 horas
 * - DIA: 06:30 - 18:30
 * - NOCHE: 18:30 - 06:30
 */
const productionShifts: ProductionShift[] = [
  {
    name: 'DIA',
    startTime: '06:30',
    endTime: '18:30',
    hours: [
      '06:30 - 07:30',
      '07:30 - 08:30',
      '08:30 - 09:30',
      '09:30 - 10:30',
      '10:30 - 11:30',
      '11:30 - 12:30',
      '12:30 - 13:30',
      '13:30 - 14:30',
      '14:30 - 15:30',
      '15:30 - 16:30',
      '16:30 - 17:30',
      '17:30 - 18:30'
    ]
  },
  {
    name: 'NOCHE',
    startTime: '18:30',
    endTime: '06:30',
    hours: [
      '18:30 - 19:30',
      '19:30 - 20:30',
      '20:30 - 21:30',
      '21:30 - 22:30',
      '22:30 - 23:30',
      '23:30 - 00:30',
      '00:30 - 01:30',
      '01:30 - 02:30',
      '02:30 - 03:30',
      '03:30 - 04:30',
      '04:30 - 05:30',
      '05:30 - 06:30'
    ]
  }
];



const catalogStopCodes: StopCode[] = [
  { "codigo": "A1", "detalle": "CALIBRACIÓN DEL APLICADOR DE ASAS", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "OTROS EQUIPOS" },
  { "codigo": "B1", "detalle": "SINCRONIZADO DE SINFIN", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B10", "detalle": "TORPEDO GASTADO", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B11", "detalle": "RODAMIENTOS GASTADOS", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B12", "detalle": "REPARACION DEL PLATO DE LA CUCHILLA", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B13", "detalle": "CAMBIO DE RODILLO IMPULSOR", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B14", "detalle": "CAMBIO DE FORMATO", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B15", "detalle": "REGULACION DEL SIN FIN", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B16", "detalle": "DEMORA DE ENJUAGUE DE CAMBIO DE FORMATO DE PULP A", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B17", "detalle": "SISTEMA ELECTRICO", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B18", "detalle": "FALLA EN EL SISTEMA ELECTRICO", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B19", "detalle": "EMPALME DE ETIQUETA", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "ETIQUETADORA / LABELLER" },
  { "codigo": "B2", "detalle": "REGULACION DE ALTURA", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B3", "detalle": "FALLA DE SENSOR", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B4", "detalle": "CAMBIO DE CUCHILLA", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B5", "detalle": "TRABA DE PRESCINTO", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B6", "detalle": "TRABA DE BOTELLA", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B7", "detalle": "ROTURA DE FAJA", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B8", "detalle": "MOTOREDUCTOR", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "B9", "detalle": "CAMBIO DE FAJA", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "PRESINTADOR / PRESENTER" },
  { "codigo": "C1", "detalle": "AJUSTE O REGULACION DE CARRIL DE BAJADA", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C10", "detalle": "SINCRONIZACION SINFIN", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C11", "detalle": "REGULACION DE ALTURA ( TORRE )", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C12", "detalle": "SIST. TRANSMISION PIÑON O CADENA ( REPARAR O CAMBI )", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C13", "detalle": "SIST. ELECTRICO GENERAL Y DE LA TOLVA", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C14", "detalle": "REGULACION DE DISCO/ PLATO ANTIROTACIONAL", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C15", "detalle": "FALLA DE MOTOR ( FAJA , EJE )", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C16", "detalle": "OTROS", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C17", "detalle": "AJUSTE / CAMBIO ANTIROTACIONAL", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C18", "detalle": "TRABA DE TAPAS EN EL CABEZAL", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C19", "detalle": "FALLA SENSORES", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C2", "detalle": "AJUSTE REPARACION Y/O CAMBIO DE CABEZAL", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C20", "detalle": "REGULACION DE DISCO SELECTOR", "tipo_n0": "OPD", "nivel_1": "PARADAS OPERATIVAS", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C21", "detalle": "ALIMENTADOR DE TAPAS", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "C22", "detalle": "CAMBIO DE RESORTES", "tipo_n0": "EQ", "nivel_1": "PARADAS POR EQUIPO", "nivel_2": "LLENADORA / FILLER" },
  { "codigo": "J16", "detalle": "BAJA DE PRODUCTO", "tipo_n0": "QD", "nivel_1": "PERDIDAS DE CALIDAD", "nivel_2": "PRODUCTO DEFECTUOSO" },
  { "codigo": "J82", "detalle": "TIEMPO NO PROGRAMADO", "tipo_n0": "TNP", "nivel_1": "TIEMPO NO PROGRAMADO", "nivel_2": "HORAS NO PROGRAMADAS" },
  { "codigo": "J169", "detalle": "LLENADORA", "tipo_n0": "OPD", "nivel_1": "TIEMPO NO PROGRAMADO", "nivel_2": "LLENADORA" }
]

// ============================================
// UTILIDAD: SIMULACIÓN DE RED
// ============================================

/**
 * Simula el delay de una llamada a API real
 * @param ms - Milisegundos de delay (default: 300ms)
 */
const simulateNetworkDelay = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ============================================
// API SIMULADA - PRODUCTOS
// ============================================

export const fetchGetLinea = () => {
  return  productDatabase.map(l => l.linea);
};


//-------------------------------------------------------------------------------------------------------------------
// Simulamos tu base de datos con el arreglo que generamos antes


/**
 * 1. Obtiene los FORMATOS únicos para una LÍNEA
 */
export const fetchFormatoByLinea = async (linea: string): Promise<string[]> => {
  await simulateNetworkDelay();
  const filtrados = productDatabase.filter(p => p.linea === linea);
  // Extraemos formatos únicos y convertimos a string para el Select
  const formatosUnicos = [...new Set(filtrados.map(p => p.formato.toString()))];
  return formatosUnicos.sort();
};

/**
 * 2. Obtiene las MARCAS únicas para una LÍNEA y FORMATO
 */
export const fetchMarcasByFormato = async (linea: string, formato: string): Promise<string[]> => {
  await simulateNetworkDelay();
  const filtrados = productDatabase.filter(p => 
    p.linea === linea && 
    p.formato.toString() === formato
  );
  return [...new Set(filtrados.map(p => p.marca))].sort();
};

/**
 * 3. Obtiene los SABORES únicos para una LÍNEA, FORMATO y MARCA
 */
export const fetchSaboresByMarca = async (linea: string, formato: string, marca: string): Promise<string[]> => {
  await simulateNetworkDelay();
  const filtrados = productDatabase.filter(p => 
    p.linea === linea && 
    p.formato.toString() === formato &&
    p.marca === marca
  );
  return [...new Set(filtrados.map(p => p.sabor))].sort();
};


export const fetchProductoDetalle = async (linea: string, formato: string, marca: string, sabor: string): Promise<any> => {
  // Simulamos delay de red
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const producto = productDatabase.find(p => 
    p.linea === linea && 
    p.formato.toString() === formato && 
    p.marca === marca && 
    p.sabor === sabor
  );

  return producto || null;
};

/**
 * 4. Obtiene el BPH (Capacidad) final basado en la selección completa
 */
export const fetchBPH = async (linea: string, formato: string, marca: string, sabor: string): Promise<number> => {
  await simulateNetworkDelay();
  const producto = productDatabase.find(p => 
    p.linea === linea && 
    p.formato.toString() === formato &&
    p.marca === marca &&
    p.sabor === sabor
  );
  return producto ? producto.bph : 0;
};


//-------------------------------------------------------------------------------------------------------------------------------


export const fetchStopCodes = async (): Promise<StopCode[]> => {
  await simulateNetworkDelay();
  return catalogStopCodes;
};



// ============================================
// API SIMULADA - PERSONAL
// ============================================

/**
 * Obtiene lista de ingenieros
 * @returns Array de ingenieros con id y nombre
 */
export const fetchEngineers = async (): Promise<Engineer[]> => {
  await simulateNetworkDelay();
  return engineers;
};

/**
 * Obtiene lista de operadores
 * @returns Array de operadores con id y nombre
 */
export const fetchOperators = async (): Promise<Operator[]> => {
  await simulateNetworkDelay();
  return operators;
};

// ============================================
// API SIMULADA - TURNOS
// ============================================

/**
 * Obtiene configuración de turnos
 * @returns Array de turnos con horarios
 */
export const fetchProductionShifts = async (): Promise<ProductionShift[]> => {
  await simulateNetworkDelay();
  return productionShifts;
};

/**
 * Obtiene las horas de un turno específico
 * @param shiftName - Nombre del turno ('DIA' o 'NOCHE')
 * @returns Array de strings con rangos horarios
 */
export const fetchShiftHours = async (shiftName: string): Promise<string[]> => {
  await simulateNetworkDelay();
  const shift = productionShifts.find(s => s.name === shiftName);
  return shift ? shift.hours : [];
};

// ============================================
// API SIMULADA - GUARDAR DATOS
// ============================================

/**
 * Guarda registro de producción horaria (simulado)
 * En producción, esto haría POST a /api/hourly-production
 * @param data - Datos de producción horaria
 * @returns Respuesta con success e id generado
 */
export const saveHourlyProduction = async (data: any): Promise<{ success: boolean; id: string }> => {
  await simulateNetworkDelay(500);
  console.log('💾 Guardando producción horaria:', data);
  return { 
    success: true, 
    id: `prod_${Date.now()}` 
  };
};

/**
 * Guarda registro de parada (simulado)
 * En producción, esto haría POST a /api/stops
 * @param data - Datos de la parada
 * @returns Respuesta con success e id generado
 */
export const saveStopRecord = async (data: any): Promise<{ success: boolean; id: string }> => {
  await simulateNetworkDelay(500);
  console.log('💾 Guardando parada:', data);
  return { 
    success: true, 
    id: `stop_${Date.now()}` 
  };
};

// ============================================
// NOTAS PARA MIGRACIÓN A API REAL
// ============================================

/**
 * Para migrar a API real, simplemente reemplaza las funciones:
 * 
 * Antes (simulado):
 * export const fetchFormatos = async (): Promise<string[]> => {
 *   await simulateNetworkDelay();
 *   return productDatabase.map(p => p.formato);
 * };
 * 
 * Después (API real):
 * export const fetchFormatos = async (): Promise<string[]> => {
 *   const response = await fetch('/api/formatos');
 *   return response.json();
 * };
 */