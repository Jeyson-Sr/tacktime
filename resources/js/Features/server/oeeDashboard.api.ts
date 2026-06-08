import axios from "axios";

export interface LineEfficiency {
  linea: string;
  oee: number;
  em: number;
}

export interface DailyOee {
  dia: string;
  fecha: string;
  oee: number;
}

export interface LineSummary {
  linea: string;
  vol_cu: number;
  oee: number;
  em: number;
  opd: number;
  or: number;
  pd: number;
  rd: number;
  eq: number;
  unidad_negocio: string;
}

export interface WeeklyOee {
  semana: string;
  oee: number;
}

export interface GlobalOee {
  oee: number;
  em: number;
}

const BASE_URL = "/dashboard/oee";

export const fetchLineEfficiencies = async () => {
  const { data } = await axios.get<LineEfficiency[]>(`${BASE_URL}/line-efficiencies`);
  return data;
};

export const fetchDailyOee = async () => {
  const { data } = await axios.get<DailyOee[]>(`${BASE_URL}/daily`);
  return data;
};

export const fetchLineSummary = async () => {
  const { data } = await axios.get<LineSummary[]>(`${BASE_URL}/line-summary`);
  return data;
};

export const fetchWeeklyOee = async () => {
  const { data } = await axios.get<WeeklyOee[]>(`${BASE_URL}/weekly`);
  return data;
};

export const fetchGlobalOee = async () => {
  const { data } = await axios.get<GlobalOee>(`${BASE_URL}/global`);
  return data;
};