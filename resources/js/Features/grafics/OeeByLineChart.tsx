import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getOeeByLine } from "../server/oeeProduction.api";

export default function OeeByLineChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getOeeByLine().then(setData);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-green-50 p-6">
      {/* Título unificado con el diseño de la tabla */}
      <h2 className="text-2xl font-bold mb-6 text-green-800 border-b-2 border-green-400 pb-2 inline-block">
        OEE por Línea
      </h2>

      <div className="h-[350px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            {/* Cuadrícula sutil en tono verde claro, ocultando las líneas verticales para un look más limpio */}
            <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" vertical={false} />
            
            {/* Eje X: Sin línea sólida, con texto verde y un poco de separación (dy) */}
            <XAxis 
              dataKey="linea" 
              tick={{ fill: '#166534', fontSize: 14, fontWeight: 500 }} 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            
            {/* Eje Y: Formato de porcentaje, sin línea sólida y texto verde */}
            <YAxis 
              domain={[0, 100]} 
              tick={{ fill: '#166534', fontSize: 14 }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}  
              dx={-10}
            />
            
            {/* Tooltip personalizado para que combine con el tema verde */}
            <Tooltip 
              cursor={{ fill: '#f0fdf4' }} // Fondo de la columna al pasar el cursor (green-50)
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '8px', 
                border: '1px solid #bbf7d0', // green-200
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#15803d', fontWeight: 'bold' }} // green-700
              labelStyle={{ color: '#166534', fontWeight: 'bold', paddingBottom: '4px' }}
            />
            
            {/* Barras del gráfico: Color verde, bordes superiores redondeados y un ancho máximo */}
            <Bar 
              dataKey="oee" 
              name="OEE" 
              fill="#22c55e" // green-500 de Tailwind
              radius={[6, 6, 0, 0]} 
              maxBarSize={60}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}