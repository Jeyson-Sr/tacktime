import React from 'react';
import { X, FileText, Activity, AlertCircle, MessageSquare, Clock, ArrowRightCircle } from 'lucide-react';
import { HourlyProduction } from '../types';

// --- CONFIGURACIÓN DE ESTILOS SIRVO/AJE ---
const AJE = {
  lima: '#D4E157',
  bosque: '#004B23',
  fondo: '#F8FAFC',
};

interface HourDetailModalProps {
  hour: HourlyProduction;
  onClose: () => void;
}

const HourDetailModal: React.FC<HourDetailModalProps> = ({ hour, onClose }) => {
  
  const getStatusInfo = () => {
    switch (hour.status) {
      case 'blue': 
        return { label: 'CUMPLIMIENTO 100%', color: 'bg-[#D4E157] text-[#004B23]', dot: 'bg-[#004B23]' };
      case 'yellow': 
        return { label: 'EFICIENCIA 90-99%', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' };
      case 'red': 
        return { label: 'BAJA EFICIENCIA <90%', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
      default: 
        return { label: 'PENDIENTE', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#004B23]/50 backdrop-blur-md">
      <div className="bg-[#F8FAFC] w-full max-w-4xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
        
        {/* HEADER: Identidad y Estado */}
        <div className="bg-[#004B23] p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/10">
                    <Clock size={32} className="text-[#D4E157]" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Reporte de Producción</p>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">HORA {hour.hour}</h2>
                </div>
            </div>
            
            <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs shadow-lg ${status.color}`}>
                <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                {status.label}
            </div>
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* SECCIÓN 1: MÉTRICAS CLAVE */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricBox label="PH Estimado" value={hour.estimado} color="blue" icon={<Activity size={14}/>} />
            <MetricBox label="PH Producido" value={hour.producido} color="green" icon={<ArrowRightCircle size={14}/>} />
            <MetricBox label="A Justificar" value={`${hour.justificar.toFixed(1)} min`} color="red" icon={<AlertCircle size={14}/>} />
            <MetricBox label="Justificado" value={`${hour.justificado.toFixed(1)} min`} color="lime" icon={<FileText size={14}/>} />
          </div>

          {/* SECCIÓN 2: LOG DE PARADAS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
                <AlertCircle size={18} className="text-[#004B23]" />
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-tight">Registro de Paradas Técnicas</h3>
            </div>
            
            <div className="space-y-2">
              {hour.stops.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[24px] py-10 text-center">
                    <p className="text-gray-300 font-bold text-sm italic tracking-wide">Sin paradas registradas en este periodo</p>
                </div>
              ) : (
                hour.stops.map(stop => (
                  <div key={stop.id} className="bg-white p-5 rounded-[24px] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-[#D4E157] transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#004B23] text-white font-mono font-black px-4 py-2 rounded-xl text-sm shadow-md">
                            {stop.codigo}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{stop.tipo}</span>
                            <span className="text-sm font-bold text-gray-700">{stop.descripcion}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 px-4 py-2 bg-gray-50 rounded-2xl">
                        <div className="text-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase">Tiempo</p>
                            <p className="font-mono font-black text-gray-800">{stop.tiempoMinutos} min</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase">Frec</p>
                            <p className="font-mono font-black text-gray-800">{stop.frecuencia}x</p>
                        </div>
                        <div className="text-center border-l border-gray-200 pl-4">
                            <p className="text-[8px] font-black text-[#004B23] uppercase leading-none mb-1">Total</p>
                            <p className="font-mono font-black text-[#004B23]">{stop.tiempoMinutos * stop.frecuencia} min</p>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECCIÓN 3: OBSERVACIONES POR DEPARTAMENTO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
                <MessageSquare size={18} className="text-[#004B23]" />
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-tight">Observaciones de Planta</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CommentDisplay label="Manufactura" value={hour.comments.mnf} color="#004B23" />
                <CommentDisplay label="Mantenimiento" value={hour.comments.mantto} color="#f97316" />
                <CommentDisplay label="Calidad" value={hour.comments.calidad} color="#10b981" />
            </div>
          </div>

        </div>

        {/* FOOTER: Acción de cierre */}
        <div className="p-8 bg-white border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-5 bg-[#004B23] text-white font-black rounded-[24px] hover:bg-[#003317] transition-all shadow-xl active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTES AUXILIARES ---

const MetricBox = ({ label, value, color, icon }: any) => {
    const themes: any = {
        blue: 'bg-blue-50 border-blue-100 text-blue-700',
        green: 'bg-green-50 border-green-100 text-green-700',
        red: 'bg-red-50 border-red-100 text-red-700',
        lime: 'bg-[#D4E157]/10 border-[#D4E157]/30 text-[#004B23]'
    };

    return (
        <div className={`p-5 rounded-[28px] border-2 shadow-sm ${themes[color]}`}>
            <div className="flex items-center gap-2 opacity-60 mb-1">
                {icon}
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-2xl font-mono font-black">{value}</div>
        </div>
    );
};

const CommentDisplay = ({ label, value, color }: any) => (
    <div className="bg-white border border-gray-100 p-5 rounded-[24px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
        <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color }}>{label}</p>
        <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
            {value || 'Sin observaciones registradas.'}
        </p>
    </div>
);

export default HourDetailModal;