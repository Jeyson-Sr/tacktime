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
import type { CommentColor, Comentario, HoraData } from "@/Features/types";
import { calculateStatus, calculateJustificar, calculateJustificado, generateId } from '../utils/calculations';
import StopCodeSearchModal from './StopCodeSearchModal';
import { fetchStopCodes } from '../database';
import Alert from '../Alert';
import ProduccionHoraList from './ProduccionHoraList';

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
  onUpdateHourByIndex: (hourIndex: number, updates: Partial<HourlyProduction>) => void;
  productData: {
    formato: string;
    marca: string;
    sabor: string;
    palletsPorHora: number;
  };
  BPH: number;
  SKU: number;
  descripccion: string;
  hourlyRecords: HourlyProduction[];
}

const StopControl: React.FC<StopControlProps> = ({
  currentHour,
  onUpdateHour,
  hourlyRecords,
  onUpdateHourByIndex,
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

  const [alerta, setAlerta] = useState('');
  const lastTap = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    const diff = now - lastTap.current;
    if (diff < 300) {
      setIsModalOpenBuscadorCode(true);
    }
    lastTap.current = now;
  };

  useEffect(() => {
    if (alerta.trim()) {
      const timer = setTimeout(() => setAlerta(''), 20000);
      return () => clearTimeout(timer);
    }
  }, [alerta]);

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
      setAlerta('');
      setAlerta('Faltan datos en la parada (Código o Tiempo)');
      return;
    }

    const totalActual = currentHour.stops.reduce((acc, s) => acc + s.tiempoMinutos, 0);
    if ((totalActual + newStop.tiempoMinutos) > currentHour.justificar) {
      setAlerta('');
      setAlerta(`Error: No puede justificar más de los ${currentHour.justificar.toFixed(1)} min requeridos.`);
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
      setAlerta('');
      setAlerta('Debe ingresar la cantidad producida.');
      return;
    }
    if (!comments.mnf) {
      setAlerta('');
      setAlerta('Debe ingresar comentarios en MNF');
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

// 1. Transformación de los datos
const DATA: HoraData[] = hourlyRecords
  .filter(record => record.producido > 0) // Solo mostrar si tiene valor de producción
  .map(record => {
    // Definimos la configuración local para el mapeo de colores
    const config: { key: string; color: CommentColor }[] = [
      { key: 'mnf', color: 'green' },
      { key: 'mantto', color: 'orange' },
      { key: 'calidad', color: 'yellow' }
    ];

    // Generamos el array de comentarios basado en la config y el objeto record.comments
    const listaComentarios: Comentario[] = config
      .map(conf => ({
        color: conf.color,
        contenido: record.comments[conf.key as keyof typeof record.comments],
        tipo: conf.key
      }))
      .filter(c => c.contenido && c.contenido.trim() !== ""); // Filtro de vacíos

    return {
            hourIndex: record.hourIndex,
            hora: record.hour,
            estimado: record.estimado,
            phProducidos: record.producido,
            justificar: record.justificar,
            justificado: record.justificado,
            status: record.status,
            closed: record.closed,
            comentarios: listaComentarios,
            paradas: record.stops || []
          };
  });


return (
  <div className="max-w-10xl mx-auto space-y-4 pb-10 px-2 sm:px-0">
      
      <ProduccionHoraList
        data={DATA}
        onUpdateHour={(hourIndex, updates) => {
          onUpdateHourByIndex(hourIndex, updates);
        }}
      />
      

      {/* ALERTA */}
      {alerta?.trim() && (
        <Alert variant="error" title="El campo es obligatorio" message={alerta} />
      )}

      {/* HEADER DE LA HORA */}
      {/* <div className="flex flex-row justify-between items-center bg-white p-4 sm:p-6 rounded-[32px] border border-gray-100 shadow-2xl gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-[#004B23] p-3 sm:p-4 rounded-2xl text-white shrink-0">
            <Clock size={24} className="sm:hidden" />
            <Clock size={32} className="hidden sm:block" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#004B23]">HORA {currentHour.hour}</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Panel de Control Horario</p>
          </div>
        </div>
      </div> */}

      {/* MÉTRICAS PRINCIPALES */}
      {/* Mobile: 2 cols top + producido full + 2 cols + botón full */}
      {/* Desktop: 7 cols en una fila */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">

        {/* Planificado */}
        <MetricCard label="Planificado" value={currentHour.estimado} icon={Activity} color="blue" />

        {/* Producido — ocupa full en móvil, 1 col en desktop */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-[24px] border-2 border-[#004B23] shadow-2xl relative overflow-hidden">
          <label className="text-[10px] font-black text-[#004B23] uppercase tracking-widest block mb-1">Producido</label>
          <input
            type="number"
            value={currentHour.producido || ''}
            onChange={(e) => handleProducidoChange(Number(e.target.value))}
            className="w-full text-3xl font-mono font-black text-[#004B23] outline-none bg-transparent"
            placeholder="0"
            inputMode="numeric"
          />
          <div className="absolute right-4 bottom-4 opacity-10">
            <CheckCircle2 size={40} />
          </div>
        </div>

        {/* A Justificar */}
        <MetricCard
          label="A Justificar"
          value={`${currentHour.justificar.toFixed(1)} min`}
          icon={AlertCircle}
          color={currentHour.justificar > 0 ? "red" : "gray"}
        />

        {/* Justificado */}
        <MetricCard
          label="Justificado"
          value={`${currentHour.justificado.toFixed(1)} min`}
          icon={Settings}
          color={currentHour.justificar === currentHour.justificado && currentHour.justificar > 0 ? "green" : "orange"}
        />

        {/* Dif a Justificar */}
        <MetricCard
          label="Dif a Justificar"
          value={`${(currentHour.justificar - currentHour.justificado).toFixed(1)} min`}
          icon={Settings}
          color={currentHour.justificar === currentHour.justificado && currentHour.justificar > 0 ? "green" : "orange"}
        />

        {/* BOTÓN FINALIZAR — full width en móvil, 2 cols en desktop */}
          <button
            onClick={handleFinalizar}
            disabled={currentHour.closed}
            className={`col-span-2 lg:col-span-2 py-5 sm:py-6 rounded-[24px] text-white font-black text-lg sm:text-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
              currentHour.closed
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#004B23] hover:bg-[#003317] shadow-green-900/20'
            }`}
          >
          <CheckCircle2 size={28} className="shrink-0" />
          <span className="truncate">
            {currentHour.closed ? 'HORA CERRADA' : `FINALIZAR HORA ${currentHour.hour}`}
          </span>
        </button>
      </div>

      {/* CUERPO PRINCIPAL: Paradas (primero) + Comentarios — columna en móvil, fila en desktop */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">

        {/* SECCIÓN REGISTRO DE PARADAS */}
        <div className="flex-1 bg-white rounded-[32px] p-5 sm:p-8 border border-gray-100 shadow-2xl space-y-5 sm:space-y-6 min-w-0">
          <div className="flex items-center gap-2 border-b pb-4 border-gray-50">
            <PlusCircle size={20} className="text-[#004B23] shrink-0" />
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-tighter">Registrar Parada de Planta</h3>
          </div>

          {/* FORMULARIO DE PARADA — mobile: 2 cols; desktop: 12 cols */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3 sm:gap-4">

            {/* Código */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2 space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Código (Doble Tap)</label>
              <input
                type="text"
                value={newStop.codigo}
                onClick={handleTap}
                onDoubleClick={() => setIsModalOpenBuscadorCode(true)}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl font-bold uppercase text-blue-600 focus:ring-2 ring-[#D4E157] transition-all text-sm"
                placeholder="E1..."
              />
            </div>

            {/* Tipo */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2 space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Tipo</label>
              <div className="w-full px-3 py-3 bg-gray-100 rounded-xl text-[9px] sm:text-[10px] font-black text-gray-500 flex items-center h-[46px]">
                {newStop.tipo || '---'}
              </div>
            </div>

            {/* Descripción — full width en móvil */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-4 space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Descripción</label>
              <div className="w-full px-3 py-3 bg-gray-100 rounded-xl text-xs text-gray-600 flex items-center h-[46px] italic truncate">
                {newStop.descripcion || 'Seleccione código...'}
              </div>
            </div>

            {/* Minutos */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2 space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Minutos</label>
              <input
                type="number"
                value={newStop.tiempoMinutos || ''}
                onChange={(e) => setNewStop({ ...newStop, tiempoMinutos: Number(e.target.value) })}
                className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 ring-[#D4E157] text-sm"
                placeholder="0"
                inputMode="numeric"
              />
            </div>

            {/* Botón Agregar */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2 flex items-end">
              <button
                onClick={handleAddStop}
                className="w-full h-[46px] bg-[#004B23] text-white rounded-xl font-black text-xs hover:bg-[#003317] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <PlusCircle size={16} />
                <span>AGREGAR</span>
              </button>
            </div>
          </div>

          {/* LISTADO DE PARADAS — prioritario en móvil */}
          <div className="space-y-3 mt-2">
            {currentHour.stops.map(stop => (
              <div
                key={stop.id}
                className="group flex items-center justify-between bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 hover:border-[#D4E157] transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                  <div className="bg-[#004B23] text-white px-2 sm:px-3 py-1 rounded-lg font-mono font-bold text-xs shrink-0">
                    {stop.codigo}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">{stop.tipo}</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-700 truncate">{stop.descripcion}</span>
                  </div>
                  <div className="flex gap-3 sm:gap-4 shrink-0">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-gray-300 uppercase">Tiempo</p>
                      <p className="font-mono font-black text-gray-700 text-sm">{stop.tiempoMinutos} min</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-[8px] font-black text-gray-300 uppercase">Frec</p>
                      <p className="font-mono font-black text-gray-700 text-sm">{stop.frecuencia}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteStop(stop.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors ml-2 shrink-0 active:scale-90"
                >
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
        <div className="lg:w-[380px] xl:w-[420px] bg-white rounded-[32px] p-5 sm:p-8 border border-gray-100 shadow-2xl shrink-0">
          <div className="flex items-center gap-2 mb-5 sm:mb-6">
            <MessageSquare size={20} className="text-[#004B23] shrink-0" />
            <h3 className="text-sm font-black text-gray-700 uppercase">Comentarios por Área</h3>
          </div>

          <div className={`grid grid-cols-1 gap-5 sm:gap-6 ${
            canEditMantto && canEditCalidad
              ? 'sm:grid-cols-3 lg:grid-cols-1'
              : canEditMantto || canEditCalidad
                ? 'sm:grid-cols-2 lg:grid-cols-1'
                : 'grid-cols-1'
          }`}>
            <CommentBox
              label="Manufactura (MNF)"
              value={comments.mnf}
              onChange={(v: string) => setComments({ ...comments, mnf: v })}
              color="#004B23"
            />
            {canEditMantto && (
              <CommentBox
                label="Mantenimiento"
                value={comments.mantto}
                onChange={(v: string) => setComments({ ...comments, mantto: v })}
                disabled={!canEditMantto}
                color="#f97316"
              />
            )}
            {canEditCalidad && (
              <CommentBox
                label="Calidad"
                value={comments.calidad}
                onChange={(v: string) => setComments({ ...comments, calidad: v })}
                disabled={!canEditCalidad}
                color="#10b981"
              />
            )}
          </div>
        </div>
      </div>

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
    <div className={`p-4 sm:p-5 rounded-[24px] border border-transparent shadow-2xl ${colorMap[color] || colorMap.gray} bg-white transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <label className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-tight">{label}</label>
        <Icon size={16} className="opacity-40 shrink-0" />
      </div>
      <div className="text-xl sm:text-2xl font-mono font-black">{value}</div>
    </div>
  );
};

const CommentBox = ({ label, value, onChange, disabled, color }: any) => (
  <div className="space-y-2">
    <label
      className="text-[10px] font-black uppercase tracking-wider block ml-2"
      style={{ color: disabled ? '#ccc' : color }}
    >
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