import { benchmarkMethods, docs, experimentalH2, sourceSnippets, runScf, sampleAxis } from "./chem.js";

const controls = {
  bond: document.querySelector("#bond"),
  method: document.querySelector("#method"),
  iterations: document.querySelector("#iterations"),
  mixing: document.querySelector("#mixing"),
  showGrid: document.querySelector("#showGrid")
};

const els = {
  bondValue: document.querySelector("#bondValue"),
  iterationValue: document.querySelector("#iterationValue"),
  mixingValue: document.querySelector("#mixingValue"),
  energy: document.querySelector("#energy"),
  electronic: document.querySelector("#electronic"),
  gap: document.querySelector("#gap"),
  spin: document.querySelector("#spin"),
  overlap: document.querySelector("#overlap"),
  core: document.querySelector("#core"),
  fock: document.querySelector("#fock"),
  densityMatrix: document.querySelector("#densityMatrix"),
  energyCanvas: document.querySelector("#energyCanvas"),
  benchmarkCanvas: document.querySelector("#benchmarkCanvas"),
  benchmarkRows: document.querySelector("#benchmarkRows"),
  benchmarkRef: document.querySelector("#benchmarkRef"),
  densityCanvas: document.querySelector("#densityCanvas"),
  doc: document.querySelector("#doc"),
  codeSelect: document.querySelector("#codeSelect"),
  codeView: document.querySelector("#codeView"),
  gridBadge: document.querySelector("#gridBadge")
};

const orbitalControls = {
  select: document.querySelector("#orbitalSelect"),
  mode: document.querySelector("#orbitalMode"),
  threshold: document.querySelector("#orbitalThreshold"),
  rotation: document.querySelector("#orbitalRotation"),
  axes: document.querySelector("#showOrbitalAxes")
};

const orbitalEls = {
  screenButtons: document.querySelectorAll(".screenButton"),
  screens: document.querySelectorAll(".screen"),
  canvas: document.querySelector("#orbitalCanvas"),
  title: document.querySelector("#orbitalTitle"),
  subtitle: document.querySelector("#orbitalSubtitle"),
  badge: document.querySelector("#orbitalBadge"),
  thresholdValue: document.querySelector("#orbitalThresholdValue"),
  rotationValue: document.querySelector("#orbitalRotationValue"),
  doc: document.querySelector("#orbitalDoc"),
  tabs: document.querySelectorAll(".orbitalTab"),
  n: document.querySelector("#orbitalN"),
  l: document.querySelector("#orbitalL"),
  angularNodes: document.querySelector("#orbitalAngularNodes"),
  radialNodes: document.querySelector("#orbitalRadialNodes"),
  formula: document.querySelector("#orbitalFormula")
};

const orbitalDocs = {
  concept: `
    <h3>位相と確率を分けて見る</h3>
    <p>青と赤は電子の正負ではなく、波動関数 <math><mi>&psi;</mi></math> の位相です。化学結合で重要なのは、同符号なら強め合い、反対符号なら打ち消し合うという重なり方です。</p>
    <p>「等値曲面メッシュ」と「位相つき点面」は Kikuchi と Suzuki の polar plot 的な考え方に近く、方向ごとの振幅を形として見せます。「確率密度点群」は <math><msup><mrow><mo>|</mo><mi>&psi;</mi><mo>|</mo></mrow><mn>2</mn></msup></math> が大きい場所を点で示します。</p>
  `,
  math: `
    <h3>水素原子での意味</h3>
    <p>水素原子の軌道は、動径部分 <math><msub><mi>R</mi><mrow><mi>n</mi><mi>l</mi></mrow></msub><mo>(</mo><mi>r</mi><mo>)</mo></math> と角度部分 <math><msub><mi>Y</mi><mrow><mi>l</mi><mi>m</mi></mrow></msub><mo>(</mo><mi>&theta;</mi><mo>,</mo><mi>&phi;</mi><mo>)</mo></math> の積で表されます。</p>
    <p>節面の総数は <math><mi>n</mi><mo>-</mo><mn>1</mn></math>、角節面は <math><mi>l</mi></math>、動径節面は <math><mi>n</mi><mo>-</mo><mi>l</mi><mo>-</mo><mn>1</mn></math> です。この画面では s, p, d, f の実軌道を、授業で使いやすい向きに揃えています。</p>
  `,
  references: `
    <h3>背景文献</h3>
    <p>出発点として、Osamu Kikuchi と Keizo Suzuki による <a href="https://pubs.acs.org/doi/10.1021/ed062p206" target="_blank" rel="noreferrer">Orbital shape representations</a>, <i>Journal of Chemical Education</i> 1985, 62, 206-209 を参照しています。同論文は 2D polar plot と 3D contour surface による軌道表現を扱っています。</p>
    <p>近年の例として、J. Chem. Educ. 2024 の <a href="https://pubs.acs.org/doi/10.1021/acs.jchemed.4c00547" target="_blank" rel="noreferrer">Visualizing the Hydrogen Atomic Orbitals</a> など、Kikuchi らの仕事を引用する教育用可視化研究があります。</p>
  `
};

