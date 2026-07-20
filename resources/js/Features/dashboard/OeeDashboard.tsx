import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

import DashboardFilters from "./DashboardFilters";
import StopCodesRankingChart from "./StopCodesRankingChart";
import ParetoStopsChart from "./ParetoStopsChart";

import {
  DashboardFilters as DashboardFiltersType,
  DashboardFilterOptions,
  fetchDashboardFilterOptions,
  fetchLineEfficiencies,
  fetchDailyOee,
  fetchLineSummary,
  fetchWeeklyOee,
  fetchGlobalOee,
  LineEfficiency,
  DailyOee,
  LineSummary,
  WeeklyOee,
  GlobalOee,
} from "@/Features/server/oeeDashboard.api";

const EMPTY_FILTERS: DashboardFiltersType = {
  year: "",
  month: "",
  week: "",
  day: "",
  linea: "",
  marca: "",
  componente: "",
};

const COLORS = {
  green: "#00A443",
  greenDark: "#008A38",
  yellow: "#F6C400",
  red: "#C70000",
  teal: "#006B7A",
  tealDark: "#005260",
  bg: "#F5F7F8",
  card: "#FFFFFF",
  grid: "#DADDE1",
  text: "#374151",
  muted: "#6B7280",
  soft: "#EEF0F3",
};

const safeNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getOeeColor = (value: number) => {
  if (value >= 75) return COLORS.green;
  if (value >= 70) return COLORS.yellow;
  return COLORS.red;
};

const formatLinea = (linea?: string) => {
  if (!linea) return "-";
  const number = linea.replace(/\D/g, "").padStart(2, "0");
  return number ? `L${number}` : linea;
};

const getDailyLabel = (row: DailyOee) => {
  return row.dia ?? row.day ?? row.name ?? row.fecha ?? "-";
};

const getWeeklyLabel = (row: WeeklyOee) => {
  return row.semana ?? row.label ?? row.name ?? (row.week ? `S${row.week}` : "-");
};

const cleanProductionFilters = (filters: DashboardFiltersType): DashboardFiltersType => {
  const { componente, sort_by, limit, ...productionFilters } = filters;
  return productionFilters;
};

const Card = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`bg-white rounded-[26px] shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-gray-100 p-5 ${className}`}
    >
      <h2 className="text-[17px] font-black text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  );
};

const GaugeCard = ({ title, value }: { title: string; value: number }) => {
  const safeValue = Math.min(Math.max(safeNumber(value), 0), 100);

  const radius = 120;
  const stroke = 38;
  const cx = 150;
  const cy = 150;

  const arcLength = Math.PI * radius;
  const progress = (safeValue / 100) * arcLength;

  return (
    <div className="bg-white rounded-[26px] shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-gray-100 p-6">
      <h2 className="text-[17px] font-black text-gray-700 mb-2">{title}</h2>

      <div className="relative h-[210px] flex items-end justify-center">
        <svg
          width="360"
          height="210"
          viewBox="0 0 300 180"
          className="overflow-visible"
        >
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={COLORS.soft}
            strokeWidth={stroke}
            strokeLinecap="butt"
          />

          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={getOeeColor(safeValue)}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={`${progress} ${arcLength}`}
          />
        </svg>

        <div className="absolute bottom-[36px] text-center">
          <div className="text-[44px] font-light text-gray-600 tracking-wide">
            {safeValue.toFixed(1)} %
          </div>
        </div>

        <div className="absolute bottom-0 left-2 text-gray-500 font-bold">
          0.0 %
        </div>

        <div className="absolute bottom-0 right-2 text-gray-500 font-bold">
          100.0 %
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl bg-white shadow-xl border border-gray-200 px-4 py-3">
      <p className="font-black text-gray-700 mb-1">{label}</p>

      {payload.map((item: any) => (
        <p key={item.dataKey} className="text-sm font-bold text-gray-600">
          {item.name}: {safeNumber(item.value).toFixed(1)} %
        </p>
      ))}
    </div>
  );
};

