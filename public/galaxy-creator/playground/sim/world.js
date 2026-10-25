/* A people's world, up close: a turning planet generated from the galaxy's seed and the people,
   that changes as they develop. Cities light the night side, then roads join them; satellites
   and launches come with spaceflight; an orbital ring and colony worlds with the stars; at the
   end the whole planet is one city. Strikes leave scars, a golden age lights the poles, a beacon
   shines from the poles out. Nothing is a picture: every world is noise, palette and the
   people's own numbers.

   World.create(host, { sim, state }) → { open(civId), close(), isOpen() }
   `state()` returns the live sim state, so the world keeps changing while it's open. */
(function (root) {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  // A small seeded generator, so a people's world looks the same every time you visit.
  const rng = (seed) => { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

  const SEAS = [[0.03, 0.12, 0.34], [0.02, 0.2, 0.3], [0.05, 0.1, 0.26], [0.06, 0.16, 0.22], [0.02, 0.08, 0.2]];
  const SEA_WORDS = ['blue', 'teal', 'indigo', 'grey-green', 'dark'];
  const LANDS = [[0.2, 0.34, 0.12], [0.42, 0.4, 0.2], [0.5, 0.28, 0.16], [0.28, 0.3, 0.2], [0.12, 0.3, 0.18], [0.45, 0.24, 0.3]];
  const LAND_WORDS = ['green', 'olive', 'rust-red', 'grey-green', 'deep green', 'plum-red'];
  const LIGHTS = { Expansive: [1.0, 0.6, 0.24], Mercantile: [1.0, 0.84, 0.44], Contemplative: [0.55, 0.9, 1.0], Insular: [0.96, 0.9, 0.8] };
  const STEPS = ['Cities', 'Radio', 'Space-flight', 'Inter-stellar', 'World-city'];

  // What a people's world is made of: fixed per people, so it is theirs.
  function looks(seed, c) {
    const r = rng(seed * 7919 + c.id * 104729 + 17);
    const pick = (a) => a[Math.floor(r() * a.length)];
    const si = Math.floor(r() * SEAS.length), li = Math.floor(r() * LANDS.length);
    return {
      sea: SEAS[si], land: LANDS[li], seaWord: SEA_WORDS[si], landWord: LAND_WORDS[li], lights: LIGHTS[c.kind] || LIGHTS.Insular,
      landAmt: 0.47 + r() * 0.12, ice: 0.1 + r() * 0.55, terrain: 1.6 + r() * 1.5, cloud: 0.55 + r() * 0.3,
      tilt: (r() - 0.5) * 1.1, spin: 0.08 + r() * 0.08, ringTilt: (r() - 0.5) * 1.2,
      sun: (() => { const a = (r() - 0.5) * 2.4 + Math.PI, e = (r() - 0.3) * 0.9; return [Math.cos(a) * 0.9, e, 0.12 + r() * 0.22]; })(), glow: [0.2 + r() * 0.15, 0.3 + r() * 0.12, 0.5 + r() * 0.15],
      key: r() * 100,
      size: ['small', 'middling', 'large'][Math.floor(r() * 3)], day: 8 + Math.floor(r() * 40),
      sats: Array.from({ length: 40 }, () => ({ a: 1.12 + r() * 0.42, inc: (r() - 0.5) * 1.6, node: r() * TAU, ph: r() * TAU, sp: 0.4 + r() * 0.9 })),
      moons: Array.from({ length: 6 }, (_, i) => ({ a: 1.75 + i * 0.22 + r() * 0.1, ph: i * 2.4 + r() * 0.3, sp: 0.06,   // spread out, and moving together so they stay apart
      size: 0.08 + r() * 0.06, hue: pick(LANDS) })),
    };
  }

  const FRAG = `precision highp float;
    varying vec2 v; uniform vec2 uRes, uCentre; uniform float uScale, uT, uRot, uTilt, uDev, uIce, uLandAmt, uTerrain, uCloud, uScar, uGolden, uDead, uKey, uDetail;
    uniform vec3 uSea, uLand, uLights, uGlow, uSun, uMood; uniform float uShelter;
    float h(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float n(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z); }
    // Octaves past what the screen can show fade out, so a close look gets finer coasts and a far one stays smooth.
    float fbm(vec3 p){ float s = 0.0, a = 0.5, w = 0.0; for (int i = 0; i < 9; i++){ float k = clamp(uDetail - float(i), 0.0, 1.0); s += a * n(p) * k; w += a * k; p = p * 2.03 + 1.7; a *= 0.5; } return s / max(w, 0.001) * 0.94; }
    float fbm4(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * n(p); p = p * 2.03 + 1.7; a *= 0.5; } return s / 0.9375 * 0.94; }
    // Height: warped noise, so continents have ragged coasts and long ranges rather than blobs.
    vec3 warp(vec3 p){ return p + 0.35 * vec3(fbm4(p * 0.9 + 3.1), fbm4(p * 0.9 + 7.7), fbm4(p * 0.9 + 12.3)); }
    float height(vec3 p){ return fbm(warp(p) * uTerrain); }
    float height4(vec3 p){ return fbm4(warp(p) * uTerrain); }
    float clouds(vec3 p){ vec3 q = p * 3.2 + vec3(uT * 0.015, 0.0, 0.0); q += 0.5 * vec3(fbm4(q * 0.7), fbm4(q * 0.7 + 4.0), fbm4(q * 0.7 + 8.0)); return smoothstep(uCloud, uCloud + 0.22, fbm4(q) * 0.6 + fbm(q * 2.6) * 0.4); }
    void main(){
      vec2 uv = (v * 0.5 + 0.5) * uRes; vec2 q = (uv - uCentre) / uScale;
      float r2 = dot(q, q), r = sqrt(r2);
      vec3 sun = normalize(uSun);
      vec3 col = vec3(0.0); float alpha = 0.0;
      float urban = smoothstep(3.5, 4.5, uDev) * (1.0 - uDead);
      vec3 sky = vec3(0.32, 0.56, 1.0);                       // scattered light: blue by day
      if (r2 < 1.0) {
        vec3 nrm = vec3(q, sqrt(1.0 - r2));
        // Turn the surface: a tilt, then the spin. The same turn takes the sun into the planet's frame.
        float ct = cos(uTilt), st = sin(uTilt), cr = cos(uRot), sr = sin(uRot);
        vec3 a = vec3(nrm.x, ct * nrm.y - st * nrm.z, st * nrm.y + ct * nrm.z);
        vec3 sq = vec3(cr * a.x + sr * a.z, a.y, -sr * a.x + cr * a.z);
        vec3 sa = vec3(sun.x, ct * sun.y - st * sun.z, st * sun.y + ct * sun.z);
        vec3 sunB = vec3(cr * sa.x + sr * sa.z, sa.y, -sr * sa.x + cr * sa.z);
        vec3 sp = sq + uKey;
        float e = height(sp), hgt = e - uLandAmt;
        float land = smoothstep(0.0, 0.006, hgt);
        float lat = abs(sq.y);
        // Relief: the slope of the land tilts its normal, so ranges and valleys catch the light.
        float eps = 0.004;
        vec3 g = vec3(height4(sp + vec3(eps, 0, 0)), height4(sp + vec3(0, eps, 0)), height4(sp + vec3(0, 0, eps))) - height4(sp);
        g -= dot(g, sq) * sq;
        vec3 nb = normalize(sq - g / eps * 0.09 * land);
        float dayS = dot(sq, sunB), day = dot(nb, sunB);
        float lit = smoothstep(-0.06, 0.22, dayS);
        // The sea: bright over the shelves, dark in the deeps.
        float depth = clamp(-hgt * 9.0, 0.0, 1.0);
        vec3 sea = mix(mix(uSea, vec3(0.16, 0.5, 0.55), 0.45) * 1.25, uSea * 0.55, smoothstep(0.0, 1.0, depth));
        // The land: wet lowlands take the world's own green, dry ones turn to sand; rock above, snow on the peaks.
        float t = clamp(hgt / 0.22, 0.0, 1.0);
        float wet = fbm4(sp * 2.1 + 40.0) + 0.25 * (1.0 - smoothstep(0.0, 0.5, abs(lat - 0.55)));   // drier near the equator's deserts
        vec3 dry = mix(vec3(0.66, 0.56, 0.38), uLand * 0.4 + vec3(0.45, 0.36, 0.24), 0.35);
        vec3 low = mix(dry, uLand, smoothstep(0.42, 0.62, wet)) * (0.85 + 0.3 * fbm4(sp * 24.0));
        vec3 rock = vec3(0.36, 0.32, 0.28) * (0.8 + 0.4 * fbm4(sp * 30.0));
        vec3 ground = mix(low, rock, smoothstep(0.35, 0.75, t));
        ground = mix(ground, vec3(0.86, 0.88, 0.9), smoothstep(0.78, 0.92, t + lat * 0.25));
        ground = mix(vec3(0.72, 0.66, 0.5), ground, smoothstep(0.0, 0.02, hgt));                         // beaches
        float tundra = smoothstep(0.55, 0.75, lat); ground = mix(ground, mix(ground, vec3(0.45, 0.43, 0.38), 0.6), tundra);
        vec3 surf = mix(sea, ground, land);
        float ice = smoothstep(1.0 - uIce * 0.5, 1.0 - uIce * 0.4, lat + (e - 0.5) * 0.3) * (1.0 - urban * 0.8);
        surf = mix(surf, vec3(0.86, 0.9, 0.95) * (0.85 + 0.2 * fbm4(sp * 14.0)), ice);
        // A world-city: the land turns to grey towers and grids, then the sea fills with platforms.
        float lon = atan(sq.z, sq.x) + (n(sq * 5.0) - 0.5) * 0.35, la = asin(clamp(sq.y, -1.0, 1.0)) + (n(sq * 5.0 + 9.0) - 0.5) * 0.2;
        float grid = max(smoothstep(0.9, 0.97, abs(fract(lon * 9.55) - 0.5) * 2.0), smoothstep(0.9, 0.97, abs(fract(la * 9.55) - 0.5) * 2.0)) * (0.5 + 0.5 * h(floor(vec3(lon * 9.55, la * 9.55, 1.0))));
        vec3 city = vec3(0.2, 0.21, 0.24) * (0.55 + 0.7 * n(sp * 180.0)) + grid * uLights * 0.45;
        surf = mix(surf, city, urban * (land + (1.0 - land) * smoothstep(0.5, 1.0, urban) * 0.45));
        // Scars: burnt ground where strikes fell.
        float scar = smoothstep(0.62, 0.6, fbm4(sp * 4.0 + 31.0)) * land * clamp(uScar, 0.0, 1.0);
        surf = mix(surf, vec3(0.08, 0.06, 0.05), scar * 0.85);
        if (uDead > 0.5) surf = mix(surf, vec3(0.3, 0.28, 0.26) * (0.6 + 0.6 * e), 0.6);
        // Clouds, and their shadows on the ground beneath.
        float cloud = clouds(sp) * (1.0 - urban * 0.6);
        float shade = clouds(sp + sunB * 0.025) * (1.0 - urban * 0.6);
        float diffuse = mix(max(dayS, 0.0), max(day, 0.0), land);
        col = surf * (0.015 + 0.95 * diffuse * (1.0 - shade * 0.45));
        // Sunlight on the sea.
        vec3 hv = normalize(sun + vec3(0, 0, 1));
        float glint = pow(max(dot(nrm, hv), 0.0), 260.0) * 0.55 + pow(max(dot(nrm, hv), 0.0), 30.0) * 0.06;
        vec3 sunset = vec3(1.0, 0.55, 0.3);
        float dusk = smoothstep(-0.1, 0.08, dayS) * smoothstep(0.3, 0.05, dayS);
        col += mix(vec3(1.0, 0.95, 0.85), sunset, dusk) * glint * (1.0 - land) * (1.0 - ice) * (1.0 - urban) * (1.0 - cloud) * lit;
        // Clouds on top: lit white by day, a faint grey at night, pink along the terminator.
        vec3 cc = mix(vec3(1.0), sunset * 1.1, dusk * 0.7) * (0.04 + 0.96 * max(dayS, 0.0) + 0.25 * dusk);
        col = mix(col, cc, cloud * 0.9);
        // Lights: cities on low land near the coasts, spreading as they grow; roads between; then everywhere.
        float grow = clamp(uDev / 3.0, 0.0, 1.0);
        float coast = 1.0 - smoothstep(0.02, 0.16, hgt);
        float region = smoothstep(0.58 - 0.16 * grow, 0.64 - 0.16 * grow, fbm4(sp * 3.0 + 7.0) * 0.7 + fbm4(sp * 11.0 + 3.0) * 0.3 + 0.12 * coast) * land * (1.0 - ice) * (1.0 - smoothstep(0.5, 0.8, t)) * step(0.02, uDev);
        vec3 cp = sp * 220.0, cf = fract(cp) - 0.5; float cid = h(floor(cp));
        float dots = smoothstep(0.88 - 0.2 * grow, 0.98, cid) * smoothstep(0.42, 0.1, length(cf)) * 1.4;
        vec3 cp2 = sp * 700.0, cf2 = fract(cp2) - 0.5;
        dots += smoothstep(0.8 - 0.25 * grow, 0.97, h(floor(cp2))) * smoothstep(0.45, 0.15, length(cf2)) * 0.7;
        dots += (0.12 + 0.2 * grow) * smoothstep(0.68 - 0.1 * grow, 0.92, n(sp * 60.0));
        float roads = smoothstep(0.7, 2.2, uDev) * smoothstep(0.94, 1.0, 1.0 - abs(n(sp * 14.0) - 0.5) * 2.0) * smoothstep(0.55 - 0.2 * grow, 0.62 - 0.2 * grow, fbm4(sp * 3.0 + 7.0)) * land * (1.0 - ice);
        float glowAll = urban * (land + (1.0 - land) * 0.55) * (0.5 + 0.5 * dots);
        float lights = (region * dots * 1.3 + region * (0.02 + 0.06 * grow) + roads * 0.7 + glowAll * 1.1) * (1.0 - cloud * 0.7) * (1.0 - uDead) * (1.0 - scar);
        col += uLights * lights * (1.0 - lit);
        col += uLights * glowAll * lit * 0.05 + uLights * grid * urban * lit * 0.25;                 // a world-city glints even by day
        // Embers where a strike burnt them, on the night side.
        col += vec3(1.0, 0.35, 0.1) * scar * (1.0 - lit) * 0.25 * (0.6 + 0.4 * n(sp * 30.0 + uT * 0.5));
        // A golden age: aurora at both poles.
        float aur = uGolden * smoothstep(0.68, 0.82, lat) * smoothstep(0.98, 0.86, lat) * (0.5 + 0.5 * n(vec3(sq.x * 8.0, uT * 0.4, sq.z * 8.0)));
        col += vec3(0.4, 1.0, 0.6) * aur * (1.0 - lit * 0.7) * 0.6;
        // The atmosphere seen edge-on: blue haze on the day side, orange at the terminator.
        float limb = pow(1.0 - nrm.z, 3.0);
        col = mix(col, sky * 0.9, limb * 0.55 * smoothstep(-0.2, 0.4, dayS));
        col += sunset * limb * dusk * 0.5;
        col += uGlow * limb * 0.08;
        col += uMood * pow(1.0 - nrm.z, 2.5) * 0.6;
        alpha = 1.0;
      }
      // Outside the disc: a thin shell of air, lit on the sun's side.
      float halo = exp(-max(0.0, r - 1.0) * 30.0) * step(1.0, r);
      float towardSun = smoothstep(-0.5, 0.7, dot(normalize(q + 1e-5), normalize(uSun.xy + 1e-5)));
      col += (sky * 0.9 + uGlow * 0.15) * halo * (0.12 + 0.75 * towardSun);
      col += uMood * exp(-max(0.0, r - 1.0) * 10.0) * step(1.0, r) * 1.1;   // how they feel about you, in their sky
      float shell = uShelter * smoothstep(0.06, 0.0, abs(r - 1.12)) * (0.6 + 0.4 * sin(uT * 2.0 + atan(q.y, q.x) * 6.0));
      col += vec3(0.55, 0.8, 1.0) * shell * 0.5; alpha = max(alpha, shell * 0.5);
      alpha = max(alpha, halo * 0.9);
      gl_FragColor = vec4(col, alpha);
    }`;

  // What their world is doing, in their own character, and what comes next.
  const VOICE = {
    Expansive: ['Their towns sprawl outward along every coast and river.', 'Highways and power lines race across the continents.', 'Rockets climb from a dozen launch sites; their satellites crowd the sky.', 'Colony ships leave every week; an orbital ring frames the world.', 'There is no wild land left: one city, from pole to pole.'],
    Mercantile: ['Port cities glitter where the trade routes meet.', 'Their cities are strung together by rails and signals.', 'Their satellites relay prices and news around the world.', 'Freighters climb to the ring and out to the colonies.', 'One market, one city, the whole world lit like a ledger.'],
    Contemplative: ['A few quiet cities, and observatories on the mountains.', 'Their radio telescopes listen more than they speak.', 'Their satellites watch the stars, and the black hole.', 'A slow ring of gardens and observatories rises over the world.', 'Even their world-city is quiet: lit, still, and listening.'],
    Insular: ['They build close and deep, in the shelter of their valleys.', 'Their cities knot together, with walls and watchful lights.', 'A few careful satellites, and defences in orbit.', 'A guarded ring, and colonies kept close.', 'A fortress-city, closed and shining.'],
  };
  const VOICE2 = {
    Expansive: ['New towns spring up wherever the land is flat and the water sweet.', 'Their cities reach for each other across the plains.', 'Launch towers rise on every continent.', 'Their ring is crowded; the colonies grow faster than the homeworld.', 'Every mountain is terraced, every coast built up.'],
    Mercantile: ['Lights cluster at the river mouths, where the boats come in.', 'Telegraph lines, then airwaves, carry their bargains.', 'Merchant satellites wink across the night side.', 'Trade fleets ply between the ring and the colony worlds.', 'Their world-city never sleeps: every light is a shop.'],
    Contemplative: ['Small towns, far apart, under very dark skies.', 'They spend their power on listening dishes, not cities.', 'Telescopes in orbit, pointed at you.', 'Their ring is a garden; their colonies are retreats.', 'Lit softly from end to end, like a lantern left on.'],
    Insular: ['Their towns hide in canyons and under the forest.', 'Their cities are walled, and lit only where they must be.', 'Their satellites watch the sky for anything coming.', 'Their ring bristles with defences.', 'A sealed world-city, its lights turned inward.'],
  };
  const NEXT = ['Keep their home calm and habitable, and they will find radio.', 'Next comes spaceflight: then they will see you, and ask things of you.', 'Next, the stars: they will settle the regions around them.', 'Given calm and room to spread, their world will become one city.', ''];
  function about(L) {
    const land = L.landAmt > 0.56 ? `a sea world, its ${L.landWord} land in scattered islands` : L.landAmt > 0.51 ? `${L.landWord} continents in ${L.seaWord} seas` : `a world of wide ${L.landWord} continents and narrow ${L.seaWord} seas`;
    const ice = L.ice > 0.5 ? ', with great ice caps' : L.ice < 0.2 ? ', with small polar caps' : '';
    return `A ${L.size} world: ${land}${ice}. A day there lasts ${L.day} hours.`;
  }
  const hexA = (h, a) => { const n = parseInt(String(h).replace('#', ''), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  function create(host, opts) {
    const sim = opts.sim, state = opts.state;
    host.innerHTML = `<canvas class="wv-back"></canvas><canvas class="wv-gl"></canvas><canvas class="wv-front"></canvas>
      <div class="wv-panel card"></div><button type="button" class="btn wv-close">Back to the galaxy</button><div class="wv-hint">Drag to turn it · scroll or pinch to come closer</div>`;
    const back = host.querySelector('.wv-back'), glc = host.querySelector('.wv-gl'), front = host.querySelector('.wv-front');
    const panel = host.querySelector('.wv-panel');
    const gl = glc.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    const sh = (t, src) => { const x = gl.createShader(t); gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(x)); return x; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 v; void main(){ v = p; gl_Position = vec4(p, 0.0, 1.0); }'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uCentre', 'uScale', 'uT', 'uRot', 'uTilt', 'uDev', 'uIce', 'uLandAmt', 'uTerrain', 'uCloud', 'uScar', 'uGolden', 'uDead', 'uKey', 'uDetail', 'uSea', 'uLand', 'uLights', 'uGlow', 'uSun', 'uMood', 'uShelter'].forEach((k) => { U[k] = gl.getUniformLocation(pr, k); });
    const dpr = Math.min(2, devicePixelRatio || 1);
    let civId = null, look = null, open = false, raf = 0, spin = 0, tilt = 0, zoom = 1, off = [0, 0], drag = null, panelKey = '', shown = 0;
    const touches = new Map(); let pinch = null;
    const launches = [];

    function size() { [back, glc, front].forEach((c) => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; }); gl.viewport(0, 0, glc.width, glc.height); }
    addEventListener('resize', () => { if (open) size(); });
    const home = () => [innerWidth > 760 ? innerWidth * 0.6 : innerWidth * 0.5, innerWidth > 760 ? innerHeight * 0.5 : innerHeight * 0.36];
    const centre = () => { const c = home(); return [c[0] + off[0], c[1] + off[1]]; };
    const radius = () => Math.min(innerWidth * (innerWidth > 760 ? 0.6 : 1), innerHeight) * 0.27 * zoom * (look ? { small: 0.82, middling: 1, large: 1.16 }[look.size] : 1);

    // Where an orbit point lands on screen, and whether the planet hides it.
    function orbit(o, t, R, C, tilt) {
      const ang = o.ph + t * o.sp;
      let x = Math.cos(ang) * o.a, y = 0, z = Math.sin(ang) * o.a;
      const ci = Math.cos(o.inc), si = Math.sin(o.inc); [y, z] = [y * ci - z * si, y * si + z * ci];
      const cn = Math.cos(o.node), sn = Math.sin(o.node); [x, y] = [x * cn - y * sn, x * sn + y * cn];
      const ct = Math.cos(tilt), st = Math.sin(tilt); [y, z] = [y * ct - z * st, y * st + z * ct];
      return { x: C[0] + x * R, y: C[1] - y * R, z, hidden: z < 0 && x * x + y * y < 1 };
    }

    function frame(now) {
      if (!open) return;
      raf = requestAnimationFrame(frame);
      const s = state(); const c = s && s.civs[civId];
      if (!c) return;
      const t = now / 1000, dev = sim.develop(c), R = radius(), C = centre();
      const W = glc.width, H = glc.height;
      spin += (drag ? 0 : look.spin * 0.016);
      // The planet.
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uRes, W, H); gl.uniform2f(U.uCentre, C[0] * dpr, H - C[1] * dpr); gl.uniform1f(U.uScale, R * dpr);
      gl.uniform1f(U.uT, t); gl.uniform1f(U.uRot, spin); gl.uniform1f(U.uTilt, look.tilt + tilt);
      gl.uniform1f(U.uDetail, clamp(Math.log2(R * dpr / 30) + 3.5, 5, 9));   // finer detail the closer you come
      gl.uniform1f(U.uDev, c.alive ? dev : 0); gl.uniform1f(U.uIce, look.ice); gl.uniform1f(U.uLandAmt, look.landAmt); gl.uniform1f(U.uTerrain, look.terrain);
      gl.uniform1f(U.uCloud, look.cloud); gl.uniform1f(U.uScar, (c.scars || 0) * 0.35); gl.uniform1f(U.uGolden, c.golden ? 1 : 0); gl.uniform1f(U.uDead, c.alive ? 0 : 1);
      gl.uniform1f(U.uKey, look.key);
      const feel = c.aware ? sim.viewOf(c) : 'Unaware';
      const mood = { Reverent: [0.7, 0.52, 0.12], Grateful: [0.38, 0.32, 0.08], Wary: [0.18, 0.26, 0.6], Fearful: [0.5, 0.06, 0.04] }[feel] || [0, 0, 0];
      const warmth = { Reverent: 1.35, Grateful: 1.15, Wary: 0.7, Fearful: 0.55 }[feel] || 1;
      gl.uniform3fv(U.uSun, look.sun); gl.uniform3fv(U.uMood, mood); gl.uniform1f(U.uShelter, s.regions[c.home].shelter > 0 ? 1 : 0);
      gl.uniform3fv(U.uSea, look.sea); gl.uniform3fv(U.uLand, look.land); gl.uniform3fv(U.uLights, look.lights.map((v) => v * warmth)); gl.uniform3fv(U.uGlow, look.glow);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // What circles it: behind the planet first, in front after.
      const bx = back.getContext('2d'), fx = front.getContext('2d');
      [bx, fx].forEach((x) => { x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, innerWidth, innerHeight); });
      const lc = `rgb(${look.lights.map((v) => Math.round(v * 255)).join(',')})`;
      // Colony worlds: one small world for every region beyond home, far out.
      const colonies = c.alive ? Math.min(look.moons.length, c.regions.length - 1) : 0, labels = [];
      for (let i = 0; i < colonies; i++) {
        const m = look.moons[i], p = orbit({ a: m.a, inc: 0.18, node: 0.3, ph: m.ph, sp: m.sp }, t, R, C, look.tilt * 0.5);
        const x = p.z < 0 ? bx : fx, rr = Math.max(3, R * m.size);
        const g = x.createRadialGradient(p.x - rr * 0.4, p.y - rr * 0.4, rr * 0.1, p.x, p.y, rr);
        g.addColorStop(0, `rgb(${m.hue.map((v) => Math.round(v * 255 + 30)).join(',')})`); g.addColorStop(1, 'rgba(10,10,14,1)');
        x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, rr, 0, TAU); x.fill();
        x.fillStyle = lc; x.globalAlpha = 0.8; x.beginPath(); x.arc(p.x + rr * 0.3, p.y + rr * 0.2, Math.max(1, rr * 0.18), 0, TAU); x.fill(); x.globalAlpha = 1;
        labels.push({ name: sim.regionName(s.regions[c.regions[i + 1]]), x: clamp(p.x, 50, innerWidth - 50), y: Math.min(p.y + rr + 13, innerHeight - 50) });
      }
      // Their names, nudged apart so none sits on another (drawn in front, after every moon).
      fx.font = '11px system-ui, sans-serif'; fx.textAlign = 'center'; fx.fillStyle = 'rgba(255,255,255,0.55)';
      labels.sort((a, b) => a.y - b.y).forEach((l, i) => {
        l.w = fx.measureText(l.name).width + 8;
        for (let k = 0; k < i; k++) { const o = labels[k]; if (Math.abs(o.x - l.x) < (o.w + l.w) / 2 && Math.abs(o.y - l.y) < 13) l.y = o.y + 13; }
        fx.fillText(l.name, l.x, l.y);
      });
      // An orbital ring, from the stars on: drawn as two halves around the planet.
      const ring = c.alive ? smooth(3.0, 3.45, dev) : 0;
      if (ring > 0) {
        for (const half of [0, 1]) {
          const x = half ? fx : bx;
          x.save(); x.translate(C[0], C[1]); x.rotate(look.ringTilt);
          x.beginPath(); x.ellipse(0, 0, R * 1.32, R * 0.3, 0, half ? 0 : Math.PI, half ? Math.PI : TAU);
          x.strokeStyle = `rgba(200,205,215,${0.35 * ring})`; x.lineWidth = Math.max(1.5, R * 0.025); x.stroke();
          // Lit stations along it.
          for (let k = 0; k < 36; k++) {
            const a = (k / 36) * TAU + t * 0.05; const sy = Math.sin(a);
            if ((sy > 0) !== !!half) continue;
            x.fillStyle = lc; x.globalAlpha = ring * (0.5 + 0.5 * Math.sin(t * 2 + k)); x.beginPath(); x.arc(Math.cos(a) * R * 1.32, sy * R * 0.3, Math.max(1, R * 0.008), 0, TAU); x.fill();
          }
          x.restore(); x.globalAlpha = 1;
        }
      }
      // Satellites, from spaceflight: more as they grow.
      const nsat = c.alive && dev >= 2 ? Math.min(look.sats.length, Math.round(3 + (dev - 2) * 18)) : 0;
      for (let i = 0; i < nsat; i++) {
        const p = orbit(look.sats[i], t * 0.6, R, C, look.tilt + tilt);
        if (p.hidden) continue;
        const x = p.z < 0 ? bx : fx, glint = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
        x.fillStyle = `rgba(235,240,255,${0.55 + 0.45 * glint})`; x.fillRect(p.x - 1, p.y - 1, 2.2, 2.2);
      }
      // Launches: now and then a rocket climbs out, more often as spaceflight takes hold.
      if (c.alive && dev >= 1.85 && dev < 4.2 && Math.random() < 0.012 * clamp(dev - 1.6, 0, 1.6)) {
        const a = Math.random() * TAU; launches.push({ a, born: t, side: Math.random() < 0.5 ? -1 : 1 });
      }
      for (let i = launches.length - 1; i >= 0; i--) {
        const L = launches[i], k = (t - L.born) / 2.6;
        if (k > 1) { launches.splice(i, 1); continue; }
        const sx = C[0] + Math.cos(L.a) * R * 0.98, sy = C[1] + Math.sin(L.a) * R * 0.98;
        const out = 1 + k * 0.5, ex = C[0] + Math.cos(L.a + L.side * k * 0.6) * R * out, ey = C[1] + Math.sin(L.a + L.side * k * 0.6) * R * out;
        fx.strokeStyle = `rgba(255,220,170,${0.7 * (1 - k)})`; fx.lineWidth = 1.4; fx.beginPath(); fx.moveTo(sx, sy); fx.quadraticCurveTo((sx + ex) / 2 + Math.cos(L.a) * R * 0.15, (sy + ey) / 2 + Math.sin(L.a) * R * 0.15, ex, ey); fx.stroke();
        fx.fillStyle = `rgba(255,240,210,${1 - k})`; fx.beginPath(); fx.arc(ex, ey, 2, 0, TAU); fx.fill();
      }
      // A beacon: light from the poles, out into the galaxy.
      if (c.beacon && c.alive) {
        for (const d of [-1, 1]) {
          const g = bx.createLinearGradient(C[0], C[1], C[0], C[1] + d * R * 4);
          g.addColorStop(0, hexA(c.colour, 0.75)); g.addColorStop(1, 'rgba(0,0,0,0)');
          bx.save(); bx.globalCompositeOperation = 'lighter';
          for (const [wk, al] of [[0.22, 0.25], [0.07, 1]]) { bx.globalAlpha = al; bx.fillStyle = g; const w = R * wk * (0.85 + 0.15 * Math.sin(t * 2)); bx.fillRect(C[0] - w / 2, d < 0 ? C[1] - R * 4 : C[1], w, R * 4); }
          bx.restore();
        }
      }
      if (now - shown > 400) { shown = now; renderPanel(s, c, dev); }
    }

    function renderPanel(s, c, dev) {
      const step = c.alive ? Math.min(4, Math.floor(dev + 0.001)) : -1;
      const toNext = c.alive && step < 4 ? clamp(dev - step, 0, 1) : 1;
      const view = sim.viewOf(c);
      const story = s.log.filter((e) => e.civ === c.id || e.other === c.id).slice(-6).reverse();
      const what = !c.alive ? 'They are gone. Their world is quiet.' : ((look.key | 0) % 2 ? VOICE2 : VOICE)[c.kind] ? ((look.key | 0) % 2 ? VOICE2 : VOICE)[c.kind][step] : VOICE.Insular[step] + ' ' + NEXT[step];
      const key = [c.id, step, Math.round(toNext * 20), view, s.regions[c.home].shelter > 0, c.regions.length, story.length && story[0].text, c.golden, c.beacon, c.scars, c.alive].join('|');
      if (key === panelKey) return;
      panelKey = key;
      const esc = (x) => String(x).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
      const mo = (d) => Math.floor(d / sim.MONTH) + 1;
      panel.innerHTML = `<div class="wv-head"><i style="background:${c.colour}"></i><div><b>The ${esc(c.name)}</b><small>${esc(c.kind)} · ${esc(sim.regionName(s.regions[c.home]))} · ${c.regions.length} ${c.regions.length === 1 ? 'region' : 'regions'}${c.aware ? ' · ' + view.toLowerCase() : ''}</small></div></div>
        <div class="wv-steps">${STEPS.map((x, i) => `<span class="${i < step ? 'done' : i === step ? 'now' : ''}">${i === step ? `<em style="width:${Math.round(toNext * 100)}%"></em>` : ''}<b>${x}</b></span>`).join('')}</div>
        <p class="wv-about">${esc(about(look))}</p>
        <p>${what}${({ Unaware: ' They cannot see you yet.', Reverent: ' Their sky glows gold: they revere you.', Grateful: ' A warm glow in their sky: they are grateful to you.', Curious: ' Their sky is clear: they have not made up their minds about you.', Wary: ' A cold blue sky, and dimmer lights: they are wary of you.', Fearful: ' Their sky glows red, and their lights are dim: they fear you.' })[c.aware ? sim.viewOf(c) : 'Unaware']}${s.regions[c.home].shelter > 0 ? ' Your shelter shimmers around them.' : ''}${c.golden ? ' A golden age: auroras at both poles.' : ''}${c.scars ? ` ${c.scars === 1 ? 'One strike has' : c.scars + ' strikes have'} burnt their land.` : ''}${c.beacon ? ' Their beacon shines from the poles.' : ''}</p>
        <div class="wv-story">${story.map((e) => `<div><em>Mo ${mo(e.day)}</em><span>${esc(e.text)}</span></div>`).join('')}</div>`;
    }

    // Grab it and turn it: the surface follows the finger, sideways and up and down. Come closer with
    // the wheel or a pinch, toward the point under the pointer.
    glc.style.touchAction = 'none';
    function zoomAt(z, x, y) {
      const nz = clamp(z, 0.6, 8), C = centre(), k = nz / zoom;
      zoom = nz;
      if (zoom <= 1.02) off = [0, 0];
      else { const H = home(); off = [x - (x - C[0]) * k - H[0], y - (y - C[1]) * k - H[1]]; }
    }
    front.addEventListener('pointerdown', (e) => {
      touches.set(e.pointerId, [e.clientX, e.clientY]); front.setPointerCapture(e.pointerId);
      if (touches.size === 2) { const [a, b] = [...touches.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), zoom }; drag = null; return; }
      drag = { x: e.clientX, y: e.clientY, spin, tilt };
    });
    front.addEventListener('pointermove', (e) => {
      if (touches.has(e.pointerId)) touches.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinch && touches.size === 2) { const [a, b] = [...touches.values()]; zoomAt(pinch.zoom * Math.hypot(a[0] - b[0], a[1] - b[1]) / Math.max(1, pinch.d), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); return; }
      if (!drag) return;
      const R = radius();
      spin = drag.spin - (e.clientX - drag.x) / R;                       // a drag of one radius turns it about a radian
      tilt = clamp(drag.tilt - (e.clientY - drag.y) / R, -1.2 - look.tilt, 1.2 - look.tilt);
    });
    const lift = (e) => { touches.delete(e.pointerId); if (touches.size < 2) pinch = null; drag = null; };
    front.addEventListener('pointerup', lift); front.addEventListener('pointercancel', lift);
    front.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(zoom * Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY); }, { passive: false });
    front.style.touchAction = 'none';
    host.querySelector('.wv-close').addEventListener('click', () => close());
    addEventListener('keydown', (e) => { if (open && e.key === 'Escape') close(); });

    function openIt(id) {
      const s = state(); const c = s && s.civs[id];
      if (!c) return;
      const already = open;
      civId = id; look = looks(s.seed, c); panelKey = ''; zoom = 1; off = [0, 0]; spin = 0; tilt = 0; launches.length = 0; touches.clear(); pinch = null;
      host.hidden = false; open = true; size();
      requestAnimationFrame(() => host.classList.add('on'));
      cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
      if (!already && opts.onOpen) opts.onOpen(id);
    }
    function close() {
      if (!open) return;
      open = false; host.classList.remove('on'); cancelAnimationFrame(raf);
      setTimeout(() => { if (!open) host.hidden = true; }, 400);
      if (opts.onClose) opts.onClose();
    }
    return { open: openIt, close, isOpen: () => open, civ: () => civId };
  }

  const World = { create, looks };
  if (typeof module !== 'undefined') module.exports = World; else root.World = World;
})(this);