const orbitals = {
  "1s": { label: "1s", n: 1, l: 0, family: "s", expression: "<mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>)</mo>", angular: () => 1, solid: (x, y, z, r) => Math.exp(-r) },
  "2s": { label: "2s", n: 2, l: 0, family: "s", expression: "<mrow><mo>(</mo><mn>2</mn><mo>-</mo><mi>r</mi><mo>)</mo></mrow><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>2</mn><mo>)</mo>", angular: () => 1, solid: (x, y, z, r) => (2 - r) * Math.exp(-r / 2) },
  "2px": { label: "2p_x", n: 2, l: 1, family: "p", expression: "<mi>x</mi><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>2</mn><mo>)</mo>", angular: (x) => x, solid: (x, y, z, r) => x * Math.exp(-r / 2) },
  "2py": { label: "2p_y", n: 2, l: 1, family: "p", expression: "<mi>y</mi><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>2</mn><mo>)</mo>", angular: (x, y) => y, solid: (x, y, z, r) => y * Math.exp(-r / 2) },
  "2pz": { label: "2p_z", n: 2, l: 1, family: "p", expression: "<mi>z</mi><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>2</mn><mo>)</mo>", angular: (x, y, z) => z, solid: (x, y, z, r) => z * Math.exp(-r / 2) },
  "3dz2": { label: "3d_z²", n: 3, l: 2, family: "d", expression: "<mrow><mo>(</mo><mn>2</mn><msup><mi>z</mi><mn>2</mn></msup><mo>-</mo><msup><mi>x</mi><mn>2</mn></msup><mo>-</mo><msup><mi>y</mi><mn>2</mn></msup><mo>)</mo></mrow><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>3</mn><mo>)</mo>", angular: (x, y, z) => 2 * z * z - x * x - y * y, solid: (x, y, z, r) => (2 * z * z - x * x - y * y) * Math.exp(-r / 3) },
  "3dxz": { label: "3d_xz", n: 3, l: 2, family: "d", expression: "<mi>x</mi><mi>z</mi><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>3</mn><mo>)</mo>", angular: (x, y, z) => x * z, solid: (x, y, z, r) => x * z * Math.exp(-r / 3) },
  "3dyz": { label: "3d_yz", n: 3, l: 2, family: "d", expression: "<mi>y</mi><mi>z</mi><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>3</mn><mo>)</mo>", angular: (x, y, z) => y * z, solid: (x, y, z, r) => y * z * Math.exp(-r / 3) },
  "3dxy": { label: "3d_xy", n: 3, l: 2, family: "d", expression: "<mi>x</mi><mi>y</mi><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>3</mn><mo>)</mo>", angular: (x, y) => x * y, solid: (x, y, z, r) => x * y * Math.exp(-r / 3) },
  "3dx2y2": { label: "3d_x²-y²", n: 3, l: 2, family: "d", expression: "<mrow><mo>(</mo><msup><mi>x</mi><mn>2</mn></msup><mo>-</mo><msup><mi>y</mi><mn>2</mn></msup><mo>)</mo></mrow><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>3</mn><mo>)</mo>", angular: (x, y) => x * x - y * y, solid: (x, y, z, r) => (x * x - y * y) * Math.exp(-r / 3) },
  "4fz3": { label: "4f_z³", n: 4, l: 3, family: "f", expression: "<mi>z</mi><mrow><mo>(</mo><mn>5</mn><msup><mi>z</mi><mn>2</mn></msup><mo>-</mo><mn>3</mn><msup><mi>r</mi><mn>2</mn></msup><mo>)</mo></mrow><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>4</mn><mo>)</mo>", angular: (x, y, z) => z * (5 * z * z - 3), solid: (x, y, z, r) => z * (5 * z * z - 3 * r * r) * Math.exp(-r / 4) },
  "4fxz2": { label: "4f_xz²", n: 4, l: 3, family: "f", expression: "<mi>x</mi><mrow><mo>(</mo><mn>5</mn><msup><mi>z</mi><mn>2</mn></msup><mo>-</mo><msup><mi>r</mi><mn>2</mn></msup><mo>)</mo></mrow><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>4</mn><mo>)</mo>", angular: (x, y, z) => x * (5 * z * z - 1), solid: (x, y, z, r) => x * (5 * z * z - r * r) * Math.exp(-r / 4) },
  "4fyz2": { label: "4f_yz²", n: 4, l: 3, family: "f", expression: "<mi>y</mi><mrow><mo>(</mo><mn>5</mn><msup><mi>z</mi><mn>2</mn></msup><mo>-</mo><msup><mi>r</mi><mn>2</mn></msup><mo>)</mo></mrow><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>4</mn><mo>)</mo>", angular: (x, y, z) => y * (5 * z * z - 1), solid: (x, y, z, r) => y * (5 * z * z - r * r) * Math.exp(-r / 4) },
  "4fzx2y2": { label: "4f_z(x²-y²)", n: 4, l: 3, family: "f", expression: "<mi>z</mi><mrow><mo>(</mo><msup><mi>x</mi><mn>2</mn></msup><mo>-</mo><msup><mi>y</mi><mn>2</mn></msup><mo>)</mo></mrow><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>4</mn><mo>)</mo>", angular: (x, y, z) => z * (x * x - y * y), solid: (x, y, z, r) => z * (x * x - y * y) * Math.exp(-r / 4) },
  "4fxyz": { label: "4f_xyz", n: 4, l: 3, family: "f", expression: "<mi>x</mi><mi>y</mi><mi>z</mi><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>4</mn><mo>)</mo>", angular: (x, y, z) => x * y * z, solid: (x, y, z, r) => x * y * z * Math.exp(-r / 4) },
  "4fx3": { label: "4f_x(x²-3y²)", n: 4, l: 3, family: "f", expression: "<mi>x</mi><mrow><mo>(</mo><msup><mi>x</mi><mn>2</mn></msup><mo>-</mo><mn>3</mn><msup><mi>y</mi><mn>2</mn></msup><mo>)</mo></mrow><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>4</mn><mo>)</mo>", angular: (x, y) => x * (x * x - 3 * y * y), solid: (x, y, z, r) => x * (x * x - 3 * y * y) * Math.exp(-r / 4) },
  "4fy3": { label: "4f_y(3x²-y²)", n: 4, l: 3, family: "f", expression: "<mi>y</mi><mrow><mo>(</mo><mn>3</mn><msup><mi>x</mi><mn>2</mn></msup><mo>-</mo><msup><mi>y</mi><mn>2</mn></msup><mo>)</mo></mrow><mi>exp</mi><mo>(</mo><mo>-</mo><mi>r</mi><mo>/</mo><mn>4</mn><mo>)</mo>", angular: (x, y) => y * (3 * x * x - y * y), solid: (x, y, z, r) => y * (3 * x * x - y * y) * Math.exp(-r / 4) }
};

