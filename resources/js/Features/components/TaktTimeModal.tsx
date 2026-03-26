import React, { useState } from 'react';
import { X, Sun, Moon, BarChart3, ChevronRight, Clock, Target, CheckCircle2 } from 'lucide-react';
import { HourlyProduction } from '../types';
import HourDetailModal from './HourDetailModal';

// --- CONFIGURACIÓN DE ESTILOS SIRVO/AJE ---
const AJE = {
  lima: '#D4E157',
  bosque: '#004B23',
  fondo: '#F8FAFC',
  noche: '#1E293B'
};

interface TaktTimeModalProps {
  onClose: () => void;
  hourlyRecords: HourlyProduction[];
  linea: string;
  productInfo: string;
}

const TaktTimeModal: React.FC<TaktTimeModalProps> = ({ onClose, hourlyRecords, linea, productInfo }) => {
  const [selectedHour, setSelectedHour] = useState<HourlyProduction | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'green': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' };
      case 'yellow': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' };
      case 'red': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
      case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200', dot: 'bg-gray-300' };
    }
  };


  const splitShifts = () => {
    if (!hourlyRecords.length) return { dayShift: [], nightShift: [] };

    let dayShift: HourlyProduction[] = [];
    let nightShift: HourlyProduction[] = [];

    const firstHour = hourlyRecords[0].hour;
    if (firstHour === "06:30 - 07:30") {
      dayShift = hourlyRecords;
    } else if (firstHour === "18:30 - 19:30") {
      nightShift = hourlyRecords;
    }

    return { dayShift, nightShift };
  };

  const { dayShift, nightShift } = splitShifts();
// ─── TURNO DÍA ───────────────────────────────────────────────
const calcularRatioDia = () => {
  const horasCerradas = dayShift.filter(item => item.closed);
  const horasConProduccion = horasCerradas.filter(item => item.producido > 0);

  if (horasConProduccion.length === 0) return 0;

  const totalProducido   = horasConProduccion.reduce((sum, item) => sum + item.producido, 0);
  const estimadoPorHora  = horasConProduccion[0].estimado;          // todos son iguales
  const totalEstimado    = horasConProduccion.length * estimadoPorHora;

  return totalEstimado > 0 ? Number((totalProducido / totalEstimado).toFixed(2)) : 0;
};

// ─── TURNO NOCHE ─────────────────────────────────────────────
const calcularRatioNoche = () => {
  const horasCerradas = nightShift.filter(item => item.closed);
  const horasConProduccion = horasCerradas.filter(item => item.producido > 0);

  if (horasConProduccion.length === 0) return 0;

  const totalProducido   = horasConProduccion.reduce((sum, item) => sum + item.producido, 0);
  const estimadoPorHora  = horasConProduccion[0].estimado;
  const totalEstimado    = horasConProduccion.length * estimadoPorHora;

  return totalEstimado > 0 ? Number((totalProducido / totalEstimado).toFixed(2)) : 0;
};

// ─── DÍA COMPLETO (24h: día + noche) ─────────────────────────
const calcularRatio24h = () => {
  const todasLasHoras = [...dayShift, ...nightShift];
  const horasCerradas = todasLasHoras.filter(item => item.closed);
  const horasConProduccion = horasCerradas.filter(item => item.producido > 0);

  if (horasConProduccion.length === 0) return 0;

  const totalProducido   = horasConProduccion.reduce((sum, item) => sum + item.producido, 0);
  const estimadoPorHora  = horasConProduccion[0].estimado;
  const totalEstimado    = horasConProduccion.length * estimadoPorHora;

  return totalEstimado > 0 ? Number((totalProducido / totalEstimado).toFixed(2)) : 0;
};

