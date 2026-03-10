import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, Search } from 'lucide-react';
import type { BeamType, AdvancedResult, BeamProfile } from '../types';
import { getBeamIcon } from '../utils/icons';

interface ProfileCardProps {
  result: AdvancedResult;
  isOptimal: boolean;
  beamTypes: BeamType[];
  selectedTypeId: number | '';
  isSelected?: boolean;
  onSelect?: () => void;
}

const AdvancedIcon = () => (
  <div className="relative flex items-center justify-center">
    <Settings size={20} className="text-white" />
    <div className="absolute -bottom-1 -right-1 bg-amber-600 rounded-full p-0.5 border border-amber-500 shadow-sm">
      <Search size={10} className="text-white" strokeWidth={3} />
    </div>
  </div>
);

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  result, 
  isOptimal, 
  beamTypes, 
  selectedTypeId,
  isSelected,
  onSelect
}) => {
  const [expanded, setExpanded] = useState(false);
  const typeName = result.type ? result.type.name : beamTypes.find(t => t.id === selectedTypeId)?.name || '';

  const realFS = Math.min(result.actualSF, result.shearSF, result.vonMisesSF);

  return (
    <div className={`rounded-lg border overflow-hidden transition-all ${isSelected ? 'ring-2 ring-amber-500 border-amber-500' : ''} ${isOptimal ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
      <div 
        className="p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <div className="shrink-0">{getBeamIcon(typeName)}</div>
              <span className={`font-bold text-base sm:text-lg ${expanded ? '' : 'truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none'} ${isOptimal ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {result.profile.name}
              </span>
              {result.type && (
                <span className={`text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 sm:px-2 py-0.5 rounded ${expanded ? '' : 'truncate max-w-[70px] xs:max-w-[100px] sm:max-w-none'}`} title={result.type.name}>
                  {result.type.name}
                </span>
              )}
              {isOptimal && (
                <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[9px] sm:text-xs font-semibold rounded-full uppercase tracking-wide shrink-0">
                  Óptimo
                </span>
              )}
            </div>
            <div className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-2 sm:gap-x-4 gap-y-0.5">
              <span>Wx: {result.profile.wx} <span className="hidden sm:inline">cm³</span></span>
              <span>Ix: {result.profile.ix} <span className="hidden sm:inline">cm⁴</span></span>
              <span className="hidden xs:inline">Área: {result.profile.a} <span className="hidden sm:inline">cm²</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400 leading-none mb-0.5 sm:mb-1">FS Real</div>
            <div className={`text-lg sm:text-2xl font-black leading-none ${realFS >= 1.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {realFS.toFixed(2)}
            </div>
            <div className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
              {result.profile.p} <span className="hidden sm:inline">kg/m</span>
            </div>
          </div>
          {onSelect && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white p-2 sm:p-2.5 rounded-md transition-colors flex items-center justify-center shadow-sm shrink-0"
              title="Ver Avanzado"
            >
              <AdvancedIcon />
            </button>
          )}
          <button className="text-slate-400 hover:text-slate-300 p-1 shrink-0">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-4 text-sm">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Esfuerzo Flexión</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {(result.maxMoment * 1000000 / (result.profile.wx * 1000)).toFixed(2)} MPa
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">F.S. Flexión</span>
            <span className={`font-semibold ${result.actualSF >= 1.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.actualSF.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Esfuerzo Cortante</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {result.shearStress.toFixed(2)} MPa
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">F.S. Cortante</span>
            <span className={`font-semibold ${result.shearSF >= 1.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.shearSF.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Esfuerzo Von Mises</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {result.vonMisesStress.toFixed(2)} MPa
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">F.S. Von Mises</span>
            <span className={`font-semibold ${result.vonMisesSF >= 1.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.vonMisesSF.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Deflexión Real</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {result.actualDeflection.toFixed(2)} mm
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Momento Máx</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {result.maxMoment.toFixed(2)} kN·m
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
