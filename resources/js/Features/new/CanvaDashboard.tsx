import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Home, Folder, LayoutGrid, Award, Sparkles, MoreHorizontal,
  Bell, Trash2, Users, Search, SlidersHorizontal, ChevronDown, Star, Image as ImageIcon, FileText, Video,
  Printer, Monitor, Calculator, Globe, Mail, Camera, Upload,
  Settings, Heart, Clock,  ArrowUpDown,
  Presentation, 
  MessageSquare, 
  Layers, 
  Lightbulb,
  PanelRightOpen,
  PanelLeftOpen,
  List
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import RevealList from '../utils/RevealList';
import embotelladoraCaral from '../../../img/embotelladora_caral.webp';
import ProductionControl from '../ProductionControl';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type TabId = 'inicio' | 'proyectos' | 'plantillas' | 'marca' | 'ia' | 'mas';
type Phase = 'idle' | 'exit' | 'enter';

interface SidebarBtnProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: boolean;
}

interface CategoryPillProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  color: string;
}

interface RecentCardProps {
  title: string;
  time: string;
  thumbnail?: React.ReactNode;
  badge?: boolean;
}

interface BrandCardProps {
  label: string;
  children: React.ReactNode;
  locked?: boolean;
}

interface ToggleIconProps {
  toggled: boolean;
  setToggled: (value: boolean) => void;
}

// ─── AJE COLOR PALETTE ────────────────────────────────────────────────────────
const AJE = {
  bosque:      '#004B23',
  corporativo: '#008037',
  lima:        '#70AD47',
  menta:       '#E8F5E9',
  // Derivados
  bosqueLight: '#005A2B',
  limaLight:   '#8DC65F',
  mentaDark:   '#C8E6C9',
  mentaMid:    '#D4EDDA',
  gold:        '#F9A825',
  goldLight:   '#FFF8E1',
};

