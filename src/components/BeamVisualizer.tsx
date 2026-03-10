import React, { useId } from 'react';
import { convertLengthToMm } from '../utils/units';

interface BeamVisualizerProps {
  spanLength: number;
  spanUnit: string;
  supports: any[];
  pointLoads: any[];
  distributedLoads: any[];
  momentLoads?: any[];
  showValues?: boolean;
  reactions?: number[];
  reactionComponents?: any[];
  noBorder?: boolean;
  selfWeight?: number; // N/mm
}

export default function BeamVisualizer({
  spanLength,
  spanUnit,
  supports = [],
  pointLoads = [],
  distributedLoads = [],
  momentLoads = [],
  showValues = false,
  reactions = [],
  reactionComponents = [],
  noBorder = false,
  selfWeight = 0
}: BeamVisualizerProps) {
  const L_mm = convertLengthToMm(spanLength, spanUnit) || 1; // Prevent division by zero
  const id = useId().replace(/:/g, '');
  
  // SVG dimensions
  const width = 800;
  const height = 200;
  const padding = 60;
  const beamY = height / 2 + 20;
  const beamXStart = padding;
  const beamXEnd = width - padding;
  const beamWidth = beamXEnd - beamXStart;

  const getX = (pos: number, unit: string) => {
    const val = Number(pos);
    if (isNaN(val)) return beamXStart;
    const pos_mm = convertLengthToMm(val, unit);
    const x = beamXStart + (pos_mm / L_mm) * beamWidth;
    return isFinite(x) ? x : beamXStart;
  };

  return (
    <div className={`w-full bg-white dark:bg-slate-900 rounded-lg overflow-hidden ${noBorder ? '' : 'p-4 border border-slate-200 dark:border-slate-700'}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid background and Markers */}
        <defs>
          <pattern id={`grid-${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-100 dark:text-slate-800" />
          </pattern>
          
          <marker id={`arrowhead-${id}`} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#0ea5e9" />
          </marker>
          <marker id={`arrowhead-small-${id}`} markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#0ea5e9" />
          </marker>
          <marker id={`arrowhead-reaction-${id}`} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
          </marker>
          <marker id={`arrowhead-moment-${id}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${id})`} />

        {/* Beam */}
        <rect
          x={beamXStart}
          y={beamY - 5}
          width={beamWidth}
          height={10}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
          className="text-slate-300 dark:text-slate-600"
        />

        {/* Self-Weight Visualization */}
        {selfWeight > 0 && (
          <g opacity="0.4">
            <rect
              x={beamXStart}
              y={beamY - 15}
              width={beamWidth}
              height={10}
              fill="rgba(148, 163, 184, 0.1)"
              stroke="#94a3b8"
              strokeWidth="0.5"
              strokeDasharray="2"
            />
            {Array.from({ length: 15 }).map((_, idx) => {
              const arrowX = beamXStart + (beamWidth / 14) * idx;
              return (
                <line
                  key={idx}
                  x1={arrowX} y1={beamY - 15}
                  x2={arrowX} y2={beamY - 5}
                  stroke="#94a3b8"
                  strokeWidth="0.5"
                  markerEnd={`url(#arrowhead-small-${id})`}
                />
              );
            })}
            <text x={beamXStart + 5} y={beamY - 20} className="text-[8px] fill-slate-400">Peso Propio</text>
          </g>
        )}

        {/* Supports */}
        {Array.isArray(supports) && supports.map((s, i) => {
          const x = getX(s.position, s.positionUnit);
          if (s.type === 'fixed') {
            return (
              <g key={s.id || i}>
                <rect x={x - 5} y={beamY - 20} width={10} height={40} fill="#8b8678" />
                <rect x={x - 8} y={beamY + 20} width={16} height={4} fill="#8b8678" />
              </g>
            );
          } else if (s.type === 'pinned') {
            return (
              <g key={s.id || i}>
                <path d={`M ${x} ${beamY + 5} L ${x - 10} ${beamY + 20} L ${x + 10} ${beamY + 20} Z`} fill="#8b8678" />
                <rect x={x - 12} y={beamY + 20} width={24} height={4} fill="#8b8678" />
              </g>
            );
          } else if (s.type === 'roller') {
            return (
              <g key={s.id || i}>
                <circle cx={x} cy={beamY + 12} r={7} fill="#8b8678" />
                <rect x={x - 12} y={beamY + 20} width={24} height={4} fill="#8b8678" />
              </g>
            );
          }
          return null;
        })}

        {/* Point Loads */}
        {Array.isArray(pointLoads) && pointLoads.map((p, i) => {
          const x = getX(p.position, p.positionUnit);
          const isUp = p.direction === 'up';
          // If down: arrow from top to beam
          // If up: arrow from bottom to beam
          const arrowYStart = isUp ? beamY + 60 : beamY - 60;
          const arrowYEnd = isUp ? beamY + 10 : beamY - 10;
          
          return (
            <g key={p.id || i}>
              <line
                x1={x} y1={arrowYStart}
                x2={x} y2={arrowYEnd}
                stroke="#0ea5e9"
                strokeWidth="2"
                markerEnd={`url(#arrowhead-${id})`}
              />
              {showValues && (
                <text x={x} y={isUp ? arrowYStart + 15 : arrowYStart - 5} textAnchor="middle" className="text-[12px] font-bold fill-slate-700 dark:fill-slate-300">
                  {p.magnitude} {p.unit}
                </text>
              )}
            </g>
          );
        })}

        {/* Distributed Loads */}
        {Array.isArray(distributedLoads) && distributedLoads.map((d, i) => {
          const x1 = getX(d.startPosition, d.positionUnit);
          const x2 = getX(d.endPosition, d.positionUnit);
          const isUp = d.direction === 'up';
          
          const rectY = isUp ? beamY + 5 : beamY - 40;
          const rectHeight = 35;
          const arrowYStart = isUp ? beamY + 40 : beamY - 40;
          const arrowYEnd = isUp ? beamY + 10 : beamY - 10;

          return (
            <g key={d.id || i}>
              <rect
                x={Math.min(x1, x2)}
                y={rectY}
                width={Math.abs(x2 - x1)}
                height={rectHeight}
                fill="rgba(14, 165, 233, 0.1)"
                stroke="#0ea5e9"
                strokeWidth="1"
                strokeDasharray="4"
              />
              {/* Arrows for distributed load */}
              {Array.from({ length: 7 }).map((_, idx) => {
                const arrowX = Math.min(x1, x2) + (Math.abs(x2 - x1) / 6) * idx;
                return (
                  <line
                    key={idx}
                    x1={arrowX} y1={arrowYStart}
                    x2={arrowX} y2={arrowYEnd}
                    stroke="#0ea5e9"
                    strokeWidth="1"
                    markerEnd={`url(#arrowhead-small-${id})`}
                  />
                );
              })}
              {showValues && (
                <text x={(x1 + x2) / 2} y={isUp ? beamY + 55 : beamY - 45} textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300">
                  {d.magnitudeStart === d.magnitudeEnd ? `${d.magnitudeStart} ${d.unit}` : `${d.magnitudeStart}-${d.magnitudeEnd} ${d.unit}`}
                </text>
              )}
            </g>
          );
        })}

        {/* Reactions (if provided) */}
        {Array.isArray(reactions) && Array.isArray(reactionComponents) && reactions.map((r, i) => {
          const comp = reactionComponents[i];
          if (comp && comp.type === 'force') {
            const x = getX(comp.x, 'mm');
            const isUp = r > 0; // Positive in solver means upward reaction
            const arrowYStart = isUp ? beamY + 60 : beamY - 60;
            const arrowYEnd = isUp ? beamY + 25 : beamY - 25;
            return (
              <g key={i}>
                <line
                  x1={x} y1={arrowYStart}
                  x2={x} y2={arrowYEnd}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  markerEnd={`url(#arrowhead-reaction-${id})`}
                />
                <text x={x} y={isUp ? arrowYStart + 15 : arrowYStart - 5} textAnchor="middle" className="text-[10px] font-bold fill-amber-600">
                  {Math.abs(r) >= 1000 ? `${(Math.abs(r) / 1000).toFixed(2)} kN` : `${Math.abs(r).toFixed(2)} N`}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Moment Loads */}
        {Array.isArray(momentLoads) && momentLoads.map((m, i) => {
          const x = getX(m.position, m.positionUnit);
          const isCW = m.direction === 'cw';
          
          return (
            <g key={m.id || i}>
              {/* Circular arrow for moment */}
              <path
                d={isCW 
                  ? `M ${x-15} ${beamY-15} A 20 20 0 1 1 ${x+15} ${beamY-15}` 
                  : `M ${x+15} ${beamY-15} A 20 20 0 1 0 ${x-15} ${beamY-15}`
                }
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                markerEnd={`url(#arrowhead-moment-${id})`}
              />
              {showValues && (
                <text x={x} y={beamY - 45} textAnchor="middle" className="text-[10px] font-bold fill-indigo-600 dark:fill-indigo-400">
                  {m.magnitude} kN·m
                </text>
              )}
            </g>
          );
        })}

        {/* Dimension Line */}
        <line x1={beamXStart} y1={beamY + 40} x2={beamXEnd} y2={beamY + 40} stroke="currentColor" className="text-slate-400" strokeWidth="1" />
        <line x1={beamXStart} y1={beamY + 35} x2={beamXStart} y2={beamY + 45} stroke="currentColor" className="text-slate-400" strokeWidth="1" />
        <line x1={beamXEnd} y1={beamY + 35} x2={beamXEnd} y2={beamY + 45} stroke="currentColor" className="text-slate-400" strokeWidth="1" />
        <text x={(beamXStart + beamXEnd) / 2} y={beamY + 55} textAnchor="middle" className="text-[12px] fill-slate-500">
          {spanLength} {spanUnit}
        </text>
      </svg>
    </div>
  );
}
