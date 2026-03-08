import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchFormatoByLinea, 
  fetchMarcasByFormato, 
  fetchSaboresByMarca, 
  fetchEngineers, 
  fetchOperators,
  // Esta función debe retornar el objeto producto completo para obtener UM y PaqPallet
  fetchProductoDetalle 
} from '../database';
import { calculatePallets } from '../utils/calculations';



const InitialDataForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  // --- ESTADOS ---
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],  
    turno: 'DIA',
    linea: 'LINEA 1',
    ingeniero: '',
    operador: '',
    formato: '',
    marca: '',
    sabor: '',
    bph: 0,
    palletsPorHora: 0,
    um: 0,          // Guardamos estos para el cálculo
    paqPallet: 0    // Guardamos estos para el cálculo
  });

  const [options, setOptions] = useState({
    lineas: ['LINEA 1', 'LINEA 2','LINEA 3', 'LINEA 4', 'LINEA 5', 'LINEA 8', 'LINEA 9', 'LINEA 10', 'LINEA 11', 'LINEA 12', 'LINEA 13', 'LINEA 14'], // Hardcoded o desde DB
    formatos: [] as string[],
    marcas: [] as string[],
    sabores: [] as string[],
    ingenieros: [] as any[],
    operadores: [] as any[]
  });

  const [loading, setLoading] = useState(false);

  // --- CARGA INICIAL (Personal y Formatos de la Línea Inicial) ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [ings, ops, formats] = await Promise.all([
        fetchEngineers(),
        fetchOperators(),
        fetchFormatoByLinea(formData.linea)
      ]);
      setOptions(prev => ({ ...prev, ingenieros: ings, operadores: ops, formatos: formats }));
      setLoading(false);
    };
    init();
  }, [formData.linea]);

  // --- LÓGICA DE CASCADA ---

  // 1. Cuando cambia Formato -> Cargar Marcas
  const handleFormatoChange = async (formato: string) => {
    setLoading(true);
    const marcas = await fetchMarcasByFormato(formData.linea, formato);
    setOptions(prev => ({ ...prev, marcas, sabores: [] }));
    setFormData(prev => ({ ...prev, formato, marca: '', sabor: '', bph: 0, palletsPorHora: 0 }));
    setLoading(false);
  };

  // 2. Cuando cambia Marca -> Cargar Sabores
  const handleMarcaChange = async (marca: string) => {
    setLoading(true);
    const sabores = await fetchSaboresByMarca(formData.linea, formData.formato, marca);
    setOptions(prev => ({ ...prev, sabores }));
    setFormData(prev => ({ ...prev, marca, sabor: '', bph: 0, palletsPorHora: 0 }));
    setLoading(false);
  };

  // 3. Cuando cambia Sabor -> Cargar Datos Técnicos (BPH, UM, PaqPallet)
  const handleSaborChange = async (sabor: string) => {
    const producto = await fetchProductoDetalle(formData.linea, formData.formato, formData.marca, sabor);
    if (producto) {
      const pph = calculatePallets(producto.bph, producto.um, producto.paqPallet);
      setFormData(prev => ({ 
        ...prev, 
        sabor, 
        bph: producto.bph, 
        um: producto.um, 
        paqPallet: producto.paqPallet,
        palletsPorHora: pph 
      }));
    }
  };

  // 4. Cuando el usuario modifica el BPH manualmente
  const handleBphManualChange = (newBph: number) => {
    const newPph = calculatePallets(newBph, formData.um, formData.paqPallet);
    setFormData(prev => ({ ...prev, bph: newBph, palletsPorHora: newPph }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Datos de Producción Inicializados:", formData);
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900">SIRVO</h1>
        <p className="text-gray-500">Configuración de Inicio de Turno</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fila 1: Datos Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-gray-400 mb-1">Línea</label>
            <select 
              className="p-3 border rounded-lg bg-gray-50"
              value={formData.linea} 
              onChange={(e) => setFormData({...formData, linea: e.target.value})}
            >
              {options.lineas.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-gray-400 mb-1">Ingeniero</label>
            <select 
              required
              className="p-3 border rounded-lg"
              value={formData.ingeniero} 
              onChange={(e) => setFormData({...formData, ingeniero: e.target.value})}
            >
              <option value="">Seleccione...</option>
              {options.ingenieros.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-gray-400 mb-1">Turno</label>
            <div className="flex gap-2">
              {['DIA', 'NOCHE'].map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setFormData({...formData, turno: t})}
                  className={`flex-1 p-3 rounded-lg font-bold transition ${formData.turno === t ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <hr />

        {/* Fila 2: Cascada de Producto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-400 mb-1">Formato</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={formData.formato} 
              onChange={(e) => handleFormatoChange(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {options.formatos.map(f => <option key={f} value={f}>{f}L</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-400 mb-1">Marca</label>
            <select 
              disabled={!formData.formato}
              className="w-full p-3 border rounded-lg disabled:opacity-50"
              value={formData.marca} 
              onChange={(e) => handleMarcaChange(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {options.marcas.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-400 mb-1">Sabor</label>
            <select 
              disabled={!formData.marca}
              className="w-full p-3 border rounded-lg disabled:opacity-50"
              value={formData.sabor} 
              onChange={(e) => handleSaborChange(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {options.sabores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Fila 3: Capacidades (BPH y Pallets) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-xl">
          <div>
            <label className="block text-sm font-bold text-indigo-900 mb-2">BPH</label>
            {typeof formData.um === 'number' && formData.um !== 0 ? (
              <div className="w-full p-4 text-2xl font-mono border-2 border-indigo-200 rounded-xl bg-gray-100 text-gray-700">
                {formData.bph}
              </div>
            ) : (
              <input 
                type="number"
                className="w-full p-4 text-2xl font-mono border-2 border-indigo-200 rounded-xl focus:border-indigo-500 outline-none"
                value={formData.bph}
                onChange={(e) => handleBphManualChange(Number(e.target.value))}
              />
            )}
          </div>
          
          <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow-inner border-2 border-dashed border-indigo-200">
            <span className="text-xs font-bold text-gray-400 uppercase">Pallets por Hora</span>
            <span className="text-4xl font-black text-indigo-600">{formData.palletsPorHora}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.sabor}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl rounded-xl transition-all shadow-lg active:scale-95 disabled:bg-gray-300"
        >
          {loading ? 'CARGANDO...' : 'INICIAR PRODUCCIÓN'}
        </button>
      </form>
    </div>
  );
};

export default InitialDataForm;