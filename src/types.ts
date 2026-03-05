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

