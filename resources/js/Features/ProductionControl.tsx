/**
 * ProductionControl.tsx - Componente principal del sistema
 */
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Factory, Settings } from 'lucide-react';
import InitialDataForm from './components/InitialDataForm';
import StopControl from './components/StopControl';
import KPISection from './components/KPISection';
import TaktTimeModal from './components/TaktTimeModal';
import { ProductionData, HourlyProduction, AppState, KPI } from './types';
import { fetchShiftHours } from './database';
import { calculateKPIs } from './utils/calculations';

const ProductionControl: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    productionData: null,
    currentHourIndex: 0,
    hourlyRecords: [],
    isInitialized: false
  });

  const [showTaktTimeModal, setShowTaktTimeModal] = useState(false);
  const [kpis, setKPIs] = useState<KPI[]>([]);

  // Inicializar producción
  const handleInitializeProduction = async (data: ProductionData) => {
    const shiftHours = await fetchShiftHours(data.turno);
    
    const hourlyRecords: HourlyProduction[] = shiftHours.map((hour, index) => ({
      hour,
      hourIndex: index,
      estimado: data.palletsPorHora,
      producido: 0,
      justificar: 0,
      justificado: 0,
      status: 'blue',
      stops: [],
      comments: { mnf: '', mantto: '', calidad: '' },
      closed: false
    }));

    setAppState({
      productionData: data,
      currentHourIndex: 0,
      hourlyRecords,
      isInitialized: true
    });
  };

  // Actualizar hora actual
  const updateCurrentHour = (updates: Partial<HourlyProduction>) => {
    setAppState(prev => {
      const newRecords = [...prev.hourlyRecords];
      newRecords[prev.currentHourIndex] = {
        ...newRecords[prev.currentHourIndex],
        ...updates
      };
      return { ...prev, hourlyRecords: newRecords };
    });
  };

  // Cerrar hora y avanzar
  const closeCurrentHour = () => {
    setAppState(prev => {
      const newRecords = [...prev.hourlyRecords];
      newRecords[prev.currentHourIndex].closed = true;
      
      return {
        ...prev,
        hourlyRecords: newRecords,
        currentHourIndex: Math.min(prev.currentHourIndex + 1, 11)
      };
    });
  };

  // Recalcular KPIs cuando cambian los registros
  useEffect(() => {
    if (appState.isInitialized) {
      const newKPIs = calculateKPIs(appState.hourlyRecords);
      setKPIs(newKPIs);
    }
  }, [appState.hourlyRecords, appState.isInitialized]);

  if (!appState.isInitialized || !appState.productionData) {
    return <InitialDataForm onSubmit={handleInitializeProduction} />;
  }

  const currentHour = appState.hourlyRecords[appState.currentHourIndex];

  // Función para generar código con año actual + 6 dígitos consecutivos
  const generateConsecutiveCode = (input: number | string): string => {
    const currentYear = new Date().getFullYear();
    const baseYear = currentYear * 1000000; // Multiplicar por 1,000,000 para dejar espacio para 6 dígitos
    
    // Convertir input a número y validar que esté en el rango de 6 dígitos
    const numInput = typeof input === 'string' ? parseInt(input, 10) : input;
    
    if (isNaN(numInput) || numInput < 0 || numInput > 999999) {
      throw new Error('El número debe estar entre 0 y 999999');
    }
    
    // Formatear a 6 dígitos con ceros a la izquierda
    const paddedInput = numInput.toString().padStart(6, '0');
    
    return `${currentYear}${paddedInput}`;
  };

  return (
    <div className="min-h-screen  p-5">
      <div className="max-w mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-lg shadow-lg p-4 mb-5">
          <div className="flex flex-wrap gap-6 items-center">
            <HeaderItem icon={Calendar} label="FECHA" value={appState.productionData.fecha} />
            <HeaderItem icon={Clock} label="TURNO" value={appState.productionData.turno} />
            <HeaderItem icon={Factory} label="LÍNEA" value={appState.productionData.linea} />
            <HeaderItem icon={User} label="INGENIERO" value={appState.productionData.ingeniero} />
            <HeaderItem icon={User} label="OPERADOR" value={appState.productionData.operador} />
          </div>
            <HeaderItem icon={Settings} label="OP" value={generateConsecutiveCode(appState.productionData.op)} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
          <div className="lg:col-span-3">
            <StopControl
              currentHour={currentHour}
              onUpdateHour={updateCurrentHour}
              onCloseHour={closeCurrentHour}
              productData={{
                formato: appState.productionData.formato,
                marca: appState.productionData.marca,
                sabor: appState.productionData.sabor,
                palletsPorHora: appState.productionData.palletsPorHora
              }}
              BPH={appState.productionData.bph}
              SKU={appState.productionData.sku}
              descripccion={appState.productionData.descripccion}
            />
          </div>
          <div>
            <KPISection kpis={kpis} />
          </div>
        </div>

        {/* Botón Ver Takt Time */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowTaktTimeModal(true)}
            className="bg-white text-indigo-600 font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl"
          >
            Ver Takt Time {appState.productionData.linea}
          </button>
        </div>

        {/* Modal Takt Time */}
        {showTaktTimeModal && (
          <TaktTimeModal
            onClose={() => setShowTaktTimeModal(false)}
            hourlyRecords={appState.hourlyRecords}
            linea={appState.productionData.linea}
            productInfo={`${appState.productionData.marca} ${appState.productionData.sabor} ${appState.productionData.formato}`}
          />
        )}
      </div>
    </div>
  );
};

interface HeaderItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const HeaderItem: React.FC<HeaderItemProps> = ({ icon: Icon, label, value }) => (
  value ? (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
        <Icon size={12} />
        {label}
      </span>
      <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
  ) : null
);

export default ProductionControl;