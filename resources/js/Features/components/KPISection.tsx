/**
 * KPISection.tsx - Sección de KPIs con barras de progreso
 */
import React from 'react';
import { KPI } from '../types';

interface KPISectionProps {
  kpis: KPI[];
}

const KPISection: React.FC<KPISectionProps> = ({ kpis }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      case 'total': return 'bg-gray-800';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-yellow-50';
      case 'danger': return 'bg-red-50';
      case 'total': return 'bg-gray-100';
      default: return 'bg-gray-50';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-700';
      case 'warning': return 'text-yellow-700';
      case 'danger': return 'text-red-700';
      case 'total': return 'text-gray-800';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b-2 border-indigo-600">
        KPIs de Producción
      </h2>

      <div className="space-y-4">
        {kpis.map((kpi, index) => (
          <div key={index} className={`rounded-lg p-4 ${getStatusBgColor(kpi.status)}`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-bold ${getStatusTextColor(kpi.status)}`}>
                {kpi.label}
              </span>
              <span className={`text-lg font-bold ${getStatusTextColor(kpi.status)}`}>
                {kpi.value.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getStatusColor(kpi.status)} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${kpi.status === 'total' ? 100 : Math.min(kpi.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPISection;