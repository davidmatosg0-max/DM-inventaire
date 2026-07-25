import React, { useCallback, useRef, useState } from 'react';
import { CheckCircle2, FileText, Loader2, Send, ShieldCheck, Sparkles } from 'lucide-react';

export type SimulacionEtapa = 'validation' | 'generation' | 'notification' | 'done';

export type SimulacionDestinatario = {
  id?: string;
  nombre: string;
  porcentaje?: number;
};

export interface SimulacionCreacionOverlayProps {
  activo: boolean;
  progreso: number;
  etapa: SimulacionEtapa;
  destinatarios: SimulacionDestinatario[];
  titulo: string;
  subtitulo: string;
  nota?: string;
  etiquetaProgresion?: string;
  etiquetaDestinatarios?: string;
  etiquetasEtapas?: {
    validation?: string;
    generation?: string;
    notification?: string;
  };
}

const ORDEN_ETAPA: Record<SimulacionEtapa, number> = {
  validation: 0,
  generation: 1,
  notification: 2,
  done: 3,
};

function iniciales(nombre: string): string {
  const partes = nombre
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase();
  return `${partes[0]![0]}${partes[partes.length - 1]![0]}`.toUpperCase();
}

const COLORES_DESTINATARIO = [
  '#1E73BE', '#2E7D32', '#F59E0B', '#7C3AED',
  '#EC4899', '#0891B2', '#DC2626', '#0D9488',
];

