const BOHR_PER_ANGSTROM = 1.8897259886;

const sto3gHydrogen = [
  { exponent: 3.42525091, coefficient: 0.15432897 },
  { exponent: 0.62391373, coefficient: 0.53532814 },
  { exponent: 0.1688554, coefficient: 0.44463454 }
];

const HARTREE_TO_KJMOL = 2625.499638;
const experimentalH2 = {
  bondAngstrom: 0.741,
  dissociationKjMol: 435.78
};

const docs = {
  integrals: `
    <h3>ガウス型軌道を使う理由</h3>
    <p>Slater 軌道は物理的に自然ですが、多中心積分が重くなります。ここでは STO-3G の 1s 軌道を 3 個の primitive Gaussian の線形結合で近似します。</p>
    <p>重なり、運動エネルギー、核引力、電子反発積分はすべて <math><mi>exp</mi><mo>(</mo><mo>-</mo><mi>a</mi><msup><mrow><mo>|</mo><mi>r</mi><mo>-</mo><mi>A</mi><mo>|</mo></mrow><mn>2</mn></msup><mo>)</mo></math> の積で書けます。Gaussian product theorem により、2 個のガウス積は新しい中心 P の 1 個のガウスへ畳み込めます。</p>
    <p>4 中心電子反発積分 <math><mo>(</mo><mi>&mu;</mi><mi>&nu;</mi><mo>|</mo><mi>&lambda;</mi><mi>&sigma;</mi><mo>)</mo></math> も Boys 関数 <math><msub><mi>F</mi><mn>0</mn></msub><mo>(</mo><mi>t</mi><mo>)</mo></math> を通して評価します。小さい系なので、すべての添字を明示的に回してテンソルを作っています。</p>
  `,
  scf: `
    <h3>SCF の流れ</h3>
    <p>密度行列 P から Fock 行列 F を作り、一般化固有値問題 <math><mi>F</mi><mi>C</mi><mo>=</mo><mi>S</mi><mi>C</mi><mi>&epsilon;</mi></math> を解き、占有軌道から新しい P を作ります。この閉ループが self-consistent field です。</p>
    <p>2 基底関数の H2 なので、<math><msup><mi>S</mi><mrow><mo>-</mo><mfrac><mn>1</mn><mn>2</mn></mfrac></mrow></msup><mi>F</mi><msup><mi>S</mi><mrow><mo>-</mo><mfrac><mn>1</mn><mn>2</mn></mfrac></mrow></msup></math> を 2x2 の普通の固有値問題に変換して手で解けます。反復の振動を抑えるために、古い密度と新しい密度を混合しています。</p>
    <p>UHF では α 電子と β 電子の密度を別々に更新します。<math><msup><mi>F</mi><mi>&alpha;</mi></msup></math> と <math><msup><mi>F</mi><mi>&beta;</mi></msup></math> が独立に動けるため、結合を伸ばすと左右の H 原子へスピンが局在化し、RHF より自然な解離曲線になります。</p>
  `,
  dft: `
    <h3>Kohn-Sham DFT と交換汎関数</h3>
    <p>KS-DFT は相互作用する電子系を、同じ密度を与える仮想的な一電子方程式で解きます。ここでは Coulomb 項 J を保持し、交換相関のうち LDA 交換だけを数値グリッドで加えます。</p>
    <p>交換エネルギー密度は次の LDA 交換式で近似します。</p>
    <div class="displayMath">
      <math display="block">
        <msub><mi>e</mi><mi>x</mi></msub>
        <mo>[</mo><mi>&rho;</mi><mo>]</mo>
        <mo>=</mo>
        <mo>-</mo>
        <mfrac><mn>3</mn><mn>4</mn></mfrac>
        <msup>
          <mrow><mo>(</mo><mfrac><mn>3</mn><mi>&pi;</mi></mfrac><mo>)</mo></mrow>
          <mrow><mn>1</mn><mo>/</mo><mn>3</mn></mrow>
        </msup>
        <msup>
          <mi>&rho;</mi>
          <mrow><mn>4</mn><mo>/</mo><mn>3</mn></mrow>
        </msup>
      </math>
    </div>
    <p>Fock 行列へ入る交換ポテンシャルは、交換エネルギーの密度に関する汎関数微分です。</p>
    <div class="displayMath">
      <math display="block">
        <msub><mi>v</mi><mi>x</mi></msub>
        <mo>(</mo><mi>&rho;</mi><mo>)</mo>
        <mo>=</mo>
        <mfrac>
          <mrow><mi>&delta;</mi><msub><mi>E</mi><mi>x</mi></msub></mrow>
          <mrow><mi>&delta;</mi><mi>&rho;</mi></mrow>
        </mfrac>
        <mo>=</mo>
        <mo>-</mo>
        <msup>
          <mrow><mo>(</mo><mfrac><mn>3</mn><mi>&pi;</mi></mfrac><mo>)</mo></mrow>
          <mrow><mn>1</mn><mo>/</mo><mn>3</mn></mrow>
        </msup>
        <msup>
          <mi>&rho;</mi>
          <mrow><mn>1</mn><mo>/</mo><mn>3</mn></mrow>
        </msup>
      </math>
    </div>
    <p>UDFT では α/β スピン密度を分け、交換はスピンごとに評価します。</p>
    <div class="displayMath">
      <math display="block">
        <msub><mi>E</mi><mi>x</mi></msub>
        <mo>[</mo><msub><mi>&rho;</mi><mi>&alpha;</mi></msub><mo>,</mo><msub><mi>&rho;</mi><mi>&beta;</mi></msub><mo>]</mo>
        <mo>=</mo>
        <mo>-</mo>
        <mfrac><mn>3</mn><mn>4</mn></mfrac>
        <msup>
          <mrow><mo>(</mo><mfrac><mn>6</mn><mi>&pi;</mi></mfrac><mo>)</mo></mrow>
          <mrow><mn>1</mn><mo>/</mo><mn>3</mn></mrow>
        </msup>
        <mo>&int;</mo>
        <mrow>
          <mo>(</mo>
          <msubsup><mi>&rho;</mi><mi>&alpha;</mi><mrow><mn>4</mn><mo>/</mo><mn>3</mn></mrow></msubsup>
          <mo>+</mo>
          <msubsup><mi>&rho;</mi><mi>&beta;</mi><mrow><mn>4</mn><mo>/</mo><mn>3</mn></mrow></msubsup>
          <mo>)</mo>
        </mrow>
        <mi>d</mi><mi>r</mi>
      </math>
    </div>
    <p>実用品質の量子化学コードはグリッド分割や相関項をずっと丁寧に扱いますが、ここでは「密度からポテンシャルが出る」構造を見えるようにしています。</p>
  `,
  experiments: `
    <h3>触って見るポイント</h3>
    <p>結合距離を伸ばすと、結合性軌道と反結合性軌道のエネルギー差が小さくなります。最小基底 RHF は解離極限が苦手なので、長距離側の挙動も観察対象です。</p>
    <p>UHF を選ぶと、<span class="inlineMath"><math><mo>&lt;</mo><msup><mi>S</mi><mn>2</mn></msup><mo>&gt;</mo></math></span> が表示されます。理想的な一重項は 0 ですが、結合を伸ばした UHF は一重項と三重項が混ざるため値が大きくなります。この「スピン汚染」は、静的相関を単一 Slater 行列で無理に表す代償です。</p>
    <p>ベンチマーク欄は、結合距離スキャンから得た最小エネルギー点と解離エネルギーを実験値と並べます。最小基底の小さな模型なので、実験と完全一致させるより、RHF と UHF がどの失敗をするかを比べるための物差しです。</p>
  `
};

