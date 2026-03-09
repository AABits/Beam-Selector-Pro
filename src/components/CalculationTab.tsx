import React, { useState, useEffect, useCallback } from 'react';
import { solveBeam } from '../utils/beamSolver';
import { Plus, Trash2, Sparkles, Loader2, Check, X, Info, ArrowDown, ArrowUp, Calculator, BarChart2, AlertTriangle } from 'lucide-react';
import type { BeamType, BeamProfile, Material, AdvancedResult } from '../types';
import FilterDropdown from './FilterDropdown';
import ProfileCard from './ProfileCard';
import { getBeamIcon } from '../utils/icons';
import { convertLengthToMm, convertForceToN, convertDistributedLoadToNmm } from '../utils/units';
import { useCalculation } from '../context/CalculationContext';
import BeamVisualizer from './BeamVisualizer';

interface PointLoad {
  id: string;
  magnitude: number;
  unit: string;
  position: number;
  positionUnit: string;
  direction: 'down' | 'up';
}

interface DistributedLoad {
  id: string;
  magnitudeStart: number;
  magnitudeEnd: number;
  unit: string;
  startPosition: number;
  endPosition: number;
  positionUnit: string;
  direction: 'down' | 'up';
}

interface MomentLoad {
  id: string;
  magnitude: number;
  position: number;
  positionUnit: string;
  direction: 'ccw' | 'cw';
}

interface Support {
  id: string;
  type: 'pinned' | 'roller' | 'fixed';
  position: number;
  positionUnit: string;
}

interface CalculationTabProps {
  onGoToEvidence?: () => void;
}

