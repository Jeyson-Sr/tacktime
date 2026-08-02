import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

import type { DashboardFilters, ParetoStopItem } from "@/Features/server/oeeDashboard.api";
import { fetchParetoStops } from "@/Features/server/oeeDashboard.api";

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

export default function ParetoStopsChart({ filters }: Props) {
  const [data, setData] = useState<ParetoStopItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const result = await fetchParetoStops({
          ...filters,
          limit: 15,
        });

        setData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error cargando Pareto de paradas:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  return (
    <div
      className="bg-white rounded-[26px] shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-gray-100 p-5 text-gray-800"
      style={{ colorScheme: 'light' }}
    >
      <div className="mb-4">
        <h2 className="text-[17px] font-black text-gray-700">
          Pareto de paradas
        </h2>
        <p className="text-sm font-bold text-gray-500">
          Códigos con mayor pérdida de tiempo y acumulado.
        </p>
      </div>

      <div className="h-[340px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 font-black">
            Cargando Pareto...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 font-black">
            No hay datos para los filtros seleccionados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="codigo" tick={{ fontSize: 12, fontWeight: 800, fill: '#1F2937' }} />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#4B5563' }}
                label={{ value: "Minutos", angle: -90, position: "insideLeft", fill: '#4B5563' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: '#4B5563' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  color: '#1F2937',
                }}
                labelStyle={{ color: '#1F2937' }}
                itemStyle={{ color: '#374151' }}
                formatter={(value: any, name: string) => {
                  if (name === "total_minutos") return [`${value} min`, "Tiempo"];
                  if (name === "porcentaje_acumulado") return [`${value}%`, "Acumulado"];
                  if (name === "porcentaje") return [`${value}%`, "Porcentaje"];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const item = data.find((x) => x.codigo === label);
                  return item ? `${item.codigo} - ${item.descripcion}` : label;
                }}
              />
              <Legend wrapperStyle={{ color: '#374151' }} />

              <Bar yAxisId="left" dataKey="total_minutos" name="Tiempo perdido" radius={[10, 10, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="porcentaje_acumulado"
                name="% acumulado"
                stroke="#023047"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
