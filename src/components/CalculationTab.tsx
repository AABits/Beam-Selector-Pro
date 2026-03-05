import React, { useState, useEffect } from 'react';
import { solveBeam } from '../utils/beamSolver';
import { Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Loader2, Check, X } from 'lucide-react';
import type { BeamType, BeamProfile, Material } from '../types';
import FilterDropdown from './FilterDropdown';
import { getBeamIcon } from './DatabaseTab';
import { convertLengthToMm, convertForceToN, convertDistributedLoadToNmm } from '../utils/units';

interface PointLoad {
  id: string;
  magnitude: number;
  unit: string;
  position: number;
  positionUnit: string;
}

interface DistributedLoad {
  id: string;
  magnitudeStart: number;
  magnitudeEnd: number;
  unit: string;
  startPosition: number;
  endPosition: number;
  positionUnit: string;
}

interface AdvancedResult {
  profile: BeamProfile;
  type?: BeamType;
  actualSF: number;
  actualDeflection: number;
  maxShear: number;
}

const ProfileCard = ({ 
  result, 
  isOptimal, 
  beamTypes, 
  selectedTypeId 
}: { 
  result: AdvancedResult, 
  isOptimal: boolean,
  beamTypes: BeamType[],
  selectedTypeId: number | ''
}) => {
  const [expanded, setExpanded] = useState(false);
  const typeName = result.type ? result.type.name : beamTypes.find(t => t.id === selectedTypeId)?.name || '';

  return (
    <div className={`rounded-lg border overflow-hidden ${isOptimal ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="flex items-center gap-2">
            {getBeamIcon(typeName)}
            <span className={`font-bold text-lg ${isOptimal ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {result.profile.name}
            </span>
            {result.type && (
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                {result.type.name}
              </span>
            )}
            {isOptimal && (
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wide">
                Óptimo
              </span>
            )}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex gap-4">
            <span>Wx: {result.profile.wx} cm³</span>
            <span>Ix: {result.profile.ix} cm⁴</span>
            <span>Área: {result.profile.a} cm²</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-xl font-bold ${isOptimal ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {result.profile.p} <span className="text-sm font-normal">kg/m</span>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-300 p-1">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="block text-slate-500 dark:text-slate-400 mb-1">Factor de Seguridad Real</span>
            <span className={`font-semibold ${result.actualSF >= 1.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.actualSF.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="block text-slate-500 dark:text-slate-400 mb-1">Deflexión Real</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {result.actualDeflection.toFixed(2)} mm
            </span>
          </div>
          <div>
            <span className="block text-slate-500 dark:text-slate-400 mb-1">Cortante Máximo (V)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {result.maxShear.toFixed(2)} kN
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CalculationTab() {
  const [beamTypes, setBeamTypes] = useState<BeamType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');

  // Calculation inputs
  const [supportCondition, setSupportCondition] = useState<'simply_supported' | 'cantilever' | 'propped_cantilever' | 'fixed_fixed'>('simply_supported');
  const [spanLength, setSpanLength] = useState<number>(5);
  const [spanUnit, setSpanUnit] = useState<string>('m');

  const [pointLoads, setPointLoads] = useState<PointLoad[]>([]);
  const [distributedLoads, setDistributedLoads] = useState<DistributedLoad[]>([]);

  const addPointLoad = () => {
    setPointLoads([...pointLoads, { 
      id: crypto.randomUUID(), 
      magnitude: 10, 
      unit: 'kN', 
      position: spanLength / 2, 
      positionUnit: spanUnit 
    }]);
  };

  const removePointLoad = (id: string) => {
    setPointLoads(pointLoads.filter(p => p.id !== id));
  };

  const addDistributedLoad = () => {
    setDistributedLoads([...distributedLoads, { 
      id: crypto.randomUUID(), 
      magnitudeStart: 5, 
      magnitudeEnd: 5, 
      unit: 'kN/m', 
      startPosition: 0, 
      endPosition: spanLength, 
      positionUnit: spanUnit 
    }]);
  };

  const removeDistributedLoad = (id: string) => {
    setDistributedLoads(distributedLoads.filter(d => d.id !== id));
  };

  const [safetyFactor, setSafetyFactor] = useState<number>(1.5);
  const [deflectionLimit, setDeflectionLimit] = useState<number>(250);

  const [selectedProfileTypes, setSelectedProfileTypes] = useState<Set<number>>(new Set());
  const [selectedSuggestionTypes, setSelectedSuggestionTypes] = useState<Set<number>>(new Set());

  const toggleProfileType = (typeId: number) => {
    const next = new Set(selectedProfileTypes);
    if (next.has(typeId)) next.delete(typeId);
    else next.add(typeId);
    setSelectedProfileTypes(next);
  };

  const toggleSuggestionType = (typeId: number) => {
    const next = new Set(selectedSuggestionTypes);
    if (next.has(typeId)) next.delete(typeId);
    else next.add(typeId);
    setSelectedSuggestionTypes(next);
  };

  const [results, setResults] = useState<{
    maxMoment: number;
    reqWy: number;
    reqIy: number;
    allowableDeflection: number;
    suitableProfiles: AdvancedResult[];
    suggestions: AdvancedResult[];
  } | null>(null);

  useEffect(() => {
    fetch('/api/beam-types')
      .then(res => res.json())
      .then(data => {
        setBeamTypes(data);
        if (data.length > 0) setSelectedTypeId(data[0].id);
      });

    fetch('/api/materials')
      .then(res => res.json())
      .then(data => {
        setMaterials(data);
        if (data.length > 0) setSelectedMaterialId(data[0].id);
      });
  }, []);

  const handleCalculate = async () => {
    if (!selectedTypeId || !selectedMaterialId) return;

    const res = await fetch(`/api/beam-profiles`);
    const allProfiles: BeamProfile[] = await res.json();

    const L_mm = convertLengthToMm(spanLength, spanUnit);
    const material = materials.find(m => m.id === selectedMaterialId);
    if (!material) return;
    
    const fy_MPa = material.fy;
    const E_MPa = material.e * 1000;

    // Prepare loads for solver
    const solverPointLoads = pointLoads.map(p => ({
      P: convertForceToN(p.magnitude, p.unit),
      a: convertLengthToMm(p.position, p.positionUnit)
    }));

    const solverDistLoads = distributedLoads.map(d => ({
      w1: convertDistributedLoadToNmm(d.magnitudeStart, d.unit),
      w2: convertDistributedLoadToNmm(d.magnitudeEnd, d.unit),
      x1: convertLengthToMm(d.startPosition, d.positionUnit),
      x2: convertLengthToMm(d.endPosition, d.positionUnit)
    }));

    const solverResult = solveBeam(L_mm, solverPointLoads, solverDistLoads, supportCondition);

    const allowableStress_MPa = fy_MPa / safetyFactor;
    const reqWx_cm3 = (solverResult.maxMoment / allowableStress_MPa) / 1000;

    const allowDeflection_mm = L_mm / deflectionLimit;
    const reqIx_cm4 = (solverResult.maxDeflectionWithoutEI / (E_MPa * allowDeflection_mm)) / 10000;

    const mapToAdvancedResult = (p: BeamProfile, type?: BeamType): AdvancedResult => {
      const actualStress = solverResult.maxMoment / (p.wx * 1000);
      const actualSF = fy_MPa / actualStress;
      const actualDeflection = solverResult.maxDeflectionWithoutEI / (E_MPa * p.ix * 10000);

      return {
        profile: p,
        type,
        actualSF,
        actualDeflection,
        maxShear: solverResult.maxShear / 1000
      };
    };

    const suitableForSelectedType = allProfiles
      .filter(p => p.type_id === selectedTypeId && p.wx >= reqWx_cm3 && p.ix >= reqIx_cm4)
      .sort((a, b) => a.p - b.p)
      .map(p => mapToAdvancedResult(p));

    const suggestions = allProfiles
      .filter(p => p.type_id !== selectedTypeId && p.wx >= reqWx_cm3 && p.ix >= reqIx_cm4)
      .sort((a, b) => a.p - b.p)
      .slice(0, 5)
      .map(p => mapToAdvancedResult(p, beamTypes.find(t => t.id === p.type_id)!));

    setResults({
      maxMoment: solverResult.maxMoment / 1000000,
      reqWy: reqWx_cm3,
      reqIy: reqIx_cm4,
      allowableDeflection: allowDeflection_mm,
      suitableProfiles: suitableForSelectedType,
      suggestions
    });
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Inputs Panel */}
      <div className="w-[400px] min-w-[400px] bg-white rounded-lg shadow-sm border border-slate-200 p-5 overflow-y-auto">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Parámetros de Cálculo</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Viga Preferido</label>
              <div className="flex items-center gap-2">
                {selectedTypeId && getBeamIcon(beamTypes.find(t => t.id === selectedTypeId)?.name || '')}
                <select
                  value={selectedTypeId}
                  onChange={e => setSelectedTypeId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="" disabled>Selecciona un tipo</option>
                  {beamTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Material</label>
              <select
                value={selectedMaterialId}
                onChange={e => setSelectedMaterialId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="" disabled>Selecciona un material</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name} (fy: {m.fy} MPa, E: {m.e} GPa)</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condición de Apoyo</label>
            <select
              value={supportCondition}
              onChange={e => setSupportCondition(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="simply_supported">Simplemente Apoyada</option>
              <option value="cantilever">En Voladizo</option>
              <option value="propped_cantilever">Apoyada y Empotrada</option>
              <option value="fixed_fixed">Doblemente Empotrada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longitud de la Viga (L)</label>
            <div className="flex">
              <input
                type="number" step="any"
                value={spanLength} onChange={e => setSpanLength(Number(e.target.value))}
                className="w-full px-3 py-2 border border-r-0 border-slate-300 dark:border-slate-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
              />
              <select
                value={spanUnit} onChange={e => setSpanUnit(e.target.value)}
                className="px-2 py-2 bg-slate-50 dark:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-r-md focus:outline-none dark:text-white"
              >
                <option value="m">m</option>
                <option value="mm">mm</option>
                <option value="in">in</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cargas Puntuales</label>
              <button onClick={addPointLoad} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-1">
                <Plus size={12} /> Agregar
              </button>
            </div>
            <div className="space-y-3">
              {pointLoads.map((p, idx) => (
                <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                  <button onClick={() => removePointLoad(p.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Magnitud (P)</label>
                      <div className="flex">
                        <input
                          type="number" step="any"
                          value={p.magnitude}
                          onChange={e => {
                            const next = [...pointLoads];
                            next[idx].magnitude = Number(e.target.value);
                            setPointLoads(next);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-l focus:outline-none"
                        />
                        <select
                          value={p.unit}
                          onChange={e => {
                            const next = [...pointLoads];
                            next[idx].unit = e.target.value;
                            setPointLoads(next);
                          }}
                          className="px-1 py-1 text-[10px] bg-slate-100 border border-l-0 border-slate-300 rounded-r"
                        >
                          <option value="kN">kN</option>
                          <option value="N">N</option>
                          <option value="kgf">kgf</option>
                          <option value="kg">kg</option>
                          <option value="tonf">tonf</option>
                          <option value="ton">ton</option>
                          <option value="lbf">lbf</option>
                          <option value="lb">lb</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Posición (x)</label>
                      <div className="flex">
                        <input
                          type="number" step="any"
                          value={p.position}
                          onChange={e => {
                            const next = [...pointLoads];
                            next[idx].position = Number(e.target.value);
                            setPointLoads(next);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-l focus:outline-none"
                        />
                        <select
                          value={p.positionUnit}
                          onChange={e => {
                            const next = [...pointLoads];
                            next[idx].positionUnit = e.target.value;
                            setPointLoads(next);
                          }}
                          className="px-1 py-1 text-[10px] bg-slate-100 border border-l-0 border-slate-300 rounded-r"
                        >
                          <option value="m">m</option>
                          <option value="mm">mm</option>
                          <option value="in">in</option>
                          <option value="ft">ft</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {pointLoads.length === 0 && <div className="text-center text-[10px] text-slate-400 py-2">No hay cargas puntuales</div>}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cargas Distribuidas</label>
              <button onClick={addDistributedLoad} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-1">
                <Plus size={12} /> Agregar
              </button>
            </div>
            <div className="space-y-3">
              {distributedLoads.map((d, idx) => (
                <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                  <button onClick={() => removeDistributedLoad(d.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Mag. Inicio (w1)</label>
                        <div className="flex">
                          <input
                            type="number" step="any"
                            value={d.magnitudeStart}
                            onChange={e => {
                              const next = [...distributedLoads];
                              next[idx].magnitudeStart = Number(e.target.value);
                              setDistributedLoads(next);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-l focus:outline-none"
                          />
                          <select
                            value={d.unit}
                            onChange={e => {
                              const next = [...distributedLoads];
                              next[idx].unit = e.target.value;
                              setDistributedLoads(next);
                            }}
                            className="px-1 py-1 text-[10px] bg-slate-100 border border-l-0 border-slate-300 rounded-r"
                          >
                            <option value="kN/m">kN/m</option>
                            <option value="N/m">N/m</option>
                            <option value="kgf/m">kgf/m</option>
                            <option value="kg/m">kg/m</option>
                            <option value="tonf/m">tonf/m</option>
                            <option value="ton/m">ton/m</option>
                            <option value="lbf/ft">lbf/ft</option>
                            <option value="lb/ft">lb/ft</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Mag. Fin (w2)</label>
                        <input
                          type="number" step="any"
                          value={d.magnitudeEnd}
                          onChange={e => {
                            const next = [...distributedLoads];
                            next[idx].magnitudeEnd = Number(e.target.value);
                            setDistributedLoads(next);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Pos. Inicio (x1)</label>
                        <div className="flex">
                          <input
                            type="number" step="any"
                            value={d.startPosition}
                            onChange={e => {
                              const next = [...distributedLoads];
                              next[idx].startPosition = Number(e.target.value);
                              setDistributedLoads(next);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-l focus:outline-none"
                          />
                          <select
                            value={d.positionUnit}
                            onChange={e => {
                              const next = [...distributedLoads];
                              next[idx].positionUnit = e.target.value;
                              setDistributedLoads(next);
                            }}
                            className="px-1 py-1 text-[10px] bg-slate-100 border border-l-0 border-slate-300 rounded-r"
                          >
                            <option value="m">m</option>
                            <option value="mm">mm</option>
                            <option value="in">in</option>
                            <option value="ft">ft</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Pos. Fin (x2)</label>
                        <input
                          type="number" step="any"
                          value={d.endPosition}
                          onChange={e => {
                            const next = [...distributedLoads];
                            next[idx].endPosition = Number(e.target.value);
                            setDistributedLoads(next);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {distributedLoads.length === 0 && <div className="text-center text-[10px] text-slate-400 py-2">No hay cargas distribuidas</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Factor de Seguridad</label>
              <input
                type="number" step="any"
                value={safetyFactor} onChange={e => setSafetyFactor(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Límite Deflexión</label>
              <div className="flex items-center">
                <span className="px-2 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 border border-r-0 border-slate-300 dark:border-slate-600 rounded-l-md py-2">L /</span>
                <input
                  type="number" step="any"
                  value={deflectionLimit} onChange={e => setDeflectionLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full mt-4 bg-amber-500 text-white font-semibold py-2.5 rounded-md hover:bg-amber-600 transition-colors"
          >
            Calcular y Seleccionar Óptimo
          </button>
        </div>
      </div>

      {/* Results Panel */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5 overflow-hidden flex flex-col">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b dark:border-slate-700 pb-2">Resultados</h2>
        
        {results ? (
          <div className="flex flex-col h-full overflow-y-auto pr-2">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Momento Máx</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{results.maxMoment.toFixed(2)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">kN·m</span></div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Wy Requerido</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{results.reqWy.toFixed(2)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">cm³</span></div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Iy Requerido</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{results.reqIy.toFixed(2)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">cm⁴</span></div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Deflexión Permisible</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{results.allowableDeflection.toFixed(2)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">mm</span></div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200">
                Perfiles Adecuados ({beamTypes.find(t => t.id === selectedTypeId)?.name})
              </h3>
              <div className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
                <FilterDropdown
                  label="Filtrar Perfiles"
                  options={results.suitableProfiles.map(p => ({ id: p.profile.id, name: p.profile.name }))}
                  selectedIds={selectedProfileTypes}
                  onSelectionChange={setSelectedProfileTypes}
                />
              </div>
            </div>
            <div className="mb-6">
              {results.suitableProfiles.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {results.suitableProfiles
                    .filter(res => selectedProfileTypes.size === 0 || selectedProfileTypes.has(res.profile.id))
                    .map((res, index) => (
                    <div key={res.profile.id}>
                      <ProfileCard 
                        result={res} 
                        isOptimal={index === 0} 
                        beamTypes={beamTypes} 
                        selectedTypeId={selectedTypeId} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400">
                  Ningún perfil de este tipo cumple con los requerimientos estructurales.
                </div>
              )}
            </div>

            {results.suggestions.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200">Sugerencias (Otros Tipos)</h3>
                  <div className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <FilterDropdown
                      label="Filtrar Sugerencias por Tipo"
                      options={beamTypes.filter(t => results.suggestions.some(s => s.type?.id === t.id)).map(t => ({ id: t.id, name: t.name }))}
                      selectedIds={selectedSuggestionTypes}
                      onSelectionChange={setSelectedSuggestionTypes}
                    />
                  </div>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {results.suggestions
                    .filter(sug => selectedSuggestionTypes.size === 0 || (sug.type && selectedSuggestionTypes.has(sug.type.id)))
                    .map((sug) => (
                    <div key={sug.profile.id}>
                      <ProfileCard 
                        result={sug} 
                        isOptimal={false} 
                        beamTypes={beamTypes} 
                        selectedTypeId={selectedTypeId} 
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500">
            Ingresa los parámetros y haz clic en calcular para ver los resultados
          </div>
        )}
      </div>
    </div>
  );
}