// ─── SIDEBAR ICON BUTTON ──────────────────────────────────────────────────────
const SidebarBtn: React.FC<SidebarBtnProps> = ({ icon: Icon, label, active = false, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 py-2 px-1 w-full rounded-lg transition-all relative cursor-pointer 
      ${active ? '' : `text-[${AJE.bosque}] hover:text-[${AJE.lima}] hover:bg-white/10`}`}
    style={active ? { background: 'rgba(0,128,55,0.25)' } : {}}
  >
    <div className={`p-1.5 rounded-lg`}>
      <Icon size={18} strokeWidth={1.8} />
    </div>
    <span className="text-[9.5px] font-medium leading-tight">{label}</span>
    {badge && (
      <span
        className="absolute top-1 right-2 w-2 h-2 rounded-full border border-white"
        style={{ background: AJE.gold }}
      />
    )}
  </button>
);

// ─── DESIGN CATEGORY PILL ─────────────────────────────────────────────────────
const CategoryPill: React.FC<CategoryPillProps> = ({ icon: Icon, label, color }) => (
  <div className="flex flex-col items-center gap-1.5 cursor-pointer group min-w-[60px]">
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-sm"
      style={{ background: color }}
    >
      <Icon size={22} strokeWidth={1.8} />
    </div>
    <span className="text-[11px] font-medium text-center leading-tight" style={{ color: AJE.bosque }}>{label}</span>
  </div>
);

// ─── RECENT PROJECT CARD ──────────────────────────────────────────────────────
const RecentCard: React.FC<RecentCardProps> = ({ title, time, thumbnail, badge }) => (
  <div className="flex flex-col gap-1.5 cursor-pointer group min-w-[150px] max-w-[190px]">
    <div
      className="relative h-[110px] rounded-xl overflow-hidden shadow-sm transition-all"
      style={{
        background: AJE.menta,
        border: `1.5px solid ${AJE.mentaDark}`,
      }}
    >
      <style>{`.recent-card-hover:hover { border-color: ${AJE.lima} !important; }`}</style>
      <div className="w-full h-full flex items-center justify-center recent-card-hover">
        {thumbnail ?? <div className="w-full h-full" style={{ background: AJE.menta }} />}
      </div>
      {badge && (
        <span
          className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded text-white"
          style={{ background: AJE.bosque }}
        >
          Solo ver
        </span>
      )}
    </div>
    <div>
      <p className="text-[12.5px] font-semibold truncate" style={{ color: AJE.bosque }}>{title}</p>
      <p className="text-[11px]" style={{ color: AJE.lima }}>• Editado hace {time}</p>
    </div>
  </div>
);

// ─── BRAND CARD ───────────────────────────────────────────────────────────────
const BrandCard: React.FC<BrandCardProps> = ({ label, children, locked }) => (
  <div className="flex flex-col gap-2 cursor-pointer group">
    <div
      className="h-[160px] rounded-2xl overflow-hidden flex items-center justify-center relative transition-all"
      style={{
        background: '#fff',
        border: `1.5px solid ${AJE.mentaDark}`,
      }}
    >
      {children}
      {locked && (
        <div className="absolute top-2 right-2">
          <Star size={14} style={{ color: AJE.gold, fill: AJE.gold }} />
        </div>
      )}
    </div>
    <span className="text-[13px] font-semibold" style={{ color: AJE.bosque }}>{label}</span>
  </div>
);

// ─── TOGGLE ICON ──────────────────────────────────────────────────────────────
const ToggleIcon: React.FC<ToggleIconProps> = ({ toggled, setToggled }) => (
  <button
    onClick={() => setToggled(!toggled)}
    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors mb-1 text-green-200 hover:text-white hover:bg-white/10s"
    title={toggled ? 'Cerrar panel' : 'Abrir panel'}
  >
    {toggled ? <PanelRightOpen size={18} style={{ color: AJE.bosque, cursor: 'pointer' }} /> : <PanelLeftOpen size={18} style={{ color: AJE.bosque, cursor: 'pointer' }} />}
  </button>
);

// ─── INICIO VIEW ──────────────────────────────────────────────────────────────
const InicioView: React.FC = () => (
  <div className="flex flex-col rounded-3xl mt-2 ml-2 mr-2 overflow-hidden">
    {/* Hero */}
    <div
      className="relative pt-12 pb-20 flex flex-col items-center px-4 sm:px-8"
      style={{ background: `linear-gradient(to bottom, ${AJE.menta} 0%, #d4f0de 10%, #ffffff 100%)` }}
    >

      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-5" style={{ color: AJE.bosque }}>
          <div className="flex items-center justify-center ">
              <RevealList items={['Sistema', 'Integrado de', 'Rendimiento y', 'Volumen', 'Operativo']} isHoverMode={false} />
          </div>
      </h1>

      <ProductionControl />
{/*       
      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {['Mis diseños', 'Plantillas', 'Canva IA'].map((tab, i) => (
          <button
            key={tab}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
            style={i === 0
              ? { background: '#fff', borderColor: AJE.lima, color: AJE.bosque, boxShadow: '0 1px 4px rgba(0,75,35,0.10)' }
              : { borderColor: 'transparent', color: AJE.corporativo }}
          >
            {tab}
          </button>
        ))}
      </div> */}
      {/* <div
        className="w-full max-w-2xl rounded-2xl shadow-lg flex items-center gap-3 px-5 py-3"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${AJE.mentaDark}` }}
      >
        <Search size={18} style={{ color: AJE.lima }} />
        <input
          className="flex-1 bg-transparent outline-none text-sm placeholder-green-400"
          style={{ color: AJE.bosque }}
          placeholder="Busca tu producción por formato, marca, sabor o mercado..."
        />
        <SlidersHorizontal size={16} style={{ color: AJE.lima }} />
      </div> */}
    </div>

    {/* Category pills */}
    {/* <div className="px-4 sm:px-10 py-6 bg-white border-b" style={{ borderColor: AJE.mentaDark }}>
      <div className="flex justify-center gap-6 overflow-x-auto pb-1 no-scrollbar">
        {[
          { icon: Presentation, label: 'Presentación', color: AJE.corporativo },
          { icon: Heart,        label: 'Redes',         color: '#C62828' },
          { icon: Video,        label: 'Vídeo',         color: AJE.bosque },
          { icon: Printer,      label: 'Impresión',     color: AJE.lima },
          { icon: FileText,     label: 'Doc',           color: AJE.corporativo },
          { icon: Layers,       label: 'Pizarra',       color: '#2E7D32' },
          { icon: Calculator,   label: 'Hoja',          color: AJE.bosqueLight },
          { icon: Globe,        label: 'Web',           color: '#00695C' },
          { icon: Mail,         label: 'Email',         color: AJE.corporativo },
          { icon: Camera,       label: 'Foto',          color: '#4E342E' },
          { icon: Settings,     label: 'Más',           color: '#546E7A' },
        ].map((c) => <CategoryPill key={c.label} {...c} />)}
      </div>
    </div> */}

    {/* Recientes */}
    {/* <div className="px-4 sm:px-10 pt-8 pb-4 bg-white">
      <h2 className="text-lg font-bold mb-4" style={{ color: AJE.bosque }}>Recientes</h2>
      <div className="flex gap-5 overflow-x-auto pb-3 no-scrollbar">
        {[
          { title: 'Reserve A', time: '11 meses', thumbnail: <div className="w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-2xl bg-white" style={{ borderColor: AJE.corporativo, color: AJE.corporativo }}>T</div> },
          { title: 'Diseño sin título', time: '11 meses' },
          { title: 'Diseño sin título', time: '11 meses' },
          { title: 'Infografía Consejos', time: '11 meses', thumbnail: <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: AJE.menta, color: AJE.corporativo }}>Infografía</div> },
          { title: 'Infografía emociones', time: '11 meses', thumbnail: <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: '#F9FBE7', color: '#689F38' }}>Emociones</div> },
          { title: 'Estudiante Software', time: '11 meses', badge: true, thumbnail: <div className="w-full h-full flex items-center justify-center text-xs font-bold p-2 text-center" style={{ background: AJE.menta, color: AJE.bosque }}>Software de Simulación</div> },
          { title: 'Presentación creativa', time: '1 año', badge: true },
        ].map((c, i) => <RecentCard key={i} {...c} />)}
      </div>
    </div> */}
  </div>
);

// ─── PROYECTOS VIEW ───────────────────────────────────────────────────────────
const ProyectosView: React.FC = () => (
  <div className="flex flex-col rounded-3xl mt-2 ml-2 mr-2 overflow-hidden">
    <div
      className="relative pt-12 pb-20 flex flex-col items-center px-4 sm:px-8"
      style={{ background: `linear-gradient(to bottom, ${AJE.menta} 0%, #d4f0de 10%, #ffffff 100%)` }}
    >
      <div
        className="absolute top-4 right-4 sm:right-6 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border"
        style={{ background: AJE.goldLight, borderColor: AJE.gold, color: AJE.bosque }}
      >
        <Star size={10} style={{ fill: AJE.gold, color: AJE.gold }} />
        Prueba gratis 30 días
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: AJE.bosque }}>Todos los proyectos</h1>
      <div
        className="w-full max-w-2xl rounded-2xl shadow-md flex items-center gap-3 px-5 py-3"
        style={{ background: '#fff', border: `1px solid ${AJE.mentaDark}` }}
      >
        <Search size={18} style={{ color: AJE.lima }} />
        <input className="flex-1 bg-transparent outline-none text-sm" style={{ color: AJE.bosque }} placeholder="Buscar en todo el contenido" />
        <SlidersHorizontal size={16} style={{ color: AJE.lima }} />
      </div>
    </div>

    <div className="px-4 sm:px-10 -mt-8 pb-16">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {['Tipo', 'Categoría', 'Titular', 'Fecha'].map((f) => (
            <button
              key={f}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs shadow-sm border"
              style={{ background: '#fff', borderColor: AJE.lima, color: AJE.bosque }}
            >
              {f} <ChevronDown size={12} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded hover:bg-green-50"><ArrowUpDown size={16} style={{ color: AJE.lima }} /></button>
          <button className="p-1.5 rounded hover:bg-green-50"><List size={16} style={{ color: AJE.lima }} /></button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:opacity-90"
            style={{ background: AJE.corporativo }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4" style={{ color: AJE.bosque }}>Recientes</h2>
        <div className="flex gap-5 overflow-x-auto pb-3 no-scrollbar">
          {[
            { title: 'Reserve A', time: '11 meses', thumbnail: <div className="w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-2xl bg-white" style={{ borderColor: AJE.corporativo, color: AJE.corporativo }}>T</div> },
            { title: 'Diseño sin título', time: '11 meses' },
            { title: 'Diseño sin título', time: '11 meses' },
            { title: 'Infografía Consejos', time: '11 meses', thumbnail: <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: AJE.menta, color: AJE.corporativo }}>Infografía</div> },
            { title: 'Infografía emociones', time: '11 meses', thumbnail: <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: '#F9FBE7', color: '#689F38' }}>Emociones</div> },
          ].map((c, i) => <RecentCard key={i} {...c} />)}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ChevronDown size={16} style={{ color: AJE.bosque }} />
          <h2 className="text-lg font-bold" style={{ color: AJE.bosque }}>Carpetas</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-44 cursor-pointer shadow-sm transition-all hover:shadow-md border"
            style={{ background: '#fff', borderColor: AJE.mentaDark }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: AJE.menta }}>
              <Upload size={16} style={{ color: AJE.corporativo }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: AJE.bosque }}>Subidos</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <ChevronDown size={16} style={{ color: AJE.bosque }} />
          <h2 className="text-lg font-bold" style={{ color: AJE.bosque }}>Diseños</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[
            { title: 'Reserve A', thumbnail: <div className="w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-2xl bg-white" style={{ borderColor: AJE.corporativo, color: AJE.corporativo }}>T</div> },
            { title: 'Diseño sin título' },
            { title: 'Diseño sin título' },
            { title: 'Infografía Consejos', thumbnail: <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: AJE.menta, color: AJE.corporativo }}>Infografía</div> },
            { title: 'Infografía emociones', thumbnail: <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: '#F9FBE7', color: '#689F38' }}>Emociones</div> },
            { title: 'Diseño sin título' },
          ].map((c, i) => <RecentCard key={i} {...c} time="11 meses" />)}
        </div>
      </div>
    </div>
  </div>
);

