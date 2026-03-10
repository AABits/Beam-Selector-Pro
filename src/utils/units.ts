export const convertLengthToMm = (value: number, unit: string) => {
  switch (unit) {
    case 'm': return value * 1000;
    case 'mm': return value;
    case 'in': return value * 25.4;
    case 'ft': return value * 304.8;
    default: return value;
  }
};

export const convertForceToN = (value: number, unit: string) => {
  switch (unit) {
    case 'N': return value;
    case 'kN': return value * 1000;
    case 'MN': return value * 1000000;
    case 'kgf': return value * 9.80665;
    case 'kg': return value * 9.80665; // masa a fuerza
    case 'tonf': return value * 9806.65; // metric ton-force
    case 'ton': return value * 9806.65; // masa a fuerza
    case 'lbf': return value * 4.44822;
    case 'lb': return value * 4.44822; // masa a fuerza
    case 'ozf': return value * 0.278014;
    default: return value;
  }
};

export const convertDistributedLoadToNmm = (value: number, unit: string) => {
  // N/mm is equivalent to kN/m
  switch (unit) {
    case 'N/m': return value / 1000;
    case 'N/mm': return value;
    case 'kN/m': return value;
    case 'kgf/m': return (value * 9.80665) / 1000;
    case 'kg/m': return (value * 9.80665) / 1000; // masa a fuerza
    case 'lbf/ft': return (value * 4.44822) / 304.8;
    case 'lb/ft': return (value * 4.44822) / 304.8; // masa a fuerza
    case 'tonf/m': return (value * 9806.65) / 1000;
    case 'ton/m': return (value * 9806.65) / 1000; // masa a fuerza
    default: return value;
  }
};

export const convertStressToMPa = (value: number, unit: string) => {
  // MPa = N/mm²
  switch (unit) {
    case 'MPa': return value;
    case 'N/mm²': return value;
    case 'GPa': return value * 1000;
    case 'psi': return value * 0.00689476;
    case 'ksi': return value * 6.89476;
    case 'kpsi': return value * 6.89476;
    default: return value;
  }
};

export const convertMomentToNmm = (value: number, unit: string) => {
  // N·mm
  switch (unit) {
    case 'N·mm': return value;
    case 'N·m': return value * 1000;
    case 'kN·m': return value * 1000000;
    case 'kgf·m': return value * 9806.65;
    case 'lbf·ft': return value * 1355.818;
    default: return value;
  }
};
