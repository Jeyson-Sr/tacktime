import React, { useState, useEffect, useMemo } from 'react';
import { fetchStopCodes } from '../database';

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

  // Cargar catálogo al abrir
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchStopCodes().then(data => {
        setCatalog(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  // Filtrado inteligente (por código o por descripción)
  const filteredCodes = useMemo(() => {
    const term = searchTerm.toUpperCase();
    return catalog.filter(item => 
      item.codigo.toUpperCase().includes(term) || 
      item.detalle.toUpperCase().includes(term)
    );
  }, [searchTerm, catalog]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header con Buscador */}
        <div className="p-5 border-b">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Buscador de Códigos</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl">✕</button>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
            <input
              autoFocus
              type="text"
              placeholder="Escribe el código (A1) o el nombre de la falla..."
              className="w-full pl-11 pr-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 ring-indigo-500 outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de Resultados */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {loading ? (
            <div className="p-10 text-center text-gray-500 font-bold animate-pulse">Cargando catálogo...</div>
          ) : filteredCodes.length > 0 ? (
            <div className="grid grid-cols-1 gap-1">
              {filteredCodes.map((item) => (
                <button
                  key={item.codigo}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="flex items-center p-3 hover:bg-indigo-50 rounded-xl transition-colors text-left group border border-transparent hover:border-indigo-200"
                >
                  <div className="bg-indigo-600 text-white font-black px-3 py-2 rounded-lg min-w-[50px] text-center shadow-sm group-hover:scale-105 transition-transform">
                    {item.codigo}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="text-sm font-bold text-gray-800 group-hover:text-indigo-900">{item.detalle}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.nivel_1} • {item.nivel_2}</div>
                  </div>
                  <div className="text-xs font-black text-indigo-400 px-2 opacity-0 group-hover:opacity-100 italic">Seleccionar →</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-gray-400 italic">No se encontraron códigos para "{searchTerm}"</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-2xl text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total de códigos encontrados: {filteredCodes.length}</p>
        </div>
      </div>
    </div>
  );
};

export default StopCodeSearchModal;