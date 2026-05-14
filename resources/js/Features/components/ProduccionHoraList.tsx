
import { useState } from "react";
import { Clock, ChevronDown, Trash2, AlertCircle, Save, Plus, Edit3 } from "lucide-react";
import type { CommentColor, Comentario, HoraData } from "@/Features/types";

// ─── Configuración de Colores ─────────────────────────────────────────────
const COLOR_CFG: Record<CommentColor, { dot: string; stroke: string }> = {
  blue:   { dot: "bg-[#378ADD]", stroke: "#378ADD" },
  green:  { dot: "bg-[#4CAF50]", stroke: "#4CAF50" },
  orange: { dot: "bg-[#EF9F27]", stroke: "#EF9F27" },
  red:    { dot: "bg-[#E24B4A]", stroke: "#E24B4A" },
};

function buildWave(seed: number, w = 80): string {
  return Array.from({ length: 11 }, (_, i) => {
    const x = (i / 10) * w;
    const y = 6 + Math.sin((i + seed) * 1.4) * 3 + Math.cos((i * 2 + seed) * 0.9) * 1.5;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

// ─── Componente de Comentario (Burbuja) ───────────────────────────────────
function ComentarioItem({ comentario, cardIdx, commentIdx }: { comentario: Comentario; cardIdx: number; commentIdx: number }) {
  const cfg = COLOR_CFG[comentario.color ?? "blue"];

  return (
    <div className="flex items-center gap-2 shrink-0 bg-white/80 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <button
        className={`w-2.5 h-2.5 rounded-full transition-transform hover:scale-125 ${cfg.dot}`}
      />
        <span className="text-[11px] text-gray-600 font-bold whitespace-nowrap px-1 animate-in fade-in slide-in-from-left-1">
          {comentario.contenido}
        </span>

    </div>
  );
}

// ─── Fila de Hora (Editable y Desplegable) ─────────────────────────────────
interface HoraRowProps {
  item: HoraData;
  acumulado: number;
  index: number;
  onUpdate: (index: number, updatedItem: HoraData) => void;
  onDelete: (index: number) => void;
}

function HoraRowEditable({ item, acumulado, index, onUpdate, onDelete }: HoraRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);

  
  
  const paradas = (item as any).paradas || [];
  const comentariosValidos = (item.comentarios ?? []).filter(c => c.contenido?.trim());


  return (
    <div className="mb-4">
      {/* CABECERA (PÍLDORA) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-20 flex items-center bg-white rounded-[40px] p-2 pr-6 shadow-sm border transition-all duration-300 cursor-pointer 
          ${isOpen ? 'border-[#D4E157] shadow-md scale-[1.01]' : 'border-gray-100 hover:border-gray-200'}`}
      >
        {/* Identificador de Hora */}
        <div className="flex items-center gap-4 min-w-[200px] px-2">
          <div className="bg-[#004B23] w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-lg">
            <Clock size={26} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#004B23] text-[18px] font-black leading-tight">HORA {item.hora}</span>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Producción</span>
          </div>
        </div>

        <div className="h-10 w-px bg-gray-100 mx-4" />

        {/* Valores Principales */}
        <div className="flex gap-10 px-4 shrink-0">
          <div className="flex flex-col group/val relative" onClick={(e) => e.stopPropagation()}>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Producidos</span>
            {isEditingValue ? (
              <input 
                autoFocus
                type="number"
                className="w-20 text-[22px] font-black text-gray-800 bg-lime-50 border-b-2 border-lime-500 outline-none"
                defaultValue={item.phProducidos}
                onBlur={(e) => {
                  onUpdate(index, { ...item, phProducidos: Number(e.target.value) });
                  setIsEditingValue(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
            ) : (
              <div 
                className="flex items-center gap-1 cursor-edit"
                onClick={() => setIsEditingValue(true)}
              >
                <span className="text-[22px] font-black text-gray-800">{item.phProducidos.toFixed(1)}</span>
                <Edit3 size={12} className="text-gray-300 opacity-0 group-hover/val:opacity-100" />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Acumulado</span>
            <span className="text-[22px] font-black text-[#004B23]">{acumulado.toFixed(1)}</span>
          </div>
        </div>

        {/* Comentarios/Ondas */}
        <div className="flex-1 flex justify-end gap-2 px-6 overflow-hidden">
          {comentariosValidos.map((c, idx) => (
            <ComentarioItem key={idx} comentario={c} cardIdx={index} commentIdx={idx} />
          ))}
        </div>

        <ChevronDown 
          size={20} 
          className={`text-gray-300 transition-transform duration-500 ${isOpen ? 'rotate-180 text-[#D4E157]' : ''}`} 
        />
      </div>

      {/* PANEL DESPLEGABLE (EDICIÓN DETALLADA) */}
      <div 
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden  rounded-[40px]">
          <div className="bg-gray-50/80 rounded-b-[32px] -mt-8 pt-14 pb-6 px-8 border-x border-b border-gray-100 shadow-inner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Gestión de Paradas */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 ">
                  <h4 className="text-[11px] font-black text-gray-500 uppercase flex items-center gap-2">
                    <p className="text-[10px] font-bold text-gray-700">
                    Total de Paradas: {paradas.length}
                    </p>
                  </h4>
                  <button className="text-[#004B23] hover:bg-white p-1 rounded-lg transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="space-y-2 max-h-45 overflow-y-auto pr-2 custom-scrollbar">
                  {paradas?.length ? (
                    paradas.map((p: any, pIdx: number) => (
                      <div key={p.id || pIdx} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100">
                        <span className="bg-[#004B23] text-white text-[10px] font-bold px-2 py-1 rounded-md">
                          {p.codigo}
                        </span>
                        <p className="flex-1 text-xs font-bold text-gray-700">{p.descripcion}</p>
                        <input 
                          type="number" 
                          step="0.1" // Permite manejar el decimal 1.3 visto en la imagen
                          value={p.tiempoMinutos}
                          onChange={(e) => {
                            const newValue = Number(e.target.value);
                            const newParadas = [...paradas];
                            
                            // Actualizamos el objeto específico
                            newParadas[pIdx] = { ...newParadas[pIdx], tiempoMinutos: newValue };
                            
                            // IMPORTANTE: Usar 'paradas' para que coincida con tu estructura de datos
                            onUpdate(index, { ...item, paradas: newParadas } as any);
                          }}
                          className="w-14 text-center font-bold text-sm bg-gray-100 rounded-lg py-1 outline-none"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-400 text-[10px] italic">
                      Sin paradas registradas
                    </p>
                  )}
                </div>
              </div>

              {/* Notas y Acciones Rápidas */}
              <div className="flex flex-col gap-4">
                <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Comentario General</label>
                 <div className="space-y-3">
                  {comentariosValidos.map((comentario: any, cIdx: number) => (

                    <textarea 
                      key={cIdx}
                      className={`w-full bg-gray-50 border-l-4 rounded-xl p-3 text-sm min-h-[80px] outline-none focus:ring-1 ring-gray-200 transition-all ${
                        comentario.color === 'green' ? 'border-green-500' : 
                        comentario.color === 'orange' ? 'border-orange-500' : 'border-gray-300'
                      }`}
                      placeholder="Escriba aquí..."
                      value={comentario.contenido || ""}
                      onChange={(e) => {
                        // Clonamos el array original de comentarios del item
                        const newComments = [...(item.comentarios || [])];
                        
                        // Buscamos el índice real dentro del array original para actualizarlo
                        // (o usamos cIdx si comentariosValidos es el mismo array)
                        if (newComments[cIdx]) {
                          newComments[cIdx] = { ...newComments[cIdx], contenido: e.target.value };
                        }
                        
                        onUpdate(index, { ...item, comentarios: newComments });
                      }}
                    />
                  ))}

                  {/* Opcional: Botón para agregar un nuevo comentario si el array está vacío */}
                  {comentariosValidos.length === 0 && (
                    <button 
                      onClick={() => {
                        const newComments = [...(item.comentarios || []), { contenido: "", color: 'blue' }];
                        onUpdate(index, { ...item, comentarios: newComments });
                      }}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      + Agregar comentario
                    </button>
                  )}
                </div>
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={() => onDelete(index)}
                      className="flex items-center gap-2 text-red-400 hover:text-red-600 font-bold text-[10px] uppercase transition-colors"
                    >
                      <Trash2 size={14} /> Eliminar Registro
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function ProduccionHoraList({ data, onDataChange }: { data: HoraData[], onDataChange?: (newData: HoraData[]) => void }) {
  
  const handleUpdate = (idx: number, updatedItem: HoraData) => {
    const newData = [...data];
    newData[idx] = updatedItem; 
    onDataChange?.(newData);
  };

  console.log(data);

  const handleDelete = (idx: number) => {
    const newData = data.filter((_, i) => i !== idx);
    onDataChange?.(newData);
  };
  let cumulative = 0;

  return (
    <div className="w-full p-4">
      <div className="max-w-6xl mx-auto space-y-1">
        {data.map((item, i) => {
          cumulative += item.phProducidos;
          return (
            <HoraRowEditable
              key={`${item.hora}-${i}`}
              index={i}
              item={item}
              acumulado={cumulative}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          );
        })}
        
        {data.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] max-h-[50px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-black text-xs uppercase tracking-tighter">Sin datos de producción</p>
          </div>
        )}
      </div>
    </div>
  );
}

