import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface StopCodeRankingItem {
  codigo: string;
  descripcion: string;
  tipo: string;
  total_minutos: number;
  total_frecuencia: number;
}

interface StopCodeRankingFilters {
  day?: string;
  week?: string;
  linea?: string;
  brand?: string;
  component?: string;
  sort_by?: 'minutes' | 'frequency';
  limit?: number;
}

const AJE = {
  green: '#004B23',
  lime: '#D4E157',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  gray: '#64748B',
  red: '#DC2626',
  orange: '#F97316',
};

const fetchStopCodesRanking = async (
  filters: StopCodeRankingFilters
): Promise<StopCodeRankingItem[]> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`/dashboard/stop-codes-ranking?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Error al obtener ranking de códigos');
  }

  const result = await response.json();

  return result.data.map((item: any) => ({
    codigo: item.codigo,
    descripcion: item.descripcion,
    tipo: item.tipo,
    total_minutos: Number(item.total_minutos),
    total_frecuencia: Number(item.total_frecuencia),
  }));
};

export const StopCodesRankingChart: React.FC = () => {
  const [data, setData] = useState<StopCodeRankingItem[]>([]);
  const [loading, setLoading] = useState(false);

  console.log('DATA GRAFICO CODIGOS:', data);

  const [filters, setFilters] = useState<StopCodeRankingFilters>({
    day: '',
    week: '',
    linea: '',
    brand: '',
    component: '',
    sort_by: 'minutes',
    limit: 10,
  });

  const updateFilter = (
    key: keyof StopCodeRankingFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const result = await fetchStopCodesRanking(filters);

        console.log('DATA GRAFICO CODIGOS:', result);

        setData(result);
      } catch (error) {
        console.error('Error cargando gráfico:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  return (
    <div
      style={{
        background: AJE.white,
        border: `1px solid ${AJE.border}`,
        borderRadius: 18,
        padding: 20,
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            margin: 0,
            color: AJE.green,
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          Códigos con más minutos y frecuencia
        </h2>

        <p
          style={{
            margin: '6px 0 0',
            color: AJE.gray,
            fontSize: 14,
          }}
        >
          Muestra qué códigos consumen más tiempo y cuántas veces se registraron.
        </p>
      </div>

      {/* FILTROS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <input
          type="date"
          value={filters.day}
          onChange={(e) => updateFilter('day', e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Semana"
          min={1}
          max={53}
          value={filters.week}
          onChange={(e) => updateFilter('week', e.target.value)}
          style={inputStyle}
        />

        <select
          value={filters.linea}
          onChange={(e) => updateFilter('linea', e.target.value)}
          style={inputStyle}
        >
          <option value="">Todas las líneas</option>
          {Array.from({ length: 14 }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              Línea {i + 1}
            </option>
          ))}
        </select>

        <select
          value={filters.brand}
          onChange={(e) => updateFilter('brand', e.target.value)}
          style={inputStyle}
        >
          <option value="">Todas las marcas</option>
          <option value="BIG COLA">BIG COLA</option>
          <option value="CIELO">CIELO</option>
          <option value="PULP">PULP</option>
          <option value="VOLT">VOLT</option>
          <option value="SPORADE">SPORADE</option>
        </select>

        <select
          value={filters.component}
          onChange={(e) => updateFilter('component', e.target.value)}
          style={inputStyle}
        >
          <option value="">Todos los componentes</option>
          <option value="EQUIPO">Equipo</option>
          <option value="ORGANIZACIONALES">Organizacionales</option>
          <option value="RUTINARIAS">Rutinarias</option>
          <option value="OPERATIVAS">Operativas</option>
        </select>

        <select
          value={filters.sort_by}
          onChange={(e) =>
            updateFilter('sort_by', e.target.value as 'minutes' | 'frequency')
          }
          style={inputStyle}
        >
          <option value="minutes">Mayor minutos</option>
          <option value="frequency">Mayor frecuencia</option>
        </select>

        <select
          value={filters.limit}
          onChange={(e) => updateFilter('limit', Number(e.target.value))}
          style={inputStyle}
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={15}>Top 15</option>
          <option value={20}>Top 20</option>
        </select>
      </div>

      {/* GRÁFICO */}
      <div style={{ width: '100%', height: 390 }}>
        {loading ? (
          <div style={emptyStyle}>Cargando gráfico...</div>
        ) : data.length === 0 ? (
          <div style={emptyStyle}>No hay datos para mostrar.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 40,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="codigo"
                angle={-25}
                textAnchor="end"
                tick={{ fontSize: 12, fill: AJE.text }}
              />

              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: AJE.red }}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: AJE.green }}
              />

              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'total_minutos') {
                    return [`${value} min`, 'Minutos'];
                  }

                  if (name === 'total_frecuencia') {
                    return [`${value} veces`, 'Frecuencia'];
                  }

                  return [value, name];
                }}
                labelFormatter={(label) => `Código: ${label}`}
              />

              <Legend />

              <Bar
                yAxisId="left"
                dataKey="total_minutos"
                name="Minutos"
                fill={AJE.red}
                radius={[8, 8, 0, 0]}
              />

              <Bar
                yAxisId="right"
                dataKey="total_frecuencia"
                name="Frecuencia"
                fill={AJE.lime}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* TABLA */}
      {data.length > 0 && (
        <div style={{ marginTop: 18, overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: AJE.green, color: AJE.white }}>
                <th style={thStyle}>Código</th>
                <th style={thStyle}>Descripción</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Minutos</th>
                <th style={thStyle}>Frecuencia</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.codigo}>
                  <td style={tdStyle}>
                    <strong>{item.codigo}</strong>
                  </td>
                  <td style={tdStyle}>{item.descripcion}</td>
                  <td style={tdStyle}>{item.tipo}</td>
                  <td style={tdStyle}>{item.total_minutos}</td>
                  <td style={tdStyle}>{item.total_frecuencia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: `1px solid ${AJE.border}`,
  background: AJE.white,
  color: AJE.text,
  fontSize: 13,
  outline: 'none',
};

const emptyStyle: React.CSSProperties = {
  height: '100%',
  background: AJE.bg,
  border: `1px dashed ${AJE.border}`,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: AJE.gray,
};

const thStyle: React.CSSProperties = {
  padding: 10,
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: 10,
  borderBottom: `1px solid ${AJE.border}`,
  color: AJE.text,
};