const sourceSnippets = {
  integrals: `function eriPrimitive(a, A, b, B, c, C, d, D) {
  const p = a + b;
  const q = c + d;
  const P = weightedCenter(a, A, b, B);
  const Q = weightedCenter(c, C, d, D);
  const rab2 = dist2(A, B);
  const rcd2 = dist2(C, D);
  const rpq2 = dist2(P, Q);
  const alpha = (a * b) / p;
  const beta = (c * d) / q;
  const boysArg = (p * q / (p + q)) * rpq2;
  return 2 * Math.PI ** 2.5 / (p * q * Math.sqrt(p + q))
    * Math.exp(-alpha * rab2 - beta * rcd2)
    * boys0(boysArg);
}`,
  scf: `for (let iter = 0; iter < maxIterations; iter++) {
  const terms = method === "lda"
    ? buildKohnShamTerms(system, P)
    : buildHartreeFockTerms(system, P);
  const F = terms.F;
  const eig = solveGeneralized2x2(F, S);
  const Pnext = densityFromCoefficients(eig.coefficients);
  const error = rmsDiff(Pnext, P);
  P = mixMatrices(Pnext, P, mixing);
  if (error < 1e-8) break;
}`,
  uhf: `function buildUhfTerms(system, Pa, Pb) {
  const Ptot = add2(Pa, Pb);
  const Fa = mat2();
  const Fb = mat2();
  for (let mu = 0; mu < 2; mu++) for (let nu = 0; nu < 2; nu++) {
    let J = 0, Ka = 0, Kb = 0;
    for (let l = 0; l < 2; l++) for (let s = 0; s < 2; s++) {
      J += Ptot[l][s] * eri[mu][nu][l][s];
      Ka += Pa[l][s] * eri[mu][l][nu][s];
      Kb += Pb[l][s] * eri[mu][l][nu][s];
    }
    Fa[mu][nu] = H[mu][nu] + J - Ka;
    Fb[mu][nu] = H[mu][nu] + J - Kb;
  }
}`,
  functional: `function ldaExchange(system, P) {
  const constant = (3 / Math.PI) ** (1 / 3);
  for (const point of grid) {
    const phi = basisValues(system, point.r);
    const rho = densityAt(P, phi);
    const energyDensity = -0.75 * constant * rho ** (4 / 3);
    const vx = -constant * rho ** (1 / 3);
    Exc += point.w * energyDensity;
    Fxc[mu][nu] += point.w * vx * phi[mu] * phi[nu];
  }
}

function lsdaExchange(system, Pa, Pb) {
  // E_x = -3/4 (6/pi)^(1/3) integral [rho_a^(4/3) + rho_b^(4/3)] dr
  const constant = (6 / Math.PI) ** (1 / 3);
  for (const point of grid) {
    const rhoA = densityAt(Pa, phi);
    const rhoB = densityAt(Pb, phi);
    const vxa = -constant * rhoA ** (1 / 3);
    const vxb = -constant * rhoB ** (1 / 3);
    Fxa[mu][nu] += point.w * vxa * phi[mu] * phi[nu];
    Fxb[mu][nu] += point.w * vxb * phi[mu] * phi[nu];
  }
}`
};

