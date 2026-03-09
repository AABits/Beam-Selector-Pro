import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import type { BeamType, AdvancedResult } from '../types';
import { getBeamIcon } from '../utils/icons';

interface ProfileCardProps {
  result: AdvancedResult;
  isOptimal: boolean;
  beamTypes: BeamType[];
  selectedTypeId: number | '';
  isSelected?: boolean;
  onSelect?: () => void;
}

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
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
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
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>Wx: {result.profile.wx} cm³</span>
              <span>Ix: {result.profile.ix} cm⁴</span>
              <span>Área: {result.profile.a} cm²</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">FS Real</div>
            <div className={`text-2xl font-black leading-none ${realFS >= 1.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {realFS.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {result.profile.p} kg/m
            </div>
          </div>
          {onSelect && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
              title="Ver Avanzado"
            >
              <FileText size={16} />
              Avanzado
            </button>
          )}
          <button className="text-slate-400 hover:text-slate-300 p-1">
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
