import React from "react";
import { RotateCcw, Search } from "lucide-react";
import type {
  DashboardFilters as DashboardFiltersType,
  DashboardFilterOptions,
} from "@/Features/server/oeeDashboard.api";

interface Props {
  filters: DashboardFiltersType;
  options: DashboardFilterOptions | null;
  onChange: (filters: DashboardFiltersType) => void;
  onApply: () => void;
  onClear: () => void;
}

const fallbackComponentes = [
  { value: "EQ", label: "Equipo" },
  { value: "OR", label: "Organizacionales" },
  { value: "PD", label: "Planificadas" },
  { value: "RD", label: "Rutinarias" },
  { value: "OPD", label: "Operativas" },
  { value: "TNP", label: "Tiempo no productivo" },
];

const selectClass =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 font-bold bg-white text-gray-800 outline-none focus:ring-2 focus:ring-[#006B7A]/30 focus:border-[#006B7A]";

const selectStyle = { colorScheme: 'light' as const };

export default function DashboardFilters({
  filters,
  options,
  onChange,
  onApply,
  onClear,
}: Props) {
  const update = (key: keyof DashboardFiltersType, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const componentes = options?.componentes?.length
    ? options.componentes
    : fallbackComponentes;

  return (
    <div
      className="rounded-[26px] bg-white border border-gray-100 shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-5 text-gray-800"
      style={{ colorScheme: 'light' }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-[17px] font-black text-gray-700">
            Filtros del Dashboard
          </h3>
          <p className="text-sm font-bold text-gray-500">
            Filtra por fecha, línea, marca y componente de parada.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-black hover:bg-gray-200"
          >
            <RotateCcw size={16} />
            Limpiar
          </button>

          <button
            type="button"
            onClick={onApply}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006B7A] text-white font-black hover:bg-[#005260]"
          >
            <Search size={16} />
            Aplicar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-7 gap-3">
        <select
          value={filters.year ?? ""}
          onChange={(e) => update("year", e.target.value)}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Año</option>
          {options?.years?.map((year) => (
            <option key={String(year)} value={String(year)}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={filters.month ?? ""}
          onChange={(e) => update("month", e.target.value)}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Mes</option>
          {options?.months?.map((month) => (
            <option key={String(month)} value={String(month)}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={filters.week ?? ""}
          onChange={(e) => update("week", e.target.value)}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Semana</option>
          {options?.weeks?.map((week) => (
            <option key={String(week)} value={String(week)}>
              Semana {week}
            </option>
          ))}
        </select>

        <select
          value={filters.day ?? ""}
          onChange={(e) => update("day", e.target.value)}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Día</option>
          {options?.days?.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <select
          value={filters.linea ?? ""}
          onChange={(e) => update("linea", e.target.value)}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Línea</option>
          {options?.lineas?.map((linea) => (
            <option key={linea} value={linea}>
              {linea}
            </option>
          ))}
        </select>

        <select
          value={filters.marca ?? ""}
          onChange={(e) => update("marca", e.target.value)}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Marca</option>
          {options?.marcas?.map((marca) => (
            <option key={marca} value={marca}>
              {marca}
            </option>
          ))}
        </select>

        <select
          value={filters.componente ?? ""}
          onChange={(e) => update("componente", e.target.value)}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Componente</option>
          {componentes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.value} - {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
