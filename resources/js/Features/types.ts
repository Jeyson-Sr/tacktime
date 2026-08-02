/**
 * ============================================
 * TYPES.TS - Definiciones de Tipos TypeScript
 * ============================================
 * 
 * Centraliza todas las interfaces y tipos del sistema.
 * Facilita el mantenimiento y reutilización de código.
 */

// ============================================
// DATOS INICIALES DE PRODUCCIÓN
// ============================================

/**
 * Datos completos para iniciar una sesión de producción
 */
export interface ProductionData {
  fecha: string;                      // Fecha de producción (YYYY-MM-DD)
  turno: 'DIA' | 'NOCHE';            // Turno de trabajo
  linea: string;                      // Línea de producción (L1-L14)
  ingeniero: string;                  // Nombre del ingeniero responsable
  operador: string;                   // Nombre del operador
  formato: string;                    // Formato del producto (0.400, 0.300, 0.625)
  marca: string;                      // Marca del producto (KR, BIG, VOLT, etc)
  sabor: string;                      // Sabor del producto
  palletsPorHora: number;                 // Pallets estimados por hora (calculado auto)
  bph: number;
  sku: number;     
  descripccion: string;                   // Descripción del producto
  op: number;
}

// ============================================
// CONFIGURACIÓN DE PRODUCTOS
// ============================================

/**
 * 
 * 
 */


export interface ProductConfig {
  sku: number;
  descripcion: string;
  um: number;
  formato: number;
  marca: string;
  sabor: string;
  bph: number;
  clasificacion: string;
  material: string;
  unidadNegocio: string;
  mercado: string;
  nivel: number;
  paqCama: number;
  cartones: number;
  paqPallet: number;
  gramaje: number;
  lineaBm: string;
  compania: string;
  familia: string;
  productoJarabe?: string;
  linea: string;
  linOut?: string;
}


// ============================================
// PERSONAL
// ============================================

/**
 * Datos de un ingeniero
 */
export interface Engineer {
  id: number;                         // ID único
  name: string;                       // Nombre completo
}

/**
 * Datos de un operador
 */
export interface Operator {
  id: number;                         // ID único
  name: string;                       // Nombre completo
}

// ============================================
// TURNOS Y HORARIOS
// ============================================

/**
 * Configuración de un turno de producción
 * Define inicio, fin y horas de trabajo
 */
export interface ProductionShift {
  name: string;                       // 'DIA' o 'NOCHE'
  startTime: string;                  // Hora de inicio (HH:MM)
  endTime: string;                    // Hora de fin (HH:MM)
  hours: string[];                    // Array de 12 rangos horarios
}

// ============================================
// PRODUCCIÓN HORARIA
// ============================================

/**
 * Registro completo de producción por hora
 * Contiene métricas, paradas y comentarios
 */
export interface HourlyProduction {
  hour: string;                       // Rango horario (ej: '06:30 - 07:30')
  hourIndex: number;                  // Índice de la hora (0-11)
  estimado: number;                   // Pallets estimados a producir
  producido: number;                  // Pallets realmente producidos
  producidoIngresado?: boolean;       // true cuando el operador registró PH (incluye 0)
  justificar: number;                 // Minutos que faltan por justificar
  justificado: number;                // Minutos ya justificados con paradas
  status: 'blue' | 'yellow' | 'red'; // Estado visual (100%, 90-99%, <90%)
  stops: StopRecord[];               // Lista de paradas registradas
  comments: HourComments;            // Comentarios por área
  closed: boolean;                    // Si la hora ya fue cerrada
}

// ============================================
// REGISTRO DE PARADAS
// ============================================

/**
 * Registro completo de una parada de producción
 * Incluye código, tipo, descripción y tiempos
 */
