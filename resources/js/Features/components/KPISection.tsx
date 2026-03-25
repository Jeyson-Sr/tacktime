import React from 'react';
import { BarChart, Target, Gauge, Zap, ChevronRight } from 'lucide-react';
import { KPI } from '../types';

// --- CONFIGURACIÓN DE ESTILOS SIRVO/AJE ---
const AJE = {
  lima: '#D4E157',
  bosque: '#004B23',
  fondo: '#F8FAFC',
};

interface KPISectionProps {
  kpis: KPI[];
}

const KPISection: React.FC<KPISectionProps> = ({ kpis }) => {
  
  const getKpiTheme = (status: string) => {
    switch (status) {
      case 'success': 
        return { bar: 'bg-[#D4E157]', text: 'text-[#004B23]', bg: 'bg-[#D4E157]/10', icon: <Target size={16} /> };
      case 'warning': 
        return { bar: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', icon: <Zap size={16} /> };
      case 'danger': 
        return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', icon: <Gauge size={16} /> };
      case 'total': 
        return { bar: 'bg-[#004B23]', text: 'text-[#004B23]', bg: 'bg-gray-100', icon: <BarChart size={16} /> };
      default: 
        return { bar: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-50', icon: <BarChart size={16} /> };
    }
  };
// Ordenar por valor descendente, excepto para OEE y TOTAL
const kpisOrdenados = [...kpis].sort((a, b) => {
  if (a.label === "OEE")   return -1;
  if (b.label === "OEE")   return  1;
  if (a.label === "TOTAL") return  1;
  if (b.label === "TOTAL") return -1;

  return b.value - a.value; // el resto por valor descendente
});
// Orden general por valor descendente
// const kpisOrdenados = [...kpis].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
      {/* Header de la Sección */}
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#004B23] p-2.5 rounded-2xl text-white shadow-lg shadow-[#004B23]/20">
            <BarChart size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#004B23] uppercase tracking-tighter">
              KPIs de Producción
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desempeño en Tiempo Real</p>
          </div>
        </div>
        {/* <div className="bg-[#D4E157]/20 px-4 py-1.5 rounded-full">
            <span className="text-[10px] font-black text-[#004B23] uppercase">SISTEMA SIRVO</span>
        </div> */}
      </div>

      {/* Lista de KPIs */}
      <div className="p-8 pt-4 space-y-6">
        {kpisOrdenados.map((kpi, index) => {
          const theme = getKpiTheme(kpi.status);
          const barWidth = kpi.status === 'total' ? 100 : Math.min(kpi.value, 100);

          return (
            <div key={index} className="group">
              {/* Info del KPI */}
              <div className="flex justify-between items-end mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`${theme.text} opacity-80`}>
                    {theme.icon}
                  </div>
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
                    {kpi.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-mono font-black ${theme.text}`}>
                    {kpi.value.toFixed(1)}
                  </span>
                  <span className={`text-xs font-black ${theme.text} opacity-60`}>%</span>
                </div>
              </div>

              {/* Contenedor de la Barra */}
              <div className={`w-full ${theme.bg} rounded-full h-5 p-1 border border-black/5 flex items-center shadow-inner`}>
                <div
                  className={`h-full ${theme.bar} transition-all duration-1000 ease-out rounded-full shadow-sm relative group-hover:brightness-110`}
                  style={{ width: `${barWidth}%` }}
                >
                    {/* Brillo decorativo en la barra */}
                    <div className="absolute inset-0 bg-white/20 rounded-full h-1/2 mt-0.5 ml-2 mr-2 overflow-hidden" />
                </div>
              </div>

              {/* Mini etiquetas opcionales o separador */}
              {index !== kpis.length - 1 && (
                <div className="mt-6 border-b border-gray-50 w-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer decorativo del KPI */}
      <div className="bg-gray-50 p-4 px-8 border-t border-gray-100 flex justify-between items-center">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Data Refresh: AUTO</p>
        <ChevronRight size={14} className="text-gray-200" />
      </div>
    </div>
  );
};

export default KPISection;