function norm(alpha) {
  return (2 * alpha / Math.PI) ** 0.75;
}

function vadd(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function vscale(s, a) {
  return [s * a[0], s * a[1], s * a[2]];
}

function dist2(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

function weightedCenter(a, A, b, B) {
  return vscale(1 / (a + b), vadd(vscale(a, A), vscale(b, B)));
}

function boys0(t) {
  if (t < 1e-8) return 1 - t / 3;
  return 0.5 * Math.sqrt(Math.PI / t) * erf(Math.sqrt(t));
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x);
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const t = 1 / (1 + p * z);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return sign * y;
}

function contracted(center) {
  return sto3gHydrogen.map((g) => ({
    exponent: g.exponent,
    coefficient: g.coefficient * norm(g.exponent),
    center
  }));
}

function primitiveOverlap(a, A, b, B) {
  const p = a + b;
  const mu = (a * b) / p;
  return (Math.PI / p) ** 1.5 * Math.exp(-mu * dist2(A, B));
}

function primitiveKinetic(a, A, b, B) {
  const p = a + b;
  const mu = (a * b) / p;
  const rab2 = dist2(A, B);
  return mu * (3 - 2 * mu * rab2) * (Math.PI / p) ** 1.5 * Math.exp(-mu * rab2);
}

function primitiveNuclear(a, A, b, B, C, Z) {
  const p = a + b;
  const mu = (a * b) / p;
  const P = weightedCenter(a, A, b, B);
  return -Z * (2 * Math.PI / p) * Math.exp(-mu * dist2(A, B)) * boys0(p * dist2(P, C));
}

function primitiveEri(a, A, b, B, c, C, d, D) {
  const p = a + b;
  const q = c + d;
  const P = weightedCenter(a, A, b, B);
  const Q = weightedCenter(c, C, d, D);
  const mu = (a * b) / p;
  const nu = (c * d) / q;
  const arg = (p * q / (p + q)) * dist2(P, Q);
  return 2 * Math.PI ** 2.5 / (p * q * Math.sqrt(p + q))
    * Math.exp(-mu * dist2(A, B) - nu * dist2(C, D))
    * boys0(arg);
}

function pairIntegral(basis, i, j, primitiveFn) {
  let value = 0;
  for (const gi of basis[i]) {
    for (const gj of basis[j]) {
      value += gi.coefficient * gj.coefficient
        * primitiveFn(gi.exponent, gi.center, gj.exponent, gj.center);
    }
  }
  return value;
}

function electronRepulsion(basis, i, j, k, l) {
  let value = 0;
  for (const gi of basis[i]) for (const gj of basis[j]) {
    for (const gk of basis[k]) for (const gl of basis[l]) {
      value += gi.coefficient * gj.coefficient * gk.coefficient * gl.coefficient
        * primitiveEri(
          gi.exponent, gi.center,
          gj.exponent, gj.center,
          gk.exponent, gk.center,
          gl.exponent, gl.center
        );
    }
  }
  return value;
}

function mat2(fill = 0) {
  return [[fill, fill], [fill, fill]];
}

function add2(A, B) {
  return [[A[0][0] + B[0][0], A[0][1] + B[0][1]], [A[1][0] + B[1][0], A[1][1] + B[1][1]]];
}

function sub2(A, B) {
  return [[A[0][0] - B[0][0], A[0][1] - B[0][1]], [A[1][0] - B[1][0], A[1][1] - B[1][1]]];
}

function scale2(s, A) {
  return [[s * A[0][0], s * A[0][1]], [s * A[1][0], s * A[1][1]]];
}

function mul2(A, B) {
  return [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]
  ];
}

