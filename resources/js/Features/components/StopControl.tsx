/**
 * ============================================
 * STOPCONTROL.TSX - Control de Paradas
 * ============================================
 * 
 * Componente para registrar producción horaria y paradas.
 * Calcula automáticamente minutos a justificar y estado.
 */
import React, { useState, useEffect } from 'react';
import { HourlyProduction, StopRecord, HourComments } from '../types';
import { calculateStatus, calculateJustificar, calculateJustificado, generateId } from '../utils/calculations';
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

// Mapeo según la imagen proporcionada
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
  // Estado para el catálogo de códigos
  const [catalog, setCatalog] = useState<StopCode[]>([]);
  
  // Estado para nuevo registro de parada
  const [newStop, setNewStop] = useState({
    codigo: '',
    tipo: '' as any,
    descripcion: '',
    tiempoMinutos: 0,
    frecuencia: 1,
  });

  const [comments, setComments] = useState<HourComments>(currentHour.comments);

  // Cargar catálogo al montar el componente
  useEffect(() => {
    const loadCatalog = async () => {
      const data = await fetchStopCodes();
      setCatalog(data);
    };
    loadCatalog();
  }, []);

  /**
   * Lógica de búsqueda automática por código
   */
  const handleCodeChange = (code: string) => {
    const cleanCode = code.toUpperCase();
    const found = catalog.find(item => item.codigo === cleanCode);

    if (found) {
      setNewStop({
        ...newStop,
        codigo: cleanCode,
        descripcion: found.detalle,
        tipo: TIPO_MAP[found.tipo_n0] || 'EQUIPO'
      });
    } else {
      setNewStop({
        ...newStop,
        codigo: cleanCode,
        descripcion: '',
        tipo: ''
      });
    }
  };

  const handleProducidoChange = (value: number) => {
    const justificar = calculateJustificar(currentHour.estimado, value);
    const status = calculateStatus(value, currentHour.estimado);
    onUpdateHour({ producido: value, justificar, status });
  };

  const handleAddStop = () => {
    if (!newStop.codigo || !newStop.descripcion || newStop.tiempoMinutos <= 0) {
      alert('Código no válido o faltan datos de tiempo');
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

    setNewStop({
      codigo: '',
      tipo: '',
      descripcion: '',
      tiempoMinutos: 0,
      frecuencia: 1
    });
  };

  const handleDeleteStop = (id: string) => {
    const updatedStops = currentHour.stops.filter(s => s.id !== id);
    const justificado = calculateJustificado(updatedStops);
    onUpdateHour({ stops: updatedStops, justificado });
  };

  const handleCloseClick = () => {
    const missing = currentHour.justificar - currentHour.justificado;
    if (missing > 1 && !confirm(`Faltan ${missing.toFixed(2)} min. ¿Cerrar?`)) return;
    onUpdateHour({ comments });
    onCloseHour();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b-2 border-indigo-600 ">
        Control de Paradas - Hora {currentHour.hour} / {BPH.toLocaleString()}- BPH 
      </h2>

      {/* Información del Producto y Métricas (Sin cambios) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <InfoBox label="FORMATO" value={productData.formato} />
        <InfoBox label="MARCA" value={productData.marca} />
        <InfoBox label="SABOR" value={productData.sabor} />
        <InfoBox label="PH ESTIMADO" value={productData.palletsPorHora.toString()} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 bg-gray-50 p-4 rounded-lg">
        <InfoBox label="ESTIMADO" value={currentHour.estimado.toString()} color="blue" />
        <div>
          <label className="block text-xs text-gray-500 mb-1">PRODUCIDO</label>
          <input
            type="number"
            value={currentHour.producido || ''}
            onChange={(e) => handleProducidoChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <InfoBox label="A JUSTIFICAR" value={`${currentHour.justificar.toFixed(0)} min`} color="red" />
        <InfoBox label="JUSTIFICADO" value={`${currentHour.justificado.toFixed(0)} min`} color="green" />
      </div>

      {/* Formulario de Paradas MODIFICADO */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Registrar Parada</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
          {/* INPUT DE CÓDIGO - Único que busca */}
          <input
            type="text"
            placeholder="Código"
            value={newStop.codigo}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
          />
          
          {/* TIPO - Ahora es un display de solo lectura */}
          <div className="px-3 py-2 border rounded-lg bg-gray-100 text-xs flex items-center justify-center text-center font-semibold text-gray-600">
            {newStop.tipo || 'TIPO'}
          </div>

          {/* DESCRIPCIÓN - Ahora es un display de solo lectura */}
          <div className="md:col-span-2 px-3 py-2 border rounded-lg bg-gray-100 text-sm flex items-center text-gray-700 italic">
            {newStop.descripcion || 'Descripción automática'}
          </div>

          <input
            type="number"
            placeholder="Tiempo (min)"
            value={newStop.tiempoMinutos || ''}
            onChange={(e) => setNewStop({ ...newStop, tiempoMinutos: Number(e.target.value) })}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Frecuencia"
            value={newStop.frecuencia}
            onChange={(e) => setNewStop({ ...newStop, frecuencia: Number(e.target.value) })}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={handleAddStop}
          className="w-full bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Agregar Parada
        </button>
      </div>

      {/* Lista de Paradas, Comentarios y Cierre (Sin cambios significativos) */}
      {/* ... (Resto del componente igual) */}
      {currentHour.stops.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Paradas Registradas</h3>
          <div className="space-y-2">
            {currentHour.stops.map(stop => (
              <div key={stop.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-500">
                <div className="flex-1 grid grid-cols-5 gap-2 text-sm">
                  <span className="font-bold">{stop.codigo}</span>
                  <span className="text-xs text-indigo-600 font-semibold">{stop.tipo}</span>
                  <span className="col-span-2 text-gray-700">{stop.descripcion}</span>
                  <span className="font-medium text-right">{stop.tiempoMinutos} min × {stop.frecuencia}</span>
                </div>
                <button onClick={() => handleDeleteStop(stop.id)} className="ml-3 text-red-600 hover:scale-110 transition-transform">🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Comentarios por Área</h3>
        <div className="space-y-2">
          {['mnf', 'mantto', 'calidad'].map((area) => (
            <input
              key={area}
              type="text"
              placeholder={area.toUpperCase()}
              value={(comments as any)[area]}
              onChange={(e) => setComments({ ...comments, [area]: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          ))}
        </div>
      </div>

      <button onClick={handleCloseClick} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 shadow-md">
        Cerrar Hora y Avanzar
      </button>
    </div>
  );
};

const InfoBox: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'gray' }) => (
  <div className="text-center p-3 bg-white rounded-lg border">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className={`text-base font-bold text-${color}-800`}>{value}</div>
  </div>
);

export default StopControl;