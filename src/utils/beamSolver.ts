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

  // 1. Identify reaction components
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
  const numUnknowns = numReactions + 2; // Reactions + C1, C2

  const A = Array.from({ length: numUnknowns }, () => new Float64Array(numUnknowns));
  const B = new Float64Array(numUnknowns);

  // Helper for Macaulay brackets <x-a>^n
  const mac = (x: number, a: number, n: number) => {
    if (x <= a) return 0;
    return Math.pow(x - a, n);
  };

  // Global Equilibrium
  // Sum Fy = 0
  for (let j = 0; j < numReactions; j++) {
    if (reactionComponents[j].type === 'force') A[0][j] = 1;
  }
  let sumP = 0;
  for (const pl of pointLoads) sumP += pl.P;
  for (const dl of distributedLoads) {
    sumP += 0.5 * (dl.w1 + dl.w2) * (dl.x2 - dl.x1);
  }
  B[0] = -sumP; // sum(R) = -sum(Loads)

  // Sum M(0) = 0
  for (let j = 0; j < numReactions; j++) {
    if (reactionComponents[j].type === 'force') A[1][j] = reactionComponents[j].x;
    else A[1][j] = 1;
  }
  let sumM0 = 0;
  for (const pl of pointLoads) sumM0 += pl.P * pl.a;
  for (const ml of momentLoads) sumM0 += ml.M;
  for (const dl of distributedLoads) {
    const Ld = dl.x2 - dl.x1;
    if (Ld > 0) {
      const F_rect = dl.w1 * Ld;
      const F_tri = 0.5 * (dl.w2 - dl.w1) * Ld;
      sumM0 += F_rect * (dl.x1 + Ld / 2);
      sumM0 += F_tri * (dl.x1 + 2 * Ld / 3);
    }
  }
  B[1] = -sumM0;

  // Boundary Conditions (v=0 at supports, theta=0 at fixed supports)
  let eqIdx = 2;
  for (const s of supports) {
    // v(xi) = 0
    const xi = s.x;
    for (let j = 0; j < numReactions; j++) {
      const xj = reactionComponents[j].x;
      if (reactionComponents[j].type === 'force') A[eqIdx][j] = mac(xi, xj, 3) / 6;
      else A[eqIdx][j] = mac(xi, xj, 2) / 2;
    }
    A[eqIdx][numReactions] = xi; // C1
    A[eqIdx][numReactions + 1] = 1; // C2
    
    let loadTerm = 0;
    for (const pl of pointLoads) loadTerm += pl.P * mac(xi, pl.a, 3) / 6;
    for (const ml of momentLoads) loadTerm += ml.M * mac(xi, ml.a, 2) / 2;
    for (const dl of distributedLoads) {
      const Ld = dl.x2 - dl.x1;
      if (Ld > 0) {
        const k = (dl.w2 - dl.w1) / Ld;
        // Uniform part (w1)
        loadTerm += (dl.w1 / 24) * (mac(xi, dl.x1, 4) - mac(xi, dl.x2, 4));
        // Triangular part (ramp from 0 to w2-w1)
        loadTerm += (k / 120) * (mac(xi, dl.x1, 5) - mac(xi, dl.x2, 5)) - ((dl.w2 - dl.w1) / 24) * mac(xi, dl.x2, 4);
      }
    }
    B[eqIdx] = -loadTerm;
    eqIdx++;

    if (s.type === 'fixed') {
      // theta(xi) = 0
      for (let j = 0; j < numReactions; j++) {
        const xj = reactionComponents[j].x;
        if (reactionComponents[j].type === 'force') A[eqIdx][j] = mac(xi, xj, 2) / 2;
        else A[eqIdx][j] = mac(xi, xj, 1);
      }
      A[eqIdx][numReactions] = 1; // C1
      
      let slopeTerm = 0;
      for (const pl of pointLoads) slopeTerm += pl.P * mac(xi, pl.a, 2) / 2;
      for (const ml of momentLoads) slopeTerm += ml.M * mac(xi, ml.a, 1);
      for (const dl of distributedLoads) {
        const Ld = dl.x2 - dl.x1;
        if (Ld > 0) {
          const k = (dl.w2 - dl.w1) / Ld;
          // Uniform part
          slopeTerm += (dl.w1 / 6) * (mac(xi, dl.x1, 3) - mac(xi, dl.x2, 3));
          // Triangular part
          slopeTerm += (k / 24) * (mac(xi, dl.x1, 4) - mac(xi, dl.x2, 4)) - ((dl.w2 - dl.w1) / 6) * mac(xi, dl.x2, 3);
        }
      }
      B[eqIdx] = -slopeTerm;
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
  const C1 = X[numReactions];
  const C2 = X[numReactions + 1];

  // 3. Generate points (include critical points to catch jumps)
  const criticalPoints = new Set<number>([0, L]);
  for (const s of supports) criticalPoints.add(s.x);
  for (const pl of pointLoads) criticalPoints.add(pl.a);
  for (const ml of momentLoads) criticalPoints.add(ml.a);
  for (const dl of distributedLoads) {
    criticalPoints.add(dl.x1);
    criticalPoints.add(dl.x2);
  }

  const N = 500;
  const evaluationPoints = Array.from(criticalPoints).sort((a, b) => a - b);
  
  // Add intermediate points
  for (let i = 0; i < N; i++) {
    evaluationPoints.push((i / N) * L);
  }
  evaluationPoints.sort((a, b) => a - b);

  const points: { x: number, V: number, M: number, EI_v: number }[] = [];
  let max_M = 0; let max_MX = 0;
  let max_V = 0; let max_VX = 0;
  let max_EI_v = 0; let max_EI_vX = 0;

  // To handle discontinuities, evaluate slightly before and after critical points
  const finalPoints: number[] = [];
  for (const x of evaluationPoints) {
    finalPoints.push(x);
    if (criticalPoints.has(x)) {
      if (x > 0) finalPoints.push(x - 1e-6);
      if (x < L) finalPoints.push(x + 1e-6);
    }
  }
  finalPoints.sort((a, b) => a - b);

  for (const x of finalPoints) {
    if (x < 0 || x > L) continue;
    let V = 0;
    let M = 0;
    let EI_v = C1 * x + C2;

    // Reactions
    for (let j = 0; j < numReactions; j++) {
      const xj = reactionComponents[j].x;
      const R = reactions[j];
      if (reactionComponents[j].type === 'force') {
        V += R * mac(x, xj, 0);
        M += R * mac(x, xj, 1);
        EI_v += R * mac(x, xj, 3) / 6;
      } else {
        M += R * mac(x, xj, 0);
        EI_v += R * mac(x, xj, 2) / 2;
      }
    }

    // Point Loads
    for (const pl of pointLoads) {
      V += pl.P * mac(x, pl.a, 0);
      M += pl.P * mac(x, pl.a, 1);
      EI_v += pl.P * mac(x, pl.a, 3) / 6;
    }

    // Moment Loads
    for (const ml of momentLoads) {
      M += ml.M * mac(x, ml.a, 0);
      EI_v += ml.M * mac(x, ml.a, 2) / 2;
    }

    // Distributed Loads
    for (const dl of distributedLoads) {
      const Ld = dl.x2 - dl.x1;
      if (Ld > 0) {
        const k = (dl.w2 - dl.w1) / Ld;
        // Uniform part
        V += dl.w1 * (mac(x, dl.x1, 1) - mac(x, dl.x2, 1));
        M += (dl.w1 / 2) * (mac(x, dl.x1, 2) - mac(x, dl.x2, 2));
        EI_v += (dl.w1 / 24) * (mac(x, dl.x1, 4) - mac(x, dl.x2, 4));
        
        // Triangular part
        V += (k / 2) * (mac(x, dl.x1, 2) - mac(x, dl.x2, 2)) - (dl.w2 - dl.w1) * mac(x, dl.x2, 1);
        M += (k / 6) * (mac(x, dl.x1, 3) - mac(x, dl.x2, 3)) - ((dl.w2 - dl.w1) / 2) * mac(x, dl.x2, 2);
        EI_v += (k / 120) * (mac(x, dl.x1, 5) - mac(x, dl.x2, 5)) - ((dl.w2 - dl.w1) / 24) * mac(x, dl.x2, 4);
      }
    }

    // Only add unique x to points for charting
    if (points.length === 0 || Math.abs(points[points.length - 1].x - x) > 1e-5) {
      points.push({ x, V, M, EI_v });
    }

    const absV = Math.abs(V);
    const absMaxV = Math.abs(max_V);
    if (absV > absMaxV + 1e-7) { 
      max_V = V; 
      max_VX = x; 
    } else if (Math.abs(absV - absMaxV) < 1e-7 && V > max_V) {
      // Prefer positive shear if magnitudes are equal
      max_V = V;
      max_VX = x;
    }

    if (Math.abs(M) > Math.abs(max_M)) { max_M = M; max_MX = x; }
    if (Math.abs(EI_v) > Math.abs(max_EI_v)) { max_EI_v = EI_v; max_EI_vX = x; }
  }

  return {
    maxMoment: max_M, maxMomentX: max_MX,
    maxShear: max_V, maxShearX: max_VX,
    maxDeflectionWithoutEI: max_EI_v, maxDeflectionX: max_EI_vX,
    reactions: Array.from(reactions),
    reactionComponents: reactionComponents.map(rc => ({ x: rc.x, type: rc.type })),
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