function transpose2(A) {
  return [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
}

function traceProduct(A, B) {
  return A[0][0] * B[0][0] + A[0][1] * B[0][1] + A[1][0] * B[1][0] + A[1][1] * B[1][1];
}

function rmsDiff(A, B) {
  const D = sub2(A, B);
  return Math.sqrt(traceProduct(D, D) / 4);
}

function mixMatrices(next, old, mixing) {
  return add2(scale2(mixing, next), scale2(1 - mixing, old));
}

function symmetricEig2(A) {
  const a = A[0][0];
  const b = A[0][1];
  const d = A[1][1];
  const delta = Math.sqrt(((a - d) / 2) ** 2 + b * b);
  const values = [(a + d) / 2 - delta, (a + d) / 2 + delta];
  const vectors = values.map((lambda) => {
    let v = Math.abs(b) > 1e-12 ? [b, lambda - a] : (a <= d ? [1, 0] : [0, 1]);
    const n = Math.hypot(v[0], v[1]);
    return [v[0] / n, v[1] / n];
  });
  return { values, vectors: [[vectors[0][0], vectors[1][0]], [vectors[0][1], vectors[1][1]]] };
}

function solveGeneralized2x2(F, S) {
  const sEig = symmetricEig2(S);
  const U = sEig.vectors;
  const SinvHalf = mul2(mul2(U, [[1 / Math.sqrt(sEig.values[0]), 0], [0, 1 / Math.sqrt(sEig.values[1])]]), transpose2(U));
  const Fp = mul2(mul2(SinvHalf, F), SinvHalf);
  const fEig = symmetricEig2(Fp);
  const C = mul2(SinvHalf, fEig.vectors);
  return { orbitalEnergies: fEig.values, coefficients: C };
}

function densityFromCoefficients(C) {
  const c0 = [C[0][0], C[1][0]];
  return [
    [2 * c0[0] * c0[0], 2 * c0[0] * c0[1]],
    [2 * c0[1] * c0[0], 2 * c0[1] * c0[1]]
  ];
}

function spinDensityFromCoefficients(C) {
  const c0 = [C[0][0], C[1][0]];
  return [
    [c0[0] * c0[0], c0[0] * c0[1]],
    [c0[1] * c0[0], c0[1] * c0[1]]
  ];
}

function orbitalOverlap(Ca, Cb, S) {
  const a = [Ca[0][0], Ca[1][0]];
  const b = [Cb[0][0], Cb[1][0]];
  return a[0] * (S[0][0] * b[0] + S[0][1] * b[1])
    + a[1] * (S[1][0] * b[0] + S[1][1] * b[1]);
}

function buildSystem(bondAngstrom) {
  const r = bondAngstrom * BOHR_PER_ANGSTROM;
  const nuclei = [
    { Z: 1, center: [-r / 2, 0, 0] },
    { Z: 1, center: [r / 2, 0, 0] }
  ];
  const basis = nuclei.map((n) => contracted(n.center));
  const S = mat2();
  const T = mat2();
  const V = mat2();
  const eri = Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => Array(2).fill(0))));

  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    S[i][j] = pairIntegral(basis, i, j, primitiveOverlap);
    T[i][j] = pairIntegral(basis, i, j, primitiveKinetic);
    V[i][j] = nuclei.reduce((sum, n) => sum + pairIntegral(
      basis,
      i,
      j,
      (a, A, b, B) => primitiveNuclear(a, A, b, B, n.center, n.Z)
    ), 0);
  }

  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    for (let k = 0; k < 2; k++) for (let l = 0; l < 2; l++) {
      eri[i][j][k][l] = electronRepulsion(basis, i, j, k, l);
    }
  }

  return {
    bondAngstrom,
    bondBohr: r,
    nuclei,
    basis,
    S,
    H: add2(T, V),
    eri,
    nuclearRepulsion: 1 / r
  };
}

