import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, SlidersHorizontal, User, HardDrive, Clock, ClipboardList } from 'lucide-react';
import { 
  fetchEngineers, 
  fetchOperators,
} from '../database';
import { usePage } from '@inertiajs/react';
import Alert from '../Alert';

// --- CONFIGURACIÓN DE ESTILOS AJE ---
const AJE = {
  lima: '#D4E157',
  bosque: '#004B23',
  mentaDark: '#A8E6CF',
  azulSeleccion: '#2563eb',
  fondo: '#F8FAFC'
};

// --- DATOS DE PRODUCTOS (Basados en tu database.ts) ---
const PRODUCT_DATABASE = [
  { sku: 408462, descripcion: "CIELO AGUA SIN GAS PET NO RETORNABLE 625 ml 15 pack", um: 15, formato: 0.625, marca: "CIELO", sabor: "AGUA", bph: 60000, linea: "LINEA 1", paqPallet: 140 },
  { sku: 408961, descripcion: "VIDA AGUA PET NO RETORNABLE 625 ML 15", um: 15, formato: 0.625, marca: "VIDA", sabor: "AGUA", bph: 60000, linea: "LINEA 1", paqPallet: 140 },
  { sku: 422387, descripcion: "KR KOLITA PET NO RETORNABLE 400 ML 15 MA", um: 15, formato: 0.400, marca: "KR", sabor: "KOLITA", bph: 55000, linea: "LINEA 1", paqPallet: 200 },
  { sku: 408469, descripcion: "CIELO AGUA SIN GAS PET NO RETORNABLE 1000 ml 6 pack", um: 6, formato: 1.0, marca: "CIELO", sabor: "AGUA", bph: 27700, linea: "LINEA 2", paqPallet: 168 },
  { sku: 422783, descripcion: "VOLT GAMER PONCHE DE FRUTAS PET NO RETORNABLE 300 ML 12 MA", um: 12, formato: 0.3, marca: "VOLT", sabor: "GAMER PONCHE DE FRUTA", bph: 34200, linea: "LINEA 5", paqPallet: 256 },
  { sku: 422376, descripcion: "CIFRUT FRUIT PUNCH PET NO RETORNABLE 350 ML 15 MA", um: 15, formato: 0.35, marca: "CIFRUT", sabor: "FRUIT PUNCH", bph: 21000, linea: "LINEA 8", paqPallet: 200 }
];

