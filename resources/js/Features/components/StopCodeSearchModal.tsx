import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Hash, Info, ChevronRight, Activity } from 'lucide-react';
import { fetchStopCodes } from '../database';

// --- CONFIGURACIÓN DE ESTILOS SIRVO/AJE ---
const AJE = {
  lima: '#D4E157',
  bosque: '#004B23',
  fondo: '#F8FAFC',
};

interface StopCode {
  codigo: string;
  detalle: string;
  tipo_n0: string;
  nivel_1: string;
  nivel_2: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: StopCode) => void;
}

const StopCodeSearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [catalog, setCatalog] = useState<StopCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchStopCodes().then(data => {
        setCatalog(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const filteredCodes = useMemo(() => {
    const term = searchTerm.toUpperCase();
    return catalog.filter(item => 
      item.codigo.toUpperCase().includes(term) || 
      item.detalle.toUpperCase().includes(term)
    );
  }, [searchTerm, catalog]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-2 inset-0 z-[200] flex items-start justify-center p-4 bg-[#004B23]/40 backdrop-blur-md rounded-[30px]">
      <div className="sticky top-10 -mt-100 bg-white w-full max-w-3xl rounded-[40px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/20">
        
        {/* HEADER: Título y Buscador */}
        <div className="p-8 pb-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-[#004B23] p-2 rounded-xl text-white">
                <Hash size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#004B23] uppercase tracking-tighter">Catálogo de Paradas</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selección de Código Técnico</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all text-gray-400"
            >
              <X size={24} />
            </button>
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#004B23]">
              <Search size={22} />
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Buscar por código (ej: A1) o descripción de falla..."
              className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:border-[#D4E157] focus:bg-white outline-none font-bold text-lg transition-all placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CONTENIDO: Lista de Resultados */}
        <div className="flex-1 overflow-y-auto px-8 pb-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-[#004B23] rounded-full animate-spin" />
              <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Sincronizando Base de Datos...</p>
            </div>
          ) : filteredCodes.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredCodes.map((item) => (
                <button
                  key={item.codigo}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="flex items-center p-4 bg-white border-2 border-gray-50 hover:border-[#D4E157] rounded-[24px] transition-all text-left group hover:shadow-md active:scale-[0.99]"
                >
                  {/* Etiqueta de Código */}
                  <div className="bg-[#004B23] text-white font-mono font-black px-4 py-3 rounded-2xl min-w-[70px] text-center shadow-lg group-hover:bg-[#003317] transition-colors">
                    {item.codigo}
                  </div>

                  {/* Información */}
                  <div className="ml-5 flex-1 overflow-hidden">
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        <Activity size={10} />
                        {item.tipo_n0 || 'TIPO'}
                    </div>
                    <div className="text-md font-bold text-gray-800 group-hover:text-[#004B23] transition-colors truncate">
                        {item.detalle}
                    </div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500">{item.nivel_1}</span>
                        <span className="text-gray-300">/</span>
                        <span className="truncate">{item.nivel_2}</span>
                    </div>
                  </div>

                  {/* Indicador de Acción */}
                  <div className="ml-4 p-2 rounded-full bg-gray-50 group-hover:bg-[#D4E157] transition-all">
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-[#004B23]" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <Info size={60} className="mb-4" />
              <p className="font-black text-center uppercase tracking-tighter">No se encontraron resultados</p>
              <p className="text-xs font-bold text-center italic">Intente con otro término de búsqueda</p>
            </div>
          )}
        </div>

        {/* FOOTER: Resumen */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center px-10">
          <div className="flex gap-4">
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-gray-400 uppercase leading-none">Resultados</span>
                <span className="text-lg font-mono font-black text-[#004B23]">{filteredCodes.length}</span>
            </div>
          </div>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">SIRVO SYSTEM v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default StopCodeSearchModal;