// ─── PLANTILLAS VIEW ──────────────────────────────────────────────────────────
const PlantillasView: React.FC = () => (
  <div className="flex flex-col rounded-3xl mt-2 ml-2 mr-2 overflow-hidden">
    <div
      className="relative pt-12 pb-24 flex flex-col items-center px-4 sm:px-8"
      style={{ background: `linear-gradient(to bottom, ${AJE.menta} 0%, #d4f0de 10%, #ffffff 100%)` }}
    >
      <div
        className="absolute top-4 right-4 sm:right-6 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border"
        style={{ background: AJE.goldLight, borderColor: AJE.gold, color: AJE.bosque }}
      >
        <Star size={10} style={{ fill: AJE.gold, color: AJE.gold }} />
        Prueba gratis 30 días
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-5" style={{ color: AJE.bosque }}>¿Qué diseñamos hoy?</h1>
      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {['Mis diseños', 'Plantillas', 'Canva IA'].map((tab, i) => (
          <button
            key={tab}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
            style={i === 1
              ? { background: '#fff', borderColor: AJE.corporativo, color: AJE.bosque, fontWeight: 600 }
              : { borderColor: 'transparent', color: AJE.corporativo }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div
        className="w-full max-w-2xl rounded-2xl shadow-lg flex items-center gap-3 px-5 py-3"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${AJE.mentaDark}` }}
      >
        <Search size={18} style={{ color: AJE.lima }} />
        <input className="flex-1 bg-transparent outline-none text-sm" style={{ color: AJE.bosque }} placeholder="Busca entre millones de plantillas" />
        <SlidersHorizontal size={16} style={{ color: AJE.lima }} />
      </div>
    </div>

    <div className="px-4 sm:px-10 py-6 bg-white -mt-1 border-b" style={{ borderColor: AJE.mentaDark }}>
      <div className="flex justify-center gap-6 overflow-x-auto pb-1 no-scrollbar">
        {[
          { icon: Presentation, label: 'Presentación', color: AJE.corporativo },
          { icon: Heart,        label: 'Redes',         color: '#C62828' },
          { icon: Video,        label: 'Vídeo',         color: AJE.bosque },
          { icon: Printer,      label: 'Impresión',     color: AJE.lima },
          { icon: FileText,     label: 'Doc',           color: AJE.corporativo },
          { icon: Layers,       label: 'Pizarra',       color: '#2E7D32' },
          { icon: Calculator,   label: 'Hoja',          color: AJE.bosqueLight },
          { icon: Globe,        label: 'Web',           color: '#00695C' },
          { icon: Mail,         label: 'Email',         color: AJE.corporativo },
          { icon: Camera,       label: 'Foto',          color: '#4E342E' },
        ].map((c) => <CategoryPill key={c.label} {...c} />)}
      </div>
    </div>

    <div className="px-4 sm:px-10 py-8 bg-white">
      <h2 className="text-xl font-bold mb-5" style={{ color: AJE.bosque }}>Plantillas destacadas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-10">
        {[
          { label: 'Presentación',         color: `linear-gradient(135deg,${AJE.corporativo},${AJE.lima})` },
          { label: 'Cartel',               color: `linear-gradient(135deg,${AJE.menta},${AJE.mentaDark})` },
          { label: 'Currículum',           color: `linear-gradient(135deg,${AJE.bosque},${AJE.corporativo})` },
          { label: 'Email',                color: `linear-gradient(135deg,${AJE.mentaDark},${AJE.lima})` },
          { label: 'Logo',                 color: `linear-gradient(135deg,#F9FBE7,#DCEDC8)` },
          { label: 'Flyer',                color: `linear-gradient(135deg,${AJE.menta},#B2DFDB)` },
          { label: 'Post Instagram',       color: `linear-gradient(135deg,${AJE.lima},${AJE.corporativo})` },
          { label: 'Historia Instagram',   color: `linear-gradient(135deg,${AJE.bosque},${AJE.lima})` },
          { label: 'Vídeo horizontal',     color: `linear-gradient(135deg,${AJE.bosque},#1B5E20)` },
          { label: 'Invitación',           color: `linear-gradient(135deg,${AJE.menta},${AJE.limaLight})` },
          { label: 'Vídeo móvil',          color: `linear-gradient(135deg,#1A2E1A,${AJE.bosque})` },
          { label: 'Post Facebook',        color: `linear-gradient(135deg,${AJE.mentaDark},${AJE.menta})` },
        ].map((t, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden cursor-pointer group relative min-h-[120px] flex items-end p-3 shadow-sm hover:shadow-md transition-shadow"
            style={{ background: t.color }}
          >
            <span className="text-white font-bold text-[12px] drop-shadow-md z-10 leading-tight">{t.label}</span>
            <div className="absolute inset-0 group-hover:bg-black/10 transition-all rounded-2xl" />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-5" style={{ color: AJE.bosque }}>Descubre lo mejor</h2>
      <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
        {[
          { bg: AJE.corporativo, text: 'La naturaleza es nuestra fuente', color: '#fff' },
          { bg: AJE.menta,       text: '¡Próximamente!',                  color: AJE.bosque },
          { bg: AJE.bosque,      text: '¿CÓMO GRABO MIS VIDEOS?',         color: '#fff' },
          { bg: '#E8F5E9',       text: 'Puedes con todo',                  color: AJE.corporativo },
          { bg: AJE.lima,        text: 'PROYECTO DE SOSTENIBILIDAD',       color: '#fff' },
        ].map((card, i) => (
          <div
            key={i}
            className="min-w-[140px] h-[180px] rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
            style={{ background: card.bg }}
          >
            <p className="text-center text-sm px-3 font-semibold" style={{ color: card.color }}>{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── MARCA VIEW ───────────────────────────────────────────────────────────────
const MarcaView: React.FC = () => (
  <div className="flex flex-col rounded-3xl mt-2 ml-2 mr-2 overflow-hidden">
    <div
      className="relative pt-10 pb-10 px-4 sm:px-10 flex flex-col"
      style={{ background: `linear-gradient(to bottom, ${AJE.menta} 0%, #d4f0de 10%, #ffffff 100%)` }}
    >
      <div
        className="absolute top-4 right-4 sm:right-6 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border"
        style={{ background: AJE.goldLight, borderColor: AJE.gold, color: AJE.bosque }}
      >
        <Star size={10} style={{ fill: AJE.gold, color: AJE.gold }} />
        Prueba gratis 30 días
      </div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: 'rgba(255,255,255,0.7)', borderColor: AJE.mentaDark }}>
          <span className="text-lg">🌿</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: AJE.bosque }}>Kit de Marca AJE</h1>
      </div>

      <div
        className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm border"
        style={{ background: 'rgba(255,255,255,0.75)', borderColor: AJE.mentaDark }}
      >
        <div className="max-w-lg">
          <h2 className="text-xl font-bold mb-2" style={{ color: AJE.bosque }}>Da vida a tu marca en todos tus diseños</h2>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: AJE.corporativo }}>
            Prepara todos los recursos y pautas de tu marca AJE desde tu kit de marca.
            Mantén la identidad verde y sostenible sin complicaciones.
          </p>
          <button
            className="px-5 py-2.5 rounded-xl text-sm font-bold shadow flex items-center gap-2 text-white hover:opacity-90 transition-opacity"
            style={{ background: AJE.corporativo }}
          >
            <Star size={12} style={{ fill: '#fff' }} />
            Pruébalo gratis 30 días
          </button>
        </div>
        <div
          className="flex-shrink-0 w-full sm:w-52 h-36 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${AJE.bosque}, ${AJE.lima})` }}
        >
          <div className="text-center">
            <span className="text-white font-black text-5xl opacity-90">AJE</span>
            <div className="flex gap-1 mt-2 justify-center">
              <div className="h-3 w-8 rounded" style={{ background: AJE.bosque }} />
              <div className="h-3 w-8 rounded" style={{ background: AJE.corporativo }} />
              <div className="h-3 w-8 rounded" style={{ background: AJE.lima }} />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="px-4 sm:px-10 py-8 bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <BrandCard label="Logos" locked>
          <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl border-2" style={{ background: AJE.menta, color: AJE.bosque, borderColor: AJE.lima }}>AJE</div>
        </BrandCard>

        <BrandCard label="Colores AJE" locked>
          <div className="grid grid-cols-2 gap-1 w-28">
            {[AJE.bosque, AJE.corporativo, AJE.lima, AJE.menta, '#004B23CC', '#008037CC', '#70AD4799', '#E8F5E9CC', '#005A2B', '#2E7D32', '#A5D6A7', '#C8E6C9'].map((c, i) => (
              <div key={i} className="h-6 w-full rounded-sm" style={{ background: c }} />
            ))}
          </div>
        </BrandCard>

        <BrandCard label="Fuentes" locked>
          <div className="flex flex-col items-center gap-1 opacity-70">
            <span className="text-3xl font-bold" style={{ color: AJE.corporativo }}>Aa</span>
            <span className="text-2xl font-bold" style={{ color: AJE.lima }}>Bb</span>
            <span className="text-xl font-bold" style={{ color: AJE.bosque }}>Cc</span>
          </div>
        </BrandCard>

        <BrandCard label="Voz de marca" locked>
          <div className="flex flex-col items-center gap-2 opacity-60">
            <div className="text-5xl font-serif leading-none" style={{ color: AJE.lima }}>"</div>
            <div className="h-1.5 w-16 rounded" style={{ background: AJE.mentaDark }} />
            <div className="flex gap-2">
              <div className="h-1.5 w-10 rounded" style={{ background: AJE.mentaDark }} />
              <div className="h-1.5 w-6 rounded" style={{ background: AJE.mentaDark }} />
            </div>
          </div>
        </BrandCard>

        <BrandCard label="Fotos" locked>
          <div className="flex items-center justify-center opacity-50">
            <div className="w-14 h-14 border-2 border-dashed rounded-lg flex items-center justify-center" style={{ borderColor: AJE.lima }}>
              <Camera size={20} style={{ color: AJE.lima }} />
            </div>
          </div>
        </BrandCard>

        <BrandCard label="Elementos gráficos" locked>
          <div className="flex items-center justify-center opacity-60">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: AJE.menta }}>
              <span className="text-3xl">🌿</span>
            </div>
          </div>
        </BrandCard>

        <BrandCard label="Iconos" locked>
          <div className="grid grid-cols-3 gap-2 opacity-50">
            {[Lightbulb, Bell, Settings, Heart, ImageIcon, MessageSquare].map((Icon, i) => (
              <Icon key={i} size={18} style={{ color: AJE.corporativo }} />
            ))}
          </div>
        </BrandCard>

        <BrandCard label="Gráficos" locked>
          <div className="flex items-center justify-center opacity-70">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${AJE.bosque} 0deg 130deg, ${AJE.lima} 130deg 250deg, ${AJE.menta} 250deg 360deg)` }}>
              <div className="w-8 h-8 rounded-full bg-white" />
            </div>
          </div>
        </BrandCard>
      </div>
    </div>
  </div>
);

// ─── CANVA IA VIEW ────────────────────────────────────────────────────────────
const CanvaIAView: React.FC = () => (
  <div className="flex flex-col rounded-3xl mt-2 ml-2  mr-2 overflow-hidden">
    <div
      className="relative pt-12 pb-20 flex flex-col items-center px-4 sm:px-8 "
      style={{ background: `linear-gradient(to bottom, ${AJE.menta} 0%, #d4f0de 10%, #ffffff 100%)` }}
    >
      <div
        className="absolute top-4 right-4 sm:right-6 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border "
        style={{ background: AJE.goldLight, borderColor: AJE.gold, color: AJE.bosque }}
      >
        <Star size={10} style={{ fill: AJE.gold, color: AJE.gold }} />
        Prueba gratis 30 días
      </div>
      <h1
        className="text-3xl sm:text-4xl font-bold text-center mb-5"
        style={{ background: `linear-gradient(135deg, ${AJE.bosque}, ${AJE.corporativo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >
        ¿Qué diseñamos hoy?
      </h1>
      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {['Mis diseños', 'Plantillas', 'Canva IA'].map((tab, i) => (
          <button
            key={tab}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
            style={i === 2
              ? { background: '#fff', borderColor: AJE.corporativo, color: AJE.bosque, fontWeight: 600 }
              : { borderColor: 'transparent', color: AJE.corporativo }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div
        className="w-full max-w-2xl rounded-2xl shadow-lg flex items-center gap-3 px-5 py-3"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${AJE.mentaDark}` }}
      >
        <Sparkles size={18} style={{ color: AJE.lima }} />
        <input className="flex-1 bg-transparent outline-none text-sm" style={{ color: AJE.bosque }} placeholder="Describe tu idea y yo la haré realidad" />
        <SlidersHorizontal size={16} style={{ color: AJE.lima }} />
      </div>
    </div>

    <div className="px-4 sm:px-10 py-8 bg-white ">
      <h2 className="text-lg font-bold mb-5" style={{ color: AJE.bosque }}>Descubre lo que puedes hacer con la IA</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { type: 'Videos',    color: AJE.corporativo, title: 'Crea un video de sostenibilidad', bg: AJE.menta },
          { type: 'Escritura', color: AJE.lima,         title: 'Un blog sobre bebidas naturales', bg: '#F9FBE7' },
          { type: 'Imagen',    color: AJE.bosque,       title: 'Un campo verde al amanecer',      bg: AJE.menta },
          { type: 'Diseño',    color: '#00695C',        title: 'Promociona tu marca AJE',         bg: AJE.mentaDark },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group border"
            style={{ borderColor: AJE.mentaDark }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: card.color }}>{card.type}</span>
            <p className="text-sm font-semibold mt-1.5 mb-4 leading-snug" style={{ color: AJE.bosque }}>{card.title}</p>
            <div className="h-28 rounded-xl border transition-colors" style={{ background: card.bg, borderColor: AJE.mentaDark }} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── MÁS VIEW ─────────────────────────────────────────────────────────────────
const MasView: React.FC = () => (
  <div className="flex flex-col rounded-3xl mt-2 ml-2 mr-2 overflow-hidden">
    <div
      className="relative pt-12 pb-16 px-4 sm:px-10"
      style={{ background: `linear-gradient(to bottom, ${AJE.menta} 0%, #d4f0de 10%, #ffffff 100%)` }}
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: AJE.bosque }}>Más herramientas</h1>
      <p className="text-sm" style={{ color: AJE.corporativo }}>Explora todo lo que AJE Canva tiene para ofrecer</p>
    </div>
    <div className="px-4 sm:px-10 py-8 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { icon: Clock,   label: 'Disponible sin conexión', desc: 'Accede a tus diseños offline' },
        { icon: Users,   label: 'Compartido conmigo',      desc: 'Diseños que otros han compartido' },
        { icon: Star,    label: 'Favoritos',                desc: 'Tus plantillas favoritas' },
        { icon: Upload,  label: 'Subidos',                  desc: 'Archivos que has subido' },
        { icon: Layers,  label: 'Elementos gráficos',       desc: 'Biblioteca de elementos' },
        { icon: Camera,  label: 'Fotos',                    desc: 'Banco de imágenes gratuitas' },
      ].map((item, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 flex gap-4 items-start cursor-pointer transition-all border hover:shadow-md"
          style={{ borderColor: AJE.mentaDark }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: AJE.menta }}
          >
            <item.icon size={18} style={{ color: AJE.corporativo }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: AJE.bosque }}>{item.label}</p>
            <p className="text-xs mt-0.5" style={{ color: AJE.lima }}>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CanvaDashboard(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const [displayedTab, setDisplayedTab] = useState<TabId>('inicio');
  const [phase, setPhase] = useState<Phase>('idle');
  const [toggled, setToggled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const pendingTab = useRef<TabId | null>(null);

  const navigateTo = (tab: TabId): void => {
    if (tab === activeTab || phase !== 'idle') return;
    setMobileMenuOpen(false);
    pendingTab.current = tab;
    setPhase('exit');
  };

  useEffect(() => {
    if (phase === 'exit') {
      const t = setTimeout(() => {
        if (pendingTab.current) {
          setActiveTab(pendingTab.current);
          setDisplayedTab(pendingTab.current);
        }
        setPhase('enter');
      }, 220);
      return () => clearTimeout(t);
    }
    if (phase === 'enter') {
      const t = setTimeout(() => setPhase('idle'), 300);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const views: Record<TabId, React.ReactNode> = {
    inicio:     <InicioView />,
    proyectos:  <ProyectosView />,
    plantillas: <PlantillasView />,
    marca:      <MarcaView />,
    ia:         <CanvaIAView />,
    mas:        <MasView />,
  };

  const navItems: Array<{ icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; tab: TabId; badge?: boolean }> = [
    { icon: Home,          label: 'Inicio',     tab: 'inicio' },
    { icon: Folder,        label: 'Proyectos',  tab: 'proyectos' },
    { icon: LayoutGrid,    label: 'Plantillas', tab: 'plantillas' },
    { icon: Award,         label: 'Marca',      tab: 'marca',     badge: true },
    { icon: Sparkles,      label: 'IA',   tab: 'ia' },
    { icon: MoreHorizontal,label: 'Más',        tab: 'mas' },
  ];

const { auth } = usePage().props;

// Create a function to decide whether to show initials or full name
const getAvatarText = (user: any): string => {
  if (!user?.name) return 'U';
  const parts = user.name.trim().split(' ');
  // If only one word, show first two letters
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // Otherwise show first letter of first name + first letter of last name
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return `${first}${last}`.toUpperCase();
};

// auth is already declared above; skip re-declaration


  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes viewExit {
          0%   { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
          100% { opacity: 0; transform: translateX(-18px) scale(0.985); filter: blur(3px); }
        }
        @keyframes viewEnter {
          0%   { opacity: 0; transform: translateX(22px) scale(0.99); filter: blur(4px); }
          60%  { opacity: 1; filter: blur(0px); }
          100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
        }
        .phase-exit  { animation: viewExit  0.22s cubic-bezier(0.4,0,0.2,1) forwards; }
        .phase-enter { animation: viewEnter 0.30s cubic-bezier(0.16,1,0.3,1) forwards; }
        .phase-idle  { opacity: 1; }
        @keyframes navSlideIn {
          0%   { opacity: 0; transform: translateX(-8px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .nav-animate { animation: navSlideIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
        @media (max-width: 640px) {
          .mobile-sidebar { display: none; }
          .mobile-bottom-nav { display: flex; }
        }
        @media (min-width: 641px) {
          .mobile-sidebar { display: flex; }
          .mobile-bottom-nav { display: none; }
        }
      `}</style>

      {/* ── MAIN SIDEBAR (desktop) ── */}
      <aside
        className="mobile-sidebar w-[72px] flex-col items-center py-3 z-20 flex-shrink-0"
        style={{ background: "white" }}
      >
        <ToggleIcon toggled={toggled} setToggled={setToggled} />

        {/* Logo */}
        <div className="mb-3">
          <img src={embotelladoraCaral} alt="Embotelladora Caral" className="w-20 h-20" />
        </div>

        <div className="flex flex-col w-full px-1 gap-0.5 mt-1">
          {navItems.map((item) => (
            <SidebarBtn
              key={item.tab}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.tab}
              onClick={() => navigateTo(item.tab)}
              badge={item.badge}
            />
          ))}
        </div>

        <div className="mt-auto flex flex-col items-center gap-3 pb-2 w-full px-1">
          <button className="w-full flex flex-col items-center py-1.5 hover:text-white" style={{ color: AJE.bosque }}>
            <Bell size={18} strokeWidth={1.8} />
          </button>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: AJE.bosque }}
          >
            {getAvatarText((auth as any)?.user)}
            
          </button>
          <button className="flex flex-col items-center gap-0.5 hover:text-white" style={{ color: AJE.bosque }}>
            <Trash2 size={18} strokeWidth={1.8} />
            <span className="text-[9px] font-medium">Papelera</span>
          </button>
        </div>
      </aside>

      {/* ── SECONDARY NAV ── */}
      <nav
        key={`nav-${activeTab}`}
        className={`hidden sm:flex flex-col flex-shrink-0 overflow-y-auto nav-animate transition-all duration-300 bg-white`}
        style={{
          width: toggled ? '200px' : '0px',
          borderRight: ` ${AJE.bosqueLight}`,
          overflow: toggled ? 'auto' : 'hidden',
        }}
      >
        {toggled && (
          <div className="p-3 flex flex-col gap-0.5 pt-4 min-w-[200px]">
            {activeTab === 'inicio' && (
              <div className="px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-2" style={{ background: AJE.menta, color: AJE.bosque }}>
                <Home size={15} /> Inicio
              </div>
            )}
            {activeTab === 'proyectos' && (
              <>
                <div onClick={() => navigateTo('proyectos')} className="px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 cursor-pointer" style={{ background: AJE.menta, color: AJE.bosque }}>
                  <Folder size={15} /> Todos los proyectos
                </div>
                {[
                  { 
                    label: 'Mis proyectos', 
                    avatar: true 
                  }, 
                  {
                    icon: Users, 
                    label: 'Compartido conmigo' 
                  }, 
                  { 
                    icon: Monitor, 
                    label: 'Sin conexión' 
                  }
                ].map((item, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-green-50" style={{ color: AJE.corporativo }}>
                    {(item as any).avatar
                      ? <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: AJE.lima }}>JS</div>
                      : <item.icon size={15} />}
                    {item.label}
                  </div>
                ))}
              </>
            )}
            {activeTab === 'plantillas' && (
              <>
                {[
                  { icon: LayoutGrid, label: 'Plantillas', active: true },
                  { icon: Camera,     label: 'Fotos' },
                  { icon: Layers,     label: 'Elementos gráficos' },
                  { icon: Star,       label: 'Creators' },
                  { icon: Heart,      label: 'Favoritos' },
                ].map((item, i) => (
                  <div key={i} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-green-50`} style={item.active ? { background: AJE.menta, color: AJE.bosque, fontWeight: 600 } : { color: AJE.corporativo }}>
                    <item.icon size={15} /> {item.label}
                  </div>
                ))}
              </>
            )}
            {activeTab === 'marca' && (
              <>
                <div className="px-3 py-1.5 text-xs truncate" style={{ color: AJE.lima }}>Todas las plantillas de la marca...</div>
                <div className="px-3 py-2 rounded-lg border font-semibold text-sm flex items-center justify-between cursor-pointer hover:bg-green-50 mb-1" style={{ borderColor: AJE.mentaDark, color: AJE.bosque }}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: AJE.menta }}>
                      <Award size={11} style={{ color: AJE.corporativo }} />
                    </div>
                    Kit de Marca
                  </div>
                  <ChevronDown size={13} style={{ color: AJE.lima }} />
                </div>
                {['Todos los recursos','Pautas','Logos','Colores','Fuentes','Voz de la marca','Fotos','Elementos','Iconos','Gráficos'].map((item, i) => (
                  <div key={i} className="px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-green-50 ml-1" style={i === 0 ? { background: AJE.menta, color: AJE.bosque, fontWeight: 600 } : { color: AJE.corporativo }}>
                    {item}
                  </div>
                ))}
              </>
            )}
            {activeTab === 'ia' && (
              <div className="px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-2" style={{ background: AJE.menta, color: AJE.bosque }}>
                <Sparkles size={15} /> Canva IA
              </div>
            )}
            {activeTab === 'mas' && (
              <>
                {[{ icon: Clock, label: 'Sin conexión' }, { icon: Upload, label: 'Subidos' }, { icon: Star, label: 'Favoritos' }].map((item, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-green-50" style={{ color: AJE.corporativo }}>
                    <item.icon size={15} /> {item.label}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto bg-white relative pb-16 sm:pb-0">
        <div
          key={displayedTab}
          className={`phase-${phase === 'idle' ? 'idle' : phase}`}
          style={{ willChange: 'transform, opacity, filter' }}
        >
          {views[displayedTab]}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-30 items-center justify-around px-2 py-2 border-t"
        style={{ background: AJE.menta }}
      >
        {navItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => navigateTo(item.tab)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all relative"
            style={{ color: activeTab === item.tab ? AJE.gold : AJE.bosqueLight }}
          >
            <item.icon size={20} strokeWidth={1.8} />
            <span className="text-[9px] font-medium">{item.label}</span>
            {item.badge && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full border border-white" style={{ background: AJE.gold }} />
            )}
          </button>
        ))}
      </nav>

      {/* Help button */}
      <button
        className="fixed bottom-20 sm:bottom-6 right-6 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-2xl hover:opacity-90 text-lg font-bold z-50 transition-opacity"
        style={{ background: AJE.corporativo }}
      >
        ?
      </button>
    </div>
  );
}