export function SimulacionCreacionOverlay({
  activo,
  progreso,
  etapa,
  destinatarios,
  titulo,
  subtitulo,
  nota,
  etiquetaProgresion = 'Progression',
  etiquetaDestinatarios = 'Destinataires',
  etiquetasEtapas,
}: SimulacionCreacionOverlayProps) {
  if (!activo) return null;

  const etapas: Array<{ key: SimulacionEtapa; label: string; Icon: typeof CheckCircle2 }> = [
    { key: 'validation', label: etiquetasEtapas?.validation ?? 'Validation', Icon: ShieldCheck },
    { key: 'generation', label: etiquetasEtapas?.generation ?? 'Génération', Icon: FileText },
    { key: 'notification', label: etiquetasEtapas?.notification ?? 'Notification', Icon: Send },
  ];
  const ordenActual = ORDEN_ETAPA[etapa];
  const totalDestinatarios = Math.max(destinatarios.length, 1);
  const slice = 100 / totalDestinatarios;

  // Anillo de progreso SVG
  const radio = 46;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia * (1 - Math.min(100, Math.max(0, progreso)) / 100);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center rounded-lg overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.96) 60%, rgba(226,232,240,0.96) 100%)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-2xl px-6 py-4">
        <div
          className="relative rounded-[28px] border border-slate-200/70 bg-white/95 overflow-hidden"
          style={{
            boxShadow: '0 40px 80px -32px rgba(15, 23, 42, 0.28), 0 12px 24px -12px rgba(15, 23, 42, 0.14)',
            fontFamily: 'Montserrat, Inter, system-ui, sans-serif',
          }}
        >
          {/* Barra fina superior con brand gradient */}
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg,#1E73BE 0%,#2E7D32 50%,#F59E0B 100%)' }}
          />

          <div className="px-8 pt-7 pb-6">
            {/* Encabezado + Anillo de progreso */}
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0" style={{ width: 108, height: 108 }}>
                <svg width="108" height="108" viewBox="0 0 108 108" className="-rotate-90">
                  <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E73BE" />
                      <stop offset="100%" stopColor="#2E7D32" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="54"
                    cy="54"
                    r={radio}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="54"
                    cy="54"
                    r={radio}
                    fill="none"
                    stroke="url(#ringGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circunferencia}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 120ms linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800 tabular-nums leading-none">
                    {Math.round(progreso)}%
                  </span>
                  <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {etiquetaProgresion}
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3F2FD] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E73BE]">
                    <Sparkles className="h-3 w-3" />
                    {subtitulo}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {titulo}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500">
                  Traitement automatisé — merci de patienter un instant.
                </p>
              </div>
            </div>

            {/* Timeline horizontal de etapas */}
            <div className="mt-7">
              <div className="relative">
                {/* Línea base */}
                <div className="absolute top-4 left-4 right-4 h-[2px] bg-slate-200" />
                {/* Línea rellena */}
                <div
                  className="absolute top-4 left-4 h-[2px] bg-[linear-gradient(90deg,#1E73BE,#2E7D32)] transition-all duration-300 ease-out"
                  style={{
                    width: `calc(${ordenActual >= etapas.length ? 100 : (ordenActual / (etapas.length - 1)) * 100}% - ${ordenActual >= etapas.length ? 32 : (ordenActual / (etapas.length - 1)) * 32}px)`,
                  }}
                />
                <div className="relative grid grid-cols-3 gap-2">
                  {etapas.map((et) => {
                    const ordenEtapa = ORDEN_ETAPA[et.key];
                    const activa = ordenEtapa === ordenActual;
                    const completada = ordenEtapa < ordenActual;
                    const Icon = et.Icon;
                    return (
                      <div key={et.key} className="flex flex-col items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                            completada
                              ? 'border-[#2E7D32] bg-[#2E7D32] text-white shadow-[0_6px_16px_-6px_rgba(46,125,50,0.55)]'
                              : activa
                                ? 'border-[#1E73BE] bg-white text-[#1E73BE] shadow-[0_0_0_4px_rgba(30,115,190,0.15)]'
                                : 'border-slate-300 bg-white text-slate-400'
                          }`}
                        >
                          {completada ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : activa ? (
                            <Icon className="h-4 w-4 animate-pulse" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
                            completada ? 'text-[#2E7D32]' : activa ? 'text-[#1E73BE]' : 'text-slate-400'
                          }`}
                        >
                          {et.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Destinatarios */}
            {destinatarios.length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {etiquetaDestinatarios}
                  </p>
                  <span className="text-[10px] font-semibold text-slate-400 tabular-nums">
                    {destinatarios.length}
                  </span>
                </div>
                <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-1" style={{ gridTemplateColumns: destinatarios.length > 4 ? 'repeat(2, minmax(0, 1fr))' : '1fr' }}>
                  {destinatarios.map((dest, index) => {
                    const umbralInicio = index * slice;
                    const umbralFin = umbralInicio + slice;
                    const listo = progreso >= umbralFin;
                    const activoDest = !listo && progreso >= umbralInicio - slice * 0.4;
                    const color = COLORES_DESTINATARIO[index % COLORES_DESTINATARIO.length];
                    return (
                      <div
                        key={dest.id || `${dest.nombre}-${index}`}
                        className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-all duration-300 ${
                          listo
                            ? 'border-[#4CAF50]/50 bg-[#E8F5E9]/70'
                            : activoDest
                              ? 'border-[#1E73BE]/40 bg-white shadow-sm'
                              : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
                        >
                          {iniciales(dest.nombre)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {dest.nombre}
                          </p>
                          {typeof dest.porcentaje === 'number' && (
                            <p className="text-[10px] font-medium text-slate-500 tabular-nums">
                              {dest.porcentaje}%
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {listo ? (
                            <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />
                          ) : activoDest ? (
                            <Loader2 className="h-4 w-4 animate-spin text-[#1E73BE]" />
                          ) : (
                            <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {nota && (
              <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
                <ShieldCheck className="h-3 w-3 text-slate-400" />
                {nota}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface UseSimulacionCreacionResult {
  activo: boolean;
  progreso: number;
  etapa: SimulacionEtapa;
  destinatarios: SimulacionDestinatario[];
  iniciar: (destinatarios: SimulacionDestinatario[], onCompletado: () => void, opciones?: { duracionMs?: number }) => void;
  cancelar: () => void;
}

export function useSimulacionCreacion(): UseSimulacionCreacionResult {
  const [activo, setActivo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [etapa, setEtapa] = useState<SimulacionEtapa>('validation');
  const [destinatarios, setDestinatarios] = useState<SimulacionDestinatario[]>([]);
  const timerRef = useRef<number | null>(null);
  const finalTimerRef = useRef<number | null>(null);

  const limpiar = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (finalTimerRef.current !== null) {
      window.clearTimeout(finalTimerRef.current);
      finalTimerRef.current = null;
    }
  }, []);

  const cancelar = useCallback(() => {
    limpiar();
    setActivo(false);
    setProgreso(0);
    setEtapa('validation');
  }, [limpiar]);

  const iniciar = useCallback((dests: SimulacionDestinatario[], onCompletado: () => void, opciones?: { duracionMs?: number }) => {
    limpiar();
    setDestinatarios(dests);
    setProgreso(0);
    setEtapa('validation');
    setActivo(true);

    const duracion = opciones?.duracionMs ?? 2600;
    const paso = 40;
    const incremento = (100 * paso) / duracion;

    timerRef.current = window.setInterval(() => {
      setProgreso((prev) => {
        const siguiente = Math.min(100, prev + incremento);
        if (siguiente < 40) {
          setEtapa('validation');
        } else if (siguiente < 85) {
          setEtapa('generation');
        } else if (siguiente < 100) {
          setEtapa('notification');
        } else {
          setEtapa('done');
        }
        if (siguiente >= 100) {
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          finalTimerRef.current = window.setTimeout(() => {
            try {
              onCompletado();
            } finally {
              setActivo(false);
              finalTimerRef.current = null;
            }
          }, 350);
        }
        return siguiente;
      });
    }, paso);
  }, [limpiar]);

  return { activo, progreso, etapa, destinatarios, iniciar, cancelar };
}