const OeeDashboard: React.FC = () => {
  const [lineEfficiencies, setLineEfficiencies] = useState<LineEfficiency[]>([]);
  const [dailyOee, setDailyOee] = useState<DailyOee[]>([]);
  const [lineSummary, setLineSummary] = useState<LineSummary[]>([]);
  const [weeklyOee, setWeeklyOee] = useState<WeeklyOee[]>([]);
  const [global, setGlobal] = useState<GlobalOee>({ oee: 0, em: 0 });

  const [filters, setFilters] = useState<DashboardFiltersType>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<DashboardFiltersType>(EMPTY_FILTERS);
  const [filterOptions, setFilterOptions] =
    useState<DashboardFilterOptions | null>(null);

  const [loading, setLoading] = useState(true);

  const loadFilterOptions = async () => {
    try {
      const options = await fetchDashboardFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error("Error cargando opciones de filtros:", error);
      setFilterOptions(null);
    }
  };

  const loadDashboard = async (currentFilters: DashboardFiltersType = EMPTY_FILTERS) => {
    try {
      setLoading(true);

      const productionFilters = cleanProductionFilters(currentFilters);

      const [
        lineEfficienciesData,
        dailyOeeData,
        lineSummaryData,
        weeklyOeeData,
        globalData,
      ] = await Promise.all([
        fetchLineEfficiencies(productionFilters),
        fetchDailyOee(productionFilters),
        fetchLineSummary(productionFilters),
        fetchWeeklyOee(productionFilters),
        fetchGlobalOee(productionFilters),
      ]);

      setLineEfficiencies(
        Array.isArray(lineEfficienciesData) ? lineEfficienciesData : []
      );
      setDailyOee(Array.isArray(dailyOeeData) ? dailyOeeData : []);
      setLineSummary(Array.isArray(lineSummaryData) ? lineSummaryData : []);
      setWeeklyOee(Array.isArray(weeklyOeeData) ? weeklyOeeData : []);
      setGlobal({
        oee: safeNumber(globalData?.oee ?? globalData?.OEE),
        em: safeNumber(globalData?.em ?? globalData?.EM),
      });
    } catch (error) {
      console.error("Error cargando dashboard OEE:", error);
      setLineEfficiencies([]);
      setDailyOee([]);
      setLineSummary([]);
      setWeeklyOee([]);
      setGlobal({ oee: 0, em: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
    loadDashboard(EMPTY_FILTERS);
  }, []);

  const handleApplyFilters = () => {
    console.log("Filtros aplicados:", filters);
    setAppliedFilters(filters);
    loadDashboard(filters);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    loadDashboard(EMPTY_FILTERS);
  };

  const totalVolCu = useMemo(() => {
    return lineSummary.reduce(
      (sum, row) => sum + safeNumber(row.vol_cu ?? row.ph),
      0
    );
  }, [lineSummary]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F5F7F8]">
        <div className="text-[#006B7A] font-black text-xl">
          Cargando dashboard OEE...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F7F8] p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#006B7A]">
            Dashboard OEE
          </h1>
          <p className="text-sm font-bold text-gray-500">
            Eficiencia por línea, día, semana, paradas y resumen global
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(appliedFilters)}
          className="px-5 py-3 rounded-2xl bg-[#006B7A] text-white font-black shadow-md hover:bg-[#005260]"
        >
          Actualizar
        </button>
      </div>

      <DashboardFilters
        filters={filters}
        options={filterOptions}
        onChange={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      <Card title="Distribución de Eficiencias % [OEE & EM]">
        <div className="h-[370px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={lineEfficiencies}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
              <XAxis
                dataKey="linea"
                tickFormatter={formatLinea}
                tick={{ fontWeight: 700, fill: COLORS.muted }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontWeight: 700, fill: COLORS.muted }}
              />
              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="oee" name="OEE %" radius={[8, 8, 0, 0]}>
                {lineEfficiencies.map((item) => (
                  <Cell key={item.linea} fill={getOeeColor(safeNumber(item.oee ?? item.OEE))} />
                ))}

                <LabelList
                  dataKey="oee"
                  position="insideTop"
                  formatter={(value: number) => `${safeNumber(value).toFixed(1)} %`}
                  angle={-90}
                  fill="#FFFFFF"
                  fontWeight={900}
                />
              </Bar>

              <Line
                type="monotone"
                dataKey="em"
                name="EM %"
                stroke="#6B8F8F"
                strokeWidth={4}
                strokeDasharray="6 6"
                dot={{ r: 5, fill: "#555", strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GaugeCard title="OEE %" value={global.oee} />
        <GaugeCard title="EM %" value={global.em} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ParetoStopsChart filters={appliedFilters} />
        <StopCodesRankingChart filters={appliedFilters} />
      </div>

      <Card title="OEE % Por Día">
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyOee}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
              <XAxis
                dataKey={getDailyLabel}
                tick={{ fontWeight: 700, fill: COLORS.muted }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontWeight: 700, fill: COLORS.muted }}
              />
              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="oee" name="OEE %" radius={[8, 8, 0, 0]}>
                {dailyOee.map((item, index) => (
                  <Cell
                    key={`${item.fecha ?? item.dia ?? index}`}
                    fill={getOeeColor(safeNumber(item.oee ?? item.OEE))}
                  />
                ))}

                <LabelList
                  dataKey="oee"
                  position="insideTop"
                  formatter={(value: number) => `${safeNumber(value).toFixed(1)} %`}
                  angle={-90}
                  fill="#FFFFFF"
                  fontWeight={900}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Resumen por Línea">
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full border-collapse overflow-hidden">
            <thead>
              <tr className="bg-[#006B7A] text-white">
                <th className="p-3 text-left">Línea</th>
                <th className="p-3 text-right">PH</th>
                <th className="p-3 text-right">OEE %</th>
                <th className="p-3 text-right">EM %</th>
                <th className="p-3 text-right">OPD</th>
                <th className="p-3 text-right">OR</th>
                <th className="p-3 text-right">PD</th>
                <th className="p-3 text-right">RD</th>
                <th className="p-3 text-right">EQ</th>
                <th className="p-3 text-left">Unidad Negocio</th>
              </tr>
            </thead>

            <tbody>
              {lineSummary.map((row, index) => (
                <tr
                  key={row.linea}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#F0F3F4]"}
                >
                  <td className="p-3 font-black text-gray-700">
                    {formatLinea(row.linea)}
                  </td>

                  <td className="p-3 text-right font-bold text-gray-700">
                    {safeNumber(row.vol_cu ?? row.ph).toLocaleString()}
                  </td>

                  <td
                    className="p-3 text-right font-black"
                    style={{ color: getOeeColor(safeNumber(row.oee)) }}
                  >
                    {safeNumber(row.oee).toFixed(1)} %
                  </td>

                  <td
                    className="p-3 text-right font-black"
                    style={{ color: getOeeColor(safeNumber(row.em)) }}
                  >
                    {safeNumber(row.em).toFixed(1)} %
                  </td>

                  <td className="p-3 text-right">{safeNumber(row.opd).toFixed(1)} %</td>
                  <td className="p-3 text-right">{safeNumber(row.or).toFixed(1)} %</td>
                  <td className="p-3 text-right">{safeNumber(row.pd).toFixed(1)} %</td>
                  <td className="p-3 text-right">{safeNumber(row.rd).toFixed(1)} %</td>
                  <td className="p-3 text-right">{safeNumber(row.eq).toFixed(1)} %</td>
                  <td className="p-3 font-bold text-gray-700">
                    {row.unidad_negocio ?? "GENERAL"}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-[#006B7A] text-white font-black">
                <td className="p-3">Total</td>
                <td className="p-3 text-right">{totalVolCu.toLocaleString()}</td>
                <td className="p-3 text-right">{safeNumber(global.oee).toFixed(1)} %</td>
                <td className="p-3 text-right">{safeNumber(global.em).toFixed(1)} %</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3">GENERAL</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <Card title="OEE % Por Semana">
        <div className="h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyOee}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.grid} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontWeight: 700, fill: COLORS.muted }}
              />
              <YAxis
                type="category"
                dataKey={getWeeklyLabel}
                tick={{ fontWeight: 900, fill: COLORS.muted }}
              />
              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="oee" name="OEE %" radius={[0, 12, 12, 0]}>
                {weeklyOee.map((item, index) => (
                  <Cell
                    key={`${item.semana ?? item.week ?? item.label ?? index}`}
                    fill={getOeeColor(safeNumber(item.oee ?? item.OEE))}
                  />
                ))}

                <LabelList
                  dataKey="oee"
                  position="insideLeft"
                  formatter={(value: number) => `${safeNumber(value).toFixed(1)} %`}
                  fill="#FFFFFF"
                  fontWeight={900}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default OeeDashboard;
