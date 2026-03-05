export function solveBeam(
  L: number, // mm
  pointLoads: { P: number, a: number }[], // N, mm
  distributedLoads: { w1: number, w2: number, x1: number, x2: number }[], // N/mm, mm
  supportCondition: 'simply_supported' | 'cantilever' | 'propped_cantilever' | 'fixed_fixed'
) {
  const N = 500;
  const dx = L / N;
  
  const V_loads_left = new Float64Array(N + 1);
  const V_loads_right = new Float64Array(N + 1);
  const M_loads = new Float64Array(N + 1);
  
  for (let i = 0; i <= N; i++) {
    const x = i * dx;
    let v_l = 0;
    let v_r = 0;
    let m = 0;
    
    // Distributed loads
    for (const dl of distributedLoads) {
      if (x > dl.x1) {
        const x_end = Math.min(x, dl.x2);
        const A = dl.w1;
        const B = (dl.x2 === dl.x1) ? 0 : (dl.w2 - dl.w1) / (dl.x2 - dl.x1);
        const u_end = x_end - dl.x1;
        const D = x - dl.x1;
        
        const dv = A * u_end + 0.5 * B * u_end * u_end;
        v_l += dv;
        v_r += dv;
        m += A * D * u_end - 0.5 * A * u_end * u_end + 0.5 * B * D * u_end * u_end - (B / 3) * u_end * u_end * u_end;
      }
    }

    // Point loads
    for (const pl of pointLoads) {
      if (x > pl.a) {
        v_l += pl.P;
        v_r += pl.P;
        m += pl.P * (x - pl.a);
      } else if (Math.abs(x - pl.a) < 1e-7) {
        // exactly at x
        v_r += pl.P;
      }
    }
    
    V_loads_left[i] = v_l;
    V_loads_right[i] = v_r;
    M_loads[i] = m;
  }
  
  const I1 = new Float64Array(N + 1);
  const I2 = new Float64Array(N + 1);
  I1[0] = 0;
  I2[0] = 0;
  for (let i = 1; i <= N; i++) {
    I1[i] = I1[i-1] + 0.5 * (M_loads[i-1] + M_loads[i]) * dx;
    I2[i] = I2[i-1] + 0.5 * (I1[i-1] + I1[i]) * dx;
  }
  
  const I1_L = I1[N];
  const I2_L = I2[N];
  const M_loads_L = M_loads[N];
  const V_loads_L = V_loads_right[N];
  
  let R_L = 0, M_L = 0, C1 = 0, C2 = 0;
  
  if (supportCondition === 'simply_supported') {
    C2 = 0;
    M_L = 0;
    R_L = M_loads_L / L;
    C1 = (I2_L - R_L * Math.pow(L, 3) / 6) / L;
  } else if (supportCondition === 'cantilever') {
    C2 = 0;
    C1 = 0;
    R_L = V_loads_L;
    M_L = R_L * L - M_loads_L;
  } else if (supportCondition === 'fixed_fixed') {
    C2 = 0;
    C1 = 0;
    R_L = (I1_L * L / 2 - I2_L) / (Math.pow(L, 3) / 12);
    M_L = R_L * L / 2 - I1_L / L;
  } else if (supportCondition === 'propped_cantilever') {
    C2 = 0;
    C1 = 0;
    R_L = (M_loads_L * Math.pow(L, 2) / 2 - I2_L) / (Math.pow(L, 3) / 3);
    M_L = R_L * L - M_loads_L;
  }
  
  let max_M = 0;
  let max_V = 0;
  let max_EI_v = 0;
  
  for (let i = 0; i <= N; i++) {
    const x = i * dx;
    const V_l = R_L - V_loads_left[i];
    const V_r = R_L - V_loads_right[i];
    const M = -M_L + R_L * x - M_loads[i];
    const EI_v = -M_L * x * x / 2 + R_L * x * x * x / 6 - I2[i] + C1 * x + C2;
    
    if (Math.abs(M) > max_M) max_M = Math.abs(M);
    if (Math.abs(V_l) > max_V) max_V = Math.abs(V_l);
    if (Math.abs(V_r) > max_V) max_V = Math.abs(V_r);
    if (Math.abs(EI_v) > max_EI_v) max_EI_v = Math.abs(EI_v);
  }
  
  return {
    maxMoment: max_M, // N*mm
    maxShear: max_V, // N
    maxDeflectionWithoutEI: max_EI_v // N*mm^3
  };
}
