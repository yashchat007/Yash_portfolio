type Gl = WebGLRenderingContext;

const VERT = `
attribute vec3 aPos;
uniform mat4 uMvp;
void main() {
  gl_Position = uMvp * vec4(aPos, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform vec4 uColor;
void main() {
  gl_FragColor = uColor;
}
`;

const POINT_VERT = `
attribute vec3 aPos;
attribute float aSize;
uniform mat4 uMvp;
uniform float uDpr;
void main() {
  gl_Position = uMvp * vec4(aPos, 1.0);
  gl_PointSize = aSize * uDpr * (2.4 / max(0.35, gl_Position.w));
}
`;

const POINT_FRAG = `
precision mediump float;
uniform vec4 uColor;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  float glow = pow(1.0 - d, 1.45);
  gl_FragColor = vec4(uColor.rgb, uColor.a * glow);
}
`;

function shellEdges(subdivisions: number): number[] {
  const t = (1 + Math.sqrt(5)) / 2;
  const verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(([x, y, z]) => {
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  });
  let faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const midpoint = new Map<string, number>();
  const mid = (i: number, j: number) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    const hit = midpoint.get(key);
    if (hit !== undefined) return hit;
    const a = verts[i];
    const b = verts[j];
    const x = (a[0] + b[0]) / 2;
    const y = (a[1] + b[1]) / 2;
    const z = (a[2] + b[2]) / 2;
    const l = Math.hypot(x, y, z);
    const index = verts.length;
    verts.push([x / l, y / l, z / l]);
    midpoint.set(key, index);
    return index;
  };
  for (let step = 0; step < subdivisions; step++) {
    const next: number[][] = [];
    midpoint.clear();
    for (const [a, b, c] of faces) {
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }
  const seen = new Set<string>();
  const edges: number[] = [];
  for (const [a, b, c] of faces) {
    for (const [i, j] of [[a, b], [b, c], [c, a]] as const) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push(verts[i][0], verts[i][1], verts[i][2], verts[j][0], verts[j][1], verts[j][2]);
    }
  }
  return edges;
}

function ring(radius: number, segments: number): Float32Array {
  const data = new Float32Array(segments * 2 * 3);
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    const o = i * 6;
    data[o] = Math.cos(a0) * radius;
    data[o + 1] = 0;
    data[o + 2] = Math.sin(a0) * radius;
    data[o + 3] = Math.cos(a1) * radius;
    data[o + 4] = 0;
    data[o + 5] = Math.sin(a1) * radius;
  }
  return data;
}

function scaleEdges(edges: number[], scale: number): Float32Array {
  const data = new Float32Array(edges.length);
  for (let i = 0; i < edges.length; i++) data[i] = edges[i] * scale;
  return data;
}

function compile(gl: Gl, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function program(gl: Gl, vert: string, frag: string): WebGLProgram {
  const p = gl.createProgram();
  if (!p) throw new Error("program");
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? "link");
  }
  return p;
}

