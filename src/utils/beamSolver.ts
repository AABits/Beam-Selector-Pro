export function solveBeam(
  L: number, // mm
  pointLoads: { P: number, a: number }[], // N, mm
  distributedLoads: { w1: number, w2: number, x1: number, x2: number }[], // N/mm, mm
  supports: { x: number, type: 'pinned' | 'roller' | 'fixed' }[],
  momentLoads: { M: number, a: number }[] = [] // N*mm, mm
) {
  if (L <= 0 || supports.length === 0) {
    return { 
      maxMoment: 0, maxMomentX: 0,
      maxShear: 0, maxShearX: 0,
      maxDeflectionWithoutEI: 0, maxDeflectionX: 0,
      reactions: [], reactionComponents: [], points: [] 
    };
  }

  // Normalize coordinates by L to improve matrix conditioning
  const nPointLoads = pointLoads.map(p => ({ P: p.P, a: p.a / L }));
  const nDistLoads = distributedLoads.map(d => ({ 
    w1: d.w1 * L, 
    w2: d.w2 * L, 
    x1: d.x1 / L, 
    x2: d.x2 / L 
  }));
  const nMomentLoads = momentLoads.map(m => ({ M: m.M / L, a: m.a / L }));
  const nSupports = supports.map(s => ({ x: s.x / L, type: s.type }));

  // 1. Identify reaction components
  const reactionComponents: { x: number, type: 'force' | 'moment' }[] = [];
  for (const s of nSupports) {
    if (s.type === 'pinned' || s.type === 'roller') {
      reactionComponents.push({ x: s.x, type: 'force' });
    } else if (s.type === 'fixed') {
      reactionComponents.push({ x: s.x, type: 'force' });
      reactionComponents.push({ x: s.x, type: 'moment' });
    }
  }

  const numReactions = reactionComponents.length;
  const numUnknowns = numReactions + 2; // Reactions + C1', C2'

  const A = Array.from({ length: numUnknowns }, () => new Float64Array(numUnknowns));
  const B = new Float64Array(numUnknowns);

  // Global Equilibrium (Normalized)
  for (let j = 0; j < numReactions; j++) {
    if (reactionComponents[j].type === 'force') A[0][j] = 1;
  }
  let sumP = 0;
  for (const pl of nPointLoads) sumP += pl.P;
  for (const dl of nDistLoads) {
    sumP += 0.5 * (dl.w1 + dl.w2) * (dl.x2 - dl.x1);
  }
  B[0] = -sumP;

  for (let j = 0; j < numReactions; j++) {
    if (reactionComponents[j].type === 'force') A[1][j] = reactionComponents[j].x;
    else A[1][j] = 1;
  }
  let sumM0 = 0;
  for (const pl of nPointLoads) sumM0 += pl.P * pl.a;
  for (const ml of nMomentLoads) sumM0 += ml.M;
  for (const dl of nDistLoads) {
    const length = dl.x2 - dl.x1;
    if (length > 0) {
      const centroid = (length / 3) * (dl.w1 + 2 * dl.w2) / (dl.w1 + dl.w2);
      sumM0 += 0.5 * (dl.w1 + dl.w2) * length * (dl.x1 + centroid);
    }
  }
  B[1] = -sumM0;

  // Boundary Conditions (Normalized)
  let eqIdx = 2;
  for (const s of nSupports) {
    const xi_s = s.x;
    for (let j = 0; j < numReactions; j++) {
      const xi_j = reactionComponents[j].x;
      if (xi_s > xi_j) {
        if (reactionComponents[j].type === 'force') A[eqIdx][j] = Math.pow(xi_s - xi_j, 3) / 6;
        else A[eqIdx][j] = Math.pow(xi_s - xi_j, 2) / 2;
      }
    }
    A[eqIdx][numReactions] = xi_s; // C1'
    A[eqIdx][numReactions + 1] = 1; // C2'
    
    let v_loads = 0;
    for (const pl of nPointLoads) {
      if (xi_s > pl.a) v_loads += pl.P * Math.pow(xi_s - pl.a, 3) / 6;
    }
    for (const ml of nMomentLoads) {
      if (xi_s > ml.a) v_loads += ml.M * Math.pow(xi_s - ml.a, 2) / 2;
    }
    for (const dl of nDistLoads) {
      if (xi_s > dl.x1) {
        const xi_eff = Math.min(xi_s, dl.x2);
        const L_d = dl.x2 - dl.x1;
        const w1 = dl.w1;
        const w2 = dl.w2;
        const k = (w2 - w1) / L_d;
        const u = xi_eff - dl.x1;
        v_loads += (w1 / 24) * Math.pow(u, 4) + (k / 120) * Math.pow(u, 5);
        
        if (xi_s > dl.x2) {
          const V_full = w1 * L_d + 0.5 * k * L_d * L_d;
          const M_full = 0.5 * w1 * L_d * L_d + (k / 6) * L_d * L_d * L_d;
          const theta_full = (w1 / 6) * Math.pow(L_d, 3) + (k / 24) * Math.pow(L_d, 4);
          const d = xi_s - dl.x2;
          v_loads += theta_full * d + M_full * d * d / 2 + V_full * d * d * d / 6;
        }
      }
    }
    B[eqIdx] = -v_loads;
    eqIdx++;

    if (s.type === 'fixed') {
      for (let j = 0; j < numReactions; j++) {
        const xi_j = reactionComponents[j].x;
        if (xi_s > xi_j) {
          if (reactionComponents[j].type === 'force') A[eqIdx][j] = Math.pow(xi_s - xi_j, 2) / 2;
          else A[eqIdx][j] = (xi_s - xi_j);
        }
      }
      A[eqIdx][numReactions] = 1; // C1'
      
      let t_loads = 0;
      for (const pl of nPointLoads) {
        if (xi_s > pl.a) t_loads += pl.P * Math.pow(xi_s - pl.a, 2) / 2;
      }
      for (const ml of nMomentLoads) {
        if (xi_s > ml.a) t_loads += ml.M * (xi_s - ml.a);
      }
      for (const dl of nDistLoads) {
        if (xi_s > dl.x1) {
          const xi_eff = Math.min(xi_s, dl.x2);
          const L_d = dl.x2 - dl.x1;
          const w1 = dl.w1;
          const w2 = dl.w2;
          const k = (w2 - w1) / L_d;
          const u = xi_eff - dl.x1;
          t_loads += (w1 / 6) * Math.pow(u, 3) + (k / 24) * Math.pow(u, 4);
          
          if (xi_s > dl.x2) {
            const V_full = w1 * L_d + 0.5 * k * L_d * L_d;
            const M_full = 0.5 * w1 * L_d * L_d + (k / 6) * L_d * L_d * L_d;
            const d = xi_s - dl.x2;
            t_loads += M_full * d + 0.5 * V_full * d * d;
          }
        }
      }
      B[eqIdx] = -t_loads;
      eqIdx++;
    }
  }

  const X = solveLinearSystem(A, B);
  if (!X) return { 
    maxMoment: 0, maxMomentX: 0,
    maxShear: 0, maxShearX: 0,
    maxDeflectionWithoutEI: 0, maxDeflectionX: 0,
    reactions: [], reactionComponents: [], points: [] 
  };

  const reactions = X.slice(0, numReactions);
  const C1_prime = X[numReactions];
  const C2_prime = X[numReactions + 1];

  // 3. Generate points (Denormalize results)
  const N = 500;
  const points: { x: number, V: number, M: number, EI_v: number }[] = [];
  let max_M = 0; let max_MX = 0;
  let max_V = 0; let max_VX = 0;
  let max_EI_v = 0; let max_EI_vX = 0;

  for (let i = 0; i <= N; i++) {
    const xi = i / N;
    const x = xi * L;
    let V = 0;
    let M_prime = 0;
    let v_prime = C1_prime * xi + C2_prime;

    for (let j = 0; j < numReactions; j++) {
      const xi_j = reactionComponents[j].x;
      const val = reactions[j];
      if (xi > xi_j) {
        if (reactionComponents[j].type === 'force') {
          V += val;
          M_prime += val * (xi - xi_j);
          v_prime += val * Math.pow(xi - xi_j, 3) / 6;
        } else {
          M_prime += val;
          v_prime += val * Math.pow(xi - xi_j, 2) / 2;
        }
      }
    }

    for (const pl of nPointLoads) {
      if (xi > pl.a) {
        V += pl.P;
        M_prime += pl.P * (xi - pl.a);
        v_prime += pl.P * Math.pow(xi - pl.a, 3) / 6;
      }
    }
    for (const ml of nMomentLoads) {
      if (xi > ml.a) {
        M_prime += ml.M;
        v_prime += ml.M * Math.pow(xi - ml.a, 2) / 2;
      }
    }
    for (const dl of nDistLoads) {
      if (xi > dl.x1) {
        const xi_eff = Math.min(xi, dl.x2);
        const L_d = dl.x2 - dl.x1;
        const w1 = dl.w1;
        const w2 = dl.w2;
        const k = (w2 - w1) / L_d;
        const u = xi_eff - dl.x1;
        
        const V_seg = w1 * u + 0.5 * k * u * u;
        const M_seg = 0.5 * w1 * u * u + (k / 6) * u * u * u;
        const v_seg = (w1 / 24) * Math.pow(u, 4) + (k / 120) * Math.pow(u, 5);
        const theta_seg = (w1 / 6) * Math.pow(u, 3) + (k / 24) * Math.pow(u, 4);

        V += V_seg;
        M_prime += M_seg;
        v_prime += v_seg;

        if (xi > dl.x2) {
          const d = xi - dl.x2;
          M_prime += V_seg * d;
          v_prime += theta_seg * d + 0.5 * M_seg * d * d + (1/6) * V_seg * d * d * d;
        }
      }
    }

    const M = M_prime * L;
    const EI_v = v_prime * Math.pow(L, 3);

    points.push({ x, V, M, EI_v });
    if (Math.abs(M) > max_M) { max_M = Math.abs(M); max_MX = x; }
    if (Math.abs(V) > max_V) { max_V = Math.abs(V); max_VX = x; }
    if (Math.abs(EI_v) > max_EI_v) { max_EI_v = Math.abs(EI_v); max_EI_vX = x; }
  }

  return {
    maxMoment: max_M, maxMomentX: max_MX,
    maxShear: max_V, maxShearX: max_VX,
    maxDeflectionWithoutEI: max_EI_v, maxDeflectionX: max_EI_vX,
    reactions: Array.from(reactions),
    reactionComponents: reactionComponents.map(rc => ({ x: rc.x * L, type: rc.type })),
    points
  };
}

