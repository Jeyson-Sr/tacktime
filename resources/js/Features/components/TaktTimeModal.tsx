/**
 * TaktTimeModal.tsx - Modal con vista de todas las horas de producción
 */
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { HourlyProduction } from '../types';
import HourDetailModal from './HourDetailModal';

interface TaktTimeModalProps {
  onClose: () => void;
  hourlyRecords: HourlyProduction[];
  linea: string;
  productInfo: string;
}

const TaktTimeModal: React.FC<TaktTimeModalProps> = ({ onClose, hourlyRecords, linea, productInfo }) => {
  const [selectedHour, setSelectedHour] = useState<HourlyProduction | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blue': return 'border-l-blue-500 bg-blue-50';
      case 'yellow': return 'border-l-yellow-400 bg-yellow-50';
      case 'red': return 'border-l-red-500 bg-red-50';
      case 'green': return 'border-l-green-500 bg-green-50';
      case 'gray': return 'border-l-gray-300 bg-gray-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  const dayShift = hourlyRecords.slice(0, 12);
  const nightShift = hourlyRecords.slice(12, 24);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 hover:bg-white hover:bg-opacity-20 rounded-full p-2"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-1">Takt Time {linea}</h2>
            <p className="text-sm opacity-90">{productInfo}</p>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ShiftSection 
                title="📊 PRIMER TURNO (Día)" 
                data={dayShift} 
                getStatusColor={getStatusColor}
                onHourClick={setSelectedHour}
              />
              <ShiftSection 
                title="📈 SEGUNDO TURNO (Noche)" 
                data={nightShift} 
                getStatusColor={getStatusColor}
                onHourClick={setSelectedHour}
              />
            </div>
          </div>

          <div className="border-t p-6 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700"
            >
              Cerrar
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

interface ShiftSectionProps {
  title: string;
  data: HourlyProduction[];
  getStatusColor: (status: string) => string;
  onHourClick: (hour: HourlyProduction) => void;
}

const ShiftSection: React.FC<ShiftSectionProps> = ({ title, data, getStatusColor, onHourClick }) => (
  <div>
    <div className="bg-gray-100 rounded-lg p-3 mb-4">
      <h3 className="font-bold text-gray-700">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {data.map((item, index) => (
        <div
          key={index}
          onClick={() => item.closed && onHourClick(item)}
          className={`border-l-4 rounded-lg p-3 ${getStatusColor(item.status)} ${
            item.closed ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-50'
          }`}
        >
          <div className="text-xs font-semibold text-gray-600 mb-1">
            Hr: {item.hour}
          </div>
          <div className="text-xs text-gray-700">
            PH Estimado: <span className="font-bold">{item.estimado}</span>
          </div>
          <div className="text-xs text-gray-700">
            PH Producido: <span className="font-bold">{item.producido}</span>
          </div>
          <div className="text-xs text-gray-700">
            Cumplimiento: <span className="font-bold">{((item.producido / item.estimado)* 100).toFixed(1)}%</span>
          </div>
          {item.closed && (
            <div className="text-xs text-indigo-600 mt-1">👁️ Click para ver detalle</div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default TaktTimeModal;