export interface StopRecord {
  id: string;                         // ID único (generado automáticamente)
  codigo: string;                     // Código de parada (ej: 'DN3')
  tipo: 'EQUIPO' | 'OPERATIVAS' | 'ORGANIZACIONALES' | 'PLANIFICADAS' | 'PERDIDAS DE CALIDAD' | 'RUTINARIAS' | 'TIEMPO NO PROGRAMADO'; // Tipo de parada
  descripcion: string;                // Descripción detallada
  tiempoMinutos: number;             // Tiempo por ocurrencia en minutos
  frecuencia: number;                // Número de veces que ocurrió
  timestamp: string;                  // Marca de tiempo ISO
}

/**
 * Estructura temporal para nuevo registro de parada
 * (antes de guardar con ID)
 */
export interface Stop {
  codigo: string;
  tipo: string;
  descripcion: string;
  tiempo: number;
  frecuencia: number;
}

// ============================================
// COMENTARIOS POR ÁREA
// ============================================

/**
 * Comentarios de diferentes áreas sobre la producción
 */
export interface HourComments {
  mnf: string;                        // Comentario de Manufactura
  mantto: string;                     // Comentario de Mantenimiento
  calidad: string;                    // Comentario de Calidad
}

// ============================================
// KPIs
// ============================================

/**
 * Indicador clave de rendimiento (KPI)
 * Incluye valor y estado visual
 */
export interface KPI {
  label: string;                      // Nombre del KPI (ej: 'OEE')
  value: number;                      // Valor numérico (porcentaje)
  status: 'success' | 'warning' | 'danger' | 'total'; // Estado para color
}

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================

/**
 * Estado global de la aplicación
 * Centraliza toda la información de la sesión de producción
 */
export interface AppState {
  productionData: ProductionData | null;  // Datos de producción o null si no iniciada
  currentHourIndex: number;               // Índice de la hora actual (0-11)
  hourlyRecords: HourlyProduction[];     // Array de 12 registros horarios
  isInitialized: boolean;                 // Si la producción ya fue inicializada
}

// ============================================
// TIPOS AUXILIARES
// ============================================

/**
 * Estados de carga para diferentes operaciones
 */
export interface LoadingStates {
  formatos: boolean;
  linea: boolean;
  marcas: boolean;
  sabores: boolean;
  pallets: boolean;
  personal: boolean;
}

/**
 * Errores de validación del formulario
 */
export type FormErrors = Partial<Record<keyof ProductionData, string>>;

/**
 * Status de producción (para colores)
 */
export type ProductionStatus = 'blue' | 'yellow' | 'red' | 'green' | 'gray';

/**
 * Tipos de paradas disponibles
 */
export type StopType = 'MAQUINA' | 'PROCESO' | 'CALIDAD';

/**
 * Nombres de turnos
 */
export type ShiftName = 'DIA' | 'NOCHE';


export type StopCode = {
  codigo: string;
  detalle: string;
  tipo_n0: 'EQ' | 'OPD' | 'OR' | 'PD' | 'QD' | 'RD' | 'TNP';
  nivel_1: string;
  nivel_2: string;

  recurso_afectado?: string;
  familia_oee?: string;
  aplica_tetra?: string;
  estado?: string;
};





//------------------------------------------
export type CommentColor = "blue" | "green" | "orange" | "red" | "yellow";

export interface Comentario {
  contenido?: string;
  color?: CommentColor;
  tipo?: string;
}

export interface HoraData {
  hourIndex: number;
  hora: string;
  estimado: number;
  phProducidos: number;
  justificar: number;
  justificado: number;
  status?: string;
  closed?: boolean;
  comentarios?: Comentario[];
  paradas?: StopRecord[];
}

export interface ProduccionHoraListProps {
  data: HoraData[];
}


export interface StopCodeRankingFilters {
  day?: string;
  week?: string;
  linea?: string;
  brand?: string;
  component?: string;
  sort_by?: 'minutes' | 'frequency';
  limit?: number;
}

export interface StopCodeRankingItem {
  codigo: string;
  descripcion: string;
  tipo: string;
  total_minutos: number;
  total_frecuencia: number;
}