function solveLinearSystem(A: Float64Array[], B: Float64Array): Float64Array | null {
  const n = B.length;
  
  // Row scaling to improve conditioning
  for (let i = 0; i < n; i++) {
    let maxVal = 0;
    for (let j = 0; j < n; j++) {
      if (Math.abs(A[i][j]) > maxVal) maxVal = Math.abs(A[i][j]);
    }
    if (maxVal > 0) {
      for (let j = 0; j < n; j++) A[i][j] /= maxVal;
      B[i] /= maxVal;
    }
  }

  for (let i = 0; i < n; i++) {
    // Pivot selection
    let max = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > max) {
        max = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    // Swap rows
    const tempA = A[maxRow];
    A[maxRow] = A[i];
    A[i] = tempA;
    const tempB = B[maxRow];
    B[maxRow] = B[i];
    B[i] = tempB;

    if (Math.abs(A[i][i]) < 1e-12) return null; // Singular matrix

    // Elimination
    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        if (i === j) A[k][j] = 0;
        else A[k][j] += c * A[i][j];
      }
      B[k] += c * B[i];
    }
  }

  // Back substitution
  const X = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    X[i] = B[i] / A[i][i];
    for (let k = i - 1; k >= 0; k--) {
      B[k] -= A[k][i] * X[i];
    }
  }
  return X;
}
