import { useMemo, useState } from "react";
import {
  Clock,
  ChevronDown,
  Trash2,
  Plus,
  Edit3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { CommentColor, Comentario, HoraData, StopRecord } from "@/Features/types";
import StopCodeSearchModal from "./StopCodeSearchModal";
import {
  calculateJustificado,
  calculateJustificar,
  calculateStatus,
  generateId,
} from "@/Features/utils/calculations";

// Este tipo extiende tu HoraData sin obligarte a romper types.ts ahora mismo.
type HoraDataEditable = HoraData & {
  hourIndex?: number;
  estimado?: number;
  justificar?: number;
  justificado?: number;
  status?: string;
  closed?: boolean;
  comments?: Record<string, string>;
  paradas?: StopRecord[];
};

type StopCodeFromModal = {
  codigo: string;
  detalle: string;
  tipo_n0?: string;
  nivel_1?: string;
  nivel_2?: string;
  tipo_parada?: string;
  categoria?: string;
  causa?: string;
  recurso_afectado?: string;
  familia_oee?: string;
};

// ─── Configuración de Colores ─────────────────────────────────────────────
const COLOR_CFG: Record<CommentColor, { dot: string; stroke: string }> = {
  blue: { dot: "bg-[#378ADD]", stroke: "#378ADD" },
  green: { dot: "bg-[#4CAF50]", stroke: "#4CAF50" },
  orange: { dot: "bg-[#EF9F27]", stroke: "#EF9F27" },
  red: { dot: "bg-[#E24B4A]", stroke: "#E24B4A" },
};

const TIPO_MAP: Record<string, StopRecord["tipo"]> = {
  EQ: "EQUIPO",
  OPD: "OPERATIVAS",
  OR: "ORGANIZACIONALES",
  PD: "PLANIFICADAS",
  QD: "PERDIDAS DE CALIDAD",
  RD: "RUTINARIAS",
  TNP: "TIEMPO NO PROGRAMADO",
  EQUIPO: "EQUIPO",
  OPERATIVAS: "OPERATIVAS",
  ORGANIZACIONALES: "ORGANIZACIONALES",
  PLANIFICADAS: "PLANIFICADAS",
  RUTINARIAS: "RUTINARIAS",
  "PERDIDAS DE CALIDAD": "PERDIDAS DE CALIDAD",
  "TIEMPO NO PROGRAMADO": "TIEMPO NO PROGRAMADO",
};

const round1 = (value: number) => Number((Number(value) || 0).toFixed(1));

function normalizeStopTipo(code: StopCodeFromModal): StopRecord["tipo"] {
  const raw = String(code.tipo_n0 || code.tipo_parada || code.familia_oee || "").trim().toUpperCase();
  return TIPO_MAP[raw] || "EQUIPO";
}

function getStopDescription(code: StopCodeFromModal) {
  return code.detalle || code.causa || code.recurso_afectado || "Sin descripción";
}

// ─── Componente de Comentario ─────────────────────────────────────────────
function ComentarioItem({ comentario }: { comentario: Comentario }) {
  const cfg = COLOR_CFG[comentario.color ?? "blue"];

  return (
    <div className="flex items-center gap-2 shrink-0 bg-white/80 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
      <span className="text-[11px] text-gray-600 font-bold whitespace-nowrap px-1 animate-in fade-in slide-in-from-left-1">
        {comentario.contenido}
      </span>
    </div>
  );
}

interface HoraRowProps {
  item: HoraDataEditable;
  acumulado: number;
  index: number;
  onUpdateHour: (hourIndex: number, updates: any) => void;
  onDelete: (hourIndex: number) => void;
}

function HoraRowEditable({ item, acumulado, index, onUpdateHour, onDelete }: HoraRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  const hourIndex = item.hourIndex ?? index;
  const paradas = item.paradas ?? [];
  const estimado = Number(item.estimado ?? 0);
  const producido = Number(item.phProducidos ?? 0);

  const comentariosValidos = useMemo(
    () => (item.comentarios ?? []).filter((c) => c.contenido?.trim()),
    [item.comentarios]
  );

  const justificar = round1(
    typeof item.justificar === "number"
      ? item.justificar
      : calculateJustificar(estimado, producido)
  );

  const justificado = round1(calculateJustificado(paradas));
  const diferencia = round1(justificar - justificado);

  const estadoJustificacion =
    diferencia === 0 ? "OK" : diferencia > 0 ? "FALTA" : "EXCEDE";

  const recalcularHora = (nuevoProducido: number, nuevasParadas: StopRecord[] = paradas) => {
    const nuevoJustificar = round1(calculateJustificar(estimado, nuevoProducido));
    const nuevoJustificado = round1(calculateJustificado(nuevasParadas));
    const status = calculateStatus(nuevoProducido, estimado);

    onUpdateHour(hourIndex, {
      producido: nuevoProducido,
      producidoIngresado: true,
      justificar: nuevoJustificar,
      justificado: nuevoJustificado,
      status,
      stops: nuevasParadas,
    });
  };

  const updateStops = (nuevasParadas: StopRecord[]) => {
    recalcularHora(producido, nuevasParadas);
  };

  const handleSelectStopCode = (code: StopCodeFromModal) => {
    const minutosSugeridos = diferencia > 0 ? diferencia : 0;

    const nuevaParada: StopRecord = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : generateId("stop"),
      codigo: code.codigo,
      tipo: normalizeStopTipo(code),
      descripcion: getStopDescription(code),
      tiempoMinutos: minutosSugeridos,
      frecuencia: 1,
      timestamp: new Date().toISOString(),
    };

    updateStops([...paradas, nuevaParada]);
    setIsOpen(true);
  };

  const handleMinutesChange = (stopIndex: number, value: number) => {
    const requested = Math.max(0, Number(value) || 0);
    const otherMinutes = paradas.reduce(
      (sum, stop, idx) => (idx === stopIndex ? sum : sum + (Number(stop.tiempoMinutos) || 0)),
      0
    );
    const maxAllowed = Math.max(0, round1((item.justificar ?? 0) - otherMinutes));
    const tiempoMinutos = Math.min(requested, maxAllowed);

    const nuevasParadas = paradas.map((stop, idx) =>
      idx === stopIndex ? { ...stop, tiempoMinutos } : stop
    );

    updateStops(nuevasParadas);
  };

  const handleDeleteStop = (stopIndex: number) => {
    const nuevasParadas = paradas.filter((_, idx) => idx !== stopIndex);
    updateStops(nuevasParadas);
  };

  const handleCommentChange = (comentario: Comentario, value: string, fallbackIndex: number) => {
    const tipoComentario = (comentario as any).tipo as string | undefined;

    if (tipoComentario) {
      const baseComments = item.comments ?? {
        mnf: '',
        mantto: '',
        calidad: '',
      };

      onUpdateHour(hourIndex, {
        comments: {
          ...baseComments,
          [tipoComentario]: value,
        },
      });
      return;
    }

    const nuevosComentarios = [...(item.comentarios ?? [])];
    if (nuevosComentarios[fallbackIndex]) {
      nuevosComentarios[fallbackIndex] = {
        ...nuevosComentarios[fallbackIndex],
        contenido: value,
      };
    }

    onUpdateHour(hourIndex, { comentarios: nuevosComentarios });
  };

  return (
    <div className="mb-4">
      {/* CABECERA */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative z-20 flex items-center bg-white rounded-[40px] p-2 pr-6 shadow-sm border transition-all duration-300 cursor-pointer ${
          isOpen
            ? "border-[#D4E157] shadow-md scale-[1.01]"
            : "border-gray-100 hover:border-gray-200"
        }`}
      >
        <div className="flex items-center gap-4 min-w-[200px] px-2">
          <div className="bg-[#004B23] w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-lg">
            <Clock size={26} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#004B23] text-[18px] font-black leading-tight">
              HORA {item.hora}
            </span>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">
              Producción
            </span>
          </div>
        </div>

        <div className="h-10 w-px bg-gray-100 mx-4" />

        <div className="flex gap-10 px-4 shrink-0">
          <div className="flex flex-col group/val relative" onClick={(e) => e.stopPropagation()}>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
              Producidos
            </span>

            {isEditingValue ? (
              <input
                autoFocus
                type="number"
                step="0.1"
                min="0"
                className="w-20 text-[22px] font-black text-gray-800 bg-lime-50 border-b-2 border-lime-500 outline-none"
                style={{ colorScheme: 'light' }}
                defaultValue={producido}
                onBlur={(e) => {
                  recalcularHora(Number(e.target.value || 0));
                  setIsEditingValue(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
            ) : (
              <div className="flex items-center gap-1 cursor-edit" onClick={() => setIsEditingValue(true)}>
                <span className="text-[22px] font-black text-gray-800">
                  {producido.toFixed(1)}
                </span>
                <Edit3 size={12} className="text-gray-300 opacity-0 group-hover/val:opacity-100" />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
              Acumulado
            </span>
            <span className="text-[22px] font-black text-[#004B23]">
              {acumulado.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex-1 flex justify-end gap-2 px-6 overflow-hidden">
          {comentariosValidos.map((c, idx) => (
            <ComentarioItem key={`${c.contenido}-${idx}`} comentario={c} />
          ))}
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black border mr-3 ${
            estadoJustificacion === "OK"
              ? "bg-green-50 text-green-700 border-green-100"
              : estadoJustificacion === "FALTA"
              ? "bg-orange-50 text-orange-700 border-orange-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {estadoJustificacion === "OK" && (
            <>
              <CheckCircle2 size={13} /> Cuadra
            </>
          )}
          {estadoJustificacion === "FALTA" && (
            <>
              <Plus size={13} /> Faltan {diferencia} min
            </>
          )}
          {estadoJustificacion === "EXCEDE" && (
            <>
              <AlertTriangle size={13} /> Excede {Math.abs(diferencia)} min
            </>
          )}
        </div>

        <ChevronDown
          size={20}
          className={`text-gray-300 transition-transform duration-500 ${
            isOpen ? "rotate-180 text-[#D4E157]" : ""
          }`}
        />
      </div>

      {/* PANEL DESPLEGABLE */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden rounded-[40px]">
          <div className="bg-gray-50/80 rounded-b-[32px] -mt-8 pt-14 pb-6 px-8 border-x border-b border-gray-100 shadow-inner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gestión de Paradas */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <h4 className="text-[11px] font-black text-gray-500 uppercase flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-700">
                      Total de Paradas: {paradas.length}
                    </span>
                  </h4>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCodeModalOpen(true);
                    }}
                    className="text-[#004B23] hover:bg-white p-1 rounded-lg transition-colors"
                    title="Agregar código de parada"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="space-y-2 max-h-45 overflow-y-auto pr-2 custom-scrollbar">
                  {paradas.length ? (
                    paradas.map((p, pIdx) => (
                      <div
                        key={p.id || `${p.codigo}-${pIdx}`}
                        className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100"
                      >
                        <span className="bg-[#004B23] text-white text-[10px] font-bold px-2 py-1 rounded-md">
                          {p.codigo}
                        </span>

                        <p className="flex-1 text-xs font-bold text-gray-700">
                          {p.descripcion}
                        </p>

                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={p.tiempoMinutos}
                          onChange={(e) => handleMinutesChange(pIdx, Number(e.target.value || 0))}
                          className="w-16 text-center font-bold text-sm text-gray-800 bg-gray-100 rounded-lg py-1 outline-none focus:ring-2 ring-[#D4E157]"
                          style={{ colorScheme: 'light' }}
                        />

                        <button
                          type="button"
                          onClick={() => handleDeleteStop(pIdx)}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar código"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-400 text-[10px] italic">
                      Sin paradas registradas
                    </p>
                  )}
                </div>
              </div>

              {/* Comentarios */}
              <div className="flex flex-col gap-4">
                <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">
                    Comentario General
                  </label>

                  <div className="space-y-3">
                    {comentariosValidos.map((comentario, cIdx) => (
                      <textarea
                        key={`${(comentario as any).tipo || cIdx}-${cIdx}`}
                        className={`w-full bg-gray-50 text-gray-800 border-l-4 rounded-xl p-3 text-sm min-h-[80px] outline-none focus:ring-1 ring-gray-200 transition-all placeholder:text-gray-400 ${
                          comentario.color === "green"
                            ? "border-green-500"
                            : comentario.color === "orange"
                            ? "border-orange-500"
                            : "border-gray-300"
                        }`}
                        style={{ colorScheme: 'light' }}
                        placeholder="Escriba aquí..."
                        value={comentario.contenido || ""}
                        onChange={(e) => handleCommentChange(comentario, e.target.value, cIdx)}
                      />
                    ))}

                    {comentariosValidos.length === 0 && (
                      <p className="text-xs text-gray-400 italic">
                        Sin comentarios registrados.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => onDelete(hourIndex)}
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

      <StopCodeSearchModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSelect={(code) => {
          handleSelectStopCode(code as StopCodeFromModal);
          setIsCodeModalOpen(false);
        }}
      />
    </div>
  );
}

export default function ProduccionHoraList({
  data,
  onUpdateHour,
}: {
  data: HoraDataEditable[];
  onUpdateHour: (hourIndex: number, updates: any) => void;
}) {
  const handleDelete = (hourIndex: number) => {
    // Limpia producción/paradas y reabre la hora para que no cuente en OEE
    onUpdateHour(hourIndex, {
      producido: 0,
      justificar: 0,
      justificado: 0,
      stops: [],
      closed: false,
      producidoIngresado: false,
      status: 'blue',
      comments: { mnf: '', mantto: '', calidad: '' },
    });
  };

  let cumulative = 0;

  return (
    <div className="w-full p-4">
      <div className="max-w-6xl mx-auto space-y-1">
        {data.map((item, i) => {
          cumulative += Number(item.phProducidos || 0);

          return (
            <HoraRowEditable
              key={`${item.hourIndex ?? i}-${item.hora}`}
              index={i}
              item={item}
              acumulado={cumulative}
              onUpdateHour={onUpdateHour}
              onDelete={handleDelete}
            />
          );
        })}

        {data.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] max-h-[50px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-black text-xs uppercase tracking-tighter">
              Sin datos de producción
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
