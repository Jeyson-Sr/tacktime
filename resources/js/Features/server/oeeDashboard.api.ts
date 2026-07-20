import axios from "axios";

export interface DashboardFilters {
  year?: string;
  month?: string;
  week?: string;
  day?: string;
  linea?: string;
  marca?: string;
  componente?: string;
  sort_by?: "minutes" | "frequency";
  limit?: number;
}

export interface FilterOptionItem {
  value: string;
  label: string;
}

export interface DashboardFilterOptions {
  years: Array<number | string>;
  months: Array<number | string>;
  weeks: Array<number | string>;
  days: string[];
  marcas: string[];
  lineas: string[];
  componentes: FilterOptionItem[];
}

export interface LineEfficiency {
  linea: string;
  line?: string;
  name?: string;
  oee: number;
  em: number;
  OEE?: number;
  EM?: number;
}

export interface DailyOee {
  dia?: string;
  day?: string;
  fecha?: string;
  name?: string;
  oee: number;
  OEE?: number;
}

export interface LineSummary {
  linea: string;
  vol_cu?: number;
  ph?: number;
  oee: number;
  em: number;
  opd?: number;
  or?: number;
  pd?: number;
  rd?: number;
  eq?: number;
  unidad_negocio?: string;
}

export interface WeeklyOee {
  semana?: string;
  week?: string | number;
  year?: string | number;
  label?: string;
  name?: string;
  oee: number;
  OEE?: number;
}

export interface GlobalOee {
  oee: number;
  em: number;
  OEE?: number;
  EM?: number;
}

export interface StopRankingItem {
  codigo: string;
  descripcion: string;
  tipo?: string;
  componente?: string;
  categoria?: string;
  total_minutos: number;
  total_frecuencia: number;
}

export interface ParetoStopItem extends StopRankingItem {
  porcentaje: number;
  porcentaje_acumulado: number;
}

const BASE_URL = "/dashboard/oee";

const cleanParams = (filters?: DashboardFilters) => {
  const params: Record<string, string | number> = {};

  if (!filters) return params;

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      params[key] = value as string | number;
    }
  });

  return params;
};

const getPayload = <T>(response: any): T => {
  const payload = response.data;

  if (payload?.success === true && Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data as T;
  }

  return payload as T;
};

export const fetchDashboardFilterOptions = async (): Promise<DashboardFilterOptions> => {
  const response = await axios.get(`${BASE_URL}/filters/options`);
  return getPayload<DashboardFilterOptions>(response);
};

export const fetchLineEfficiencies = async (
  filters?: DashboardFilters
): Promise<LineEfficiency[]> => {
  const response = await axios.get(`${BASE_URL}/line-efficiencies`, {
    params: cleanParams(filters),
  });

  return getPayload<LineEfficiency[]>(response);
};

export const fetchDailyOee = async (
  filters?: DashboardFilters
): Promise<DailyOee[]> => {
  const response = await axios.get(`${BASE_URL}/daily`, {
    params: cleanParams(filters),
  });

  return getPayload<DailyOee[]>(response);
};

export const fetchLineSummary = async (
  filters?: DashboardFilters
): Promise<LineSummary[]> => {
  const response = await axios.get(`${BASE_URL}/line-summary`, {
    params: cleanParams(filters),
  });

  return getPayload<LineSummary[]>(response);
};

export const fetchWeeklyOee = async (
  filters?: DashboardFilters
): Promise<WeeklyOee[]> => {
  const response = await axios.get(`${BASE_URL}/weekly`, {
    params: cleanParams(filters),
  });

  return getPayload<WeeklyOee[]>(response);
};

export const fetchGlobalOee = async (
  filters?: DashboardFilters
): Promise<GlobalOee> => {
  const response = await axios.get(`${BASE_URL}/global`, {
    params: cleanParams(filters),
  });

  return getPayload<GlobalOee>(response);
};

export const fetchStopCodesRanking = async (
  filters?: DashboardFilters
): Promise<StopRankingItem[]> => {
  const response = await axios.get(`${BASE_URL}/stop-codes-ranking`, {
    params: cleanParams(filters),
  });

  return getPayload<StopRankingItem[]>(response);
};

export const fetchParetoStops = async (
  filters?: DashboardFilters
): Promise<ParetoStopItem[]> => {
  const response = await axios.get(`${BASE_URL}/pareto-stops`, {
    params: cleanParams(filters),
  });

  return getPayload<ParetoStopItem[]>(response);
};