export default function CalculationTab({ onGoToEvidence }: CalculationTabProps) {
  const { setState: setGlobalState } = useCalculation();
  const [beamTypes, setBeamTypes] = useState<BeamType[]>([]);
  const [allProfiles, setAllProfiles] = useState<BeamProfile[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');

  // Calculation inputs
  const [supportCondition, setSupportCondition] = useState<'simply_supported' | 'cantilever' | 'propped_cantilever' | 'fixed_fixed' | 'custom'>('simply_supported');
  const [spanLength, setSpanLength] = useState<number>(5);
  const [spanUnit, setSpanUnit] = useState<string>('m');

  const [supports, setSupports] = useState<Support[]>([]);
  const [pointLoads, setPointLoads] = useState<PointLoad[]>([]);
  const [distributedLoads, setDistributedLoads] = useState<DistributedLoad[]>([]);
  const [momentLoads, setMomentLoads] = useState<MomentLoad[]>([]);
  const [includeSelfWeight, setIncludeSelfWeight] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync supports with supportCondition and spanLength
  useEffect(() => {
    if (supportCondition === 'custom') return;

    const L = spanLength;
    let newSupports: Support[] = [];

    if (supportCondition === 'simply_supported') {
      newSupports = [
        { id: 's1', type: 'pinned', position: 0, positionUnit: spanUnit },
        { id: 's2', type: 'roller', position: L, positionUnit: spanUnit }
      ];
    } else if (supportCondition === 'cantilever') {
      newSupports = [
        { id: 's1', type: 'fixed', position: 0, positionUnit: spanUnit }
      ];
    } else if (supportCondition === 'propped_cantilever') {
      newSupports = [
        { id: 's1', type: 'fixed', position: 0, positionUnit: spanUnit },
        { id: 's2', type: 'roller', position: L, positionUnit: spanUnit }
      ];
    } else if (supportCondition === 'fixed_fixed') {
      newSupports = [
        { id: 's1', type: 'fixed', position: 0, positionUnit: spanUnit },
        { id: 's2', type: 'fixed', position: L, positionUnit: spanUnit }
      ];
    }

    setSupports(newSupports);
  }, [supportCondition, spanLength, spanUnit]);

  const addSupport = () => {
    setSupports([...supports, {
      id: crypto.randomUUID(),
      type: 'pinned',
      position: spanLength / 2,
      positionUnit: spanUnit
    }]);
  };

  const removeSupport = (id: string) => {
    setSupports(supports.filter(s => s.id !== id));
  };

  const addPointLoad = () => {
    setPointLoads([...pointLoads, { 
      id: crypto.randomUUID(), 
      magnitude: 10, 
      unit: 'kN', 
      position: spanLength / 2, 
      positionUnit: spanUnit,
      direction: 'down'
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
      positionUnit: spanUnit,
      direction: 'down'
    }]);
  };

  const removeDistributedLoad = (id: string) => {
    setDistributedLoads(distributedLoads.filter(d => d.id !== id));
  };

  const [safetyFactor, setSafetyFactor] = useState<number>(1);
  const [deflectionLimit, setDeflectionLimit] = useState<number>(250);

  const [selectedProfileTypes, setSelectedProfileTypes] = useState<Set<number>>(new Set());
  const [selectedSuggestionTypes, setSelectedSuggestionTypes] = useState<Set<number>>(new Set());

  // Default material mapping
  const defaultMaterialMap: Record<string, string> = {
    'IPE': 'ASTM A36',
    'IPN': 'ASTM A36',
    'UPN': 'ASTM A36',
    'HEB': 'ASTM A36',
    'Tubo Cuadrado Mecánico': 'ASTM A366',
    'Tubo Cuadrado Estructural': 'ASTM A500 Gr. A',
    'Tubo Rectangular Mecánico': 'JIS 3141 SPCC SD',
    'Tubo Rectangular Estructural': 'ASTM A500 Gr. A',
    'Tubo Redondo Mecánico': 'JIS 3141 SPCC SD',
    'Tubo Redondo Estructural': 'ASTM A500 Gr. A',
    'Tubo Cuadrado A/INOX': 'AISI 304',
    'Tubo Rectangular A/INOX': 'AISI 304',
    'Tubo Redondo A/INOX': 'AISI 304'
  };

  useEffect(() => {
    if (selectedTypeId && beamTypes.length > 0 && materials.length > 0) {
      const selectedType = beamTypes.find(t => t.id === selectedTypeId);
      if (selectedType) {
        const defaultMaterialName = defaultMaterialMap[selectedType.name];
        if (defaultMaterialName) {
          const defaultMaterial = materials.find(m => m.name === defaultMaterialName);
          if (defaultMaterial) {
            setSelectedMaterialId(defaultMaterial.id);
          }
        }
      }
    }
  }, [selectedTypeId, beamTypes, materials]);

  const [results, setResults] = useState<{
    maxMoment: number;
    reqWy: number;
    reqIy: number;
    allowableDeflection: number;
    suitableProfiles: AdvancedResult[];
    suggestions: AdvancedResult[];
  } | null>(null);

  const mapToAdvancedResult = useCallback((
    p: BeamProfile, 
    type: BeamType | undefined,
    solverPointLoads: any[],
    solverDistLoads: any[],
    L_mm: number,
    solverSupports: any[],
    fy_MPa: number,
    E_MPa: number,
    solverMomentLoads: any[] = []
  ): AdvancedResult => {
    // Add self-weight as a distributed load if enabled
    let profileDistLoads = [...solverDistLoads];
    if (includeSelfWeight) {
      const sw_Nmm = (p.p * 9.80665) / 1000;
      profileDistLoads.push({
        w1: sw_Nmm,
        w2: sw_Nmm,
        x1: 0,
        x2: L_mm
      });
    }

    const profileResult = solveBeam(L_mm, solverPointLoads, profileDistLoads, solverSupports, solverMomentLoads);

    const actualStress = profileResult.maxMoment / (p.wx * 1000);
    const actualSF = fy_MPa / actualStress;
    const actualDeflection = profileResult.maxDeflectionWithoutEI / (E_MPa * p.ix * 10000);

    // Estimate Shear Area (Av)
    let av_mm2 = p.a * 100; // default to full area if unknown
    const currentTypeName = (type?.name || beamTypes.find(t => t.id === selectedTypeId)?.name || '').toUpperCase();
    
    if (currentTypeName.includes('IPE') || currentTypeName.includes('IPN') || currentTypeName.includes('HEA') || currentTypeName.includes('HEB')) {
      av_mm2 = p.h * p.e; // Web area
    } else if (currentTypeName.includes('RECTANGULAR') || currentTypeName.includes('CUADRADO') || currentTypeName.includes('INOX')) {
      av_mm2 = 2 * p.h * p.e; 
    } else if (currentTypeName.includes('REDONDO')) {
      av_mm2 = p.a * 100 * 0.637; // 2/pi * A
    } else if (currentTypeName.includes('UPN') || currentTypeName.includes('U') || currentTypeName.includes('C')) {
      av_mm2 = p.h * p.e; // Web area
    }

    const shearStress = (profileResult.maxShear / av_mm2);
    const allowableShear = 0.6 * fy_MPa;
    const shearSF = allowableShear / shearStress;

    const vonMisesStress = Math.sqrt(Math.pow(actualStress, 2) + 3 * Math.pow(shearStress, 2));
    const vonMisesSF = fy_MPa / vonMisesStress;

    return {
      profile: p,
      type,
      actualSF,
      actualDeflection,
      maxMoment: profileResult.maxMoment / 1000000,
      maxShear: profileResult.maxShear / 1000,
      shearStress,
      shearSF,
      vonMisesStress,
      vonMisesSF,
      maxMomentX: profileResult.maxMomentX,
      maxShearX: profileResult.maxShearX,
      maxDeflectionX: profileResult.maxDeflectionX,
      reactions: profileResult.reactions,
      reactionComponents: profileResult.reactionComponents,
      points: profileResult.points
    };
  }, [beamTypes, selectedTypeId, includeSelfWeight]);

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

    fetch('/api/beam-profiles')
      .then(res => res.json())
      .then(data => setAllProfiles(data));
  }, []);

  const handleCalculate = async () => {
    setError(null);
    if (!selectedTypeId || !selectedMaterialId) return;

    const L_mm = convertLengthToMm(spanLength, spanUnit);
    
    // Validation: Loads must be within the beam length
    for (const p of pointLoads) {
      const pos_mm = convertLengthToMm(p.position, p.positionUnit);
      if (pos_mm > L_mm || pos_mm < 0) {
        setError(`La carga puntual en ${p.position} ${p.positionUnit} está fuera de la longitud de la viga.`);
        return;
      }
    }

    for (const d of distributedLoads) {
      const start_mm = convertLengthToMm(d.startPosition, d.positionUnit);
      const end_mm = convertLengthToMm(d.endPosition, d.positionUnit);
      if (start_mm > L_mm || start_mm < 0 || end_mm > L_mm || end_mm < 0) {
        setError(`La carga distribuida entre ${d.startPosition} y ${d.endPosition} ${d.positionUnit} está fuera de la longitud de la viga.`);
        return;
      }
    }

    // Validation: Supports must be within the beam length
    for (const s of supports) {
      const pos_mm = convertLengthToMm(s.position, s.positionUnit);
      if (pos_mm > L_mm || pos_mm < 0) {
        setError(`El apoyo en ${s.position} ${s.positionUnit} está fuera de la longitud de la viga.`);
        return;
      }
    }

    const material = materials.find(m => m.id === selectedMaterialId);
    if (!material) return;
    
    const fy_MPa = material.fy;
    const E_MPa = material.e * 1000;

    // Prepare loads for solver
    const solverPointLoads = pointLoads.map(p => ({
      P: convertForceToN(p.magnitude, p.unit) * (p.direction === 'up' ? -1 : 1),
      a: convertLengthToMm(p.position, p.positionUnit)
    }));

    const solverDistLoads = distributedLoads.map(d => ({
      w1: convertDistributedLoadToNmm(d.magnitudeStart, d.unit) * (d.direction === 'up' ? -1 : 1),
      w2: convertDistributedLoadToNmm(d.magnitudeEnd, d.unit) * (d.direction === 'up' ? -1 : 1),
      x1: convertLengthToMm(d.startPosition, d.positionUnit),
      x2: convertLengthToMm(d.endPosition, d.positionUnit)
    }));

    const solverSupports = supports.map(s => ({
      x: convertLengthToMm(s.position, s.positionUnit),
      type: s.type
    }));

    const solverMomentLoads = momentLoads.map(m => ({
      M: Number(m.magnitude) * (m.direction === 'cw' ? -1 : 1) * 1000000, // Convert kN.m to N.mm
      a: convertLengthToMm(m.position, m.positionUnit)
    }));

    const allowableStress_MPa = fy_MPa / safetyFactor;
    const allowDeflection_mm = L_mm / deflectionLimit;

    const suitableForSelectedType = allProfiles
      .filter(p => p.type_id === selectedTypeId)
      .map(p => mapToAdvancedResult(p, undefined, solverPointLoads, solverDistLoads, L_mm, solverSupports, fy_MPa, E_MPa, solverMomentLoads))
      .filter(res => res.actualSF >= 1.0 && res.actualDeflection <= allowDeflection_mm && res.shearSF >= 1.0)
      .sort((a, b) => a.profile.p - b.profile.p);

    const suggestions = Array.from(new Set(allProfiles.map(p => p.type_id)))
      .filter(typeId => typeId !== selectedTypeId)
      .flatMap(typeId => {
        return allProfiles
          .filter(p => p.type_id === typeId)
          .map(p => mapToAdvancedResult(p, beamTypes.find(t => t.id === p.type_id)!, solverPointLoads, solverDistLoads, L_mm, solverSupports, fy_MPa, E_MPa, solverMomentLoads))
          .filter(res => res.actualSF >= 1.0 && res.actualDeflection <= allowDeflection_mm && res.shearSF >= 1.0)
          .sort((a, b) => a.profile.p - b.profile.p);
      });

    // If self-weight is included, we need a reference profile for the global summary.
    // We'll use the optimal profile if available, otherwise fallback to the first profile of the selected type.
    let summaryDistLoads = [...solverDistLoads];
    const optimalProfile = suitableForSelectedType[0];
    const refProfile = optimalProfile ? optimalProfile.profile : allProfiles.find(p => p.type_id === selectedTypeId);

    if (includeSelfWeight && refProfile) {
      const sw_Nmm = (refProfile.p * 9.80665) / 1000;
      summaryDistLoads.push({
        w1: sw_Nmm,
        w2: sw_Nmm,
        x1: 0,
        x2: L_mm
      });
    }

    const solverResult = solveBeam(L_mm, solverPointLoads, summaryDistLoads, solverSupports, solverMomentLoads);

    const reqWx_cm3 = (solverResult.maxMoment / allowableStress_MPa) / 1000;
    const reqIx_cm4 = (solverResult.maxDeflectionWithoutEI / (E_MPa * allowDeflection_mm)) / 10000;
    const refIx = refProfile?.ix || 1;

    const calcResults = {
      maxMoment: solverResult.maxMoment / 1000000,
      maxMomentX: solverResult.maxMomentX / 1000,
      maxShear: solverResult.maxShear / 1000,
      maxShearX: solverResult.maxShearX / 1000,
      maxDeflection: solverResult.maxDeflectionWithoutEI / (E_MPa * refIx * 10000),
      maxDeflectionX: solverResult.maxDeflectionX / 1000,
      reqWy: reqWx_cm3,
      reqIy: reqIx_cm4,
      allowableDeflection: allowDeflection_mm,
      reactions: solverResult.reactions,
      reactionComponents: solverResult.reactionComponents,
      points: solverResult.points,
      suitableProfiles: suitableForSelectedType,
      suggestions,
      selectedProfile: undefined // Reset selection on new calculation
    };

    setResults(calcResults);

    setGlobalState({
      inputs: {
        spanLength,
        spanUnit,
        supports,
        pointLoads,
        distributedLoads,
        momentLoads,
        includeSelfWeight,
        safetyFactor,
        deflectionLimit,
        material,
        beamType: beamTypes.find(t => t.id === selectedTypeId)
      },
      results: calcResults
    });
  };

  const handleSelectProfile = (profileResult: AdvancedResult) => {
    if (!results) return;
    
    const updatedResults = {
      ...results,
      selectedProfile: profileResult
    };
    
    setResults(updatedResults);
    
    setGlobalState(prev => ({
      ...prev,
      results: updatedResults
    }));
  };

  const handleSelectProfileAndGo = (profileResult: AdvancedResult) => {
    handleSelectProfile(profileResult);
    if (onGoToEvidence) {
      onGoToEvidence();
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Left Column */}
      <div className="w-[420px] min-w-[420px] flex flex-col gap-4 overflow-hidden">
        
        {/* Previsualización de Cargas */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 shrink-0">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Previsualización de Cargas (Opcional)</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-4">
              <BeamVisualizer
                spanLength={spanLength}
                spanUnit={spanUnit}
                supports={supports}
                pointLoads={pointLoads}
                distributedLoads={distributedLoads}
                momentLoads={momentLoads}
                noBorder
                selfWeight={includeSelfWeight ? (allProfiles.find(p => p.type_id === selectedTypeId)?.p || 0) * 9.80665 / 1000 : 0}
              />
            </div>
          </details>
        </div>

        {/* Selección de Viga */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b dark:border-slate-700 pb-2 flex items-center gap-2">
            <Check size={18} className="text-amber-500" />
            Selección de Viga
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Viga Preferido</label>
                <div className="flex items-center gap-2">
                  {selectedTypeId && getBeamIcon(beamTypes.find(t => t.id === selectedTypeId)?.name || '')}
                  <select
                    value={selectedTypeId}
                    onChange={e => setSelectedTypeId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white text-sm"
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
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white text-sm"
                >
                  <option value="" disabled>Selecciona un material</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (fy: {m.fy} MPa)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Self-Weight Toggle */}
            <div className="border-t dark:border-slate-700 pt-4 mt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={includeSelfWeight}
                    onChange={e => setIncludeSelfWeight(e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${includeSelfWeight ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${includeSelfWeight ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Incluir Peso Propio</span>
                  <span className="text-[10px] text-slate-400">Calcula automáticamente la carga muerta de la viga</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Parámetros de Cálculo */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5 overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b dark:border-slate-700 pb-2 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            Parámetros de Cálculo
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condición de Apoyo</label>
              <select
                value={supportCondition}
                onChange={e => setSupportCondition(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white text-sm"
              >
                <option value="simply_supported">Simplemente Apoyada</option>
                <option value="cantilever">En Voladizo</option>
                <option value="propped_cantilever">Apoyada y Empotrada</option>
                <option value="fixed_fixed">Doblemente Empotrada</option>
                <option value="custom">Personalizada (Múltiples Apoyos)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longitud de la Viga (L)</label>
              <div className="flex">
                <input
                  type="number" step="0.1"
                  value={spanLength === 0 ? '' : spanLength} 
                  onChange={e => setSpanLength(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-r-0 border-slate-300 dark:border-slate-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white text-sm"
                />
                <select
                  value={spanUnit} onChange={e => setSpanUnit(e.target.value)}
                  className="px-2 py-2 bg-slate-50 dark:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-r-md focus:outline-none dark:text-white text-sm"
                >
                  <option value="m">m</option>
                  <option value="mm">mm</option>
                  <option value="in">in</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>

            {/* Supports Section */}
            <div className="border-t dark:border-slate-700 pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Apoyos / Soportes</label>
                {supportCondition === 'custom' && (
                  <button onClick={addSupport} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-1 dark:text-slate-200">
                    <Plus size={12} /> Agregar
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {supports.map((s, idx) => (
                  <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                    {supportCondition === 'custom' && (
                      <button onClick={() => removeSupport(s.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Tipo de Apoyo</label>
                        <select
                          disabled={supportCondition !== 'custom'}
                          value={s.type}
                          onChange={e => {
                            const next = [...supports];
                            next[idx].type = e.target.value as any;
                            setSupports(next);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none dark:bg-slate-700 dark:text-white"
                        >
                          <option value="pinned">Articulado (Pinned)</option>
                          <option value="roller">Rodillo (Roller)</option>
                          <option value="fixed">Empotrado (Fixed)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Posición (x)</label>
                        <div className="flex">
                          <input
                            disabled={supportCondition !== 'custom'}
                            type="number" step="0.1"
                            value={s.position === 0 ? '0' : s.position}
                            onChange={e => {
                              const next = [...supports];
                              next[idx].position = e.target.value === '' ? 0 : Number(e.target.value);
                              setSupports(next);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-l focus:outline-none dark:bg-slate-700 dark:text-white"
                          />
                          <select
                            disabled={supportCondition !== 'custom'}
                            value={s.positionUnit}
                            onChange={e => {
                              const next = [...supports];
                              next[idx].positionUnit = e.target.value;
                              setSupports(next);
                            }}
                            className="px-1 py-1 text-[10px] bg-slate-100 dark:bg-slate-600 border border-l-0 border-slate-300 dark:border-slate-600 rounded-r dark:text-white"
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
                {supports.length === 0 && <div className="text-center text-[10px] text-slate-400 py-2">No hay apoyos configurados</div>}
              </div>
            </div>

            <div className="border-t dark:border-slate-700 pt-4">
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
                          <select
                            value={p.direction}
                            onChange={e => {
                              const next = [...pointLoads];
                              next[idx].direction = e.target.value as 'down' | 'up';
                              setPointLoads(next);
                            }}
                            className="px-1 py-1 text-[10px] bg-slate-100 border border-r-0 border-slate-300 rounded-l"
                          >
                            <option value="down">↓</option>
                            <option value="up">↑</option>
                          </select>
                          <input
                            type="number" step="0.1" min="0"
                            value={p.magnitude === 0 ? '' : p.magnitude}
                            onChange={e => {
                              const next = [...pointLoads];
                              next[idx].magnitude = e.target.value === '' ? 0 : Number(e.target.value);
                              setPointLoads(next);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 focus:outline-none"
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
                            type="number" step="0.1"
                            value={p.position === 0 ? '' : p.position}
                            onChange={e => {
                              const next = [...pointLoads];
                              next[idx].position = e.target.value === '' ? 0 : Number(e.target.value);
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
                            <select
                              value={d.direction}
                              onChange={e => {
                                const next = [...distributedLoads];
                                next[idx].direction = e.target.value as 'down' | 'up';
                                setDistributedLoads(next);
                              }}
                              className="px-1 py-1 text-[10px] bg-slate-100 border border-r-0 border-slate-300 rounded-l"
                            >
                              <option value="down">↓</option>
                              <option value="up">↑</option>
                            </select>
                            <input
                              type="number" step="0.1"
                              value={d.magnitudeStart === 0 ? '' : d.magnitudeStart}
                              onChange={e => {
                                const next = [...distributedLoads];
                                next[idx].magnitudeStart = e.target.value === '' ? 0 : Number(e.target.value);
                                setDistributedLoads(next);
                              }}
                              className="w-full px-2 py-1 text-xs border border-slate-300 focus:outline-none"
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
                            type="number" step="0.1"
                            value={d.magnitudeEnd === 0 ? '' : d.magnitudeEnd}
                            onChange={e => {
                              const next = [...distributedLoads];
                              next[idx].magnitudeEnd = e.target.value === '' ? 0 : Number(e.target.value);
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
                              type="number" step="0.1"
                              value={d.startPosition === 0 ? '' : d.startPosition}
                              onChange={e => {
                                const next = [...distributedLoads];
                                next[idx].startPosition = e.target.value === '' ? 0 : Number(e.target.value);
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
                            type="number" step="0.1"
                            value={d.endPosition === 0 ? '' : d.endPosition}
                            onChange={e => {
                              const next = [...distributedLoads];
                              next[idx].endPosition = e.target.value === '' ? 0 : Number(e.target.value);
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

            {/* Moment Loads Section */}
            <div className="space-y-3 border-t dark:border-slate-700 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Momentos Puntuales</h3>
                <button
                  onClick={() => setMomentLoads([...momentLoads, { id: crypto.randomUUID(), magnitude: 0, position: 0, positionUnit: spanUnit, direction: 'ccw' }])}
                  className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                >
                  <Plus size={12} /> Añadir Momento
                </button>
              </div>
              <div className="space-y-3">
                {momentLoads.map((m, idx) => (
                  <div key={m.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 relative group">
                    <button
                      onClick={() => setMomentLoads(momentLoads.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Magnitud (kN·m)</label>
                        <div className="flex">
                          <select
                            value={m.direction}
                            onChange={e => {
                              const next = [...momentLoads];
                              next[idx].direction = e.target.value as 'ccw' | 'cw';
                              setMomentLoads(next);
                            }}
                            className="px-1 py-1 text-[10px] bg-slate-100 dark:bg-slate-700 border border-r-0 border-slate-300 dark:border-slate-600 rounded-l dark:text-white"
                          >
                            <option value="ccw">↺</option>
                            <option value="cw">↻</option>
                          </select>
                          <input
                            type="number" step="0.1"
                            value={m.magnitude === 0 ? '' : m.magnitude}
                            onChange={e => {
                              const next = [...momentLoads];
                              next[idx].magnitude = e.target.value === '' ? 0 : Number(e.target.value);
                              setMomentLoads(next);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-r focus:outline-none dark:bg-slate-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Posición</label>
                        <div className="flex">
                          <input
                            type="number" step="0.1"
                            value={m.position === 0 ? '' : m.position}
                            onChange={e => {
                              const next = [...momentLoads];
                              next[idx].position = e.target.value === '' ? 0 : Number(e.target.value);
                              setMomentLoads(next);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-l focus:outline-none dark:bg-slate-700 dark:text-white"
                          />
                          <select
                            value={m.positionUnit}
                            onChange={e => {
                              const next = [...momentLoads];
                              next[idx].positionUnit = e.target.value;
                              setMomentLoads(next);
                            }}
                            className="px-1 py-1 text-[10px] bg-slate-100 dark:bg-slate-700 border border-l-0 border-slate-300 dark:border-slate-600 rounded-r dark:text-white"
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
                {momentLoads.length === 0 && <div className="text-center text-[10px] text-slate-400 py-2">No hay momentos puntuales</div>}
              </div>
            </div>

            {/* Self-Weight Toggle */}
            {/* Moved to Selección de Viga */}

            <div className="grid grid-cols-2 gap-4 border-t dark:border-slate-700 pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Factor de Seguridad</label>
                <input
                  type="number" step="0.1" min="0.1"
                  value={safetyFactor === 0 ? '' : safetyFactor} 
                  onChange={e => setSafetyFactor(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Límite Deflexión
                  <div className="group relative">
                    <Info size={14} className="text-slate-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg z-50 leading-tight">
                      Flecha máxima permitida como fracción del largo (L). 
                      Ej: L/250 significa que la viga no debe bajar más de 1/250 de su longitud.
                    </div>
                  </div>
                </label>
                <div className="flex items-center">
                  <span className="px-3 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 border border-r-0 border-slate-300 dark:border-slate-600 rounded-l-md py-2 whitespace-nowrap flex-shrink-0 font-medium text-sm">L /</span>
                  <input
                    type="number" step="0.1" min="1"
                    value={deflectionLimit === 0 ? '' : deflectionLimit} 
                    onChange={e => setDeflectionLimit(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Floating Calculate Button */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
              <button
                onClick={handleCalculate}
                className="bg-amber-500 text-white font-bold py-3 px-8 rounded-full hover:bg-amber-600 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Calculator size={20} />
                Calcular
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none">
          <div className="p-4 bg-red-50 dark:bg-red-900/90 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-100 rounded-lg shadow-2xl flex items-center gap-3 font-medium pointer-events-auto">
            <X size={20} className="flex-shrink-0" />
            {error}
          </div>
        </div>
      )}

      {/* Results Panel */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5 overflow-hidden flex flex-col h-full">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b dark:border-slate-700 pb-2">Resultados</h2>
        
        {results ? (
          <div className="flex flex-col h-full overflow-y-auto pr-2 pb-20">
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Momento Máx</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{(results.selectedProfile?.maxMoment || results.maxMoment).toFixed(2)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">kN·m</span></div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Cortante Máx</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{(results.selectedProfile?.maxShear || results.maxShear || 0).toFixed(2)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">kN</span></div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Wx Requerido</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{results.reqWy.toFixed(2)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">cm³</span></div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Ix Requerido</div>
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
            </div>
            <div className="mb-6">
              {results.suitableProfiles.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 p-1">
                  {results.suitableProfiles
                    .map((res, index) => (
                    <div key={res.profile.id}>
                      <ProfileCard 
                        result={res} 
                        isOptimal={index === 0} 
                        beamTypes={beamTypes} 
                        selectedTypeId={selectedTypeId} 
                        isSelected={results.selectedProfile?.profile.id === res.profile.id}
                        onSelect={() => handleSelectProfileAndGo(res)}
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
                      options={beamTypes.filter(t => t.id !== selectedTypeId).map(t => ({ id: t.id, name: t.name }))}
                      selectedIds={selectedSuggestionTypes}
                      onSelectionChange={setSelectedSuggestionTypes}
                    />
                  </div>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 p-1">
                  {(() => {
                    let displayedSuggestions = [];
                    if (selectedSuggestionTypes.size === 0) {
                      // Show only the optimal (first) profile for each type
                      const seenTypes = new Set();
                      for (const sug of results.suggestions) {
                        if (sug.type && !seenTypes.has(sug.type.id)) {
                          seenTypes.add(sug.type.id);
                          displayedSuggestions.push(sug);
                        }
                      }
                    } else {
                      // Show all profiles for the selected types
                      displayedSuggestions = results.suggestions.filter(sug => sug.type && selectedSuggestionTypes.has(sug.type.id));
                    }

                    return displayedSuggestions.map((sug) => (
                      <div key={sug.profile.id}>
                        <ProfileCard 
                          result={sug} 
                          isOptimal={selectedSuggestionTypes.size === 0 ? true : results.suggestions.find(s => s.type?.id === sug.type?.id)?.profile.id === sug.profile.id} 
                          beamTypes={beamTypes} 
                          selectedTypeId={selectedTypeId} 
                          isSelected={results.selectedProfile?.profile.id === sug.profile.id}
                          onSelect={() => handleSelectProfileAndGo(sug)}
                        />
                      </div>
                    ));
                  })()}
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

