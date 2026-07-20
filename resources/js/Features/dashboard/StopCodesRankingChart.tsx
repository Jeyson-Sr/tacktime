import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import type { DashboardFilters, StopRankingItem } from "@/Features/server/oeeDashboard.api";
import { fetchStopCodesRanking } from "@/Features/server/oeeDashboard.api";

interface Props {
  filters: DashboardFilters;
}

const COLORS = [
  "#006B7A",
  "#00A6A6",
  "#83C5BE",
  "#FFB703",
  "#FB8500",
  "#8ECAE6",
  "#219EBC",
  "#023047",
];

const safeNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export default function StopCodesRankingChart({ filters }: Props) {
  const [data, setData] = useState<StopRankingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"minutes" | "frequency">("minutes");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const result = await fetchStopCodesRanking({
          ...filters,
          sort_by: sortBy,
          limit: 10,
        });

        setData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error cargando ranking de códigos:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, sortBy]);

  return (
    <div className="bg-white rounded-[26px] shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-gray-100 p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[17px] font-black text-gray-700">
            Códigos más frecuentes
          </h2>
          <p className="text-sm font-bold text-gray-500">
            Ranking por tiempo o frecuencia de parada.
          </p>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "minutes" | "frequency")}
          className="border border-gray-200 rounded-xl px-3 py-2 font-black bg-white text-gray-800 outline-none"
        >
          <option value="minutes">Mayor tiempo</option>
          <option value="frequency">Mayor frecuencia</option>
        </select>
      </div>

      <div className="h-[320px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 font-black">
            Cargando ranking...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 font-black">
            No hay datos para los filtros seleccionados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="codigo"
                width={70}
                tick={{ fontSize: 12, fontWeight: 800 }}
              />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === "total_minutos") return [`${value} min`, "Tiempo"];
                  if (name === "total_frecuencia") return [`${value}`, "Frecuencia"];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const item = data.find((x) => x.codigo === label);
                  return item ? `${item.codigo} - ${item.descripcion}` : label;
                }}
              />

              <Bar
                dataKey={sortBy === "minutes" ? "total_minutos" : "total_frecuencia"}
                radius={[0, 10, 10, 0]}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {data.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#006B7A] text-white">
                <th className="p-3 text-left">Código</th>
                <th className="p-3 text-left">Descripción</th>
                <th className="p-3 text-left">Componente</th>
                <th className="p-3 text-right">Minutos</th>
                <th className="p-3 text-right">Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.codigo} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3 font-black">{item.codigo}</td>
                  <td className="p-3">{item.descripcion}</td>
                  <td className="p-3">{item.componente ?? item.tipo ?? item.categoria ?? "-"}</td>
                  <td className="p-3 text-right font-bold">{safeNumber(item.total_minutos).toFixed(1)}</td>
                  <td className="p-3 text-right font-bold">{safeNumber(item.total_frecuencia)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
