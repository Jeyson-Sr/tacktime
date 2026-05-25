import { httpClient } from "./httpClient";
import type { AppState } from "../types";

export async function syncOeeProduction(appState: AppState) {
  if (!appState.productionData) {
    throw new Error("No existe información de producción para guardar.");
  }

  return httpClient<{
    ok: boolean;
    message: string;
    production_id: number;
  }>("/oee/sync", {
    method: "POST",
    body: JSON.stringify({
      productionData: appState.productionData,
      currentHourIndex: appState.currentHourIndex,
      hourlyRecords: appState.hourlyRecords,
    }),
  });
}

export async function getOeeProductions() {
  return httpClient<any[]>("/oee/productions");
}

export async function getOeeProductionById(id: number) {
  return httpClient<any>(`/oee/productions/${id}`);
}

export async function getOeeByLine(date?: string) {
  const query = date ? `?date=${date}` : "";
  return httpClient<any[]>(`/oee/charts/oee-by-line${query}`);
}