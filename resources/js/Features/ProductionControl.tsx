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
import { syncOeeProduction } from '@/Features/server/oeeProduction.api'; 

const ProductionControl: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    productionData: null,
    currentHourIndex: 0,
    hourlyRecords: [],
    isInitialized: false
  });

  const [showTaktTimeModal, setShowTaktTimeModal] = useState(false);
  const [kpis, setKPIs] = useState<KPI[]>([]);

const [isSavingShift, setIsSavingShift] = useState(false);
const [isShiftFinished, setIsShiftFinished] = useState(false);
const [finishShiftMessage, setFinishShiftMessage] = useState('');

  const persistState = async (state: AppState) => {
    try {
      await syncOeeProduction(state);
    } catch (error) {
      console.error('Error sincronizando producción:', error);
    }
  };

  // Inicializar producción
  const handleInitializeProduction = async (data: ProductionData) => {
  const shiftHours = await fetchShiftHours(data.turno);
  
  const hourlyRecords: HourlyProduction[] = shiftHours.map((hour, index) => ({
    hour,
    hourIndex: index,
    estimado: Number(data.palletsPorHora) || 0,
    producido: 0,
    justificar: 0,
    justificado: 0,
    status: 'blue',
    stops: [],
    comments: { mnf: '', mantto: '', calidad: '' },
    closed: false
  }));

  const newState: AppState = {
    productionData: data,
    currentHourIndex: 0,
    hourlyRecords,
    isInitialized: true
  };

  setAppState(newState);
  await persistState(newState);
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

  const updateHourByIndex = (
  hourIndex: number,
  updates: Partial<HourlyProduction>
) => {
  setAppState(prev => {
    const newRecords = [...prev.hourlyRecords];

    const realIndex = newRecords.findIndex(
      record => record.hourIndex === hourIndex
    );

    if (realIndex === -1) return prev;

    const current = newRecords[realIndex];
    const nextComments =
      updates.comments !== undefined
        ? {
            ...(current.comments ?? { mnf: '', mantto: '', calidad: '' }),
            ...updates.comments,
          }
        : current.comments;

    newRecords[realIndex] = {
      ...current,
      ...updates,
      comments: nextComments,
    };

    return {
      ...prev,
      hourlyRecords: newRecords,
    };
  });
};

  // Cerrar hora, avanzar y persistir (evita pérdida si refresh/logout)
  const closeCurrentHour = () => {
  setAppState(prev => {
    const newRecords = [...prev.hourlyRecords];

    newRecords[prev.currentHourIndex] = {
      ...newRecords[prev.currentHourIndex],
      closed: true
    };

    const isLastHour = prev.currentHourIndex >= newRecords.length - 1;

    const newState: AppState = {
      ...prev,
      hourlyRecords: newRecords,
      currentHourIndex: isLastHour
        ? prev.currentHourIndex
        : prev.currentHourIndex + 1
    };

    void persistState(newState);

    return newState;
  });
};


const handleFinishShift = async () => {
  setFinishShiftMessage('');

  const totalHours = appState.hourlyRecords.length;
  const closedHours = appState.hourlyRecords.filter(hour => hour.closed).length;
  const pendingHours = appState.hourlyRecords.filter(hour => !hour.closed);

  if (!appState.productionData) {
    setFinishShiftMessage('No hay datos de producción para guardar.');
    return;
  }

  if (totalHours === 0) {
    setFinishShiftMessage('No hay horas generadas para este turno.');
    return;
  }

  if (closedHours < totalHours) {
    const pendingText = pendingHours
      .map(hour => hour.hour)
      .join(', ');

    setFinishShiftMessage(`Aún faltan cerrar horas: ${pendingText}`);
    return;
  }

  try {
    setIsSavingShift(true);

    await syncOeeProduction(appState);

    setIsShiftFinished(true);
    setFinishShiftMessage('Turno finalizado y guardado correctamente en la base de datos.');
  } catch (error) {
    console.error('Error al finalizar turno:', error);
    setFinishShiftMessage('No se pudo guardar el turno. Revisa consola o conexión con backend.');
  } finally {
    setIsSavingShift(false);
  }
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

  // console.log(appState.productionData.op);

  const currentHour = appState.hourlyRecords[appState.currentHourIndex];

  const totalHours = appState.hourlyRecords.length;

const closedHours = appState.hourlyRecords.filter(hour => hour.closed).length;

const canFinishShift =
  totalHours > 0 &&
  closedHours === totalHours &&
  !isShiftFinished;

  // Función para generar código con año actual + 6 dígitos consecutivos
  const generateConsecutiveCode = (input: number | string | null): string | null => {
    if (!input) {
      console.log('El número no puede estar vacío');
      return null;
    }

    const currentYear = new Date().getFullYear();
    const baseYear = currentYear * 1000000; // Multiplicar por 1,000,000 para dejar espacio para 6 dígitos
    
    // Convertir input a número y validar que esté en el rango de 6 dígitos
    const numInput = typeof input === 'string' ? parseInt(input, 10) : input;
    
    if (isNaN(numInput) || numInput < 0 || numInput > 999999) {
      console.log('El número debe estar entre 0 y 999999');
      return null;
    }
    
    // Formatear a 6 dígitos con ceros a la izquierda
    const paddedInput = numInput.toString().padStart(6, '0');
    
    return `${currentYear}${paddedInput}`;
  };

  return (
    <div className="min-h-screen w-full p-5 text-gray-800" style={{ colorScheme: 'light' }}>
      <div className="max-w mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row  gap-5 justify-between items-center bg-white rounded-lg shadow-lg p-4 mb-5">
          <div className="flex flex-wrap gap-6 items-center">
            <HeaderItem icon={Calendar} label="FECHA" value={appState.productionData.fecha} />
            <HeaderItem icon={Clock} label="TURNO" value={appState.productionData.turno} />
            <HeaderItem icon={Factory} label="LÍNEA" value={appState.productionData.linea} />
            <HeaderItem icon={User} label="INGENIERO" value={appState.productionData.ingeniero} />
            <HeaderItem icon={User} label="OPERADOR" value={appState.productionData.operador} />
          </div>
          <div className='flex gap-5'>
            {appState.productionData.descripccion && (
            <div className="px-6 py-2 bg-gray-50 rounded-full border border-gray-100 flex flex-col items-center">
                <span className="text-[9px] font-black text-gray-400 uppercase">Detalle</span>
                <span className="font-mono font-bold text-[#004B23]">{appState.productionData.descripccion.toLocaleString()}</span>
            </div>
          )}
          <div className="px-6 py-2 bg-gray-50 rounded-full border border-gray-100 flex flex-col items-center">
                <span className="text-[9px] font-black text-gray-400 uppercase">BPH Nominal</span>
                <span className="font-mono font-bold text-[#004B23]">{appState.productionData.bph.toLocaleString()}</span>
            </div>

          </div>
            <HeaderItem icon={Settings} label="OP" value={generateConsecutiveCode(appState.productionData.op) || 'N/A'} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-5 mb-5">
          <div className="lg:col-span-4">
            {!isShiftFinished && (
              <StopControl
                currentHour={currentHour}
                onUpdateHour={updateCurrentHour}
                onUpdateHourByIndex={updateHourByIndex}
                onCloseHour={closeCurrentHour}
                productData={{
                  formato: appState.productionData.formato,
                  marca: appState.productionData.marca,
                  sabor: appState.productionData.sabor,
                palletsPorHora: Number(appState.productionData.palletsPorHora) || 0
                }}
                BPH={appState.productionData.bph}
                SKU={appState.productionData.sku}
                descripccion={appState.productionData.descripccion}
                hourlyRecords={appState.hourlyRecords}
              />
            )}
          </div>
          {/* <div>
            <KPISection kpis={kpis} />
          </div> */}
        </div>

        {/* Botón Ver Takt Time */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-5 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#004B23]">
                  Estado del turno
                </h3>

                <p className="text-sm font-semibold text-gray-500">
                  Horas cerradas: {closedHours} / {totalHours}
                </p>

                {finishShiftMessage && (
                  <p className={`mt-2 text-sm font-bold ${
                    isShiftFinished ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {finishShiftMessage}
                  </p>
                )}
              </div>

              {canFinishShift && (
                <button
                  onClick={handleFinishShift}
                  disabled={isSavingShift}
                  className="w-full md:w-auto bg-[#004B23] text-white font-black py-4 px-8 rounded-2xl shadow-lg hover:bg-[#003317] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingShift ? 'GUARDANDO TURNO...' : 'FINALIZAR TURNO Y GUARDAR'}
                </button>
              )}

              {isShiftFinished && (
                <div className="bg-green-50 text-green-700 font-black px-6 py-4 rounded-2xl border border-green-100">
                  TURNO FINALIZADO
                </div>
              )}
            </div>
          </div>
          {/* <button
            onClick={() => setShowTaktTimeModal(true)}
            className="bg-white text-indigo-600 font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl"
          >
            Ver Takt Time {appState.productionData.linea}
          </button> */}
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