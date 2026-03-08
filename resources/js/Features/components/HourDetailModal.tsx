/**
 * HourDetailModal.tsx - Modal con detalle de una hora específica
 */
import React from 'react';
import { X } from 'lucide-react';
import { HourlyProduction } from '../types';

interface HourDetailModalProps {
  hour: HourlyProduction;
  onClose: () => void;
}

const HourDetailModal: React.FC<HourDetailModalProps> = ({ hour, onClose }) => {
  const getStatusBadge = () => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[hour.status] || colors.blue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 hover:bg-white hover:bg-opacity-20 rounded-full p-2"
          >
            <X size={24} />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Detalle de Hora</h2>
              <p className="text-lg">{hour.hour}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold ${getStatusBadge()}`}>
              {hour.status === 'blue' ? '100%' : hour.status === 'yellow' ? '90-99%' : '<90%'}
            </span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="PH Estimado" value={hour.estimado.toString()} color="blue" />
            <MetricCard label="PH Producido" value={hour.producido.toString()} color="green" />
            <MetricCard label="A Justificar" value={`${hour.justificar.toFixed(2)} min`} color="red" />
            <MetricCard label="Justificado" value={`${hour.justificado.toFixed(2)} min`} color="green" />
          </div>

          {/* Paradas */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Paradas Registradas</h3>
            {hour.stops.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay paradas registradas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Código</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Tipo</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Descripción</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Tiempo</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Frecuencia</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hour.stops.map(stop => (
                      <tr key={stop.id} className="border-t">
                        <td className="px-4 py-2 font-mono text-sm">{stop.codigo}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            stop.tipo === 'MAQUINA' ? 'bg-red-100 text-red-800' :
                            stop.tipo === 'PROCESO' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {stop.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">{stop.descripcion}</td>
                        <td className="px-4 py-2 text-center text-sm">{stop.tiempoMinutos.toFixed(0)} min</td>
                        <td className="px-4 py-2 text-center text-sm">{stop.frecuencia}x</td>
                        <td className="px-4 py-2 text-center text-sm font-bold">
                          {stop.tiempoMinutos * stop.frecuencia} min
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Comentarios */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Comentarios por Área</h3>
            <div className="space-y-3">
              <CommentBox label="MNF" value={hour.comments.mnf} />
              <CommentBox label="MANTTO" value={hour.comments.mantto} />
              <CommentBox label="CALIDAD" value={hour.comments.calidad} />
            </div>
          </div>
        </div>

        <div className="border-t p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className={`bg-${color}-50 border-l-4 border-${color}-500 p-4 rounded-lg`}>
    <div className="text-xs text-gray-600 mb-1">{label}</div>
    <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
  </div>
);

const CommentBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
    <div className="text-sm text-gray-800">{value || 'Sin comentarios'}</div>
  </div>
);

export default HourDetailModal;