const ratioDia   = calcularRatioDia();
const ratioNoche = calcularRatioNoche();
const cump        = calcularRatio24h();   // OEE = cumplimiento del día completo





  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#004B23]/40 backdrop-blur-md">
        <div className="bg-[#F8FAFC] w-full max-w-7xl rounded-[40px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/20">
          
          {/* HEADER SUPERIOR */}
          <div className="bg-[#004B23] p-8 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="bg-[#D4E157] p-2 rounded-xl text-[#004B23]">
                        <BarChart3 size={24} />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Takt Time {linea}</h2>
                </div>
                <p className="text-[#D4E157] font-bold text-xs uppercase tracking-[0.2em] ml-1">{productInfo}</p>
              </div>
              
              <div className="flex gap-4 mr-15">
                <div className="bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-sm border border-white/10">
                    <p className="text-[15px] font-black uppercase opacity-60">CUMPLIMIENTO TOTAL</p>
                    <p className="text-sm font-bold">{(cump * 100).toFixed(1)} %</p>
                </div>
              </div>
            </div>
          </div>

          {/* CUERPO DEL MODAL (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* SECCIÓN TURNO DÍA */}
              <ShiftSection 
                title="Turno Día" 
                icon={<Sun size={20} className="text-orange-500" />}
                data={dayShift} 
                getStatusStyle={getStatusStyle}
                onHourClick={setSelectedHour}
                cump={ratioDia}
              />

              {/* SECCIÓN TURNO NOCHE */}
              <ShiftSection 
                title="Turno Noche" 
                icon={<Moon size={20} className="text-indigo-400" />}
                data={nightShift} 
                getStatusStyle={getStatusStyle}
                onHourClick={setSelectedHour}
                cump={ratioNoche}
              />
              
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 bg-white border-t border-gray-100 flex justify-center">
            <button
              onClick={onClose}
              className="px-10 py-4 bg-[#004B23] text-white font-black rounded-2xl hover:bg-[#003317] transition-all shadow-lg active:scale-95"
            >
              CERRAR TABLERO
            </button>
          </div>
        </div>
      </div>

      {selectedHour && (
        <HourDetailModal hour={selectedHour} onClose={() => setSelectedHour(null)} />
      )}
    </>
  );
};

// --- SUB-COMPONENTE: SECCIÓN DE TURNO ---

interface ShiftSectionProps {
  title: string;
  icon: React.ReactNode;
  data: HourlyProduction[];
  getStatusStyle: (status: string) => any;
  onHourClick: (hour: HourlyProduction) => void;
  cump: number;
}

const ShiftSection: React.FC<ShiftSectionProps> = ({ title, icon, data, getStatusStyle, onHourClick, cump }) => (
  <div className="space-y-6">
    <div className='flex items-center justify-between gap-3'>
      <div className="flex items-center gap-3 ml-2">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
          {icon}
        </div>
        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{title}</h3>
      </div>
      <div className="flex items-center gap-3 ml-2 ">
        <div className="bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-sm border bg-gray-100">
          <p className="text-[15px] font-black uppercase opacity-60">CUMP</p>
          <p className="text-sm font-bold">{(cump * 100).toFixed(1)} %</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item, index) => {
        const style = getStatusStyle(item.status);
        const cumplimiento = item.estimado > 0 ? (item.producido / item.estimado) * 100 : 0;

        return (
          <div
            key={index}
            onClick={() => item.closed && onHourClick(item)}
            className={`relative group rounded-[28px] p-5 border-2 transition-all overflow-hidden
              ${item.closed 
                ? `${style.bg} ${style.border} cursor-pointer hover:shadow-xl hover:-translate-y-1` 
                : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
              }`}
          >
            {/* Cabecera de la Tarjeta de Hora */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`} />
                    <span className="text-xl font-mono font-black text-gray-800">HR: {item.hour}</span>
                </div>
                {item.closed && (
                    <div className="bg-white/50 p-1.5 rounded-lg">
                        <ChevronRight size={16} className={style.text} />
                    </div>
                )}
            </div>

            {/* Métricas de la Hora */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Estimado</p>
                    <p className="text-lg font-mono font-bold text-gray-700">{item.estimado}</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Producido</p>
                    <p className={`text-lg font-mono font-black ${style.text}`}>{item.producido}</p>
                </div>
            </div>

            {/* Barra de Progreso / Cumplimiento */}
            <div className="mt-4 pt-4 border-t border-black/5">
                <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase">Cumplimiento</span>
                    <span className={`text-xs font-black font-mono ${style.text}`}>{cumplimiento.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${style.dot.replace('bg-', 'bg-')}`}
                        style={{ width: `${Math.min(cumplimiento, 100)}%`, backgroundColor: 'currentColor' }}
                    />
                </div>
            </div>

            {/* Overlay para horas no cerradas */}
            {!item.closed && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                    <Clock size={20} className="text-gray-300" />
                </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default TaktTimeModal;