function fmt(x, digits = 6) {
  return Number.isFinite(x) ? x.toFixed(digits) : "-";
}

function matrixText(title, M) {
  return `${title}\n[ ${fmt(M[0][0])}  ${fmt(M[0][1])} ]\n[ ${fmt(M[1][0])}  ${fmt(M[1][1])} ]`;
}

function drawHistory(history) {
  const canvas = els.energyCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#d8dee5";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = 30 + i * (h - 60) / 4;
    ctx.beginPath();
    ctx.moveTo(48, y);
    ctx.lineTo(w - 24, y);
    ctx.stroke();
  }
  if (history.length < 2) return;

  const energies = history.map((p) => p.energy);
  const min = Math.min(...energies);
  const max = Math.max(...energies);
  const pad = Math.max((max - min) * 0.08, 1e-5);
  const xOf = (i) => 48 + i * (w - 84) / Math.max(history.length - 1, 1);
  const yOf = (e) => 24 + (max + pad - e) * (h - 54) / (max - min + 2 * pad);

  ctx.strokeStyle = "#007f86";
  ctx.lineWidth = 3;
  ctx.beginPath();
  history.forEach((p, i) => {
    const x = xOf(i);
    const y = yOf(p.energy);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#17202a";
  ctx.font = "16px ui-sans-serif, system-ui";
  ctx.fillText("SCF energy history", 48, 22);
  ctx.font = "12px ui-sans-serif, system-ui";
  ctx.fillStyle = "#5b6874";
  ctx.fillText(`${fmt(min, 7)} to ${fmt(max, 7)} Ha`, 48, h - 14);
}

function drawDensity(result) {
  const canvas = els.densityCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const rows = sampleAxis(result);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const maxAbs = Math.max(...rows.flatMap((r) => [Math.abs(r.aoA), Math.abs(r.aoB), Math.abs(r.mo)]));
  const maxDensity = Math.max(...rows.map((r) => r.density));
  const xMin = rows[0].x;
  const xMax = rows[rows.length - 1].x;
  const xOf = (x) => 44 + (x - xMin) * (w - 88) / (xMax - xMin);
  const yOrb = (v) => h * 0.47 - v * (h * 0.32) / maxAbs;
  const yDensity = (v) => h - 34 - v * (h * 0.28) / maxDensity;

  ctx.strokeStyle = "#d8dee5";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(44, h * 0.47);
  ctx.lineTo(w - 44, h * 0.47);
  ctx.moveTo(44, h - 34);
  ctx.lineTo(w - 44, h - 34);
  ctx.stroke();

  const drawLine = (key, color, yMap, width = 2) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    rows.forEach((r, i) => {
      const x = xOf(r.x);
      const y = yMap(r[key]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  drawLine("aoA", "#c64562", yOrb);
  drawLine("aoB", "#b08200", yOrb);
  drawLine("mo", "#007f86", yOrb, 3);
  if (result.method === "uhf" || result.method === "udft") {
    drawLine("betaMo", "#c64562", yOrb, 3);
  }
  drawLine("density", "#6251a6", yDensity, 3);

  const nuclei = result.system.nuclei.map((n) => n.center[0]);
  ctx.fillStyle = "#17202a";
  for (const x of nuclei) {
    ctx.beginPath();
    ctx.arc(xOf(x), h - 34, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (controls.showGrid.checked && result.grid.length) {
    ctx.fillStyle = "rgba(0, 127, 134, 0.18)";
    for (const p of result.grid.filter((_, i) => i % 28 === 0)) {
      const gx = xOf(p.r[0]);
      const gy = h * 0.72 - p.r[1] * 18;
      if (gx > 44 && gx < w - 44 && gy > h * 0.53 && gy < h - 52) {
        ctx.fillRect(gx, gy, 2, 2);
      }
    }
  }

  ctx.font = "13px ui-sans-serif, system-ui";
  ctx.fillStyle = "#c64562";
  ctx.fillText("AO left", 54, 30);
  ctx.fillStyle = "#b08200";
  ctx.fillText("AO right", 130, 30);
  ctx.fillStyle = "#007f86";
  ctx.fillText(result.method === "uhf" || result.method === "udft" ? "alpha MO" : "occupied MO", 220, 30);
  ctx.fillStyle = "#6251a6";
  ctx.fillText("density", 330, 30);
  if (result.method === "uhf" || result.method === "udft") {
    ctx.fillStyle = "#c64562";
    ctx.fillText("beta MO", 410, 30);
  }
}

function drawBenchmark(benchmarks) {
  const canvas = els.benchmarkCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const allPoints = benchmarks.flatMap((b) => b.points.map((p) => ({
    method: b.method,
    x: p.bondAngstrom,
    y: (p.energy - b.farEnergy) * HARTREE_TO_KJMOL_LOCAL
  })));
  const xMin = 0.45;
  const xMax = 3.45;
  const yMin = Math.min(-520, ...allPoints.map((p) => p.y));
  const yMax = Math.max(80, ...allPoints.map((p) => p.y));
  const xOf = (x) => 54 + (x - xMin) * (w - 100) / (xMax - xMin);
  const yOf = (y) => 30 + (yMax - y) * (h - 76) / (yMax - yMin);
  const colors = { rhf: "#007f86", uhf: "#c64562" };

  ctx.strokeStyle = "#d8dee5";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = 30 + i * (h - 76) / 4;
    ctx.beginPath();
    ctx.moveTo(54, y);
    ctx.lineTo(w - 46, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#17202a";
  ctx.beginPath();
  ctx.moveTo(54, yOf(0));
  ctx.lineTo(w - 46, yOf(0));
  ctx.stroke();

  for (const benchmark of benchmarks) {
    ctx.strokeStyle = colors[benchmark.method];
    ctx.lineWidth = benchmark.method === "uhf" ? 3 : 2;
    ctx.beginPath();
    benchmark.points.forEach((point, i) => {
      const x = xOf(point.bondAngstrom);
      const y = yOf((point.energy - benchmark.farEnergy) * HARTREE_TO_KJMOL_LOCAL);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = "#b08200";
  ctx.beginPath();
  ctx.moveTo(xOf(experimentalH2.bondAngstrom), 28);
  ctx.lineTo(xOf(experimentalH2.bondAngstrom), h - 42);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#17202a";
  ctx.font = "15px ui-sans-serif, system-ui";
  ctx.fillText("E(R) - E(6 Å)", 54, 20);
  ctx.font = "12px ui-sans-serif, system-ui";
  ctx.fillStyle = "#5b6874";
  ctx.fillText("R / Å", w - 82, h - 14);
  ctx.fillText("kJ mol⁻¹", 54, h - 14);
  ctx.fillStyle = "#007f86";
  ctx.fillText("RHF", 190, 20);
  ctx.fillStyle = "#c64562";
  ctx.fillText("UHF", 230, 20);
  ctx.fillStyle = "#5b6874";
  ctx.fillText("exp R_e", 270, 20);
}

const HARTREE_TO_KJMOL_LOCAL = 2625.499638;

function renderBenchmark() {
  const benchmarks = benchmarkMethods({
    maxIterations: Number(controls.iterations.value),
    mixing: Number(controls.mixing.value)
  });
  drawBenchmark(benchmarks);
  els.benchmarkRef.textContent = `exp: R_e ${fmt(experimentalH2.bondAngstrom, 3)} Å, D ${fmt(experimentalH2.dissociationKjMol, 2)} kJ mol⁻¹`;
  els.benchmarkRows.innerHTML = benchmarks.map((b) => `
    <tr class="${b.method}">
      <td>${b.method === "udft" ? "UDFT" : b.method.toUpperCase()}</td>
      <td>${fmt(b.equilibriumAngstrom, 2)}</td>
      <td>${fmt(b.bondError, 3)}</td>
      <td>${fmt(b.dissociationKjMol, 1)}</td>
      <td>${fmt(b.dissociationError, 1)}</td>
    </tr>
  `).join("");
}

function rotatePoint(point, yaw, pitch) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const x1 = point.x * cy + point.z * sy;
  const z1 = -point.x * sy + point.z * cy;
  const y1 = point.y * cp - z1 * sp;
  const z2 = point.y * sp + z1 * cp;
  return { x: x1, y: y1, z: z2, phase: point.phase, weight: point.weight };
}

function project(point, width, height, scale) {
  const perspective = 5.8 / (5.8 - point.z);
  return {
    x: width / 2 + point.x * scale * perspective,
    y: height / 2 - point.y * scale * perspective,
    z: point.z,
    phase: point.phase,
    weight: point.weight,
    perspective
  };
}

function sphereDirections(count) {
  const dirs = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const z = 1 - 2 * (i + 0.5) / count;
    const radius = Math.sqrt(Math.max(0, 1 - z * z));
    const theta = i * golden;
    dirs.push({ x: Math.cos(theta) * radius, y: Math.sin(theta) * radius, z });
  }
  return dirs;
}

function pseudoRandom(index) {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function drawAxes(ctx, width, height, yaw, pitch, scale) {
  const axes = [
    { label: "x", color: "#c64562", end: { x: 1.65, y: 0, z: 0 } },
    { label: "y", color: "#b08200", end: { x: 0, y: 1.65, z: 0 } },
    { label: "z", color: "#007f86", end: { x: 0, y: 0, z: 1.65 } }
  ];
  const origin = project(rotatePoint({ x: 0, y: 0, z: 0 }, yaw, pitch), width, height, scale);
  ctx.lineWidth = 2;
  ctx.font = "13px ui-sans-serif, system-ui";
  for (const axis of axes) {
    const end = project(rotatePoint(axis.end, yaw, pitch), width, height, scale);
    ctx.strokeStyle = axis.color;
    ctx.fillStyle = axis.color;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.fillText(axis.label, end.x + 5, end.y - 5);
  }
}

function drawNodalHints(ctx, width, height, orbital) {
  ctx.fillStyle = "#5b6874";
  ctx.font = "13px ui-sans-serif, system-ui";
  const radial = orbital.n - orbital.l - 1;
  ctx.fillText(`angular nodes: ${orbital.l}`, 24, height - 48);
  ctx.fillText(`radial nodes: ${radial}`, 24, height - 28);
  if (orbital.family === "p") ctx.fillText("p orbitals have one nodal plane through the nucleus", 24, 30);
  if (orbital.family === "d") ctx.fillText("d orbitals have two angular nodes", 24, 30);
  if (orbital.family === "f") ctx.fillText("f orbitals have three angular nodes and richer phase alternation", 24, 30);
}

function drawOrbitalSurface(ctx, orbital, yaw, pitch, threshold) {
  const width = orbitalEls.canvas.width;
  const height = orbitalEls.canvas.height;
  const dirs = sphereDirections(2400);
  const values = dirs.map((dir) => orbital.angular(dir.x, dir.y, dir.z));
  const maxAbs = Math.max(...values.map(Math.abs)) || 1;
  const points = dirs.map((dir, i) => {
    const value = values[i] / maxAbs;
    const radius = 0.28 + 1.72 * Math.abs(value);
    return {
      x: dir.x * radius,
      y: dir.y * radius,
      z: dir.z * radius,
      phase: Math.sign(value) || 1,
      weight: Math.abs(value)
    };
  }).filter((p) => p.weight >= threshold * 0.18)
    .map((p) => project(rotatePoint(p, yaw, pitch), width, height, 150))
    .sort((a, b) => a.z - b.z);

  for (const p of points) {
    const alpha = 0.28 + 0.6 * p.weight;
    ctx.fillStyle = p.phase >= 0 ? `rgba(0, 127, 134, ${alpha})` : `rgba(198, 69, 98, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.2 * p.perspective, 0, Math.PI * 2);
    ctx.fill();
  }
}

function makeSurfaceGrid(orbital, threshold) {
  const latSteps = 50;
  const lonSteps = 96;
  const raw = [];
  let maxAbs = 0;
  for (let i = 0; i <= latSteps; i++) {
    const theta = Math.PI * i / latSteps;
    const row = [];
    for (let j = 0; j <= lonSteps; j++) {
      const phi = 2 * Math.PI * j / lonSteps;
      const x = Math.sin(theta) * Math.cos(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(theta);
      const value = orbital.angular(x, y, z);
      maxAbs = Math.max(maxAbs, Math.abs(value));
      row.push({ x, y, z, value });
    }
    raw.push(row);
  }

  return raw.map((row) => row.map((cell) => {
    const normalized = maxAbs > 0 ? cell.value / maxAbs : 0;
    const magnitude = Math.abs(normalized);
    const radius = 0.18 + 1.82 * magnitude;
    return {
      x: cell.x * radius,
      y: cell.y * radius,
      z: cell.z * radius,
      phase: Math.sign(normalized) || 1,
      weight: magnitude,
      visible: magnitude >= threshold * 0.08
    };
  }));
}

function drawMeshLine(ctx, a, b, color, alpha, width = 1.15) {
  ctx.strokeStyle = color.replace("ALPHA", alpha.toFixed(3));
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawOrbitalMesh(ctx, orbital, yaw, pitch, threshold) {
  const width = orbitalEls.canvas.width;
  const height = orbitalEls.canvas.height;
  const grid = makeSurfaceGrid(orbital, threshold);
  const projected = grid.map((row) => row.map((p) => {
    const q = project(rotatePoint(p, yaw, pitch), width, height, 150);
    return { ...q, visible: p.visible };
  }));

  const segments = [];
  for (let i = 0; i < projected.length; i++) {
    for (let j = 0; j < projected[i].length; j++) {
      const p = projected[i][j];
      if (!p.visible) continue;
      if (j + 1 < projected[i].length) {
        const q = projected[i][j + 1];
        if (q.visible && p.phase === q.phase) segments.push([p, q]);
      }
      if (i + 1 < projected.length) {
        const q = projected[i + 1][j];
        if (q.visible && p.phase === q.phase) segments.push([p, q]);
      }
    }
  }

  segments.sort((a, b) => ((a[0].z + a[1].z) / 2) - ((b[0].z + b[1].z) / 2));
  for (const [a, b] of segments) {
    const phaseColor = a.phase >= 0 ? "rgba(0, 127, 134, ALPHA)" : "rgba(198, 69, 98, ALPHA)";
    const alpha = 0.28 + 0.54 * Math.min(a.weight, b.weight);
    drawMeshLine(ctx, a, b, phaseColor, alpha, a.z > 0 ? 1.35 : 0.9);
  }

  // Emphasize nodal boundaries where neighboring mesh cells change phase.
  ctx.strokeStyle = "rgba(23, 32, 42, 0.22)";
  ctx.lineWidth = 1;
  for (let i = 0; i < projected.length - 1; i++) {
    for (let j = 0; j < projected[i].length - 1; j++) {
      const p = projected[i][j];
      const q = projected[i + 1][j];
      const r = projected[i][j + 1];
      if (p.visible && q.visible && p.phase !== q.phase) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
      if (p.visible && r.visible && p.phase !== r.phase) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
      }
    }
  }
}

function drawOrbitalCloud(ctx, orbital, yaw, pitch, threshold) {
  const width = orbitalEls.canvas.width;
  const height = orbitalEls.canvas.height;
  const maxR = orbital.n * 2.2;
  const samples = [];
  let maxProb = 0;
  for (let i = 1; i <= 15000; i++) {
    const x = (pseudoRandom(i) * 2 - 1) * maxR;
    const y = (pseudoRandom(i + 17000) * 2 - 1) * maxR;
    const z = (pseudoRandom(i + 34000) * 2 - 1) * maxR;
    const r = Math.hypot(x, y, z);
    if (r > maxR) continue;
    const value = orbital.solid(x, y, z, r);
    const prob = value * value;
    maxProb = Math.max(maxProb, prob);
    samples.push({ x: x / maxR * 2.1, y: y / maxR * 2.1, z: z / maxR * 2.1, phase: Math.sign(value) || 1, weight: prob });
  }
  const keep = Math.max(0.0005, threshold ** 3) * maxProb;
  const points = samples.filter((p) => p.weight >= keep)
    .map((p) => ({ ...p, weight: Math.sqrt(p.weight / maxProb) }))
    .map((p) => project(rotatePoint(p, yaw, pitch), width, height, 155))
    .sort((a, b) => a.z - b.z);

  for (const p of points.slice(-5200)) {
    const alpha = 0.18 + 0.55 * p.weight;
    ctx.fillStyle = p.phase >= 0 ? `rgba(0, 127, 134, ${alpha})` : `rgba(198, 69, 98, ${alpha})`;
    ctx.fillRect(p.x, p.y, 2.1 * p.perspective, 2.1 * p.perspective);
  }
}

function renderOrbital() {
  const orbital = orbitals[orbitalControls.select.value];
  const mode = orbitalControls.mode.value;
  const threshold = Number(orbitalControls.threshold.value);
  const yaw = Number(orbitalControls.rotation.value) * Math.PI / 180;
  const pitch = -0.34;
  const ctx = orbitalEls.canvas.getContext("2d");
  const width = orbitalEls.canvas.width;
  const height = orbitalEls.canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  if (orbitalControls.axes.checked) {
    drawAxes(ctx, width, height, yaw, pitch, 150);
    drawNodalHints(ctx, width, height, orbital);
  }
  if (mode === "cloud") drawOrbitalCloud(ctx, orbital, yaw, pitch, threshold);
  else if (mode === "mesh") drawOrbitalMesh(ctx, orbital, yaw, pitch, threshold);
  else drawOrbitalSurface(ctx, orbital, yaw, pitch, threshold);

  orbitalEls.title.textContent = `Hydrogen ${orbital.label} orbital`;
  orbitalEls.subtitle.textContent = mode === "cloud"
    ? "点の濃さは |ψ|² の大きい領域を表し、色は波動関数の位相を表します。"
    : mode === "mesh"
      ? "Kikuchi 風に方向ごとの振幅を半径へ変換し、等値曲面を位相色のメッシュで描きます。"
      : "方向ごとの振幅を半径に変換し、正負の位相を点面として色分けしています。";
  orbitalEls.badge.textContent = mode === "cloud" ? "probability cloud" : mode === "mesh" ? "mesh phase surface" : "point phase surface";
  orbitalEls.thresholdValue.value = threshold.toFixed(2);
  orbitalEls.rotationValue.value = `${orbitalControls.rotation.value}°`;
  orbitalEls.n.textContent = orbital.n;
  orbitalEls.l.textContent = orbital.l;
  orbitalEls.angularNodes.textContent = orbital.l;
  orbitalEls.radialNodes.textContent = orbital.n - orbital.l - 1;
  orbitalEls.formula.innerHTML = `
    <div class="formulaBlock">
      <math display="block">
        <mi>&psi;</mi>
        <mo>(</mo><mtext>${orbital.label}</mtext><mo>)</mo>
        <mo>&propto;</mo>
        ${orbital.expression}
      </math>
    </div>
    <div class="formulaBlock smallFormula">
      <math display="block">
        <mtext>angular nodes</mtext>
        <mo>=</mo>
        <mi>l</mi>
        <mo>=</mo>
        <mn>${orbital.l}</mn>
      </math>
    </div>
    <div class="formulaBlock smallFormula">
      <math display="block">
        <mtext>radial nodes</mtext>
        <mo>=</mo>
        <mi>n</mi>
        <mo>-</mo>
        <mi>l</mi>
        <mo>-</mo>
        <mn>1</mn>
        <mo>=</mo>
        <mn>${orbital.n - orbital.l - 1}</mn>
      </math>
    </div>
    <p>phase colors: teal = positive, rose = negative</p>
  `;
}

function setOrbitalDoc(key) {
  orbitalEls.doc.innerHTML = orbitalDocs[key];
  orbitalEls.tabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.orbitalDoc === key);
  });
}

function setScreen(key) {
  orbitalEls.screenButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === key);
  });
  orbitalEls.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === `${key}Screen`);
  });
  if (key === "orbitals") renderOrbital();
}

function recompute() {
  const bondAngstrom = Number(controls.bond.value);
  const maxIterations = Number(controls.iterations.value);
  const mixing = Number(controls.mixing.value);
  const method = controls.method.value;
  els.bondValue.value = fmt(bondAngstrom, 2);
  els.iterationValue.value = String(maxIterations);
  els.mixingValue.value = fmt(mixing, 2);

  const result = runScf({ bondAngstrom, method, maxIterations, mixing });
  els.energy.textContent = `${fmt(result.totalEnergy, 8)} Ha`;
  els.electronic.textContent = `${fmt(result.electronicEnergy, 8)} Ha`;
  els.gap.textContent = `${fmt(result.gap, 6)} Ha`;
  els.spin.textContent = `${fmt(result.spinSquared, 4)} / ${result.converged ? "yes" : "not yet"}`;
  els.overlap.textContent = matrixText("Overlap S", result.system.S);
  els.core.textContent = matrixText("Core H", result.system.H);
  els.fock.textContent = matrixText(
    method === "lda" ? "KS matrix" : method === "uhf" ? "Fock Fα" : method === "udft" ? "KS Fα" : "Fock F",
    result.F
  );
  els.densityMatrix.textContent = matrixText("Density P", result.P);
  els.gridBadge.textContent = controls.showGrid.checked ? "grid on" : "grid off";
  drawHistory(result.history);
  drawDensity(result);
}

function setDoc(key) {
  els.doc.innerHTML = docs[key];
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.doc === key);
  });
}

function setCode(key) {
  els.codeView.textContent = sourceSnippets[key];
}

for (const control of Object.values(controls)) {
  control.addEventListener("input", recompute);
}

controls.iterations.addEventListener("input", renderBenchmark);
controls.mixing.addEventListener("input", renderBenchmark);

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => setDoc(button.dataset.doc));
});

els.codeSelect.addEventListener("input", () => setCode(els.codeSelect.value));

orbitalEls.screenButtons.forEach((button) => {
  button.addEventListener("click", () => setScreen(button.dataset.screen));
});

for (const control of Object.values(orbitalControls)) {
  control.addEventListener("input", renderOrbital);
}

orbitalEls.tabs.forEach((button) => {
  button.addEventListener("click", () => setOrbitalDoc(button.dataset.orbitalDoc));
});

setDoc("integrals");
setCode("integrals");
recompute();
renderBenchmark();
setOrbitalDoc("concept");
renderOrbital();