function identity(): Float32Array {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

function multiply(a: Float32Array, b: Float32Array, out = new Float32Array(16)): Float32Array {
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
  const m = new Float32Array(16);
  const f = 1 / Math.tan(fov / 2);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}

function rotateX(angle: number): Float32Array {
  const m = identity();
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  return m;
}

function rotateY(angle: number): Float32Array {
  const m = identity();
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
}

function translateZ(z: number): Float32Array {
  const m = identity();
  m[14] = z;
  return m;
}

function readRgb(name: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const [r, g, b] = raw.split(",").map((part) => Number(part.trim()));
  return [(r || 0) / 255, (g || 0) / 255, (b || 0) / 255];
}

const SATS = [
  { radius: 1.45, speed: 0.55, phase: 0.4, tilt: 0.28, size: 18 },
  { radius: 1.7, speed: -0.34, phase: 2.2, tilt: -0.18, size: 14 },
  { radius: 1.2, speed: 0.82, phase: 4.1, tilt: 0.5, size: 12 },
];

export function mount(canvas: HTMLCanvasElement, onReady: () => void): () => void {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });
  if (!gl) return () => {};

  let lineProg: WebGLProgram;
  let pointProg: WebGLProgram;
  try {
    lineProg = program(gl, VERT, FRAG);
    pointProg = program(gl, POINT_VERT, POINT_FRAG);
  } catch {
    return () => {};
  }

  const shell = scaleEdges(shellEdges(1), 1);
  const inner = scaleEdges(shellEdges(0), 0.46);
  const orbit = ring(1.62, 72);

  const shellBuf = gl.createBuffer();
  const innerBuf = gl.createBuffer();
  const orbitBuf = gl.createBuffer();
  const pointBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, shellBuf);
  gl.bufferData(gl.ARRAY_BUFFER, shell, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, innerBuf);
  gl.bufferData(gl.ARRAY_BUFFER, inner, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, orbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, orbit, gl.STATIC_DRAW);

  const lineLoc = gl.getAttribLocation(lineProg, "aPos");
  const lineMvp = gl.getUniformLocation(lineProg, "uMvp");
  const lineColor = gl.getUniformLocation(lineProg, "uColor");
  const pointLoc = gl.getAttribLocation(pointProg, "aPos");
  const pointSize = gl.getAttribLocation(pointProg, "aSize");
  const pointMvp = gl.getUniformLocation(pointProg, "uMvp");
  const pointDpr = gl.getUniformLocation(pointProg, "uDpr");
  const pointColor = gl.getUniformLocation(pointProg, "uColor");

  let lineRgb = readRgb("--gl-line");
  let hotRgb = readRgb("--gl-hot");
  const onTheme = () => {
    lineRgb = readRgb("--gl-line");
    hotRgb = readRgb("--gl-hot");
  };
  document.addEventListener("themechange", onTheme);

  const parent = canvas.parentElement ?? canvas;
  let pointerX = 0;
  let pointerY = 0;
  const onPointer = (event: PointerEvent) => {
    const rect = parent.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };
  const onLeave = () => {
    pointerX = 0;
    pointerY = 0;
  };
  parent.addEventListener("pointermove", onPointer);
  parent.addEventListener("pointerleave", onLeave);

  let width = 0;
  let height = 0;
  let dpr = 1;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, rect.width < 700 ? 1.25 : 1.5);
    const nextW = Math.max(1, Math.round(rect.width * dpr));
    const nextH = Math.max(1, Math.round(rect.height * dpr));
    if (nextW === width && nextH === height) return;
    width = nextW;
    height = nextH;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let frame = 0;
  let running = true;
  let visible = true;
  let ready = false;
  const started = performance.now();
  const proj = new Float32Array(16);
  const view = new Float32Array(16);
  const model = new Float32Array(16);
  const mvp = new Float32Array(16);
  const tmp = new Float32Array(16);

  const drawLines = (buffer: WebGLBuffer | null, count: number, matrix: Float32Array, color: [number, number, number], alpha: number) => {
    gl.useProgram(lineProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(lineLoc);
    gl.vertexAttribPointer(lineLoc, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(lineMvp, false, matrix);
    gl.uniform4f(lineColor, color[0], color[1], color[2], alpha);
    gl.drawArrays(gl.LINES, 0, count);
  };

  const tick = (now: number) => {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    resize();
    const t = (now - started) / 1000;
    const yaw = t * 0.18 + pointerX * 0.45;
    const pitch = 0.35 + pointerY * 0.28;
    const aspect = width / Math.max(1, height);
    perspective(0.72, aspect, 0.1, 20).forEach((v, i) => { proj[i] = v; });
    const viewM = multiply(translateZ(-4.35), multiply(rotateX(pitch), rotateY(yaw), tmp), view);
    multiply(proj, viewM, mvp);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawLines(orbitBuf, orbit.length / 3, mvp, lineRgb, 0.35);
    drawLines(shellBuf, shell.length / 3, mvp, lineRgb, 0.82);

    const innerView = multiply(translateZ(-4.35), multiply(rotateX(-pitch * 0.4), rotateY(-yaw * 1.4), tmp), model);
    const innerMvp = multiply(proj, innerView, tmp);
    drawLines(innerBuf, inner.length / 3, innerMvp, hotRgb, 0.55);

    const points = new Float32Array(4 * 4);
    points[0] = 0;
    points[1] = 0;
    points[2] = 0;
    points[3] = 26;
    SATS.forEach((sat, index) => {
      const angle = t * sat.speed + sat.phase;
      const o = (index + 1) * 4;
      points[o] = Math.cos(angle) * sat.radius;
      points[o + 1] = Math.sin(angle * 0.85) * sat.tilt;
      points[o + 2] = Math.sin(angle) * sat.radius;
      points[o + 3] = sat.size;
    });
    gl.useProgram(pointProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuf);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(pointLoc);
    gl.vertexAttribPointer(pointLoc, 3, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(pointSize);
    gl.vertexAttribPointer(pointSize, 1, gl.FLOAT, false, 16, 12);
    gl.uniformMatrix4fv(pointMvp, false, mvp);
    gl.uniform1f(pointDpr, dpr);
    gl.uniform4f(pointColor, hotRgb[0], hotRgb[1], hotRgb[2], 0.95);
    gl.drawArrays(gl.POINTS, 0, 4);

    if (!ready) {
      ready = true;
      onReady();
    }
  };

  const onVis = (entries: IntersectionObserverEntry[]) => {
    visible = entries.some((entry) => entry.isIntersecting);
  };
  const vis = new IntersectionObserver(onVis, { threshold: 0.05 });
  vis.observe(parent);
  frame = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    observer.disconnect();
    vis.disconnect();
    document.removeEventListener("themechange", onTheme);
    parent.removeEventListener("pointermove", onPointer);
    parent.removeEventListener("pointerleave", onLeave);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
