import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trash2, 
  AlertCircle, 
  Clock, 
  Settings, 
  CheckCircle2, 
  MessageSquare,
  PlusCircle,
  Activity
} from 'lucide-react';
import { HourlyProduction, StopRecord, HourComments } from '../types';
import { calculateStatus, calculateJustificar, calculateJustificado, generateId } from '../utils/calculations';
import StopCodeSearchModal from './StopCodeSearchModal';
import { fetchStopCodes } from '../database';

// --- CONFIGURACIÓN DE ESTILOS SIRVO/AJE ---
const AJE = {
  lima: '#D4E157',
  bosque: '#004B23',
  mentaDark: '#A8E6CF',
  fondo: '#F8FAFC',
  peligro: '#ef4444',
  ok: '#22c55e'
};

const TIPO_MAP: Record<string, string> = {
  'EQ': 'EQUIPO',
  'OPD': 'OPERATIVAS',
  'OR': 'ORGANIZACIONALES',
  'PD': 'PLANIFICADAS',
  'QD': 'PERDIDAS DE CALIDAD',
  'RD': 'RUTINARIAS',
  'TNP': 'TIEMPO NO PROGRAMADO'
};

interface StopControlProps {
  currentHour: HourlyProduction;
  onUpdateHour: (updates: Partial<HourlyProduction>) => void;
  onCloseHour: () => void;
  productData: {
    formato: string;
    marca: string;
    sabor: string;
    palletsPorHora: number;
  };
  BPH: number;
  SKU: number;
  descripccion: string;
}

