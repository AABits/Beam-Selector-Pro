import React from 'react';
import { useCalculation } from '../context/CalculationContext';
import { FileText, ArrowRight, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function EvidenceTab() {
  const { state } = useCalculation();
  const { inputs, results } = state;

  if (!inputs || !results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
        <FileText size={64} className="opacity-20" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">No hay cálculos recientes</h3>
          <p className="text-sm">Realiza un cálculo en la pestaña "Cálculo" para ver la hoja de evidencias.</p>
        </div>
      </div>
    );
  }

  const selectedProfile = results.suitableProfiles[0];

  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <FileText className="text-amber-500" />
          Hoja de Evidencias de Cálculo
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Resumen detallado de los parámetros y resultados obtenidos para la verificación técnica.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Inputs */}
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              1. Datos de Entrada
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 w-1/2">Longitud de Viga (L)</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{inputs.spanLength} {inputs.spanUnit}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">Material</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{inputs.material?.name}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">Módulo de Elasticidad (E)</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{inputs.material?.e} GPa</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">Límite de Fluencia (Fy)</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{inputs.material?.fy} MPa</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">Factor de Seguridad (FS)</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{inputs.safetyFactor}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">Límite de Deflexión</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">L / {inputs.deflectionLimit} ({results.allowableDeflection.toFixed(2)} mm)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              2. Reacciones en los Apoyos
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Posición (x)</th>
                    <th className="px-4 py-2 text-left font-semibold">Tipo</th>
                    <th className="px-4 py-2 text-right font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {results.reactionComponents.map((comp, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{comp.x} mm</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize">{comp.type === 'force' ? 'Fuerza Vertical' : 'Momento'}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {Math.abs(results.reactions[idx]).toFixed(2)} {comp.type === 'force' ? 'N' : 'N·mm'}
                        <span className="text-[10px] ml-1 opacity-60">{results.reactions[idx] < 0 ? (comp.type === 'force' ? '↑' : '↺') : (comp.type === 'force' ? '↓' : '↻')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Section 2: Results */}
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              3. Esfuerzos Internos Máximos
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Momento Flector Máx (Mmax)</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {results.maxMoment.toFixed(3)} <span className="text-sm font-normal text-slate-500">kN·m</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Esfuerzo Cortante Máx (Vmax)</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {results.maxShear.toFixed(2)} <span className="text-sm font-normal text-slate-500">kN</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              4. Requerimientos de Sección
            </h2>
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/50 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                  <ArrowRight size={16} />
                  Módulo de Sección Requerido (Wx)
                </div>
                <div className="text-lg font-bold text-amber-900 dark:text-amber-100">{results.reqWy.toFixed(2)} cm³</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                  <ArrowRight size={16} />
                  Inercia Requerida (Ix)
                </div>
                <div className="text-lg font-bold text-amber-900 dark:text-amber-100">{results.reqIy.toFixed(2)} cm⁴</div>
              </div>
            </div>
          </section>

          {selectedProfile && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                5. Perfil Seleccionado: {selectedProfile.profile.name}
              </h2>
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
                    <div className="text-[10px] uppercase font-bold text-slate-400">Esfuerzo Actuante</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {(results.maxMoment * 1000 / selectedProfile.profile.wx).toFixed(2)} MPa
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Factor de Seguridad (SF)</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedProfile.actualSF.toFixed(2)}
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
            </section>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg flex gap-3 items-start">
        <Info size={20} className="text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <p className="font-semibold mb-1">Nota Técnica:</p>
          Los cálculos se basan en la teoría de vigas de Euler-Bernoulli y el método de Macaulay para la resolución de vigas estáticamente indeterminadas. 
          Se asume un comportamiento elástico lineal del material. El autopeso de la viga ha sido incluido automáticamente en el cálculo.
          Verifique siempre los resultados con normativas locales (AISC, Eurocódigo, etc.) antes de la ejecución.
        </div>
      </div>
    </div>
  );
}
