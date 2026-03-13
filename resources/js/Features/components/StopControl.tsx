/**
 * ============================================
 * STOPCONTROL.TSX - Control de Paradas
 * ============================================
 * 
 * Componente para registrar producción horaria y paradas.
 * Calcula automáticamente minutos a justificar y estado.
 */
import React, { useState, useEffect, use } from 'react';
import { HourlyProduction, StopRecord, HourComments } from '../types';
import { calculateStatus, calculateJustificar, calculateJustificado, generateId } from '../utils/calculations';
import StopCodeSearchModal from './StopCodeSearchModal';
// Importamos la función y el tipo desde tu base de datos
import { fetchStopCodes } from '../database';
interface StopCode {
  codigo: string;
  detalle: string;
  tipo_n0: string;
  nivel_1: string;
  nivel_2: string;
}


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
}

const TIPO_MAP: Record<string, string> = {
  'EQ': 'EQUIPO',
  'OPD': 'OPERATIVAS',
  'OR': 'ORGANIZACIONALES',
  'PD': 'PLANIFICADAS',
  'QD': 'PERDIDAS DE CALIDAD',
  'RD': 'RUTINARIAS',
  'TNP': 'TIEMPO NO PROGRAMADO'
};

const StopControl: React.FC<StopControlProps> = ({
  currentHour,
  onUpdateHour,
  onCloseHour,
  productData,
  BPH
}) => {
  const [isModalOpenBuscadorCode, setIsModalOpenBuscadorCode] = useState(false);
  const [catalog, setCatalog] = useState<StopCode[]>([]);
  const [newStop, setNewStop] = useState({
    codigo: '',
    tipo: '',
    descripcion: '',
    tiempoMinutos: 0,
    frecuencia: 1, // FRECUENCIA MANTENIDA
  });

  const [comments, setComments] = useState<HourComments>({
    ...currentHour.comments,
    mnf: '',
    mantto: '',
    calidad: ''
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
    onUpdateHour({ producido: value, justificar, status });
  };

  const handleAddStop = () => {
    if (!newStop.codigo || newStop.tiempoMinutos <= 0) {
      alert('Faltan datos en la parada (Código o Tiempo)');
      return;
    }

    const totalActual = currentHour.stops.reduce((acc, s) => acc + s.tiempoMinutos, 0);
    if ((totalActual + newStop.tiempoMinutos) > (currentHour.justificar + 0.1)) {
      alert(`Error: No puede justificar más de los ${currentHour.justificar.toFixed(0)} min requeridos.`);
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

    // Reset con frecuencia en 1
    setNewStop({ codigo: '', tipo: '', descripcion: '', tiempoMinutos: 0, frecuencia: 1 });
  };

  const handleDeleteStop = (id: string) => {
    const updatedStops = currentHour.stops.filter(s => s.id !== id);
    const justificado = calculateJustificado(updatedStops);
    onUpdateHour({ stops: updatedStops, justificado });
  };

  const handleCloseClick = () => {
    const { justificar, justificado, ...rest } = currentHour;
    
    if (!currentHour.producido || currentHour.producido <= 0) {
      alert('Faltan datos en la parada (Producido)');
      return;
    }

    // if (justificado !== justificar) {
    //   alert('Error: Justificado no coincide con Justificar.');
    //   return;
    // }
    
    
    console.log("%c--- REPORTE HORA " + currentHour.hour + " ---", "color: #4f46e5; font-weight: bold;");
    console.log("Paradas:", currentHour.stops);
    console.log("Comentarios:", comments);
    console.log("Justificar:", justificar, "Justificado:", justificado);
    // Keep existing comments when updating the hour field
    // Remove invalid hour property; HourComments does not include it
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-5 pb-3 border-b-2 border-indigo-600">
        <h2 className="text-xl font-bold text-gray-800">
          Control de Paradas - Hora {currentHour.hour}
        </h2>
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
          BPH: {BPH.toLocaleString()}
        </span>
      </div>

      {/* Info Producto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <InfoBox label="FORMATO" value={productData.formato} />
        <InfoBox label="MARCA" value={productData.marca} />
        <InfoBox label="SABOR" value={productData.sabor} />
        <InfoBox label="PH ESTIMADO" value={productData.palletsPorHora.toString()} />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 bg-gray-50 p-4 rounded-lg border">
        <InfoBox label="ESTIMADO" value={currentHour.estimado.toString()} color="blue" />
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-bold">PRODUCIDO</label>
          <input
            type="number"
            value={currentHour.producido || ''}
            onChange={(e) => handleProducidoChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold outline-none"
          />
        </div>
        <InfoBox label="A JUSTIFICAR" value={`${currentHour.justificar.toFixed(0)} min`} color="red" />
        <InfoBox label="JUSTIFICADO" value={`${currentHour.justificado.toFixed(0)} min`} color="green" />
      </div>

      {/* REGISTRO DE PARADA (CON FRECUENCIA) */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 text-xs uppercase">Registrar Parada</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
            <input
              type="text" placeholder="Código" value={newStop.codigo}
              onDoubleClick={() => setIsModalOpenBuscadorCode(true)}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="px-3 py-2 border rounded-lg font-bold uppercase focus:border-indigo-500 outline-none"
            />
          <div className="px-3 py-2 border rounded-lg bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500 uppercase text-center">
            {newStop.tipo || 'TIPO'}
          </div>
          <div className="md:col-span-2 px-3 py-2 border rounded-lg bg-gray-100 text-xs flex items-center italic text-gray-600">
            {newStop.descripcion || 'Descripción automática'}
          </div>
          <input
            type="number" placeholder="Minutos" value={newStop.tiempoMinutos || ''}
            onChange={(e) => setNewStop({ ...newStop, tiempoMinutos: Number(e.target.value) })}
            className="px-3 py-2 border rounded-lg font-bold"
          />
          <input
            type="number" placeholder="Frecuencia" value={newStop.frecuencia}
            onChange={(e) => setNewStop({ ...newStop, frecuencia: Number(e.target.value) })}
            className="px-3 py-2 border rounded-lg font-bold"
          />
        </div>
        <button
          onClick={handleAddStop}
          className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700"
        >
          Agregar Parada
        </button>
      </div>


            {/* Modal Takt Time */}
            {isModalOpenBuscadorCode && (
              <StopCodeSearchModal 
                isOpen={isModalOpenBuscadorCode}
                onClose={() => setIsModalOpenBuscadorCode(false)}
                onSelect={(code: StopCode) => setNewStop(prev => ({
                  ...prev,
                  codigo: code.codigo,
                  descripcion: code.detalle,
                  tipo: TIPO_MAP[code.tipo_n0] || 'EQUIPO'
                }))}
              />
            )}



      {/* Lista de Paradas */}
      <div className="mb-6 space-y-2">
        {currentHour.stops.map(stop => (
          <div key={stop.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-500 text-sm">
            <div className="flex-1 grid grid-cols-6 gap-2 items-center">
              <span className="font-bold">{stop.codigo}</span>
              <span className="text-[10px] text-indigo-600 font-bold uppercase">{stop.tipo}</span>
              <span className="col-span-2 text-gray-700 truncate">{stop.descripcion}</span>
              <span className="font-bold text-center">{stop.tiempoMinutos} min</span>
              <span className="text-gray-500 text-center">Frec: {stop.frecuencia}</span>
            </div>
            <button onClick={() => handleDeleteStop(stop.id)} className="ml-4 text-red-500">🗑️</button>
          </div>
        ))}
      </div>

      {/* Comentarios Consolidados por Área */}
      <div className="mb-8 border-t pt-5 space-y-4">
        <h3 className="font-bold text-gray-700 text-sm uppercase">Comentarios de la Hora</h3>
        
        <div className="space-y-1">
          <label className="text-[10px] font-black text-indigo-600 uppercase">Manufactura (MNF)</label>
          <input
            type="text" placeholder="General de la hora..."
            value={comments.mnf}
            onChange={(e) => setComments({ ...comments, mnf: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="space-y-1">
          <label className={`text-[10px] font-black uppercase ${canEditMantto ? 'text-orange-600' : 'text-gray-400'}`}>Mantenimiento</label>
          <input
            type="text" disabled={!canEditMantto}
            value={comments.mantto}
            onChange={(e) => setComments({ ...comments, mantto: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg ${!canEditMantto ? 'bg-gray-100' : 'border-orange-200'}`}
          />
        </div>

        <div className="space-y-1">
          <label className={`text-[10px] font-black uppercase ${canEditCalidad ? 'text-green-600' : 'text-gray-400'}`}>Calidad</label>
          <input
            type="text" disabled={!canEditCalidad}
            value={comments.calidad}
            onChange={(e) => setComments({ ...comments, calidad: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg ${!canEditCalidad ? 'bg-gray-100' : 'border-green-200'}`}
          />
        </div>
      </div>

      <button
      onClick={handleCloseClick} 
      className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all uppercase tracking-widest">
        Finalizar Hora
      </button>
    </div>
  );
};


const InfoBox: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'gray' }) => (
  <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
    <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">{label}</div>
    <div className={`text-base font-black text-${color}-800`}>{value}</div>
  </div>
);

export default StopControl;