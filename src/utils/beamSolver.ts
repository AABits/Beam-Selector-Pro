export function solveBeam(
  L: number, // mm
  pointLoads: { P: number, a: number }[], // N, mm
  distributedLoads: { w1: number, w2: number, x1: number, x2: number }[], // N/mm, mm
  supports: { x: number, type: 'pinned' | 'roller' | 'fixed' }[]
) {
  if (L <= 0 || supports.length === 0) {
    return { maxMoment: 0, maxShear: 0, maxDeflectionWithoutEI: 0 };
  }

  const N = 500;
  const dx = L / N;
  
  // 1. Precalculate I1 and I2 for loads (Macaulay-like integration)
  const I1_loads = new Float64Array(N + 1);
  const I2_loads = new Float64Array(N + 1);
  const M_loads = new Float64Array(N + 1);
  const V_loads = new Float64Array(N + 1);

  for (let i = 0; i <= N; i++) {
    const x = i * dx;
    let v = 0;
    let m = 0;
    
    for (const dl of distributedLoads) {
      if (x > dl.x1) {
        const x_end = Math.min(x, dl.x2);
        const A = dl.w1;
        const B = (dl.x2 === dl.x1) ? 0 : (dl.w2 - dl.w1) / (dl.x2 - dl.x1);
        const u_end = x_end - dl.x1;
        const D = x - dl.x1;
        
        v += A * u_end + 0.5 * B * u_end * u_end;
        m += A * D * u_end - 0.5 * A * u_end * u_end + 0.5 * B * D * u_end * u_end - (B / 3) * u_end * u_end * u_end;
      }
    }

    for (const pl of pointLoads) {
      if (x > pl.a) {
        v += pl.P;
        m += pl.P * (x - pl.a);
      }
    }
    
    V_loads[i] = v;
    M_loads[i] = m;
  }
  
  for (let i = 1; i <= N; i++) {
    I1_loads[i] = I1_loads[i-1] + 0.5 * (M_loads[i-1] + M_loads[i]) * dx;
    I2_loads[i] = I2_loads[i-1] + 0.5 * (I1_loads[i-1] + I1_loads[i]) * dx;
  }

  // 2. Set up linear system for reactions and integration constants C1, C2
  // Unknowns: [R1, R2, ..., Rn, M1, M2, ..., Mm, C1, C2]
  // Reaction components: Force R_i at x_i, Moment M_j at x_j
  const reactionComponents: { x: number, type: 'force' | 'moment' }[] = [];
  for (const s of supports) {
    if (s.type === 'pinned' || s.type === 'roller') {
      reactionComponents.push({ x: s.x, type: 'force' });
    } else if (s.type === 'fixed') {
      reactionComponents.push({ x: s.x, type: 'force' });
      reactionComponents.push({ x: s.x, type: 'moment' });
    }
  }

  const numReactions = reactionComponents.length;
  const numUnknowns = numReactions + 2;
  const A = Array.from({ length: numUnknowns }, () => new Float64Array(numUnknowns));
  const B = new Float64Array(numUnknowns);

  // Equilibrium Equations
  // 1. Sum of Forces = 0
  for (let j = 0; j < numReactions; j++) {
    if (reactionComponents[j].type === 'force') A[0][j] = 1;
    else A[0][j] = 0;
  }
  B[0] = -V_loads[N];

  // 2. Sum of Moments about x=0 = 0
  // Sum(R_k * x_k) + Sum(M_k) + Sum(P_i * a_i) = 0
  // Sum(P_i * a_i) = V_loads[N] * L - M_loads[N]
  for (let j = 0; j < numReactions; j++) {
    if (reactionComponents[j].type === 'force') A[1][j] = reactionComponents[j].x;
    else A[1][j] = 1;
  }
  B[1] = -(V_loads[N] * L - M_loads[N]);

  // Boundary Conditions
  let eqIdx = 2;
  for (const s of supports) {
    // v(x_s) = 0
    // C2 + C1*x_s + I2_loads(x_s) + sum(R_i * <x_s - x_i>^3 / 6) + sum(M_j * <x_s - x_j>^2 / 2) = 0
    const x_s = s.x;
    for (let j = 0; j < numReactions; j++) {
      const x_j = reactionComponents[j].x;
      const type_j = reactionComponents[j].type;
      if (x_s > x_j) {
        if (type_j === 'force') A[eqIdx][j] = Math.pow(x_s - x_j, 3) / 6;
        else A[eqIdx][j] = Math.pow(x_s - x_j, 2) / 2;
      }
    }
    A[eqIdx][numReactions] = x_s; // C1
    A[eqIdx][numReactions + 1] = 1; // C2
    
    // Find I2_loads at x_s using interpolation
    const idx = Math.min(Math.floor(x_s / dx), N - 1);
    const frac = (x_s - idx * dx) / dx;
    B[eqIdx] = -(I2_loads[idx] + frac * (I2_loads[idx + 1] - I2_loads[idx]));
    eqIdx++;

    if (s.type === 'fixed') {
      // theta(x_s) = 0
      // C1 + I1_loads(x_s) + sum(R_i * <x_s - x_i>^2 / 2) + sum(M_j * <x_s - x_j>^1) = 0
      for (let j = 0; j < numReactions; j++) {
        const x_j = reactionComponents[j].x;
        const type_j = reactionComponents[j].type;
        if (x_s > x_j) {
          if (type_j === 'force') A[eqIdx][j] = Math.pow(x_s - x_j, 2) / 2;
          else A[eqIdx][j] = (x_s - x_j);
        }
      }
      A[eqIdx][numReactions] = 1; // C1
      A[eqIdx][numReactions + 1] = 0; // C2
      
      const idx = Math.min(Math.floor(x_s / dx), N - 1);
      const frac = (x_s - idx * dx) / dx;
      B[eqIdx] = -(I1_loads[idx] + frac * (I1_loads[idx + 1] - I1_loads[idx]));
      eqIdx++;
    }
  }

  // Solve A*X = B using Gaussian elimination
  const X = solveLinearSystem(A, B);
  if (!X) return { maxMoment: 0, maxShear: 0, maxDeflectionWithoutEI: 0, reactions: [], reactionComponents: [] };

  const reactions = X.slice(0, numReactions);
  const C1 = X[numReactions];
  const C2 = X[numReactions + 1];

  // 3. Calculate final results
  let max_M = 0;
  let max_V = 0;
  let max_EI_v = 0;

  for (let i = 0; i <= N; i++) {
    const x = i * dx;
    // V(x) = V_loads(x) + sum(R_k)
    // M(x) = M_loads(x) + sum(R_k * <x - x_k>) + sum(M_k)
    // EI_v(x) = I2_loads(x) + sum(R_k * <x - x_k>^3 / 6) + sum(M_k * <x - x_k>^2 / 2) + C1*x + C2
    let V = V_loads[i];
    let M = M_loads[i];
    let EI_v = I2_loads[i] + C1 * x + C2;

    for (let j = 0; j < numReactions; j++) {
      const x_j = reactionComponents[j].x;
      const type_j = reactionComponents[j].type;
      const val = reactions[j];
      if (x > x_j) {
        if (type_j === 'force') {
          V += val;
          M += val * (x - x_j);
          EI_v += val * Math.pow(x - x_j, 3) / 6;
        } else {
          M += val;
          EI_v += val * Math.pow(x - x_j, 2) / 2;
        }
      }
    }

    if (Math.abs(M) > max_M) max_M = Math.abs(M);
    if (Math.abs(V) > max_V) max_V = Math.abs(V);
    if (Math.abs(EI_v) > max_EI_v) max_EI_v = Math.abs(EI_v);
  }

  return {
    maxMoment: max_M,
    maxShear: max_V,
    maxDeflectionWithoutEI: max_EI_v,
    reactions: Array.from(reactions),
    reactionComponents
  };
}

function solveLinearSystem(A: Float64Array[], B: Float64Array): Float64Array | null {
  const n = B.length;
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
