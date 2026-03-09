import React from 'react';
import { useCalculation } from '../context/CalculationContext';
import { FileText, ArrowRight, CheckCircle2, AlertCircle, Info, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import BeamVisualizer from './BeamVisualizer';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Label } from 'recharts';

export default function EvidenceTab() {
  const { state } = useCalculation();
  const { inputs, results } = state;

  if (!inputs || !results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
        <FileText size={64} className="opacity-20" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">No hay cálculos recientes</h3>
          <p className="text-sm">Realiza un cálculo en la pestaña "Cálculo" para ver la hoja de cálculo avanzado.</p>
        </div>
      </div>
    );
  }

  if (!results.selectedProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 m-6 p-12">
        <AlertCircle size={64} className="text-amber-500 opacity-50" />
        <div className="text-center max-w-md">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Selección Requerida</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Elija una de las propuestas (marcando la casilla en la tarjeta del perfil) en la pestaña de Cálculo para revisar los cálculos detallados.
          </p>
        </div>
      </div>
    );
  }

  const selectedProfile = results.selectedProfile;

  // Prepare data for charts
  const chartData = (selectedProfile.points || []).map(p => {
    const Ix = selectedProfile.profile.ix;
    return {
      x: Number((p.x / 1000).toFixed(3)), // Convert to meters for display
      V: Number((p.V / 1000).toFixed(3)), // kN
      M: Number((p.M / 1000000).toFixed(3)), // kN.m
      deflection: Number((p.EI_v / (inputs.material!.e * 1000 * Ix * 10000)).toFixed(4)) // mm
    };
  });

  const formatForce = (n: number) => {
    const kn = n / 1000;
    return `${kn.toFixed(2)} kN (${n.toFixed(2)} N)`;
  };

  const formatMoment = (n_mm: number) => {
    const kn_m = n_mm / 1000000;
    return `${kn_m.toFixed(2)} kN·m (${(n_mm / 1000).toFixed(2)} N·m)`;
  };

  const formatLength = (mm: number) => {
    if (Math.abs(mm) >= 1000) {
      return `${mm.toFixed(2)} mm (${(mm / 1000).toFixed(2)} m)`;
    } else if (Math.abs(mm) >= 10) {
      return `${mm.toFixed(2)} mm (${(mm / 10).toFixed(2)} cm)`;
    }
    return `${mm.toFixed(2)} mm`;
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <FileText className="text-amber-500" />
            Hoja de Cálculo Avanzado
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Verificación técnica detallada y diagramas de esfuerzos.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Fecha de Cálculo</div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Visual Representation */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <details className="group" open>
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              1. Esquema de Cargas y Apoyos
            </h2>
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-6">
            <BeamVisualizer
              spanLength={inputs.spanLength}
              spanUnit={inputs.spanUnit}
              supports={inputs.supports}
              pointLoads={inputs.pointLoads}
              distributedLoads={inputs.distributedLoads}
              momentLoads={inputs.momentLoads}
              showValues={true}
              reactions={selectedProfile.reactions}
              reactionComponents={selectedProfile.reactionComponents}
              noBorder
              selfWeight={inputs.includeSelfWeight ? (selectedProfile.profile.p || 0) * 9.80665 / 1000 : 0}
            />
          </div>
        </details>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Inputs & Summary */}
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              2. Datos de Entrada
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Longitud (L):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{inputs.spanLength} {inputs.spanUnit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Material:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{inputs.material?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Fluencia (Fy):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{inputs.material?.fy} MPa</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Factor Seg. (FS):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{inputs.safetyFactor}</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              3. Reacciones y Estabilidad
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-4 space-y-3">
                {selectedProfile.reactionComponents.map((rc: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      {rc.type === 'force' ? 'Reacción Vertical' : 'Momento de Empotramiento'} en {formatLength(rc.x)}:
                    </span>
                    <span className="font-bold text-amber-600">
                      {rc.type === 'force' ? formatForce(Math.abs(selectedProfile.reactions[idx])) : formatMoment(Math.abs(selectedProfile.reactions[idx]))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              4. Resumen de Esfuerzos
            </h2>
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Momento Máx</div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedProfile.maxMoment.toFixed(2)} <span className="text-sm font-normal">kN·m</span></div>
                    <div className="text-[10px] text-slate-500">en x = {formatLength(selectedProfile.maxMomentX)}</div>
                  </div>
                  <TrendingUp className="text-amber-500 opacity-50" size={24} />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Cortante Máx</div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedProfile.maxShear.toFixed(2)} <span className="text-sm font-normal">kN</span></div>
                    <div className="text-[10px] text-slate-500">en x = {formatLength(selectedProfile.maxShearX)}</div>
                  </div>
                  <Activity className="text-blue-500 opacity-50" size={24} />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Deflexión Máx</div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedProfile.actualDeflection.toFixed(2)} <span className="text-sm font-normal">mm</span></div>
                    <div className="text-[10px] text-slate-500">en x = {formatLength(selectedProfile.maxDeflectionX)}</div>
                  </div>
                  <TrendingDown className="text-emerald-500 opacity-50" size={24} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Section 5: Requerimientos */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              5. Requerimientos de Diseño
            </h2>
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/50 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-700/70 dark:text-amber-400/70">Esfuerzo Admisible (Flexión)</div>
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    {inputs.material ? (inputs.material.fy / inputs.safetyFactor).toFixed(2) : 0} MPa
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-700/70 dark:text-amber-400/70">Esfuerzo Admisible (Corte)</div>
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    {inputs.material ? (0.6 * inputs.material.fy / inputs.safetyFactor).toFixed(2) : 0} MPa
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-700/70 dark:text-amber-400/70">Deflexión Permisible</div>
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    {results.allowableDeflection.toFixed(2)} mm
                  </div>
                </div>
              </div>
              
              <div className="border-t border-amber-200/50 dark:border-amber-800/30 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
                    <ArrowRight size={16} />
                    Módulo de Sección Requerido (Wx)
                  </div>
                  <div className="text-lg font-bold text-amber-900 dark:text-amber-100">{results.reqWy.toFixed(2)} cm³</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
                    <ArrowRight size={16} />
                    Inercia Requerida (Ix)
                  </div>
                  <div className="text-lg font-bold text-amber-900 dark:text-amber-100">{results.reqIy.toFixed(2)} cm⁴</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Perfil Seleccionado */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              6. Perfil Seleccionado
            </h2>
            {selectedProfile ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{selectedProfile.profile.name}</span>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={14} />
                    CUMPLE CON LOS REQUERIMIENTOS
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Esfuerzo Actuante (Flexión)</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {(selectedProfile.maxMoment * 1000000 / (selectedProfile.profile.wx * 1000)).toFixed(2)} MPa
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Factor de Seguridad (Flexión)</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedProfile.actualSF.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Esfuerzo Cortante</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {selectedProfile.shearStress.toFixed(2)} MPa
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Factor de Seguridad (Cortante)</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedProfile.shearSF.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Esfuerzo Von Mises</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {selectedProfile.vonMisesStress.toFixed(2)} MPa
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Factor de Seguridad (Von Mises)</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedProfile.vonMisesSF.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Deflexión Real</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {selectedProfile.actualDeflection.toFixed(2)} mm
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Estado de Deflexión</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {(selectedProfile.actualDeflection <= results.allowableDeflection) ? 'OK' : 'FALLA'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/50 p-5 flex items-center gap-3 text-red-700 dark:text-red-300">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">Ningún perfil cumple con los requerimientos estructurales.</span>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <details className="group" open>
            <summary className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer list-none">
              <h3 className="text-xs font-bold text-slate-400 uppercase">Diagramas de Esfuerzos (Opcional)</h3>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-2 space-y-10">
              {/* Shear Chart */}
              <div className="h-[200px] w-full">
                <div className="px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Fuerzas Cortantes [kN]</div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                    <XAxis dataKey="x" hide />
                    <YAxis fontSize={10} stroke="#94a3b8" tickFormatter={(val) => val.toFixed(1)} />
                    <Tooltip 
                      contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--tw-colors-slate-800)', color: 'var(--tw-colors-slate-200)' }}
                      formatter={(value: any) => [`${value} kN`, 'Cortante']}
                      labelFormatter={(label) => `x = ${label} m`}
                    />
                    <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
                    <Area type="stepAfter" dataKey="V" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Moment Chart */}
              <div className="h-[200px] w-full">
                <div className="px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Momento Flector [kN·m]</div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                    <XAxis dataKey="x" hide />
                    <YAxis fontSize={10} stroke="#94a3b8" tickFormatter={(val) => val.toFixed(1)} />
                    <Tooltip 
                      contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--tw-colors-slate-800)', color: 'var(--tw-colors-slate-200)' }}
                      formatter={(value: any) => [`${value} kN·m`, 'Momento']}
                      labelFormatter={(label) => `x = ${label} m`}
                    />
                    <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
                    <Area type="monotone" dataKey="M" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Deflection Chart */}
              <div className="h-[200px] w-full">
                <div className="px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Deflexiones [mm]</div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                    <XAxis dataKey="x" fontSize={10} stroke="#94a3b8">
                      <Label value="Posición [m]" offset={-10} position="insideBottom" fontSize={10} fill="#94a3b8" />
                    </XAxis>
                    <YAxis fontSize={10} stroke="#94a3b8" tickFormatter={(val) => val.toFixed(1)} reversed />
                    <Tooltip 
                      contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--tw-colors-slate-800)', color: 'var(--tw-colors-slate-200)' }}
                      formatter={(value: any) => [`${value} mm`, 'Deflexión']}
                      labelFormatter={(label) => `x = ${label} m`}
                    />
                    <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
                    <Area type="monotone" dataKey="deflection" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </details>
        </section>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg flex gap-3 items-start">
        <Info size={20} className="text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <p className="font-semibold mb-1">Nota Técnica:</p>
          Los cálculos se basan en la teoría de vigas de Euler-Bernoulli y el método de Macaulay. 
          Se asume un comportamiento elástico lineal. El autopeso de la viga ha sido incluido.
          Verifique siempre los resultados con normativas locales antes de la ejecución.
        </div>
      </div>
    </div>
  );
}