function buildHartreeFockTerms(system, P) {
  const F = mat2();
  for (let mu = 0; mu < 2; mu++) for (let nu = 0; nu < 2; nu++) {
    let g = 0;
    for (let l = 0; l < 2; l++) for (let s = 0; s < 2; s++) {
      g += P[l][s] * (system.eri[mu][nu][l][s] - 0.5 * system.eri[mu][l][nu][s]);
    }
    F[mu][nu] = system.H[mu][nu] + g;
  }
  return { F, Exc: 0 };
}

function buildUhfTerms(system, Pa, Pb) {
  const Ptot = add2(Pa, Pb);
  const Fa = mat2();
  const Fb = mat2();
  for (let mu = 0; mu < 2; mu++) for (let nu = 0; nu < 2; nu++) {
    let J = 0;
    let Ka = 0;
    let Kb = 0;
    for (let l = 0; l < 2; l++) for (let s = 0; s < 2; s++) {
      J += Ptot[l][s] * system.eri[mu][nu][l][s];
      Ka += Pa[l][s] * system.eri[mu][l][nu][s];
      Kb += Pb[l][s] * system.eri[mu][l][nu][s];
    }
    Fa[mu][nu] = system.H[mu][nu] + J - Ka;
    Fb[mu][nu] = system.H[mu][nu] + J - Kb;
  }
  return { Fa, Fb };
}

const angularDirections = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  [0.57735, 0.57735, 0.57735], [-0.57735, 0.57735, 0.57735],
  [0.57735, -0.57735, 0.57735], [0.57735, 0.57735, -0.57735],
  [-0.57735, -0.57735, 0.57735], [-0.57735, 0.57735, -0.57735],
  [0.57735, -0.57735, -0.57735], [-0.57735, -0.57735, -0.57735]
];

function makeGrid(system) {
  const grid = [];
  const dr = 0.22;
  for (const nucleus of system.nuclei) {
    for (let shell = 1; shell <= 32; shell++) {
      const radius = shell * dr;
      const weight = 4 * Math.PI * radius * radius * dr / angularDirections.length / system.nuclei.length;
      for (const dir of angularDirections) {
        grid.push({
          r: [
            nucleus.center[0] + radius * dir[0],
            nucleus.center[1] + radius * dir[1],
            nucleus.center[2] + radius * dir[2]
          ],
          w: weight
        });
      }
    }
  }
  return grid;
}

function basisValue(contractedGaussian, r) {
  let value = 0;
  for (const g of contractedGaussian) {
    value += g.coefficient * Math.exp(-g.exponent * dist2(r, g.center));
  }
  return value;
}

function basisValues(system, r) {
  return system.basis.map((b) => basisValue(b, r));
}

function densityAt(P, phi) {
  let rho = 0;
  for (let mu = 0; mu < 2; mu++) for (let nu = 0; nu < 2; nu++) {
    rho += P[mu][nu] * phi[mu] * phi[nu];
  }
  return Math.max(rho, 0);
}

function ldaExchange(system, P) {
  const Fxc = mat2();
  const grid = makeGrid(system);
  const constant = (3 / Math.PI) ** (1 / 3);
  let Exc = 0;
  for (const point of grid) {
    const phi = basisValues(system, point.r);
    const rho = densityAt(P, phi);
    if (rho < 1e-14) continue;
    const eps = -0.75 * constant * rho ** (4 / 3);
    const vx = -constant * rho ** (1 / 3);
    Exc += point.w * eps;
    for (let mu = 0; mu < 2; mu++) for (let nu = 0; nu < 2; nu++) {
      Fxc[mu][nu] += point.w * vx * phi[mu] * phi[nu];
    }
  }
  return { Fxc, Exc, grid };
}

function buildKohnShamTerms(system, P) {
  const J = mat2();
  for (let mu = 0; mu < 2; mu++) for (let nu = 0; nu < 2; nu++) {
    for (let l = 0; l < 2; l++) for (let s = 0; s < 2; s++) {
      J[mu][nu] += P[l][s] * system.eri[mu][nu][l][s];
    }
  }
  const { Fxc, Exc, grid } = ldaExchange(system, P);
  return { F: add2(add2(system.H, J), Fxc), J, Fxc, Exc, grid };
}