// --- COMPONENTE SELECTOR INDUSTRIAL ---
const SelectorIndustrial = ({ label, options, value, onChange, variant = 'dropdown', icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'switch') {
    return (
      <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-4">{label}</label>
        <div className="relative flex bg-gray-100 p-1 rounded-full border border-gray-200 h-[42px] items-center">
          <div 
            className="absolute h-[32px] bg-white rounded-full shadow-sm border transition-all duration-300"
            style={{ width: `calc(50% - 4px)`, left: value === options[0] ? '4px' : '50%', borderColor: AJE.bosque }} 
          />
          {options.slice(0, 2).map((opt: string) => (
            <button key={opt} type="button" onClick={() => onChange(opt)}
              className={`relative z-10 w-1/2 text-[11px] font-bold transition-colors ${value === opt ? 'text-[#004B23]' : 'text-gray-400'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'label') {
    return (
      <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-4">{label}</label>
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border bg-white"
             style={{ borderColor: '#e5e7eb', color: AJE.bosque }}>
          {Icon && <Icon size={14} className="text-gray-400" />}
          <span className="truncate">{value || "—"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-w-[180px]" ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-4">{label}</label>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-2.5 rounded-full text-sm font-medium border bg-white transition-all"
        style={{ borderColor: isOpen ? AJE.lima : '#e5e7eb', color: AJE.bosque }}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={14} className="text-gray-400" />}
          <span className="truncate">{value || "Seleccione..."}</span>
        </div>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden py-1">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option: any) => {
              const name = typeof option === 'string' ? option : option.name;
              return (
                <button 
                  key={name} 
                  type="button" 
                  onClick={() => { onChange(name); setIsOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${value === name ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const InitialDataForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [linea, setLinea] = useState('LINEA 1');
  const [ingeniero, setIngeniero] = useState('');
  const [turno, setTurno] = useState('DIA');
  const [operador, setOperador] = useState('');
  const [opValue, setOpValue] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [productoSel, setProductoSel] = useState<any>(null);
  const [listaFormulas, setListaFormulas] = useState<any>(null);
  const [options, setOptions] = useState({
    ingenieros: [] as any[],
    operadores: [] as any[],
    lineas: ['LINEA 1', 'LINEA 2', 'LINEA 3', 'LINEA 4', 'LINEA 5', 'LINEA 8', 'LINEA 9', 'LINEA 10']
  });
  
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState('');


useEffect(() => {
  if (alerta.trim()) {
    const timer = setTimeout(() => {
      setAlerta('');
    }, 20000);
    return () => clearTimeout(timer);
  }
}, [alerta]);
  const { auth } = usePage().props;

  // Carga de personal desde database.ts
  useEffect(() => {
    const loadStaff = async () => {
      setIngeniero((auth as any)?.user?.name || '');
      setLoading(true);
      const [ings, ops] = await Promise.all([fetchEngineers(), fetchOperators()]);
      setOptions(prev => ({ ...prev, ingenieros: ings, operadores: ops }));
      setLoading(false);
    };
    loadStaff();
  }, []);


  // Auto-muestra la lista de productos de la línea actual apenas se carga el componente
  const handleShowLista = (show: boolean) => {
    if (show) {
      const productosDeLinea = PRODUCT_DATABASE.filter(p => p.linea === linea);
      setListaFormulas(productosDeLinea.length > 0 ? productosDeLinea : null);
    } else {
      setListaFormulas(null);
    }
  };

  // Filtrado de productos basado en la línea y búsqueda
  const productosFiltrados = useMemo(() => {
    let filtrados = PRODUCT_DATABASE.filter(p => p.linea === linea);
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      filtrados = filtrados.filter(p => 
        p.descripcion.toLowerCase().includes(term) || 
        p.marca.toLowerCase().includes(term) || 
        p.sabor.toLowerCase().includes(term) ||
        p.sku.toString().includes(term)
      );
    }
    return filtrados;
  }, [busqueda, linea]);

  // Cálculo de Pallets
  const palletsPorHora = useMemo(() => {
    if (!productoSel) return 0;
    return (productoSel.bph / productoSel.um / productoSel.paqPallet).toFixed(1);
  }, [productoSel]);

  // Manejo de envío final con la estructura exacta solicitada
  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();
    if (!productoSel || !ingeniero || !operador) {
      setAlerta("Por favor completa los datos de Ingeniero, Operador y selecciona un Producto.");
      return;
    }

    const finalData = {
      bph: productoSel.bph,
      fecha: new Date().toISOString().split('T')[0], // Formato "2026-03-15"
      formato: productoSel.formato.toString(),
      ingeniero: ingeniero,
      linea: linea,
      marca: productoSel.marca,
      operador: operador,
      palletsPorHora: palletsPorHora,
      paqPallet: productoSel.paqPallet,
      sabor: productoSel.sabor,
      turno: turno,
      um: productoSel.um,
      op: opValue, // Incluimos la OP por utilidad
      sku: productoSel.sku,
      descripccion: productoSel.descripcion,
    };


    //simulacion de datos existentes del numero de la op registrada
     if (!validarOpExistente(opValue)) {
        // console.log("🚀 OP válida:", opValue);
      } else {
        setAlerta("");
        setAlerta("La OP fue resgistrada previamente.");
        setOpValue("");
        return;
      }
    //----------------------------------------------

    console.log("🚀 Datos de Producción Inicializados:", finalData);
    onSubmit(finalData);
  };

  function handleChangeOpValue(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value.length || e.target.value.length > 6) {
      setOpValue("");
      setAlerta("El valor de la OP debe tener mas 6 dígitos.");
    } else {
      setOpValue(e.target.value);
    }
  }

  //Funcion validadora de la OP
  function validarOpExistente(input: string): boolean | null {
    const Op = ["2026087687", "2026086007", "2026000876", "2026000001"]
    const currentYear = new Date().getFullYear().toString();
    const rawInput = input.replace(/\D/g, '').slice(0, 6);
    const padded = rawInput.padStart(6, '0');
    const fullOp = currentYear + padded;
    const valor = Op.includes(fullOp) ;
    return valor;
  }



  return (
    <div className="min-h-screen  p-4 md:p-8">
      {alerta?.trim() && (
        <Alert variant="error" title="El campo es obligatorio" message={alerta} />
      )}
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabecera */}
        {/* <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter" style={{ color: AJE.bosque }}>SIRVO</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Control de Producción Industrial</p>
        </div> */}

        {/* 1. Panel de Configuración de Turno */}
        <div className="flex flex-wrap gap-6 items-end">
          <SelectorIndustrial 
            label="Línea" 
            options={options.lineas} 
            value={linea} 
            onChange={(v: string) => { setLinea(v); setProductoSel(null); }} 
            icon={HardDrive}
          />
          <SelectorIndustrial 
            label="Ingeniero" 
            options={options.ingenieros} 
            value={ingeniero} 
            icon={User}
            variant="label"
          />
          <SelectorIndustrial 
            label="Turno" 
            options={['DIA', 'NOCHE']} 
            value={turno} 
            onChange={setTurno} 
            variant="switch" 
          />
          <SelectorIndustrial 
            label="Operador Líder" 
            options={options.operadores} 
            value={operador} 
            onChange={setOperador} 
            icon={User}
          />
        </div>

        {/* 2. Buscador de Productos */}
        <div className="relative flex flex-col items-center">
          <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl shadow-lg flex items-center gap-3 px-6 py-4 border-2 transition-all"
               style={{ borderColor: productoSel ? AJE.lima : '#E2E8F0' }}>
            <Search size={20} style={{ color: AJE.bosque }} />
            <input 
              className="flex-1 bg-transparent outline-none text-lg font-medium placeholder-gray-300" 
              placeholder="Buscar por marca, sabor o SKU..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onFocus={() => handleShowLista(true)}
            />
            <SlidersHorizontal size={18} className="text-gray-300" />
          </div>

          {/* Resultados del Buscador */}
          {/* Cambiamos 'busqueda' por una variable de estado como 'listaFormulas' o simplemente validamos que existan productos */}
          {(listaFormulas || busqueda) && (
            <div className="absolute top-16 z-50 w-full max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map(p => (
                  <div 
                    key={p.sku} 
                    onClick={() => { setProductoSel(p); setBusqueda(""); setListaFormulas(false); }}
                    className="p-4 hover:bg-green-50 cursor-pointer border-b last:border-0 flex justify-between items-center group"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#004B23] group-hover:text-blue-600 transition-colors">{p.descripcion}</p>
                      <p className="text-[10px] text-gray-400 font-mono uppercase">SKU: {p.sku} • FORMATO: {p.formato.toFixed(3)} • BPH: {p.bph}</p>
                    </div>
                    <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-black text-gray-400">SELECCIONAR</div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm italic">No se encontraron productos</div>
              )}
            </div>
          )}
        </div>

        {/* 3. Resumen y KPIs Visuales */}
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {/* Card Producto Seleccionado */}
          <div className="flex-1 max-w-md space-y-4">
            <div className={`p-6 rounded-[24px] transition-all border-2 flex items-start gap-4 ${productoSel ? 'bg-[#008037] text-white border-transparent' : 'bg-gray-50 text-gray-400 border-dashed border-gray-200'}`}>
              <div className={`p-3 rounded-xl ${productoSel ? 'bg-white/20' : 'bg-gray-100'}`}>
                <ClipboardList size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Producto</p>
                <p className="text-lg font-bold leading-tight">{productoSel?.descripcion || "Esperando selección..."}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] text-gray-400 font-black mb-1 uppercase">BPH Nominal</p>
                <p className="text-2xl font-mono font-bold text-gray-800">{productoSel?.bph.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] text-gray-400 font-black mb-1 uppercase">Orden Prod. (OP)</p>
                <input 
                   type="text" 
                   className="w-full outline-none font-mono font-bold text-2xl text-blue-600 placeholder-gray-100" 
                   value={opValue} 
                   onChange={handleChangeOpValue}
                   placeholder={new Date().getFullYear().toString() + '...'}
                />
              </div>
            </div>
          </div>

          {/* Card Pallets Visual (Círculo/Impacto) */}
          <div className="p-8 bg-white rounded-[40px] border-2 border-dashed border-green-200 flex flex-col items-center justify-center min-w-[250px] max-h-[220px] shadow-sm relative overflow-hidden group m-auto">
            <div className="absolute -right-4 -bottom-4 text-[#004B23]/5 group-hover:scale-110 transition-transform duration-700">
              <HardDrive size={160} />
            </div>
            <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] mb-8">Pallets / Hora</p>
            <span className="text-6xl font-black text-[#004B23] drop-shadow-sm leading-none">
                {palletsPorHora}
            </span>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1.5 rounded-full border border-green-100">
                <Clock size={12} />
                PALLET ESTIMADO
            </div>
          </div>
        </div>

        {/* 4. Botón de Acción Final */}
        <button
          onClick={handleSubmit}
          disabled={loading || !productoSel}
          className={`w-full py-6 rounded-[24px] font-black text-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-4
            ${productoSel 
              ? 'bg-[#004B23] text-white hover:bg-[#003317] shadow-green-900/20' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {loading ? (
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Clock size={28} />
              INICIAR PRODUCCIÓN
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InitialDataForm;