const StopControl: React.FC<StopControlProps> = ({
  currentHour,
  onUpdateHour,
  onCloseHour,
  productData,
  BPH,
  SKU,
  descripccion
}) => {
  const [isModalOpenBuscadorCode, setIsModalOpenBuscadorCode] = useState(false);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [newStop, setNewStop] = useState({
    codigo: '',
    tipo: '',
    descripcion: '',
    tiempoMinutos: 0,
    frecuencia: 1,
  });

  const [comments, setComments] = useState<HourComments>({
    mnf: currentHour.comments?.mnf || '',
    mantto: currentHour.comments?.mantto || '',
    calidad: currentHour.comments?.calidad || ''
  });

  useEffect(() => {
    const loadCatalog = async () => {
      const data = await fetchStopCodes();
      setCatalog(data);
    };
    loadCatalog();
  }, []);

  const handleCodeChange = (code: string) => {
    const cleanCode = code.toUpperCase();
    const found = catalog.find(item => item.codigo === cleanCode);
    setNewStop({
      ...newStop,
      codigo: cleanCode,
      descripcion: found ? found.detalle : '',
      tipo: found ? (TIPO_MAP[found.tipo_n0] || 'EQUIPO') : ''
    });
  };

  const handleProducidoChange = (value: number) => {
    const justificar = calculateJustificar(currentHour.estimado, value);
    const status = calculateStatus(value, currentHour.estimado);
    onUpdateHour({ producido: value, justificar: Number(justificar.toFixed(1)), status });
  };

  const handleAddStop = () => {
    if (!newStop.codigo || newStop.tiempoMinutos <= 0) {
      alert('Faltan datos en la parada (Código o Tiempo)');
      return;
    }

    const totalActual = currentHour.stops.reduce((acc, s) => acc + s.tiempoMinutos, 0);
    if ((totalActual + newStop.tiempoMinutos) > (currentHour.justificar)) {
      alert(`Error: No puede justificar más de los ${currentHour.justificar.toFixed(1)} min requeridos.`);
      return;
    }

    const stop: StopRecord = {
      id: generateId('stop'),
      ...newStop,
      timestamp: new Date().toISOString()
    };

    const updatedStops = [...currentHour.stops, stop];
    const justificado = calculateJustificado(updatedStops);
    onUpdateHour({ stops: updatedStops, justificado });
    setNewStop({ codigo: '', tipo: '', descripcion: '', tiempoMinutos: 0, frecuencia: 1 });
  };

  const handleDeleteStop = (id: string) => {
    const updatedStops = currentHour.stops.filter(s => s.id !== id);
    const justificado = calculateJustificado(updatedStops);
    onUpdateHour({ stops: updatedStops, justificado });
  };

  const handleFinalizar = () => {
    if (!currentHour.producido || currentHour.producido < 0) {
      alert('Debe ingresar la cantidad producida.');
      return;
    }

    if (!comments.mnf) {
      alert('Debe ingresar comentarios en MNF');
      return;
    }
  setComments({  
      ...currentHour.comments,
    mnf: '',
    mantto: '',
    calidad: '' 
  });

    onUpdateHour({ comments });
    onCloseHour();
  };

  const hasType = (types: string[]) => currentHour.stops.some(s => types.includes(s.tipo));
  const canEditMantto = hasType(['EQUIPO', 'OPERATIVAS']);
  const canEditCalidad = hasType(['PERDIDAS DE CALIDAD']);

  console.log()

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      
      {/* HEADER DE LA HORA */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[32px] border border-gray-100 shadow-2xl gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#004B23] p-4 rounded-2xl text-white">
            <Clock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#004B23]">HORA {currentHour.hour}</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Panel de Control Horario</p>
          </div>
        </div>
         
        <div className="flex flex-col md:flex-row md:gap-20 gap-4">
          {descripccion && (
            <div className="px-6 py-2 bg-gray-50 rounded-full border border-gray-100 flex flex-col items-center">
                <span className="text-[9px] font-black text-gray-400 uppercase">Detalle</span>
                <span className="font-mono font-bold text-[#004B23]">{descripccion.toLocaleString()}</span>
            </div>
          )}
            <div className="px-6 py-2 bg-gray-50 rounded-full border border-gray-100 flex flex-col items-center">
                <span className="text-[9px] font-black text-gray-400 uppercase">BPH Nominal</span>
                <span className="font-mono font-bold text-[#004B23]">{BPH.toLocaleString()}</span>
            </div>
            {/* <div className="px-6 py-2 bg-[#D4E157]/20 rounded-full border border-[#D4E157] flex flex-col items-center">
                <span className="text-[9px] font-black text-[#004B23] uppercase">Status</span>
                <span className="font-bold text-[#004B23] text-xs">{currentHour.status || 'PENDIENTE'}</span>
            </div> */}
        </div>
      </div>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Planificado" value={currentHour.estimado} icon={Activity} color="blue" />
        
        <div className="bg-white p-5 rounded-[24px] border-2 border-[#004B23] shadow-2xl relative overflow-hidden">
          <label className="text-[10px] font-black text-[#004B23] uppercase tracking-widest block mb-1">Producido</label>
          <input
            type="number"
            value={currentHour.producido || ''}
            onChange={(e) => handleProducidoChange(Number(e.target.value))}
            className="w-full text-3xl font-mono font-black text-[#004B23] outline-none bg-transparent"
            placeholder="0"
          />
          <div className="absolute right-4 bottom-4 opacity-10">
            <CheckCircle2 size={40} />
          </div>
        </div>

        <MetricCard 
            label="A Justificar" 
            value={`${currentHour.justificar.toFixed(1)} min`} 
            icon={AlertCircle} 
            color={currentHour.justificar > 0 ? "red" : "gray"} 
        />
        
        <MetricCard 
            label="Justificado" 
            value={`${currentHour.justificado.toFixed(1)} min`} 
            icon={Settings} 
            color={currentHour.justificar === currentHour.justificado && currentHour.justificar > 0 ? "green" : "orange"} 
        />
        <MetricCard 
            label="Dif a Justificar" 
            value={`${(currentHour.justificar - currentHour.justificado).toFixed(1)} min`} 
            icon={Settings} 
            color={currentHour.justificar === currentHour.justificado && currentHour.justificar > 0 ? "green" : "orange"} 
        />
      </div>

      {/* SECCIÓN REGISTRO DE PARADAS */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-2xl space-y-6">
        <div className="flex items-center gap-2 border-b pb-4 border-gray-50">
          <PlusCircle size={20} className="text-[#004B23]" />
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-tighter">Registrar Parada de Planta</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Código (Doble Clic)</label>
                <input
                    type="text"
                    value={newStop.codigo}
                    onDoubleClick={() => setIsModalOpenBuscadorCode(true)}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-bold uppercase text-blue-600 focus:ring-2 ring-[#D4E157] transition-all"
                    placeholder="E1..."
                />
            </div>

            <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Tipo</label>
                <div className="w-full px-4 py-3 bg-gray-100 rounded-xl text-[10px] font-black text-gray-500 flex items-center h-[48px]">
                    {newStop.tipo || '---'}
                </div>
            </div>

            <div className="md:col-span-4 space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Descripción</label>
                <div className="w-full px-4 py-3 bg-gray-100 rounded-xl text-xs text-gray-600 flex items-center h-[48px] italic truncate">
                    {newStop.descripcion || 'Seleccione código...'}
                </div>
            </div>

            <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Minutos</label>
                <input
                    type="number"
                    value={newStop.tiempoMinutos || ''}
                    onChange={(e) => setNewStop({ ...newStop, tiempoMinutos: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 ring-[#D4E157]"
                    placeholder="0"
                />
            </div>

            <div className="md:col-span-2 flex items-end">
                <button
                    onClick={handleAddStop}
                    className="w-full h-[48px] bg-[#004B23] text-white rounded-xl font-black text-xs hover:bg-[#003317] transition-all flex items-center justify-center gap-2"
                >
                    <PlusCircle size={16} /> AGREGAR
                </button>
            </div>
        </div>

        {/* LISTADO DE PARADAS CARGADAS */}
        <div className="space-y-3 mt-8 ">
          {currentHour.stops.map(stop => (
            <div key={stop.id} className="group flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 hover:border-[#D4E157] transition-all shadow-sm">
              <div className="flex items-center gap-6 flex-1">
                <div className="bg-[#004B23] text-white px-3 py-1 rounded-lg font-mono font-bold text-xs">{stop.codigo}</div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">{stop.tipo}</span>
                  <span className="text-sm font-bold text-gray-700">{stop.descripcion}</span>
                </div>
                <div className="flex gap-4 ml-auto mr-8">
                   <div className="text-center">
                     <p className="text-[8px] font-black text-gray-300 uppercase">Tiempo</p>
                     <p className="font-mono font-black text-gray-700">{stop.tiempoMinutos} min</p>
                   </div>
                   <div className="text-center">
                     <p className="text-[8px] font-black text-gray-300 uppercase">Frec</p>
                     <p className="font-mono font-black text-gray-700">{stop.frecuencia}</p>
                   </div>
                </div>
              </div>
              <button onClick={() => handleDeleteStop(stop.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {currentHour.stops.length === 0 && (
            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <p className="text-gray-300 font-bold text-sm italic">Sin paradas registradas en esta hora</p>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN COMENTARIOS */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare size={20} className="text-[#004B23]" />
          <h3 className="text-sm font-black text-gray-700 uppercase">Comentarios por Área</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CommentBox 
            label="Manufactura (MNF)" 
            value={comments.mnf} 
            onChange={(v: string) => setComments({ ...comments, mnf: v })} 
            color="#004B23"
          />
          <CommentBox 
            label="Mantenimiento" 
            value={comments.mantto} 
            onChange={(v: string) => setComments({ ...comments, mantto: v })} 
            disabled={!canEditMantto}
            color="#f97316"
          />
          <CommentBox 
            label="Calidad" 
            value={comments.calidad} 
            onChange={(v: string) => setComments({ ...comments, calidad: v })} 
            disabled={!canEditCalidad}
            color="#10b981"
          />
        </div>
      </div>

      {/* BOTÓN FINALIZAR HORA */}
      <button
        onClick={handleFinalizar}
        className="w-full py-6 rounded-[24px] bg-[#004B23] text-white font-black text-2xl shadow-xl shadow-green-900/20 hover:bg-[#003317] transition-all flex items-center justify-center gap-4 active:scale-95"
      >
        <CheckCircle2 size={32} />
        FINALIZAR HORA {currentHour.hour}
      </button>

      {/* MODAL DE BÚSQUEDA */}
      <StopCodeSearchModal 
        isOpen={isModalOpenBuscadorCode}
        onClose={() => setIsModalOpenBuscadorCode(false)}
        onSelect={(code: any) => setNewStop(prev => ({
          ...prev,
          codigo: code.codigo,
          descripcion: code.detalle,
          tipo: TIPO_MAP[code.tipo_n0] || 'EQUIPO'
        }))}
      />
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const MetricCard = ({ label, value, icon: Icon, color = 'gray' }: any) => {
  const colorMap: any = {
    blue: 'text-blue-600 bg-blue-50',
    red: 'text-red-600 bg-red-50 border-red-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    orange: 'text-orange-600 bg-orange-50',
    gray: 'text-gray-400 bg-gray-50'
  };
  
  return (
    <div className={`p-5 rounded-[24px] border border-transparent shadow-2xl ${colorMap[color] || colorMap.gray} bg-white transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <label className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</label>
        <Icon size={16} className="opacity-40" />
      </div>
      <div className="text-2xl font-mono font-black">{value}</div>
    </div>
  );
};

const CommentBox = ({ label, value, onChange, disabled, color }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-wider block ml-2" style={{ color: disabled ? '#ccc' : color }}>
      {label}
    </label>
    <textarea
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-4 rounded-2xl border-none text-sm font-medium transition-all min-h-[100px] resize-none
        ${disabled ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-gray-50 focus:ring-2'}
      `}
      style={{ '--tw-ring-color': color } as React.CSSProperties}
      placeholder={disabled ? "No requiere comentario..." : "Escriba observaciones..."}
    />
  </div>
);

export default StopControl;