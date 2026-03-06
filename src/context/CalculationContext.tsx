import React, { createContext, useContext, useState } from 'react';
import type { BeamType, Material, AdvancedResult } from '../types';

interface CalculationState {
  inputs: {
    spanLength: number;
    spanUnit: string;
    supports: any[];
    pointLoads: any[];
    distributedLoads: any[];
    safetyFactor: number;
    deflectionLimit: number;
    material?: Material;
    beamType?: BeamType;
  } | null;
  results: {
    maxMoment: number; // kN.m
    maxShear: number; // kN
    maxDeflection: number; // mm
    reqWy: number; // cm3
    reqIy: number; // cm4
    allowableDeflection: number; // mm
    reactions: number[];
    reactionComponents: any[];
    suitableProfiles: AdvancedResult[];
    suggestions: AdvancedResult[];
  } | null;
}

const CalculationContext = createContext<{
  state: CalculationState;
  setState: React.Dispatch<React.SetStateAction<CalculationState>>;
} | undefined>(undefined);

export function CalculationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CalculationState>({
    inputs: null,
    results: null
  });

  return (
    <CalculationContext.Provider value={{ state, setState }}>
      {children}
    </CalculationContext.Provider>
  );
}

export function useCalculation() {
  const context = useContext(CalculationContext);
  if (context === undefined) {
    throw new Error('useCalculation must be used within a CalculationProvider');
  }
  return context;
}
