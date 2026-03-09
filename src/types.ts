export interface BeamType {
  id: number;
  name: string;
}

export interface BeamProfile {
  id: number;
  type_id: number;
  name: string;
  h: number;
  b: number;
  e: number;
  e1: number;
  a: number;
  ix: number;
  wx: number;
  iy: number;
  wy: number;
  p: number;
}

export interface Material {
  id: number;
  name: string;
  fy: number;
  e: number;
}

export interface Support {
  id: string;
  type: 'pinned' | 'roller' | 'fixed';
  position: number;
  positionUnit: string;
}

export interface AdvancedResult {
  profile: BeamProfile;
  type?: BeamType;
  actualSF: number;
  actualDeflection: number;
  maxMoment: number;
  maxShear: number;
  shearStress: number;
  shearSF: number;
  vonMisesStress: number;
  vonMisesSF: number;
  maxMomentX: number;
  maxShearX: number;
  maxDeflectionX: number;
  reactions: number[];
  reactionComponents: any[];
  points: { x: number, V: number, M: number, EI_v: number }[];
}