function lsdaExchange(system, Pa, Pb) {
  const Fxa = mat2();
  const Fxb = mat2();
  const grid = makeGrid(system);
  const constant = (6 / Math.PI) ** (1 / 3);
  let Exc = 0;
  for (const point of grid) {
    const phi = basisValues(system, point.r);
    const rhoA = densityAt(Pa, phi);
    const rhoB = densityAt(Pb, phi);
    if (rhoA > 1e-14) {
      Exc += point.w * (-0.75 * constant * rhoA ** (4 / 3));
      const vxa = -constant * rhoA ** (1 / 3);
      for (let mu = 0; mu < 2; mu++) for (let nu = 0; nu < 2; nu++) {
        Fxa[mu][nu] += point.w * vxa * phi[mu] * phi[nu];
      }
    }
    if (rhoB > 1e-14) {
      Exc += point.w * (-0.75 * constant * rhoB ** (4 / 3));
      const vxb = -constant * rhoB ** (1 / 3);
      for (let mu = 0; mu < 2; mu++) for (let nu = 0; nu < 2; nu++) {
        Fxb[mu][nu] += point.w * vxb * phi[mu] * phi[nu];
      }
    }
  }
  return { Fxa, Fxb, Exc, grid };
}

function buildUksTerms(system, Pa, Pb) {
  const Ptot = add2(Pa, Pb);
  const J = mat2();
  for (let mu = 0; mu < 2; mu++) for (let nu = 0; nu < 2; nu++) {
    for (let l = 0; l < 2; l++) for (let s = 0; s < 2; s++) {
      J[mu][nu] += Ptot[l][s] * system.eri[mu][nu][l][s];
    }
  }
  const { Fxa, Fxb, Exc, grid } = lsdaExchange(system, Pa, Pb);
  return {
    Fa: add2(add2(system.H, J), Fxa),
    Fb: add2(add2(system.H, J), Fxb),
    J,
    Fxa,
    Fxb,
    Exc,
    grid
  };
}

function electronicEnergy(system, P, F, method, Exc = 0) {
  if (method === "rhf") {
    return 0.5 * traceProduct(P, add2(system.H, F));
  }
  const J = mat2();
  for (let mu = 0; mu < 2; mu++) for (let nu = 0; nu < 2; nu++) {
    for (let l = 0; l < 2; l++) for (let s = 0; s < 2; s++) {
      J[mu][nu] += P[l][s] * system.eri[mu][nu][l][s];
    }
  }
  return traceProduct(P, system.H) + 0.5 * traceProduct(P, J) + Exc;
}

function uhfElectronicEnergy(system, Pa, Pb, Fa, Fb) {
  return 0.5 * (
    traceProduct(Pa, add2(system.H, Fa))
    + traceProduct(Pb, add2(system.H, Fb))
  );
}

function runUhfScf({ bondAngstrom, maxIterations, mixing }) {
  const system = buildSystem(bondAngstrom);
  const coreGuess = solveGeneralized2x2(system.H, system.S);
  const closedShellSpinDensity = spinDensityFromCoefficients(coreGuess.coefficients);
  let Pa = bondAngstrom < 1.05 ? closedShellSpinDensity : [[1, 0], [0, 0]];
  let Pb = bondAngstrom < 1.05 ? closedShellSpinDensity : [[0, 0], [0, 1]];
  let eigA = coreGuess;
  let eigB = coreGuess;
  let terms = buildUhfTerms(system, Pa, Pb);
  const history = [];
  let converged = false;

  for (let iter = 1; iter <= maxIterations; iter++) {
    terms = buildUhfTerms(system, Pa, Pb);
    eigA = solveGeneralized2x2(terms.Fa, system.S);
    eigB = solveGeneralized2x2(terms.Fb, system.S);
    const nextPa = spinDensityFromCoefficients(eigA.coefficients);
    const nextPb = spinDensityFromCoefficients(eigB.coefficients);
    const error = Math.max(rmsDiff(nextPa, Pa), rmsDiff(nextPb, Pb));
    const Eelec = uhfElectronicEnergy(system, nextPa, nextPb, terms.Fa, terms.Fb);
    history.push({ iter, energy: Eelec + system.nuclearRepulsion, error });
    Pa = mixMatrices(nextPa, Pa, mixing);
    Pb = mixMatrices(nextPb, Pb, mixing);
    if (error < 1e-8) {
      converged = true;
      Pa = nextPa;
      Pb = nextPb;
      break;
    }
  }

  terms = buildUhfTerms(system, Pa, Pb);
  eigA = solveGeneralized2x2(terms.Fa, system.S);
  eigB = solveGeneralized2x2(terms.Fb, system.S);
  const P = add2(Pa, Pb);
  const Eelec = uhfElectronicEnergy(system, Pa, Pb, terms.Fa, terms.Fb);
  const abOverlap = orbitalOverlap(eigA.coefficients, eigB.coefficients, system.S);

  return {
    method: "uhf",
    system,
    P,
    Pa,
    Pb,
    F: terms.Fa,
    Fa: terms.Fa,
    Fb: terms.Fb,
    orbitalEnergies: eigA.orbitalEnergies,
    betaOrbitalEnergies: eigB.orbitalEnergies,
    coefficients: eigA.coefficients,
    betaCoefficients: eigB.coefficients,
    electronicEnergy: Eelec,
    totalEnergy: Eelec + system.nuclearRepulsion,
    gap: Math.min(eigA.orbitalEnergies[1] - eigA.orbitalEnergies[0], eigB.orbitalEnergies[1] - eigB.orbitalEnergies[0]),
    spinSquared: Math.max(0, 1 - abOverlap * abOverlap),
    spinSeparation: Math.abs(Pa[0][0] - Pb[0][0]),
    converged,
    history,
    grid: []
  };
}

function runUdftScf({ bondAngstrom, maxIterations, mixing }) {
  const system = buildSystem(bondAngstrom);
  const coreGuess = solveGeneralized2x2(system.H, system.S);
  const closedShellSpinDensity = spinDensityFromCoefficients(coreGuess.coefficients);
  let Pa = bondAngstrom < 1.05 ? closedShellSpinDensity : [[1, 0], [0, 0]];
  let Pb = bondAngstrom < 1.05 ? closedShellSpinDensity : [[0, 0], [0, 1]];
  let eigA = coreGuess;
  let eigB = coreGuess;
  let terms = buildUksTerms(system, Pa, Pb);
  const history = [];
  let converged = false;

  for (let iter = 1; iter <= maxIterations; iter++) {
    terms = buildUksTerms(system, Pa, Pb);
    eigA = solveGeneralized2x2(terms.Fa, system.S);
    eigB = solveGeneralized2x2(terms.Fb, system.S);
    const nextPa = spinDensityFromCoefficients(eigA.coefficients);
    const nextPb = spinDensityFromCoefficients(eigB.coefficients);
    const error = Math.max(rmsDiff(nextPa, Pa), rmsDiff(nextPb, Pb));
    const nextP = add2(nextPa, nextPb);
    const Eelec = traceProduct(nextP, system.H)
      + 0.5 * traceProduct(nextP, terms.J)
      + terms.Exc;
    history.push({ iter, energy: Eelec + system.nuclearRepulsion, error });
    Pa = mixMatrices(nextPa, Pa, mixing);
    Pb = mixMatrices(nextPb, Pb, mixing);
    if (error < 1e-8) {
      converged = true;
      Pa = nextPa;
      Pb = nextPb;
      break;
    }
  }

  terms = buildUksTerms(system, Pa, Pb);
  eigA = solveGeneralized2x2(terms.Fa, system.S);
  eigB = solveGeneralized2x2(terms.Fb, system.S);
  const P = add2(Pa, Pb);
  const Eelec = traceProduct(P, system.H) + 0.5 * traceProduct(P, terms.J) + terms.Exc;
  const abOverlap = orbitalOverlap(eigA.coefficients, eigB.coefficients, system.S);

  return {
    method: "udft",
    system,
    P,
    Pa,
    Pb,
    F: terms.Fa,
    Fa: terms.Fa,
    Fb: terms.Fb,
    orbitalEnergies: eigA.orbitalEnergies,
    betaOrbitalEnergies: eigB.orbitalEnergies,
    coefficients: eigA.coefficients,
    betaCoefficients: eigB.coefficients,
    electronicEnergy: Eelec,
    totalEnergy: Eelec + system.nuclearRepulsion,
    gap: Math.min(eigA.orbitalEnergies[1] - eigA.orbitalEnergies[0], eigB.orbitalEnergies[1] - eigB.orbitalEnergies[0]),
    spinSquared: Math.max(0, 1 - abOverlap * abOverlap),
    spinSeparation: Math.abs(Pa[0][0] - Pb[0][0]),
    converged,
    history,
    grid: terms.grid
  };
}

function runScf({ bondAngstrom, method, maxIterations, mixing }) {
  if (method === "uhf") return runUhfScf({ bondAngstrom, maxIterations, mixing });
  if (method === "udft") return runUdftScf({ bondAngstrom, maxIterations, mixing });
  const system = buildSystem(bondAngstrom);
  const guess = solveGeneralized2x2(system.H, system.S);
  let P = mat2();
  let eig = guess;
  let terms = buildHartreeFockTerms(system, P);
  const history = [];
  let converged = false;

  for (let iter = 1; iter <= maxIterations; iter++) {
    terms = method === "lda" ? buildKohnShamTerms(system, P) : buildHartreeFockTerms(system, P);
    eig = solveGeneralized2x2(terms.F, system.S);
    const nextP = densityFromCoefficients(eig.coefficients);
    const error = rmsDiff(nextP, P);
    const Eelec = electronicEnergy(system, nextP, terms.F, method, terms.Exc);
    history.push({ iter, energy: Eelec + system.nuclearRepulsion, error });
    P = mixMatrices(nextP, P, mixing);
    if (error < 1e-8) {
      converged = true;
      P = nextP;
      break;
    }
  }

  terms = method === "lda" ? buildKohnShamTerms(system, P) : buildHartreeFockTerms(system, P);
  eig = solveGeneralized2x2(terms.F, system.S);
  const Eelec = electronicEnergy(system, P, terms.F, method, terms.Exc);
  return {
    method,
    system,
    P,
    F: terms.F,
    orbitalEnergies: eig.orbitalEnergies,
    coefficients: eig.coefficients,
    electronicEnergy: Eelec,
    totalEnergy: Eelec + system.nuclearRepulsion,
    gap: eig.orbitalEnergies[1] - eig.orbitalEnergies[0],
    spinSquared: 0,
    spinSeparation: 0,
    converged,
    history,
    grid: terms.grid ?? []
  };
}

function benchmarkMethods({ maxIterations = 60, mixing = 0.35 } = {}) {
  const methods = ["rhf", "uhf"];
  const distances = Array.from({ length: 31 }, (_, i) => 0.45 + i * 0.1);
  const farDistance = 6.0;
  return methods.map((method) => {
    const points = distances.map((bondAngstrom) => {
      const result = runScf({ bondAngstrom, method, maxIterations, mixing });
      return { bondAngstrom, energy: result.totalEnergy, converged: result.converged };
    });
    const far = runScf({ bondAngstrom: farDistance, method, maxIterations, mixing });
    const minIndex = points.reduce((bestIndex, point, index) => point.energy < points[bestIndex].energy ? index : bestIndex, 0);
    let minimum = points[minIndex];
    if (minIndex > 0 && minIndex < points.length - 1) {
      const a = points[minIndex - 1];
      const b = points[minIndex];
      const c = points[minIndex + 1];
      const h = b.bondAngstrom - a.bondAngstrom;
      const denom = a.energy - 2 * b.energy + c.energy;
      if (Math.abs(denom) > 1e-12) {
        const offset = 0.5 * h * (a.energy - c.energy) / denom;
        const refinedR = b.bondAngstrom + offset;
        const refinedEnergy = b.energy - 0.5 * denom * (offset / h) ** 2;
        minimum = { bondAngstrom: refinedR, energy: refinedEnergy, converged: b.converged };
      }
    }
    const dissociationKjMol = Math.max(0, (far.totalEnergy - minimum.energy) * HARTREE_TO_KJMOL);
    return {
      method,
      points,
      farDistance,
      farEnergy: far.totalEnergy,
      equilibriumAngstrom: minimum.bondAngstrom,
      minimumEnergy: minimum.energy,
      dissociationKjMol,
      bondError: minimum.bondAngstrom - experimentalH2.bondAngstrom,
      dissociationError: dissociationKjMol - experimentalH2.dissociationKjMol
    };
  });
}

function sampleAxis(result, points = 240) {
  const span = Math.max(4.5, result.system.bondBohr + 3.0);
  const rows = [];
  const C = result.coefficients;
  for (let i = 0; i < points; i++) {
    const x = -span / 2 + span * i / (points - 1);
    const phi = basisValues(result.system, [x, 0, 0]);
    rows.push({
      x,
      aoA: phi[0],
      aoB: phi[1],
      mo: C[0][0] * phi[0] + C[1][0] * phi[1],
      betaMo: result.betaCoefficients
        ? result.betaCoefficients[0][0] * phi[0] + result.betaCoefficients[1][0] * phi[1]
        : C[0][0] * phi[0] + C[1][0] * phi[1],
      density: densityAt(result.P, phi)
    });
  }
  return rows;
}

export { docs, experimentalH2, sourceSnippets, runScf, benchmarkMethods, sampleAxis };
