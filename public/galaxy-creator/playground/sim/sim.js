/* Galaxy sim: the rules in .notes/plans/sim-rules.md as code. Pure and deterministic (seeded), no
   rendering, so it runs in the browser (window.Sim) and in Node (require), where
   tools/sim-check.js plays whole years to check the balance.

   create(seed) → state; step(state) advances one day; act(state, action, region) spends
   influence. Everything a page needs to draw is in the state. */
(function (root) {
  'use strict';
  const YEAR = 365, MONTH = YEAR / 12;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const rng = (seed) => { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

  // Tunables, in one place so the balance can be read and changed.
  const K = {
    infall: 0.009, infallThin: 0.6, infallOuter: 0.55, infallMid: 0.3,
    sfArm: 0.03, sfGap: 0.011, sfCore: 0.035, sfPow: 1.35, youngShare: 0.25,
    death: 0.085, returnGas: 0.45, metalYield: 0.42, snHit: 0.11,
    recover: 0.018, shelterRecover: 3, shelterSn: 0.5, shelterDays: 30, nurtureGain: 0.35, nurtureMax: 3,
    bhGrow: 0.0015, flareChance: 0.007, flareHit: 0.55, calmDays: 20,
    habMetal: [0.12, 0.42], habStab: [0.6, 0.85], habSun: [0.15, 0.9],
    lifeOn: 0.34, lifeRate: 0.011, lifeDecay: 0.006, nurtureBoost: 3.5,
    dilution: 0.6, burstHit: 0.25, burstSterile: 0.6, metalDrift: 0.02,
    worlds: [0.3, 0.38, 0.22, 0.1], worldRate: 0.42,             // chance of 0..3 worlds; life speed per world
    influenceMax: 10, income: [0.2, 0.3], trustDecay: 0,          // influence a day, first day to last
    sparkRate: 1.1, sparkDays: 12, sparkGain: 2,                 // stardust: tap it before it fades
    novaRate: 0.06, novaWarn: 12, novaHit: 0.6, novaSplash: 0.2, shieldK: 0.35, colonyHold: 0.45, homeHit: 25,
    flareWarn: 10, grbFrom: 5.5, grbChance: 0.012, grbWarn: 15, collideAt: 7, collideWarn: 45,
    askEvery: 60, refuseHit: 0.5, viewCap: 3.5, schismAt: 300, schismHit: 3, forgive: 1, apartNurture: 1.4, upliftGain: 12, upliftTrust: 0.4, upliftEvery: 30, testAt: 330, seedWorld: true, seedPace: 0.4, rivalHit: 0.75, bankMax: 3, bankFlow: 0.25, blame: 2, graceDays: 8, thinDays: 15, kindTrust: 0, kindEvery: 18, foresight: 1, foreDays: 25, askDays: 25, coachSteps: 2, stormAt: 11.25, midStormAt: 8.4, midStormSize: 3, challengeDays: [36, 68, 100, 132, 196, 256], challengeFor: 30, challengeWorth: 6, challengeGift: 0, stormSize: 5, stormWarn: 9, beaconFrom: 8, beaconDays: 30, concordTalk: 6, concordAt: 11.97, concordMin: 4, concordView: 1, concordShare: 2 / 3,
    cost: { seed: 2, starburst: 3, shelter: 2, calm: 3, feed: 3, merge: 6, collect: 0, refuse: 0, choose: 0, uplift: 4 },
  };

  const NAMES = ['Veyari', 'Oru', 'Thessaly', 'Kesh', 'Amaranth', 'Ilun', 'Coraxi', 'Seln', 'Tavu', 'Mireth', 'Halcyne', 'Quorr', 'Ebonai', 'Lysa', 'Nuvial', 'Saro', 'Pellan', 'Ostra', 'Vael', 'Isk', 'Marrow', 'Teskari', 'Udun', 'Wren', 'Calyx', 'Dravi', 'Ophen', 'Yselt', 'Corun', 'Ammet', 'Fennic', 'Zheb'];
  const KINDS = ['Expansive', 'Contemplative', 'Mercantile', 'Insular'];
  const COLOURS = ['#ffb35c', '#62e0d6', '#ff7aa8', '#b49cff', '#9be36b', '#ffd36b', '#6fb1ff', '#ff8a5c'];
  const EXPAND = { Expansive: 10, Mercantile: 18, Contemplative: 32, Insular: 75 };   // days between settlements
  const STAGES = ['Cities', 'Radio', 'Spaceflight', 'Interstellar'];
  const STAGE_AT = [0, 14, 38, 70];                                                    // days of good conditions to reach each

  // ---- the galaxy's layout: the core, and three rings of eight sectors -------------------------
  // Each region's place in the disk (for drawing): a ring radius and an angle; arms run through
  // sectors 0, 2, 4, 6 (with a twist, ring by ring).
  function layout() {
    const R = [{ id: 0, ring: 0, sector: 0, r: 0, a: 0, arm: true, n: [] }];
    const radii = [0.22, 0.48, 0.78];
    for (let ring = 1; ring <= 3; ring++) for (let s = 0; s < 8; s++) {
      R.push({ id: R.length, ring, sector: s, r: radii[ring - 1], a: (s / 8) * Math.PI * 2 + ring * 0.55, arm: (s + ring) % 2 === 0, n: [] });
    }
    const idOf = (ring, s) => (ring === 0 ? 0 : 1 + (ring - 1) * 8 + ((s % 8) + 8) % 8);
    R.forEach((g) => {
      if (g.ring === 0) { for (let s = 0; s < 8; s++) g.n.push(idOf(1, s)); return; }
      g.n.push(idOf(g.ring, g.sector - 1), idOf(g.ring, g.sector + 1));
      g.n.push(g.ring === 1 ? 0 : idOf(g.ring - 1, g.sector));
      if (g.ring < 3) g.n.push(idOf(g.ring + 1, g.sector));
    });
    return R;
  }

  const shuffle = (a, r) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const pickWorlds = (x) => { let acc = 0; for (let i = 0; i < K.worlds.length; i++) { acc += K.worlds[i]; if (x < acc) return i; } return K.worlds.length - 1; };
  function create(seed) {
    const r = rng(seed || 1);
    const regions = layout().map((g) => Object.assign(g, {
      gas: [1.1, 0.8, 0.55, 0.35][g.ring] * (0.85 + r() * 0.3),
      young: 0, sunlike: 0, metals: 0, stability: 1, life: 0, nurture: 0, shelter: 0, civ: null, hab: 0,
      worlds: g.ring === 0 ? 0 : pickWorlds(r()),                  // planets that could hold life: shown to the player
    }));
    const places = PLACES.map((ring) => shuffle(ring, r));           // every galaxy has its own map of names
    regions.forEach((g) => { g.name = g.ring ? places[g.ring - 1][g.sector] : 'the core'; });
    const trait = TRAITS[Math.floor(r() * TRAITS.length)];
    if (trait.mod.worlds) regions.forEach((g) => { if (g.ring) g.worlds = Math.max(g.worlds, pickWorlds(r())); });
    // The omens come in their own order, on their own days.
    const omenKinds = shuffle(['twin', 'cloud', 'cluster', 'comet', 'wanderer'], r);
    omenKinds.push(omenKinds[Math.floor(r() * 4)]);
    const omenDays = OMEN_DAYS.map((d) => d + Math.floor(r() * 19) - 9);
    return {
      trait, omenKinds, omenDays, bank: 0,
      seed: seed || 1, day: 0, rand: r, regions,
      halo: 26 * (trait.mod.halo || 1), bh: { mass: 0.05, calm: 0, flares: 0 },
      companion: { dist: 1, merged: false },
      influence: 6, civs: [], log: [], milestones: {}, actions: [], namesUsed: 0,
      sparks: [], threats: [], nextId: 1,
      names: shuffle(NAMES, r),                                    // every galaxy meets different people first
    };
  }

  // ---- reading the state -----------------------------------------------------------------------
  // Influence a day: scarce while the galaxy is young, richer as there is more to look after.
  const income = (s) => K.income[0] + (K.income[1] - K.income[0]) * Math.min(1, s.day / YEAR);
  const month = (s) => s.day / MONTH;
  // Cosmic time in Gyr: fast through the forge, slow once civilisations exist.
  const CLOCK = [[0, 0], [1, 2.5], [2, 5.5], [3, 7.5], [4, 9], [9, 12.5], [12, 13.8]];
  function gyr(s) {
    const m = month(s);
    for (let i = 1; i < CLOCK.length; i++) if (m <= CLOCK[i][0]) { const [m0, g0] = CLOCK[i - 1], [m1, g1] = CLOCK[i]; return g0 + (g1 - g0) * (m - m0) / (m1 - m0); }
    return 13.8;
  }
  const ERAS = [[1, 'First light'], [2, 'The forge'], [3, 'Calm'], [4, 'First life'], [9, 'Civilisations'], [12.01, 'Contact and legacy']];
  const era = (s) => ERAS.find(([m]) => month(s) < m)[1];
  function habit(g) {
    if (g.ring === 0) return 0;                                    // the core is too violent for life
    return sm(K.habMetal[0], K.habMetal[1], g.metals) * sm(K.habStab[0], K.habStab[1], g.stability) * sm(K.habSun[0], K.habSun[1], g.sunlike);
  }

  // Fresh gas from the halo is pristine: it thins out a region's heavy elements.
  const dilute = (g, add) => { g.metals *= 1 - K.dilution * add / (g.gas + g.sunlike * 0.5 + add); };

  function note(s, text, o) { s.log.push(Object.assign({ day: s.day, text }, o || {})); }
  // A milestone either tags the entry that just told the story (onLast) or gets its own line.
  function milestone(s, key, text, onLast) {
    if (s.milestones[key] !== undefined) return;
    s.milestones[key] = s.day;
    if (onLast) Object.assign(s.log[s.log.length - 1], { milestone: key, headline: text }); else note(s, text, { milestone: key });
  }

  // ---- challenges: months 2 to 5 -------------------------------------------------------------
  // The galaxy sets one aim at a time, with a deadline: the player picks the way there. Met, it is
  // worth legacy and a little influence; missed, it just passes.
  const CHALLENGES = {
    life: { measure: (s) => s.regions.filter((g) => g.life > 0.05 || g.civ !== null).length, step: 4, text: (n) => `Life in ${n} regions`, how: 'shelter regions that are habitable, and seed gassy ones' },
    nursery: { measure: (s) => s.regions.filter((g) => g.ring && g.nurture >= K.apartNurture).length, step: 1, text: () => 'Nurse a region: shelter one place four times', how: 'shelter the same region again and again; its nurture shows on its card' },
    peoples: { measure: (s) => s.civs.filter((c) => c.alive).length, step: 1, text: (n) => `${n} civilisations alive at once`, ok: (s) => s.regions.some((g) => g.civ === null && g.life > 0.2), how: 'shelter the region where life is growing' },
    stage: { measure: (s) => s.civs.reduce((a, c) => a + (c.alive ? c.tech : 0), 0), step: 1, text: () => 'A people reaches its next stage', ok: (s) => s.civs.some((c) => c.alive && c.tech < 3), how: 'uplift a people, and keep their worlds safe' },
    stardust: { measure: (s) => s.actions.filter((a) => a.kind === 'collect').length, step: 5, text: (n, c) => `Gather ${c.step} stardust`, how: 'tap the golden ✦ on the map' },
  };
  function challenges(s) {
    const ch = s.challenge;
    if (ch && !ch.done) {
      const C = CHALLENGES[ch.id], now = C.measure(s);
      ch.now = now;
      if (now >= ch.target) {
        ch.done = true; ch.doneAt = s.day; s.feats = (s.feats || 0) + 1;
        s.influence = Math.min(K.influenceMax, s.influence + K.challengeGift);
        note(s, `Challenge met: ${ch.text}. +${K.challengeWorth} legacy`, { challenge: true, met: true });
      } else if (ch.until - s.day === 7) note(s, `7 days left for the challenge: ${ch.text} (${Math.max(0, now - ch.base)} of ${ch.step})`, { challenge: true });
      else if (s.day >= ch.until) { ch.done = true; ch.doneAt = s.day; ch.missed = true; note(s, `Challenge missed: ${ch.text} (${Math.max(0, ch.now - ch.base)} of ${ch.step})`, { challenge: true }); }
    }
    const i = K.challengeDays.indexOf(s.day);
    if (i < 0) return;
    const used = s.challengesSeen || (s.challengesSeen = []);
    const fits = (id) => !CHALLENGES[id].ok || CHALLENGES[id].ok(s);
    let pool = Object.keys(CHALLENGES).filter((id) => !used.includes(id) && fits(id));
    if (!pool.length) pool = Object.keys(CHALLENGES).filter((id) => id !== used[used.length - 1] && fits(id));   // all seen: any but the last
    if (!pool.length) return;
    const id = pool[(s.seed * 7 + i * 13) % pool.length], C = CHALLENGES[id], base = C.measure(s);   // not from s.rand: the rest of the galaxy stays as it was
    used.push(id);
    const c = { id, base, now: base, target: base + C.step, until: s.day + K.challengeFor, step: C.step };
    c.text = C.text(c.target, c); c.how = C.how;
    s.challenge = c;
    note(s, `A challenge: ${c.text}, within ${days(K.challengeFor)}`, { challenge: true, ask: true });
  }

  // ---- one day -----------------------------------------------------------------------------
  function step(s) {
    const R = s.regions, t = s.day / YEAR, r = s.rand;
    // A seed world: one young people already lives at the start, so the opening has something to lose.
    if (s.day === 0 && !s.seeded && K.seedWorld) {
      s.seeded = true;
      const g = R.filter((x) => x.ring === 2 && x.worlds > 0).sort((a, b) => b.worlds - a.worlds)[0];
      Object.assign(g, { metals: 0.55, sunlike: 1.1, stability: 1, gas: Math.max(g.gas, 0.6), nurture: 1 });
      g.hab = habit(g);
      const c = birth(s, g); c.progress = 6; c.seedWorld = true; c.pace = K.seedPace;   // their first cities, and a slower pace
      note(s, `A seed world: the ${c.name} already live in ${regionName(g)}. Keep them safe while the galaxy grows around them`, { civ: c.id, seed: true });
    }
    // Influence past the cap goes to the bank (up to 6), and flows back as you spend.
    const inc = income(s), room = K.influenceMax - s.influence;
    if (inc > room) { s.bank = Math.min(K.bankMax, (s.bank || 0) + inc - Math.max(0, room)); s.influence = K.influenceMax; }
    else { const flow = Math.min(s.bank || 0, K.bankFlow, room - inc); s.influence += inc + flow; s.bank = (s.bank || 0) - flow; }

    // 1. Infall from the halo, mostly onto the outer ring, thinning through the year.
    const fall = Math.min(s.halo, s.halo * K.infall * (1 - K.infallThin * t));
    s.halo -= fall;
    R.forEach((g) => {
      if (!g.ring) return;
      const add = fall * (g.ring === 3 ? K.infallOuter : g.ring === 2 ? K.infallMid : 1 - K.infallOuter - K.infallMid) / 8;
      dilute(g, add); g.gas += add;
    });

    R.forEach((g) => {
      // 2. Star formation: faster on the arms and in the core.
      const eff = g.ring === 0 ? K.sfCore : g.arm ? K.sfArm : K.sfGap;
      const formed = Math.min(g.gas * 0.5, eff * Math.pow(g.gas, K.sfPow));
      g.gas -= formed;
      g.young += formed * K.youngShare;
      g.sunlike += formed * (1 - K.youngShare);
      // 3. Young stars die: gas back, metals up, stability down.
      const dying = g.young * K.death;
      g.young -= dying;
      g.gas += dying * K.returnGas;
      g.metals = Math.min(1, g.metals + dying * K.metalYield / (0.15 + g.sunlike * 0.35));
      g.stability -= dying * K.snHit * (g.shelter > 0 ? K.shelterSn : 1) * 6;
      if (r() < Math.min(0.25, dying * K.sparkRate * mod(s, 'spark'))) spark(s, g.id);
      // 4. Recovery toward calm, faster under shelter.
      g.stability += (1 - g.stability) * K.recover * (g.shelter > 0 ? K.shelterRecover : 1);
      g.stability = clamp(g.stability, 0, 1);
    });

    // Metals drift: supernova ejecta mix into neighbouring regions.
    const drift = R.map((g) => g.n.reduce((a, n) => a + R[n].metals, 0) / g.n.length);
    R.forEach((g, i) => { if (drift[i] > g.metals) g.metals += (drift[i] - g.metals) * K.metalDrift; });
    // 5. The black hole: grows on the core's gas; flares now and then unless calmed.
    const core = R[0];
    const bite = core.gas * K.bhGrow * 4;
    core.gas -= bite; s.bh.mass += bite;

    // The companion drifts closer through the year.
    if (!s.companion.merged) s.companion.dist = Math.max(0.15, 1 - t * 0.9);

    // Stardust fades; threats are announced ahead of time, then strike.
    const had = s.sparks.length;
    s.sparks = s.sparks.filter((x) => x.until > s.day);
    s.sparksLost = (s.sparksLost || 0) + had - s.sparks.length;
    threats(s);

    // 6. Life, where it is habitable long enough; and the civilisations.
    R.forEach((g) => {
      g.hab = habit(g);
      if (g.civ !== null) return;
      if (g.hab > K.lifeOn) g.life += K.lifeRate * g.hab * g.worlds * K.worldRate * (1 + K.nurtureBoost * g.nurture);
      else g.life = Math.max(0, g.life - K.lifeDecay);
      g.lifeMax = Math.max(g.lifeMax || 0, g.life);
      if (g.lifeMax > 0.3 && g.life < 0.05) { g.lifeMax = 0; note(s, `The life growing in ${regionName(g)} died out`, { region: g.id, lost: true }); }
      if (g.hab > K.lifeOn) milestone(s, 'habitable', 'The first habitable region');
      if (g.life > 0.3) milestone(s, 'life', 'Life, in ' + regionName(g));
      // Life you nursed always becomes someone: its own people, or, next to an existing home,
      // part of that people, who thank you for it.
      if (g.life >= 1) {
        const f = fate(s, g);
        if (f.kind === 'join' || f.kind === 'settle') welcome(s, s.civs[f.civ], g); else birth(s, g);   // invited settlers take it as theirs   // refused settlers don't get it later
      }
    });
    s.civs.forEach((c) => liveCiv(s, c));

    if (R.some((g) => g.metals > 0.1)) milestone(s, 'metals', 'The first heavy elements');
    if (s.civs.filter((c) => c.alive).length >= 5) milestone(s, 'five', 'Five civilisations at once');
    concord(s);
    omen(s);
    challenges(s);
    // A schism: two peoples of the concord's circle quarrel, and each demands you take their side.
    if (s.day === K.schismAt && s.concord === undefined) {
      const c0 = circle(s), free = (x) => x.aware && x.alive && !(x.ask && (x.ask.kind === 'beacon' || x.ask.dispute !== undefined));
      const pool = c0.members.filter(free);
      let pair = null;
      pool.forEach((x) => { const o = x.rival !== undefined ? s.civs[x.rival] : null; if (!pair && o && pool.includes(o)) pair = [x, o]; });
      if (!pair && pool.length >= 2) { const top = pool.slice().sort((a, b) => b.view - a.view); pair = [top[0], top[1]]; }
      if (pair) {
        const [a, b] = pair, R = s.regions;
        const near = R.filter((g) => g.ring && g.civ === null && g.worlds > 0 && g.n.some((n) => R[n].civ === a.id || R[n].civ === b.id));
        // Over a free region if there is one; if not, over a border region one of them holds: siding means sheltering it.
        const border = R.find((x) => (x.civ === a.id && x.n.some((n) => R[n].civ === b.id)) || (x.civ === b.id && x.n.some((n) => R[n].civ === a.id))) || R[a.home];
        const g = near[0] || R.filter((x) => x.ring && x.civ === null).sort((x, y) => y.worlds - x.worlds)[0] || border;
        const how = g.civ === null ? 'seed' : 'shelter';
        if (g) {
          const until = s.day + 20;
          [a, b].forEach((x) => { if (x.ask) note(s, `The ${x.name} set aside their request: there are bigger things now`, { civ: x.id }); });
          a.ask = { kind: how, region: g.id, until, dispute: b.id, schism: true, text: `A schism: the ${a.name} demand you side with them over ${regionName(g)}` };
          b.ask = { kind: how, region: g.id, until, dispute: a.id, schism: true, text: `A schism: the ${b.name} demand you side with them over ${regionName(g)}` };
          note(s, `A schism: the ${a.name} and the ${b.name} have quarrelled over ${regionName(g)}, and each demands you take their side. The one you pass over will not forget it`, { civ: a.id, other: b.id, ask: true, dispute: true, schism: true });
        }
      }
    }
    if (s.day === K.testAt && s.concord === undefined) {
      const c0 = circle(s), shaky = c0.members.filter((c) => c.aware && c.view >= 1 && c.view < 2.5 && !c.ask);
      if (shaky.length) {
        note(s, `The concord is near, and not every people is sure of you: ${shaky.map((c) => 'the ' + c.name).join(', ').replace(/, ([^,]*)$/, ' and $1')} want one more sign of your care. Ignoring them now costs twice as much`, { test: true });
        shaky.forEach((c) => { c.nextAsk = s.day; ask(s, c); if (c.ask) c.ask.test = true; });
      }
    }
    if (R.filter((g) => g.civ !== null).length >= 10) milestone(s, 'ten', 'Ten regions inhabited');
    // Shelters and calm wear off at the end of the day, after the day's strikes: N days covers a strike N days out.
    R.forEach((g) => { if (g.shelter > 0) g.shelter--; });
    if (s.bh.calm > 0) s.bh.calm--;
    s.day++;
    return s;
  }

  // ---- stardust and threats -----------------------------------------------------------
  function spark(s, region, delay) { s.sparks.push({ id: s.nextId++, region, from: s.day + (delay || 0), until: s.day + (delay || 0) + K.sparkDays }); }
  const shielded = (g) => g.shelter > 0;
  const THREAT_TEXT = {
    nova: (g) => `A giant star in ${regionName(g)} will explode`,
    flare: () => 'The black hole is stirring: a flare is coming',
    grb: (g) => `A gamma-ray burst is aimed at ${regionName(g)}`,
    collide: () => 'The companion galaxy is falling in on its own',
  };
  function warn(s, kind, region, days) {
    if (s.day + Math.round(days) >= YEAR) return null;               // nothing that can't land before the year ends
    const x = { id: s.nextId++, kind, region, at: s.day + Math.round(days), from: s.day };
    s.threats.push(x);
    note(s, THREAT_TEXT[kind](region === null ? null : s.regions[region]) + ` (lands month ${Math.floor((s.day + Math.round(days)) / MONTH) + 1}, day ${Math.floor((s.day + Math.round(days)) % MONTH) + 1})`, { threat: kind, region });
    return x;
  }
  function threats(s) {
    const R = s.regions, r = s.rand, m = month(s), t = s.day / YEAR;
    if (s.day === Math.round(K.stormAt * MONTH) - 30 && s.civs.filter((c) => c.alive).length >= 2) note(s, `The astronomers of the galaxy see it coming: in about a month, a storm of supernovae will strike several homes at once. Each needs a shelter (2 influence): save about ${2 * Math.min(K.stormSize, s.civs.filter((c) => c.alive).length)}`, { stormTalk: true });
    if (s.day === Math.round(K.stormAt * MONTH)) {
      const homes = s.civs.filter((c) => c.alive).map((c) => R[c.home]).filter((g) => !s.threats.some((x) => x.region === g.id)).slice(0, K.stormSize);
      if (homes.length >= 2) {
        note(s, `A storm of supernovae is coming: ${homes.length} homes are in its path`, { storm: true });
        homes.forEach((g, i) => warn(s, 'nova', g.id, K.stormWarn + i * 3));
      }
    }
    // A smaller storm mid-year: supernovae at colonies, forecast three weeks ahead.
    const mid = Math.round(K.midStormAt * MONTH), alive = s.civs.filter((c) => c.alive);
    if (s.day === mid - 20 && alive.length >= 2) note(s, `The astronomers see dying stars that will burst in about three weeks: up to ${K.midStormSize} of the peoples' colonies are in their path. Each needs a shelter (2 influence)`, { stormTalk: true });
    if (s.day === mid) {
      const free = (g) => !s.threats.some((x) => x.region === g.id);
      const cols = alive.flatMap((c) => c.regions.filter((id) => id !== c.home).map((id) => R[id])).filter(free);
      const pick = cols.sort((a, b) => a.id - b.id).slice(0, K.midStormSize);   // colonies only: a home struck falls back a stage
      if (pick.length >= 2) {
        note(s, `Dying stars are about to burst: ${pick.length} colonies are in their path`, { storm: true });
        pick.forEach((g, i) => warn(s, 'nova', g.id, 12 + i * 3));
      }
    }
    const pending = (k, id) => s.threats.some((x) => x.kind === k && (id === undefined || x.region === id));
    R.forEach((g) => { if (g.ring && !pending('nova', g.id) && r() < K.novaRate * mod(s, 'nova') * g.young) warn(s, 'nova', g.id, K.novaWarn); });
    if (!pending('flare') && r() < K.flareChance * mod(s, 'flare') * (0.5 + s.bh.mass * 2) * (1 + t)) warn(s, 'flare', 0, K.flareWarn);
    const grbFrom = K.grbFrom + mod(s, 'grbFrom', 0);
    if (m >= grbFrom && !pending('grb') && r() < K.grbChance * mod(s, 'grb') * (1 + (m - grbFrom) / 2)) {   // more often as the year ends
      const lived = R.filter((g) => g.ring && (g.civ !== null || g.life > 0.1));
      const pool = lived.length ? lived : R.filter((g) => g.ring);
      warn(s, 'grb', pool[Math.floor(r() * pool.length)].id, K.grbWarn);
    }
    const collideAt = (K.collideAt + mod(s, 'collide', 0)) * MONTH;
    if (!s.companion.merged && !pending('collide') && s.day >= collideAt - K.collideWarn) warn(s, 'collide', null, collideAt - s.day);
    const due = s.threats.filter((x) => x.at <= s.day);
    s.threats = s.threats.filter((x) => x.at > s.day);
    due.forEach((x) => strike(s, x));
  }
  // A strike on an unsheltered civilisation: a colony may be lost; a home world loses ground.
  function civHit(s, g, what) {
    if (g.civ === null) return;
    const c = s.civs[g.civ];
    c.scars++;
    // They saw it coming too, and they know you could have helped.
    if (c.aware) { c.view -= K.blame; note(s, `The ${c.name} wonder why you did not shield them`, { civ: c.id, blame: true }); }
    if (g.id !== c.home && g.stability < K.colonyHold) {
      c.regions = c.regions.filter((id) => id !== g.id); g.civ = null; g.invite = undefined;
      note(s, `${what} destroyed the ${c.name}'s colony in ${regionName(g)}`, { civ: c.id, setback: true, region: g.id });
    } else if (g.id === c.home) {
      c.progress = Math.max(STAGE_AT[c.tech], c.progress - K.homeHit); c.pop *= 0.7;
      note(s, `${what} burned the ${c.name}'s cities`, { civ: c.id, setback: true, region: g.id });
    }
  }
  function strike(s, x) {
    const R = s.regions, g = x.region === null ? null : R[x.region];
    if (x.kind === 'nova') {
      const held = shielded(g);
      g.stability = Math.max(0, g.stability - K.novaHit * (held ? K.shieldK : 1));
      if (!held) g.life *= 0.5;
      g.n.forEach((n) => { const h = R[n]; h.stability = Math.max(0, h.stability - K.novaSplash * (shielded(h) ? K.shieldK : 1)); });
      for (let i = 0; i < 3; i++) spark(s, g.id);
      note(s, held ? `The supernova hit ${regionName(g)}: your shelter held` : g.civ === null && g.life < 0.05 && (!g.worlds || g.hab < 0.3) ? `A supernova lit up ${regionName(g)}; nothing lived there` : `A supernova tore through ${regionName(g)}`, { strike: 'nova', region: g.id, you: held });
      if (held && g.civ !== null) { gain(s, s.civs[g.civ], 1.5); note(s, `The ${s.civs[g.civ].name} saw the supernova pass them by, and you`, { civ: g.civ, you: true }); }
      if (!held) civHit(s, g, 'The supernova');
    }
    if (x.kind === 'flare') {
      if (s.bh.calm > 0) note(s, `The core was still calm from your calming (it lasts ${K.calmDays} days): no flare`, { you: true, strike: 'calmed' });
      else flare(s, false);
    }
    if (x.kind === 'grb') {
      if (shielded(g)) {
        if (g.civ !== null) { gain(s, s.civs[g.civ], 1.5); note(s, `The gamma-ray burst passed over the sheltered ${s.civs[g.civ].name}`, { civ: g.civ, you: true, strike: 'grb', region: g.id }); }
        else note(s, `The gamma-ray burst passed over ${regionName(g)}: your shelter held`, { you: true, strike: 'grb', region: g.id });
      } else {
        g.life = 0; g.lifeMax = 0; g.stability = Math.max(0, g.stability - 0.35);
        if (g.civ !== null) {
          const c = s.civs[g.civ];
          c.scars++;
          if (c.aware) { c.view -= K.blame; note(s, `The ${c.name} wonder why you did not shield them`, { civ: c.id, blame: true }); }
          if (g.id === c.home) {
            c.tech = Math.max(0, c.tech - 1); c.progress = STAGE_AT[c.tech]; c.pop *= 0.5;
            note(s, `A gamma-ray burst struck the ${c.name}'s home: they fell back to ${STAGES[c.tech].toLowerCase()}`, { civ: c.id, setback: true, strike: 'grb', region: g.id });
          } else {
            c.regions = c.regions.filter((id) => id !== g.id); g.civ = null; g.invite = undefined;
            note(s, `A gamma-ray burst wiped out the ${c.name}'s colony in ${regionName(g)}`, { civ: c.id, setback: true, strike: 'grb', region: g.id });
          }
        } else note(s, `A gamma-ray burst swept ${regionName(g)}${g.worlds ? ', sterilising it' : ''}`, { strike: 'grb', region: g.id });
      }
    }
    if (x.kind === 'collide') {
      s.companion.merged = true; s.companion.dist = 0;
      R.forEach((h) => { h.stability = Math.max(0, h.stability - 0.35 * (shielded(h) ? K.shieldK : 1)); if (h.ring === 3) { h.gas += 0.9; h.metals = Math.min(1, h.metals + 0.12); } });
      note(s, 'The companion galaxy crashed into yours', { strike: 'collide', merge: true });
    }
  }

  function flare(s, byYou) {
    s.bh.flares++;
    const hit = K.flareHit * (0.7 + Math.min(1.2, s.bh.mass));
    const R = s.regions, hurt = [];
    R.forEach((g) => {
      if (g.ring > 1) return;
      g.stability = Math.max(0, g.stability - hit * (g.ring === 0 ? 1.4 : 1) * (shielded(g) ? K.shieldK : 1));
      if (g.ring === 1) { const out = g.gas * 0.2; g.gas -= out; g.n.forEach((n) => { if (R[n].ring === 2) R[n].gas += out / 1; }); }
      if (g.civ !== null && g.ring) { hurt.push(g.civ); if (!shielded(g)) civHit(s, g, byYou ? 'The flare you caused' : 'The flare'); }
    });
    const civs = [...new Set(hurt)];
    civs.forEach((ci) => {
      const c = s.civs[ci];
      note(s, byYou ? `The flare you caused scorched the ${c.name}` : `A black hole flare scorched the ${c.name}`, { civ: c.id, you: byYou });
      if (byYou) c.view -= 2;
    });
    note(s, byYou ? 'You fed the black hole: it flared' : 'The black hole flared', { flare: true });
  }

  // ---- civilisations ----------------------------------------------------------------------
  // Every region has its own name (players need to tell them apart), and a kind for the card.
  const PLACES = [
    ['Ember Gate', 'Cinder Way', 'Lantern Reach', 'Forge Rim', 'Vesper Arm', 'Brightwell', 'Halo Steps', 'Corona Drift', 'Kiln Hollow', 'Sunward', 'Blaze Cross', 'Gilt Spiral', 'Ashfall', 'Crown Deep', 'Morrow Light', 'Pyre Reach'],
    ['Tidewater', 'Amber Fields', 'Sable Reach', 'Rosewind', 'Quietwater', 'Glassmere', 'Mistral', 'Harrow Gap', 'Saltmarsh', 'Hollowell', 'Lark Rise', 'Greywater', 'Fernhold', 'Copper Vale', 'Stillmere', 'Bellwether'],
    ['Far Shore', 'Lastlight', 'Driftmark', 'Outer Dark', 'Pale Harbour', 'Wanderlight', 'Thornfield', 'Long Night', 'Frostward', 'Dusk Hollow', 'Edgewater', 'Farthing', 'Coldharbour', 'Nightfall Reach', 'Seaglass', 'Last Lantern'],
  ];
  // Every galaxy has a character of its own, named at the start: it bends a rule or two.
  const TRAITS = [
    { id: 'restless', name: 'A restless core', text: 'The black hole is hungry: flares come far more often.', mod: { flare: 1.5 } },
    { id: 'rich', name: 'A gas-rich halo', text: 'Gas keeps falling in: more stars, more supernovae, more stardust.', mod: { halo: 1.35, nova: 1.25 } },
    { id: 'quiet', name: 'A quiet galaxy', text: 'Few giant stars: calmer skies, but stardust is rare.', mod: { nova: 0.6, spark: 0.8 } },
    { id: 'fertile', name: 'Many worlds', text: 'More regions have worlds that could hold life.', mod: { worlds: 1 } },
    { id: 'grb', name: 'Gamma-ray skies', text: 'Gamma-ray bursts start earlier and come more often.', mod: { grb: 1.5, grbFrom: -1 } },
    { id: 'close', name: 'A close companion', text: 'The companion galaxy is near: it crashes in at the start of month 7 unless you merge it.', mod: { collide: -1 } },
  ];
  const mod = (s, k, d = 1) => (s.trait && s.trait.mod[k] !== undefined ? s.trait.mod[k] : d);
  const collideMonth = (s) => K.collideAt + mod(s, 'collide', 0) + 1;
  const regionName = (g) => g.name || (g.ring === 0 ? 'the core' : PLACES[g.ring - 1][g.sector]);
  const regionKind = (g) => (g.ring === 0 ? 'the centre' : ['', 'inner', 'middle', 'outer'][g.ring] + ' ' + (g.arm ? 'arm' : 'gap'));
  const OPPOSITE = { Expansive: 'Insular', Insular: 'Expansive', Mercantile: 'Contemplative', Contemplative: 'Mercantile' };
  const rivalOf = (s, c) => (c.rival !== undefined && s.civs[c.rival].alive && c.met.includes(c.rival) ? s.civs[c.rival] : null);
  function birth(s, g) {
    const r = s.rand;
    const c = {
      id: s.civs.length, name: s.names[s.namesUsed++ % s.names.length] + (s.namesUsed > s.names.length ? ' II' : ''),
      kind: (() => { const used = (k) => s.civs.filter((x) => x.kind === k).length, least = Math.min(...KINDS.map(used)); const pool = KINDS.filter((k) => used(k) === least); return pool[Math.floor(r() * pool.length)]; })(), colour: COLOURS[s.civs.length % COLOURS.length],
      home: g.id, regions: [g.id], born: s.day, tech: 0, progress: 0, pop: 0.2, alive: true, collapses: 0,
      view: 0, aware: false, nextSettle: 0, golden: false, beacon: false, met: [], ask: null, nextAsk: 0, honoured: 0, scars: 0,
    };
    s.civs.push(c);
    g.civ = c.id;
    claimed(s, g, null);
    note(s, `The ${c.name} arose in ${regionName(g)}`, { civ: c.id, birth: true });
    // A rival: an older people of the opposite character. Once they know each other, helping one costs you with the other.
    const o = s.civs.find((x) => x !== c && x.alive && x.kind === OPPOSITE[c.kind] && x.rival === undefined);
    if (o) { c.rival = o.id; o.rival = c.id; note(s, `The ${c.name} and the ${o.name} are opposites (${c.kind.toLowerCase()} and ${o.kind.toLowerCase()}): rivals, once they meet`, { civ: c.id, other: o.id, rivalry: true }); }
    milestone(s, 'civ', `The first civilisation: the ${c.name}`, true);
    return c;
  }
  // A region changes hands: requests aimed at it are settled, without blame.
  function claimed(s, g, by) {
    s.civs.forEach((o) => {
      if (!o.ask || o.ask.region !== g.id || o.ask.kind === 'shelter') return;
      note(s, o === by ? `The ${o.name} have ${regionName(g)} now; their request is settled` : `${by ? 'The ' + by.name + ' took' : 'New life woke in'} ${regionName(g)}; the ${o.name} withdraw their request`, { civ: o.id });
      o.ask = null; o.nextAsk = s.day + K.askEvery / 2;
    });
  }
  // What life in an unclaimed region will become: joined to a neighbouring people (beside their
  // home, unless you refused them it), taken by settlers you invited, or a people of its own.
  // The page's region card reads the same answer, so its prediction is the rule.
  function fate(s, g) {
    if (g.civ !== null || !g.worlds || !g.ring) return null;
    const R = s.regions;
    if (g.invite !== undefined && g.invite !== null && s.civs[g.invite].alive && s.civs[g.invite].regions.some((id) => R[id].n.includes(g.id))) return { kind: 'settle', civ: g.invite };
    const askers = s.civs.filter((c) => c.alive && c.ask && c.ask.kind === 'seed' && c.ask.region === g.id), asker = askers[0];
    const host = g.shelter > 0 && g.nurture >= K.apartNurture ? null : R.find((x) => x.civ !== null && x.n.includes(g.id) && s.civs[x.civ].home === x.id && g.refused !== x.civ);   // under your shelter, it wakes as its own people
    const near = R.find((x) => x.civ !== null && x.n.includes(g.id) && s.civs[x.civ].home === x.id && g.refused !== x.civ);
    return { kind: host ? 'join' : 'new', civ: host ? host.civ : null, neighbour: near ? near.civ : null, asker: asker ? asker.id : null, askers: askers.map((x) => x.id) };
  }
  // Trust you earn holds for a while before it starts to fade again.
  const coolsIn = (s, c) => (K.trustDecay ? Math.max(0, (c.grace || 0) - s.day) + Math.floor((c.view - K.concordView) / K.trustDecay) : Infinity);   // days until a grateful people cools
  const days = (n) => n <= 0 ? 'under a day' : `${n} ${n === 1 ? 'day' : 'days'}`;
  const kindReady = (s, c) => c.kindAt === undefined || s.day - c.kindAt >= K.kindEvery;
  function gain(s, c, n) { c.view = Math.min(K.viewCap, c.view + n); c.grace = s.day + K.graceDays; c.thin = false; }
  function welcome(s, c, g) {
    claimed(s, g, c);
    g.civ = c.id; c.regions.push(g.id); g.life = 0; g.lifeMax = 0;
    c.progress += 10;
    if (c.aware) gain(s, c, 1);
    note(s, `The ${c.name} found the life you nursed in ${regionName(g)}, and welcomed it as their own${c.aware ? '. They thank you' : ''}`, { civ: c.id, you: true, welcome: true, region: g.id });
  }
  function liveCiv(s, c) {
    if (!c.alive) return;
    const R = s.regions, home = R[c.home], r = s.rand;
    const ok = home.hab > 0.2;
    c.pop = clamp(c.pop + (ok ? 0.01 * (1 + c.regions.length * 0.3) : -0.02), 0, 100);
    if (ok) c.progress += c.pace || 1;
    if (c.view > K.viewCap) c.view = K.viewCap;                 // trust has a ceiling: even reverence can be shaken
    while (c.tech < 3 && c.progress >= STAGE_AT[c.tech + 1]) {
      c.tech++;
      note(s, `The ${c.name}: ${STAGES[c.tech].toLowerCase()}`, { civ: c.id, stage: c.tech });
      if (c.tech === 2) { c.aware = true; milestone(s, 'flight', `First spaceflight: the ${c.name}`, true); if (!c.nextAsk) c.nextAsk = s.day + 8; }
    }
    // Trust fades a little every day: it has to be kept, not just won.
    // A warning before a grateful people cools, while there's still time to do something.
    const cools = coolsIn(s, c);
    if (c.aware && c.view >= 1 && cools <= K.thinDays && !c.thin) { c.thin = true; note(s, `The ${c.name}'s trust is wearing thin: in ${days(cools)} they will cool. Shelter one of their worlds, or answer them`, { civ: c.id, thin: true }); }
    if (c.aware && c.view > 0 && s.day >= (c.grace || 0)) {
      const was = viewOf(c);
      c.view = Math.max(0, c.view - K.trustDecay);
      if (viewOf(c) !== was) note(s, `The ${c.name}'s trust in you is cooling: now ${viewOf(c).toLowerCase()}`, { civ: c.id, cooling: true });
    }
    // Requests: civilisations that can see you ask for help, and remember whether you came.
    if (c.ask && s.day > c.ask.until) {
      const wasBeacon = c.ask.kind === 'beacon';
      if (c.ask.kind === 'seed' && c.ask.region !== null && s.regions[c.ask.region].life > 0.05) s.regions[c.ask.region].refused = c.id;   // the life there stays its own
      c.view -= c.ask.test ? 3 : 1.5; c.ask = null; c.nextAsk = s.day + K.askEvery;   // ignoring the last test hurts twice as much
      note(s, wasBeacon ? `The ${c.name}'s beacon was never lit. They trust you less` : `The ${c.name} asked, and no help came. They trust you less`, { civ: c.id, ignored: true });
    }
    if (c.aware && !c.ask && c.nextAsk && s.day >= c.nextAsk && s.day < YEAR - K.askDays && s.day !== K.testAt) ask(s, c);
    // Settling: interstellar civilisations take habitable neighbours, at their own pace.
    if (c.tech >= 3 && s.day >= c.nextSettle) {
      const options = [...new Set(c.regions.flatMap((id) => R[id].n))].map((id) => R[id]).filter((g) => g.civ === null && g.ring > 0 && g.hab > 0.25 && (g.life < 0.1 || g.invite === c.id));
      if (options.length) {
        const g = options.sort((a, b) => b.hab - a.hab)[0];
        if (g.life > 0.1) note(s, `The ${c.name} settled ${regionName(g)}; the life that was growing there is gone`, { civ: c.id, region: g.id, lost: true });
        g.civ = c.id; c.regions.push(g.id); g.life = 0;
        claimed(s, g, c);
        if (c.regions.length === 2 || c.regions.length % 3 === 0) note(s, `The ${c.name} hold ${c.regions.length} regions`, { civ: c.id });
      }
      c.nextSettle = s.day + EXPAND[c.kind] * (0.7 + r() * 0.6) / (c.pace || 1);
    }
    // Contact: neighbouring regions held by another civilisation.
    c.regions.forEach((id) => R[id].n.forEach((n) => {
      const o = R[n].civ;
      if (o === null || o === c.id || c.met.includes(o) || !s.civs[o].alive) return;
      c.met.push(o); s.civs[o].met.push(c.id);
      note(s, `First contact: the ${c.name} and the ${s.civs[o].name}`, { civ: c.id, other: o, contact: true });
      milestone(s, 'contact', `First contact: the ${c.name} and the ${s.civs[o].name}`, true);
    }));
    // A golden age: four or more regions in a long calm.
    if (!c.golden && c.regions.length >= 4 && c.regions.every((id) => R[id].stability > 0.8)) {
      c.golden = true; note(s, `A golden age for the ${c.name}`, { civ: c.id, golden: true }); milestone(s, 'golden', `A golden age: the ${c.name}`, true);
    }
    // Collapse: the home world loses its calm.
    if (home.stability < 0.25) {
      c.collapses++;
      const lost = c.regions.filter((id) => id !== c.home);
      lost.forEach((id) => { R[id].civ = null; });
      c.regions = [c.home]; c.tech = Math.max(0, c.tech - 1); c.progress = STAGE_AT[c.tech];
      c.pop *= 0.4;
      note(s, `The ${c.name} collapsed${lost.length ? `, losing ${lost.length} ${lost.length === 1 ? 'colony' : 'colonies'}` : ''}`, { civ: c.id, collapse: true });
      if (c.pop < 0.08) { c.alive = false; home.civ = null; home.life = 0; note(s, `The ${c.name} are gone`, { civ: c.id, gone: true }); }
    }
    if (c.collapses && c.alive && c.tech >= 3) milestone(s, 'survivor', `The ${c.name} survived a collapse`);
  }

  // What a civilisation asks for depends on who they are: expansive and mercantile peoples want
  // room to grow, contemplative and insular ones want to be kept safe.
  const WANTS = { Expansive: ['seed', 'forge', 'contact', 'shelter'], Mercantile: ['contact', 'forge', 'seed', 'shelter'], Contemplative: ['calm', 'shelter'], Insular: ['shelter'] };
  function ask(s, c) {
    const R = s.regions, home = R[c.home];
    const frontier = [...new Set(c.regions.flatMap((id) => R[id].n))].map((id) => R[id]).filter((g) => g.ring && g.civ === null && g.worlds > 0 && (g.invite === undefined || g.invite === null) && !(g.restUntil > s.day));
    const inner = c.regions.some((id) => R[id].ring <= 1) || home.ring === 2;
    const options = {
      shelter: () => { const g = c.regions.map((id) => R[id]).filter((x) => x.shelter <= 0).sort((a, b) => a.stability - b.stability)[0]; return g && { kind: 'shelter', region: g.id, text: g.id === c.home ? `The ${c.name} ask you to shelter their home, ${regionName(g)}` : `The ${c.name} ask you to shelter their colony in ${regionName(g)}` }; },
      calm: () => s.bh.calm <= 0 && { kind: 'calm', region: null, text: `The ${c.name} fear the black hole: they ask you to calm the core` },
      // Gas for a region between them and a people they haven't met: settling it brings contact.
      contact: () => {
        const g = frontier.filter((x) => x.life < 0.1).find((x) => x.n.some((n) => { const o = R[n].civ; return o !== null && o !== c.id && s.civs[o].alive && !c.met.includes(o); }));
        if (!g) return null;
        const o = s.civs[R[g.n.find((n) => R[n].civ !== null && R[n].civ !== c.id && !c.met.includes(R[n].civ))].civ];
        return { kind: 'seed', region: g.id, text: `The ${c.name} ask for gas in ${regionName(g)}: settling it would bring them to the ${o.name}` };
      },
      // Metals for their worlds: a starburst in a lifeless, gassy region beside them.
      forge: () => {
        const g = frontier.filter((x) => x.life < 0.05 && x.gas > 0.5 && x.metals < 0.6).sort((a, b) => b.gas - a.gas)[0];
        return g && { kind: 'starburst', region: g.id, text: `The ${c.name} ask you to starburst ${regionName(g)} and forge metals for their worlds (it will shake them a little)` };
      },
      seed: () => {
        if (!frontier.length) return null;
        const g = frontier.sort((x, y) => (x.life - y.life) * 2 + (x.gas - y.gas))[0];
        return { kind: 'seed', region: g.id, text: `The ${c.name} ask for gas in ${regionName(g)}, to settle it${g.life > 0.05 ? '. Life is already growing there, and settling would end it' : g.hab > K.lifeOn && g.worlds ? '. Life could start there soon; settling would end it' : ''}` };
      },
    };
    let a = null;
    // Late, a great civilisation that trusts you asks for something bigger: help lighting a beacon.
    const beaconOpen = s.civs.some((o) => o.ask && o.ask.kind === 'beacon');
    const nearStorm = s.day + K.beaconDays > Math.round(K.stormAt * MONTH) + 5 && s.day < Math.round(K.stormAt * MONTH) + K.stormWarn + 12;   // no beacon due in the storm's own weeks
    if (month(s) >= K.beaconFrom && !beaconOpen && !nearStorm && s.day + K.beaconDays < YEAR - 3 && c.tech >= 3 && c.regions.length >= 3 && !c.beacon && c.view >= 1 && s.rand() < 0.6) {
      const regions = c.regions.slice(0, 4);
      a = { kind: 'beacon', region: null, regions, done: [], text: `The ${c.name} are lighting a beacon to the galaxy: shelter ${regions.length} of their regions, from now on, to help` };
    }
    // Foresight: if what they would ask for is already done, they thank you instead of asking.
    const done = {
      calm: () => s.bh.calm > 0 && 'calm the core',
      shelter: () => c.regions.every((id) => R[id].shelter > 0) && 'shelter their worlds',
      seed: () => { const g = frontier.find((x) => x.seededAt >= s.day - K.foreDays && x.life < 0.1); if (g) { g.invite = c.id; return `send gas to ${regionName(g)}`; } return false; },
    };
    done.contact = done.seed;
    if (!a) for (const k of WANTS[c.kind]) {
      const was = done[k] && done[k]();
      if (was) {
        gain(s, c, K.foresight); c.progress += 10; c.honoured++; c.nextAsk = s.day + K.askEvery;
        note(s, `The ${c.name} were about to ask you to ${was}, and you already had. They thank you`, { civ: c.id, you: true, answered: true, foresight: true });
        return;
      }
      a = options[k] && options[k](); if (a) break;
    }
    if (!a) a = { kind: 'shelter', region: c.home, text: `The ${c.name} ask you to shelter their home, ${regionName(home)}` };
    if (a.kind === 'seed' && a.region !== null) {
      const others = s.civs.filter((o) => o !== c && o.alive && o.aware && o.regions.some((id) => R[id].n.includes(a.region)));
      if (others.length) a.text += ` (the ${others.map((o) => o.name).join(' and the ')} border it too, and would mind)`;
    }
    c.ask = Object.assign(a, { until: s.day + (a.kind === 'beacon' ? K.beaconDays : K.askDays) });
    note(s, a.text, { civ: c.id, ask: true });
    // A dispute: a neighbour that borders the same region wants it too, at the same time.
    if (a.kind === 'seed' && a.region !== null) {
      const rival = s.civs.find((o) => o !== c && o.alive && o.aware && !o.ask && o.regions.some((id) => R[id].n.includes(a.region)));
      if (rival) {
        rival.ask = { kind: 'seed', region: a.region, until: c.ask.until, dispute: c.id, text: `The ${rival.name} want ${regionName(R[a.region])} too: gas for one people settles it for them` };
        c.ask.dispute = rival.id;
        note(s, `A dispute: the ${c.name} and the ${rival.name} both want ${regionName(R[a.region])}`, { civ: rival.id, other: c.id, ask: true, dispute: true });
      }
    }
  }

  // ---- the finale: a concord of the civilisations that know each other, and you --------------
  // From month 9 they talk of uniting; at month 11.5 the biggest group in contact unites if it
  // has at least three members and they are, on average, grateful to you.
  function circle(s) {
    const alive = s.civs.filter((c) => c.alive), seen = new Set(), trusts = (x) => x.aware && x.view >= K.concordView;
    let best = [];
    alive.forEach((c) => {
      if (seen.has(c.id)) return;
      const group = [], stack = [c.id];
      while (stack.length) { const id = stack.pop(); if (seen.has(id)) continue; seen.add(id); group.push(s.civs[id]); s.civs[id].met.forEach((o) => { if (s.civs[o].alive) stack.push(o); }); }
      const t = (g) => g.filter(trusts).length;
      if (group.length > best.length || (group.length === best.length && t(group) > t(best))) best = group;   // the biggest circle: groups only grow, so it doesn't jump
    });
    const aware = best.filter((x) => x.aware), trusted = best.filter(trusts), need = Math.max(K.concordMin, Math.ceil(aware.length * K.concordShare));   // peoples who can't see you yet don't count against it
    return { members: best, aware, trusted, ready: best.length >= K.concordMin && trusted.length >= need, need, short: Math.max(0, K.concordMin - best.length), trusts };
  }
  // ---- omens: free choices in the opening months, each a small trade-off that shapes the galaxy ---
  // One at a time, a few weeks apart; left alone for 10 days, it passes (the last option, "let it be").
  const OMEN_DAYS = [18, 42, 68, 96, 124, 152];
  function omen(s) {
    if (s.omen && s.day >= s.omen.until) { note(s, `${s.omen.title}: you let it be`, { omen: true }); s.omen = null; }
    const i = (s.omenDays || OMEN_DAYS).indexOf(s.day);
    if (i < 0 || s.omen) return;
    const R = s.regions, r = s.rand, free = R.filter((g) => g.ring && g.civ === null);
    const pick = (list) => list[Math.floor(r() * list.length)];
    const two = (list) => { const a = pick(list), b = pick(list.filter((x) => x !== a)); return [a, b]; };
    const kinds = ['twin', 'cloud', 'cluster', 'comet', 'wanderer'];
    const kind = s.omenKinds ? s.omenKinds[i] : kinds[(i + (s.seed % kinds.length)) % kinds.length];
    let o = null;
    if (kind === 'twin') {
      const [a, b] = two(free.filter((g) => g.worlds < 3 && g.worlds > 0));
      if (a && b) o = { title: 'A new world is forming', text: `Planets are gathering into a new world. It can settle in ${regionName(a)} or in ${regionName(b)}: one more world (one more dot) where life can grow.`, options: [{ label: regionName(a), fx: ['world', a.id] }, { label: regionName(b), fx: ['world', b.id] }] };
    }
    if (kind === 'cloud') {
      const [a, b] = two(free.filter((g) => g.ring >= 2));
      if (a && b) o = { title: 'A gas cloud drifts in', text: `A cloud of fresh gas is falling from the halo. Draw it into ${regionName(a)} or ${regionName(b)} (gas for new stars), or let it scatter into stardust to tap.`, options: [{ label: regionName(a), fx: ['gas', a.id] }, { label: regionName(b), fx: ['gas', b.id] }, { label: 'Stardust', fx: ['dust', a.id] }] };
    }
    if (kind === 'cluster') {
      const a = free.filter((g) => g.life < 0.05).sort((x, y) => y.gas - x.gas)[0];
      if (a) o = { title: 'Giant stars are kindling', text: `A cluster of giant stars is forming in ${regionName(a)}. Let it burn: heavy elements there and next door, but the region will be unsettled for a while. Or disperse it, and keep the calm.`, options: [{ label: 'Let it burn', fx: ['burn', a.id] }, { label: 'Disperse it', fx: ['calm', a.id] }] };
    }
    if (kind === 'comet') {
      const a = free.filter((g) => g.worlds > 0).sort((x, y) => y.hab - x.hab)[0];
      if (a) o = { title: 'A storm of comets', text: `Icy comets are falling toward ${regionName(a)}. Let them come: water for its worlds (once life starts, it grows faster there for good), but the impacts shake it. Or turn them away.`, options: [{ label: 'Let them come', fx: ['water', a.id] }, { label: 'Turn them away', fx: ['none'] }] };
    }
    if (kind === 'wanderer') {
      const [a, b] = two(free.filter((g) => g.worlds > 0));
      if (a && b) o = { title: 'A wandering black hole', text: `A small black hole is passing through. It will graze ${regionName(a)} or ${regionName(b)}: your choice which is shaken. It leaves a little stardust in its wake.`, options: [{ label: regionName(a), fx: ['graze', a.id] }, { label: regionName(b), fx: ['graze', b.id] }] };
    }
    if (!o) return;
    s.omen = Object.assign(o, { until: s.day + 10, kind });
    note(s, `${o.title}: ${o.text}`, { omen: true, ask: true });
  }
  function choose(s, n) {
    const o = s.omen, opt = o && o.options[n];
    if (!opt) return { ok: false, why: 'gone' };
    const R = s.regions, [fx, id] = opt.fx, g = id === undefined ? null : R[id];
    if (fx === 'world') g.worlds = Math.min(3, g.worlds + 1);
    if (fx === 'gas') { dilute(g, 0.7); g.gas += 0.7; }
    if (fx === 'dust') for (let i = 0; i < 2; i++) spark(s, g.id);
    if (fx === 'burn') { g.metals = Math.min(1, g.metals + 0.2); g.n.forEach((n) => { R[n].metals = Math.min(1, R[n].metals + 0.08); }); g.stability = Math.max(0, g.stability - 0.35); spark(s, g.id, 4); }
    if (fx === 'calm') g.stability = Math.min(1, g.stability + 0.1);
    if (fx === 'water') { g.nurture = Math.min(K.nurtureMax, g.nurture + 1); g.stability = Math.max(0, g.stability - 0.2); }   // water: life will grow faster there, for good
    if (fx === 'graze') { g.stability = Math.max(0, g.stability - 0.3); spark(s, g.id, 2); }
    s.actions.push({ day: s.day, kind: 'choose', region: n });
    const said = { world: `${regionName(g)} now has ${g.worlds} ${g.worlds === 1 ? 'world' : 'worlds'}`, gas: `fresh gas pours into ${regionName(g)}`, dust: 'it scatters into stardust: tap it', burn: `heavy elements rain on ${regionName(g)} and its neighbours, and it is unsettled`, calm: `${regionName(g)} stays calm`, water: `the worlds of ${regionName(g)} have water: life will grow faster there`, graze: `${regionName(g)} is shaken, and stardust trails behind`, none: 'the comets pass by' }[fx];
    note(s, `${o.title}: ${opt.label}. ${said.replace(/^./, (x) => x.toUpperCase())}`, { omen: true, you: true, region: id });
    s.omen = null;
    return { ok: true };
  }
  function concord(s) {
    const talk = Math.round(K.concordTalk * MONTH), at = Math.round(K.concordAt * MONTH);
    if (s.day === talk) note(s, `The civilisations talk of a concord. If at least ${K.concordMin} peoples in contact, and two in every three of them, trust you (grateful or better) when the year ends, they will unite. Trust comes from what you do for them, and what you fail to do`, { concordTalk: true });
    if (s.day === Math.round(K.beaconFrom * MONTH) - 10 && s.civs.some((c) => c.alive && c.tech >= 2)) note(s, 'Great civilisations will soon ask for help lighting beacons. Each takes several shelters: keep influence in reserve', { beaconTalk: true });
    // Once it's talked of, say when the concord comes within reach, and when it slips away.
    if (s.day > talk && s.day < at && s.concord === undefined) {
      const r = circle(s).ready;
      if (r !== !!s.concordNear) { s.concordNear = r; note(s, r ? 'The concord is within reach: if the year ended now, they would unite' : 'The concord has slipped out of reach', { concordNear: r, you: r }); }
    }
    if (s.day !== at || s.concord !== undefined) return;
    const c = circle(s);
    if (c.ready) {
      s.concord = { members: c.trusted.map((x) => x.id), day: s.day };
      note(s, `The Gardener's Concord: ${c.trusted.map((x) => 'the ' + x.name).join(', ').replace(/, ([^,]*)$/, ' and $1')} unite, and name it for you`, { concord: true });
      milestone(s, 'concord', 'The concord', true);
    } else {
      s.concord = null;
      note(s, c.members.length < K.concordMin ? 'No concord: too few civilisations know each other' : `No concord: only ${c.trusted.length} of them trusted you enough to unite`, { concord: false });
    }
  }

  // A score for the year: what lives, how far it got, how it feels about you.
  function legacyParts(s) {
    const VIEW = { Reverent: 6, Grateful: 3, Curious: 1 };
    const parts = [];
    s.civs.forEach((c) => {
      if (!c.alive) return;
      const items = [['alive', 10], ['stage', 4 * c.tech], ['regions', 2 * c.regions.length], ['golden age', c.golden ? 8 : 0], ['trust', VIEW[viewOf(c)] || 0], ['answered', 2 * c.honoured], ['beacon', c.beacon ? 15 : 0], ['scars', -4 * c.scars]];
      parts.push({ civ: c.id, label: `The ${c.name}`, items: items.filter((x) => x[1]), total: items.reduce((a, x) => a + x[1], 0) });
    });
    if (s.concord) parts.push({ label: "The Gardener's Concord", total: 10 * s.concord.members.length });
    if (s.feats) parts.push({ label: `${s.feats} ${s.feats === 1 ? 'challenge' : 'challenges'} met`, total: K.challengeWorth * s.feats });
    const ms = Object.keys(s.milestones).length;
    if (ms) parts.push({ label: `${ms} milestones (firsts along the way)`, total: 3 * ms });
    return parts;
  }
  const legacy = (s) => legacyParts(s).reduce((a, p) => a + p.total, 0);
  // The concord's worth if it holds: counted in the score you're heading for, until it's decided.
  const concordWorth = (s) => { if (s.concord !== undefined || month(s) < K.concordTalk) return 0; const c = circle(s); return c.ready ? 10 * c.trusted.length : 0; };
  const STARS = [90, 250, 400];                                   // one, two and three stars
  const stars = (s) => STARS.filter((x) => legacy(s) >= x).length;

  // ---- what you do -------------------------------------------------------------------------
  const HELPS = { seed: 0, shelter: 0, starburst: -1, feed: -2 };   // gratitude comes from answers and protection, not routine care
  const spendable = (s) => s.influence + (s.bank || 0);           // what you can spend now: influence plus the bank
  function act(s, kind, regionId, forCiv) {                        // forCiv: which people's request this answers
    const cost = K.cost[kind];
    if (cost === undefined || spendable(s) + 1e-9 < cost) return { ok: false, why: 'influence' };
    if (kind === 'collect') {                                    // tap stardust: the region argument is the spark's id
      const i = s.sparks.findIndex((x) => x.id === regionId && (x.from || 0) <= s.day);
      if (i < 0) return { ok: false, why: 'gone' };
      s.sparks.splice(i, 1);
      const over = Math.max(0, s.influence + K.sparkGain - K.influenceMax);   // what doesn't fit goes to the bank
      s.influence = Math.min(K.influenceMax, s.influence + K.sparkGain);
      s.bank = Math.min(K.bankMax, (s.bank || 0) + over);
      s.actions.push({ day: s.day, kind, region: regionId });
      return { ok: true };
    }
    if (kind === 'choose') return choose(s, regionId);         // an omen: the region argument is the option's index
    if (kind === 'refuse') {                                     // say no to a request: kinder than silence
      const c = s.civs[forCiv];
      if (!c || !c.alive || !c.ask) return { ok: false, why: 'gone' };
      if (c.ask.kind === 'seed' && c.ask.region !== null) { s.regions[c.ask.region].refused = c.id; s.regions[c.ask.region].restUntil = s.day + 90; }
      c.view -= c.ask.schism ? K.refuseHit * 2 : K.refuseHit; c.ask = null; c.nextAsk = s.day + K.askEvery;
      s.actions.push({ day: s.day, kind, region: regionId, civ: forCiv });
      note(s, `You told the ${c.name} no. They take it better than silence`, { civ: c.id, you: true, refused: true });
      return { ok: true };
    }
    const R = s.regions, g = regionId === undefined ? null : R[regionId];
    if ((kind === 'seed' || kind === 'starburst' || kind === 'shelter') && !g) return { ok: false, why: 'region' };
    if (kind === 'merge' && (s.companion.merged || month(s) < 2)) return { ok: false, why: 'merge' };
    s.influence -= cost;
    if (s.influence < 0) { s.bank = Math.max(0, (s.bank || 0) + s.influence); s.influence = 0; }   // the bank covers what influence can't
    s.actions.push(forCiv === undefined ? { day: s.day, kind, region: regionId } : { day: s.day, kind, region: regionId, civ: forCiv });
    if (kind === 'seed') { g.seededAt = s.day; const take = Math.min(s.halo, 0.6); s.halo -= take; dilute(g, take); g.gas += take + 0.25; }
    if (kind === 'starburst') {
      const formed = g.gas * 0.7; g.gas -= formed; g.young += formed * 0.55; g.sunlike += formed * 0.45;
      spark(s, g.id, 3);                                           // the first stars to die leave stardust a few days on
      g.stability = Math.max(0, g.stability - K.burstHit);
      // The shock sterilises: life here and next door is set back, and the neighbours are shaken.
      g.life *= 1 - K.burstSterile;
      g.n.forEach((n) => { R[n].stability = Math.max(0, R[n].stability - K.burstHit * 0.5); R[n].life *= 1 - K.burstSterile * 0.5; });
    }
    if (kind === 'shelter') { g.shelter = K.shelterDays; g.nurture = Math.min(K.nurtureMax, g.nurture + K.nurtureGain); }
    if (kind === 'uplift') {
      if (!g || g.civ === null) { s.influence += cost; s.actions.pop(); return { ok: false, why: 'region' }; }
      const c = s.civs[g.civ];
      c.progress += K.upliftGain * (c.pace || 1) * (c.tech >= 3 ? 1.5 : 1);
      const thanks = c.aware && (c.upliftAt === undefined || s.day - c.upliftAt >= K.upliftEvery);
      if (thanks) { c.view += K.upliftTrust; c.upliftAt = s.day; }
      note(s, `You lifted the ${c.name}: schools, power, ideas${thanks ? (c.view >= 1 ? '. They are grateful' : c.view >= -2 ? '. It warms them to you a little' : '. It eases their fear a little') : ''}`, { civ: c.id, you: true, uplift: true });
    }
    if (kind === 'calm') s.bh.calm = Math.min(K.calmDays * 1.5, s.bh.calm + K.calmDays);   // calming again adds days
    if (kind === 'feed') { const take = R[0].gas * 0.5; R[0].gas -= take; s.bh.mass += take * 0.6; flare(s, true); }
    if (kind === 'merge') {
      s.companion.merged = true; s.companion.dist = 0;
      s.threats = s.threats.filter((x) => x.kind !== 'collide');
      R.forEach((x) => { x.stability = Math.max(0, x.stability - (x.ring === 3 ? 0.3 : 0.15)); if (x.ring === 3) { x.gas += 0.9; x.metals = Math.min(1, x.metals + 0.12); } });
      note(s, 'You merged the companion galaxy into your own', { you: true, merge: true });
    }
    // A beacon, one sheltered region at a time.
    const helped = new Set();                                   // peoples this act answered: no kindness noise for them
    if (kind === 'shelter') s.civs.forEach((c) => {
      if (!c.alive || !c.ask || c.ask.kind !== 'beacon' || !c.ask.regions.includes(regionId) || c.ask.done.includes(regionId)) return;
      c.ask.done.push(regionId); helped.add(c.id);
      if (c.ask.done.length < c.ask.regions.length) return;
      c.beacon = true; gain(s, c, 2); c.honoured++; c.ask = null; c.nextAsk = s.day + K.askEvery;
      note(s, `The ${c.name} lit their beacon. It will shine across the galaxy for a billion years`, { civ: c.id, you: true, answered: true, beacon: true });
      milestone(s, 'beacon', `A beacon: the ${c.name}`, true);
    });
    // A request answered.
    let answeredOne = false;
    s.civs.forEach((c) => {
      if (!c.alive || !c.ask || c.ask.kind === 'beacon' || c.ask.kind !== kind || (c.ask.region !== null && c.ask.region !== regionId)) return;
      if (forCiv !== undefined && c.id !== forCiv && kind !== 'calm') return;
      if (forCiv === undefined && answeredOne && kind !== 'calm') return;   // without a choice, the first in line (a calm core answers them all)
      answeredOne = true; helped.add(c.id);
      if (kind === 'seed' && c.ask.region !== null) R[c.ask.region].invite = c.id;   // you invited them in
      const sch = c.ask.schism && s.civs[c.ask.dispute].ask && s.civs[c.ask.dispute].ask.schism ? s.civs[c.ask.dispute] : null;
      const wasCold = c.view <= -2;   // wary or worse
      gain(s, c, wasCold ? 2 + K.forgive : 2); c.progress += 15 * (c.pace || 1);
      if (wasCold) note(s, `The ${c.name} begin to forgive you`, { civ: c.id, you: true });
      if (sch) { sch.ask = null; sch.nextAsk = s.day + K.askEvery; sch.view -= K.schismHit; note(s, `The ${sch.name} will not forget that you sided with the ${c.name}`, { civ: sch.id, grudge: true }); } c.honoured++; c.ask = null; c.nextAsk = s.day + K.askEvery;
      note(s, `You answered the ${c.name}`, { civ: c.id, you: true, answered: true });
      const rv = rivalOf(s, c);
      if (rv && rv.aware) { rv.view -= K.rivalHit; note(s, `The ${rv.name} resent the help you gave their rivals, the ${c.name}`, { civ: rv.id, rival: true }); }
      // Another people wanted that region too.
      if (kind === 'seed') s.civs.forEach((o) => {
        if (o === c || !o.alive || !o.aware || !o.regions.some((id) => R[id].n.includes(regionId))) return;
        if (o.ask && o.ask.region === regionId) { o.ask = null; o.nextAsk = s.day + K.askEvery; o.view -= 1.5; note(s, `The ${o.name} will remember you chose the ${c.name}`, { civ: o.id, grudge: true }); }
        o.view -= 0.5; note(s, `The ${o.name} wanted ${regionName(R[regionId])} too`, { civ: o.id, rival: true });
      });
    });
    // The civilisations it touched remember.
    if (g && g.civ !== null && HELPS[kind] !== undefined && !helped.has(g.civ)) {
      const c = s.civs[g.civ];
      const text = { seed: `You sent gas to the ${c.name}`, shelter: `You sheltered the ${c.name}`, starburst: `The starburst you triggered ${c.tech >= 3 ? 'fed the colonies of' : 'shook'} the ${c.name}` }[kind];
      // A kindness: shelter or gas for one of their regions, unasked. They notice one every 20 days.
      let kindNote = '';
      if (K.kindTrust && (kind === 'shelter' || kind === 'seed') && c.aware) {
        if (kindReady(s, c)) { const was = coolsIn(s, c); c.view += K.kindTrust; c.kindAt = s.day; if (c.view >= 1) c.thin = false; kindNote = c.view >= K.concordView ? `: a kindness they notice (their trust holds ${days(coolsIn(s, c))} now)` : ': a kindness they notice'; }
        else kindNote = ` (a kind gesture ${days(s.day - c.kindAt)} ago is still fresh: they notice one every ${K.kindEvery} days)`;
      }
      if (text) note(s, text + kindNote, { civ: c.id, you: true, kind: kindNote.startsWith(':') });
      c.view += HELPS[kind];
    }
    return { ok: true };
  }
  const viewOf = (c) => (!c.aware ? 'Unaware' : c.view >= 3 ? 'Reverent' : c.view >= 1 ? 'Grateful' : c.view > -2 ? 'Curious' : c.view > -4 ? 'Wary' : 'Fearful');
  const stage = (c) => STAGES[c.tech];
  function develop(c) {
    if (c.tech >= 3) return 3 + Math.min(1.5, (c.progress - STAGE_AT[3]) / 260 + Math.max(0, c.regions.length - 2) * 0.04);
    return c.tech + Math.max(0, Math.min(0.99, (c.progress - STAGE_AT[c.tech]) / (STAGE_AT[c.tech + 1] - STAGE_AT[c.tech])));
  }

  // A summary a page can turn into galaxy settings (how the galaxy should look today).
  function look(s) {
    const R = s.regions;
    const sum = (k) => R.reduce((a, g) => a + g[k], 0);
    const young = sum('young'), sun = sum('sunlike'), gas = sum('gas');
    return {
      youngFrac: young / Math.max(1e-6, young + sun * 0.05),
      gas, stars: young + sun, metals: sum('metals') / R.length,
      unrest: 1 - sum('stability') / R.length, bh: s.bh.mass,
    };
  }

  // ---- advice: the coach, as rules over the state (shared by the page and the checker) ---------
  const THREATS = {
    nova: { name: 'Supernova', answer: 'shelter' }, grb: { name: 'Gamma-ray burst', answer: 'shelter' },
    flare: { name: 'Black hole flare', answer: 'calm' }, collide: { name: 'Companion galaxy', answer: 'merge' },
  };
  // Whether a threat is already answered: the region sheltered past the strike, the core calmed past it.
  function guarded(s, x) {
    const left = x.at - s.day;
    if (x.kind === 'flare') return s.bh.calm > left;
    if (x.kind === 'collide') return false;
    const g = s.regions[x.region];
    return g.shelter > left || (g.civ === null && (g.worlds === 0 || (g.life < 0.05 && g.hab < 0.3)));
  }
  const named = regionName;
  // Every warning and request, most urgent first, each with its answer.
  function alerts(s) {
    const out = [];
    s.threats.forEach((x) => {
      const g = x.region === null ? null : s.regions[x.region], left = x.at - s.day, ok = guarded(s, x);
      const where = x.kind === 'flare' ? 'the core' : g ? named(g) : 'your galaxy';
      const who = g && g.civ !== null ? ` · the ${s.civs[g.civ].name}` : '';
      const text = { nova: `Supernova in ${where}${who}`, grb: `Gamma-ray burst at ${where}${who}`, flare: 'Black hole flare', collide: 'The companion galaxy is falling in' }[x.kind];
      // A burst hits the neighbours too: the answer points at the next region still exposed.
      const region = x.kind === 'nova' || x.kind === 'grb' ? x.region : undefined;
      out.push({ threat: x.kind, left, text, ok, kind: THREATS[x.kind].answer, region, select: g ? g.id : 0 });
    });
    s.civs.forEach((c) => {
      if (!c.alive || !c.ask) return;
      if (c.ask.kind === 'beacon') {
        const next = c.ask.regions.find((id) => !c.ask.done.includes(id));
        out.push({ civ: c.id, beacon: true, left: c.ask.until - s.day, text: `${c.ask.text} (${c.ask.done.length} of ${c.ask.regions.length})`, ok: false, kind: 'shelter', region: next, select: next });
      } else if (c.ask.dispute !== undefined && c.ask.dispute < c.id && s.civs[c.ask.dispute].ask && s.civs[c.ask.dispute].ask.dispute === c.id) return;   // shown with its pair
      else if (c.ask.dispute !== undefined && s.civs[c.ask.dispute].ask && s.civs[c.ask.dispute].ask.dispute === c.id) {
        const o = s.civs[c.ask.dispute];
        out.push({ civ: o.id, rival: c.id, dispute: true, left: c.ask.until - s.day, text: c.ask.schism ? `A schism over ${named(s.regions[c.ask.region])}: the ${o.name} and the ${c.name} each demand your side` : `The ${o.name} and the ${c.name} both want ${named(s.regions[c.ask.region])}`, ok: false, kind: c.ask.kind, region: c.ask.region, select: c.ask.region });
      } else out.push({ civ: c.id, left: c.ask.until - s.day, text: c.ask.text + (c.ask.kind === 'calm' && s.threats.some((x) => x.kind === 'flare') ? '. A flare is coming: calming answers both' : ''), ok: false, kind: c.ask.kind, region: c.ask.region === null ? undefined : c.ask.region, select: c.home });
    });
    if (s.omen) out.push({ omen: true, left: s.omen.until - s.day, text: s.omen.title, ok: false, select: s.omen.options[0].fx[1] });
    return out.sort((a, b) => (a.ok - b.ok) || (a.left - b.left));
  }
  // One next step: { rule, text, kind?, region? }. After the opening the coach steps back: warnings,
  // requests and disputes keep their answers, but routine moves (where to shelter next) become hints,
  // and the choice is the player's.
  const ROUTINE = ['life', 'green', 'nursery', 'golden', 'full', 'shaken'], OPENING = ['forge', 'merge', 'settle'];
  function advise(s, o) {
    const a = adviseAll(s, o || {});
    if (((o && o.veteran) ? (ROUTINE.includes(a.rule) || OPENING.includes(a.rule)) : month(s) >= K.coachSteps && ROUTINE.includes(a.rule)) && a.kind && s.influence < K.influenceMax - 0.5) return Object.assign({}, a, { hint: true, text: a.text.replace(/^/, 'A thought: ') });
    return a;
  }
  // Trust about to cool in the concord's circle. Peoples you can help now come first; the concord is
  // named only when losing them would break it.
  function trustAdvice(s, R) {
    if (month(s) < K.concordTalk || s.concord !== undefined) return null;
    const c = circle(s), fading = c.trusted.filter((x) => coolsIn(s, x) <= K.thinDays && coolsIn(s, x) < YEAR - s.day).sort((a, b) => (kindReady(s, b) - kindReady(s, a)) || (coolsIn(s, a) - coolsIn(s, b)));
    const f = fading[0];
    if (!f) return null;
    const breaks = c.ready && c.trusted.length - 1 < c.need, critical = breaks || coolsIn(s, f) <= 7;
    if (!kindReady(s, f)) return { rule: 'trust', critical: false, text: `The ${f.name} will cool in ${days(coolsIn(s, f))}${breaks ? ', and the concord with them' : ''}. Their next kindness counts in ${days(K.kindEvery - (s.day - f.kindAt))}; until then, answer their requests or shield them.` };
    const g = f.regions.map((id) => R[id]).sort((a, b) => a.shelter - b.shelter)[0];
    return { rule: 'trust', critical, text: `The ${f.name} will cool in ${days(coolsIn(s, f))}${breaks ? ', and the concord with them' : ''}. Shelter ${named(g)}, one of their regions: a kindness they notice.`, kind: 'shelter', region: g.id };
  }
  function adviseAll(s, o) {
    const R = s.regions, m = month(s);
    const free = (g) => g.ring > 0 && g.civ === null && !(g.invite !== undefined && g.invite !== null);   // not given away
    const bursts = s.actions.filter((a) => a.kind === 'starburst').length;
    const cap = (t) => t.replace(/^t/, 'T');
    const list = alerts(s);
    if (s.day >= YEAR) return { rule: 'over', text: 'The year is over. Look around, or start a new galaxy.' };
    const matters = (a) => a.kind !== 'shelter' || a.region === undefined || (() => { const g = R[a.region]; return g.civ !== null || (g.worlds > 0 && (g.life > 0.05 || g.hab > 0.3)); })();
    // Whatever runs out first, warning or request.
    const urgent = list.find((a) => !a.ok && !a.omen && a.left <= (a.threat && a.region !== undefined && R[a.region].civ !== null ? 16 : 12) && (a.civ !== undefined || matters(a)));
    if (urgent && urgent.threat) return { rule: 'warning', text: `${urgent.text}: ${days(urgent.left)} left. ${urgent.kind === 'calm' ? 'Calm the core before it hits.' : urgent.kind === 'merge' ? 'Merge it now, on your terms.' : 'Shelter it and it will barely notice.'}`, kind: urgent.kind, region: urgent.region };
    // A dispute is the player's call: the coach explains it and leaves both answers in the list.
    const disputed = list.find((a) => !a.ok && a.civ !== undefined && s.civs[a.civ].ask && s.civs[a.civ].ask.dispute !== undefined && s.civs[s.civs[a.civ].ask.dispute].ask);
    if (disputed && (!urgent || urgent.civ !== undefined)) {
      const c = s.civs[disputed.civ], o = s.civs[c.ask.dispute];
      return { rule: 'dispute', text: `A dispute: the ${c.name} and the ${o.name} both want ${named(R[c.ask.region])}. Side with one and they settle it; the other will be hurt. Your call, at the top of the screen: the costs in trust are shown there.` };
    }
    if (s.omen) return { rule: 'omen', text: `${s.omen.title}. Your choice, at the top of the screen: it costs nothing, and it passes in ${days(s.omen.until - s.day)}.` };
    if (urgent) return { rule: 'request', text: `${urgent.text}. ${days(urgent.left)} left to answer.`, kind: urgent.kind, region: urgent.region };
    if (!o.noStardust && s.sparks.some((x) => (x.from || 0) <= s.day) && s.influence < K.influenceMax - 1) return { rule: 'stardust', text: `Tap the golden stardust ✦ on the map: +${K.sparkGain} influence each, before it fades.${s.day < 40 ? ' Supernovae leave it behind.' : ''}` };
    if (m < 1.6 && bursts < 3 && R.some((x) => free(x) && x.gas > 0.3 && !x.n.some((n) => R[n].civ !== null))) {
      const g = R.filter((x) => free(x) && x.gas > 0.3 && !x.n.some((n) => R[n].civ !== null)).sort((a, b) => (b.gas + (b.worlds ? 0 : 0.6) + b.n.reduce((x, n) => x + R[n].worlds, 0) * 0.08) - (a.gas + (a.worlds ? 0 : 0.6) + a.n.reduce((x, n) => x + R[n].worlds, 0) * 0.08))[0];
      return { rule: 'forge', text: `Life needs heavy elements, and only dying stars make them. Starburst ${named(g)} while nothing lives there yet${g.worlds ? '' : ': it has no worlds of its own, and its metals will drift into the worlds next door'}. (${bursts} of 3 done)`, kind: 'starburst', region: g.id };
    }
    if (!s.companion.merged && m >= 2) return { rule: 'merge', text: `Merge the companion galaxy now: it brings the metals the outer ring is missing. Wait, and it crashes in on its own at the start of month ${collideMonth(s)}.`, kind: 'merge' };
    { const tr = trustAdvice(s, R); if (tr) return tr; }
    const asked = list.find((a) => !a.ok && a.civ !== undefined);
    if (asked) return { rule: 'request', text: `${asked.text}. Answering makes them grateful, and speeds them up${((rv) => (rv && rv.aware ? `; their rivals the ${rv.name} will resent it` : ''))(rivalOf(s, s.civs[asked.civ]))}.`, kind: asked.kind, region: asked.region };
    { const tr = trustAdvice(s, R); if (tr && tr.critical) return tr; }
    if (m >= K.concordTalk && s.concord === undefined) {
      const c = circle(s), need = K.concordMin;
      if (!c.ready) {
        const few = c.members.length < need;
        // Too few in contact: gas for an empty region between the group and someone outside it.
        const inGroup = new Set(c.members.map((x) => x.id));
        const bridge = few && R.find((g) => g.ring && g.civ === null && g.worlds > 0 && g.life < 0.1 && g.n.some((n) => inGroup.has(R[n].civ)) && g.n.some((n) => R[n].civ !== null && !inGroup.has(R[n].civ)));
        const reach = !bridge && R.filter((g) => g.ring && g.civ === null && g.worlds > 0 && g.life < 0.1 && g.n.some((n) => inGroup.has(R[n].civ))).sort((a, b) => b.hab - a.hab)[0];
        const spot = bridge || reach;
        // Seeded lately: more gas won't hurry them; say so rather than ask for it again.
        const waiting = spot && spot.seededAt !== undefined && s.day - spot.seededAt < 60;
        if (few && waiting) return { rule: 'concord', text: `The concord needs ${need} civilisations in contact; the biggest group has ${c.members.length}. You seeded ${named(spot)}: the peoples beside it will settle it in their own time (some spread every few weeks, others rarely). Meanwhile, answer their requests.` };
        if (few) return { rule: 'concord', text: `The concord needs ${need} civilisations in contact; the biggest group has ${c.members.length}. ${bridge ? `Seed ${named(bridge)}: whoever settles it will bring the peoples on either side together.` : reach ? `Seed ${named(reach)}, beside them: settling it carries them further out, toward others.` : 'Help them spread: answer their requests to settle new regions.'}`, kind: spot ? 'seed' : undefined, region: spot ? spot.id : undefined };
        const doubt = c.members.filter((x) => x.aware && !c.trusts(x)).sort((a, b) => b.view - a.view)[0];   // only peoples who can see you can come round
        const help = false;   // routine care doesn't buy trust: answers and shields do
        return { rule: 'concord', text: `The concord needs ${c.need} grateful peoples; ${c.trusted.length === 1 ? 'one is' : c.trusted.length + ' are'}. ${doubt ? `The ${doubt.name} are closest: answer their next request, and shield them when a warning comes.` : 'Answer requests and shield them from warnings.'}`, kind: help ? 'shelter' : undefined, region: help ? doubt.home : undefined };
      }
    }
    const civ = s.civs.find((c) => c.alive && R[c.home].shelter <= 0 && R[c.home].stability < 0.7);
    if (civ) return { rule: 'shaken', text: `The ${civ.name} are shaken. Shelter their home before they collapse.`, kind: 'shelter', region: civ.home };
    const toStorm = Math.round(K.stormAt * MONTH) - s.day, need = 2 * Math.min(K.stormSize, s.civs.filter((c) => c.alive).length);
    if (toStorm > 0 && toStorm <= 30 && s.influence < need) return { rule: 'reserve', text: `The storm comes in about ${days(toStorm)}: save ${need} influence to shelter the homes in its path (you have ${s.influence.toFixed(1)}).` };
    if (YEAR - s.day <= 10) return { rule: 'end', text: 'The last days of the year. Keep the peoples safe and their trust warm: the concord is decided on the final day.' };
    if (m >= K.beaconFrom && s.influence < 5) return { rule: 'reserve', text: 'Keep influence in reserve: late in the year warnings, requests and beacons come thick and fast.' };
    // Influence and the bank both full: every day's income is lost. Uplift always helps someone.
    if (s.influence >= K.influenceMax - 0.05 && (s.bank || 0) >= K.bankMax - 0.1 && m >= 1) {
      const ch = s.challenge && !s.challenge.done && s.challenge.id === 'stage';
      const up = s.civs.filter((c) => c.alive && c.tech < 3).sort((a, b) => develop(a) - develop(b))[0] || s.civs.filter((c) => c.alive).sort((a, b) => develop(a) - develop(b))[0];
      if (up) return { rule: 'brim', text: `Influence and the bank are both full: what you earn now is lost. ${ch ? 'For the challenge, uplift' : 'Uplift'} the ${up.name}: they develop faster, and their world shows it.`, kind: 'uplift', region: up.home };
    }
    const life = R.filter((g) => free(g) && g.life > 0.04 && g.shelter <= 0).sort((a, b) => b.life - a.life)[0];
    if (life) return { rule: 'life', text: `${life.life > 0.3 ? 'Life is growing' : 'Life is stirring'} in ${named(life)} (the pulsing ring). Shelter it and it will grow faster.`, kind: 'shelter', region: life.id };
    const green = R.filter((g) => free(g) && g.worlds > 0 && g.hab > K.lifeOn * 0.6 && g.shelter <= 0).sort((a, b) => (b.hab + b.worlds * 0.3) - (a.hab + a.worlds * 0.3))[0];
    if (green) return { rule: 'green', text: `${cap(named(green))} is ${green.hab > K.lifeOn ? 'habitable' : 'nearly habitable'}, with ${green.worlds} ${green.worlds === 1 ? 'world' : 'worlds'} (the dots). Shelter it: each shelter makes life there grow faster for good.`, kind: 'shelter', region: green.id };
    // Nurseries away from peoples' homes first: life beside a home joins that people.
    const homeBeside = (g) => R.find((x) => x.civ !== null && x.n.includes(g.id) && s.civs[x.civ].home === x.id);
    const nursery = R.filter((g) => free(g) && g.worlds >= 2 && g.shelter <= 0).sort((a, b) => (b.worlds * 2 + b.metals + b.hab - (homeBeside(b) ? 1.5 : 0)) - (a.worlds * 2 + a.metals + a.hab - (homeBeside(a) ? 1.5 : 0)))[0];
    const by = nursery && homeBeside(nursery);
    if (nursery && s.influence >= 4) return { rule: 'nursery', text: `Prepare a nursery: ${named(nursery)} has ${nursery.worlds} worlds (the dots). Shelter it now and the nurture it builds will speed up life there later.${by ? ` It borders the ${s.civs[by.civ].name}'s home: its life will join them, unless you shelter it about four times and keep it sheltered when it wakes.` : ' Nothing borders it: its life will become a people of its own.'}`, kind: 'shelter', region: nursery.id };
    if (m < 3) return { rule: 'settle', text: 'Let the galaxy settle, and keep some influence for warnings. Green regions with worlds (the white dots) are where life will start.' };
    // Spare influence late: help a big civilisation toward its golden age (four regions in a long calm).
    if (s.influence >= 6) {
      const big = s.civs.filter((c) => c.alive && !c.golden && c.regions.length >= 4).sort((a, b) => b.regions.length - a.regions.length)[0];
      const weak = big && big.regions.map((id) => R[id]).filter((g) => g.shelter <= 0).sort((a, b) => a.stability - b.stability)[0];
      if (weak) return { rule: 'golden', text: `The ${big.name} hold ${big.regions.length} regions. A golden age needs four, all in a long calm: shelter ${named(weak)}, the least calm of theirs.`, kind: 'shelter', region: weak.id };
      const spare = R.filter((g) => free(g) && g.worlds > 0 && g.shelter <= 0).sort((a, b) => (b.hab + b.worlds * 0.3) - (a.hab + a.worlds * 0.3))[0];
      if (spare && s.influence >= K.influenceMax - 1) return { rule: 'full', text: `Influence is nearly full. ${cap(named(spare))} has ${spare.worlds} ${spare.worlds === 1 ? 'world' : 'worlds'}: shelter it so life can start there too.`, kind: 'shelter', region: spare.id };
    }
    const next = list.find((a) => !a.ok);
    if (next) return { rule: 'idle', text: `Next: ${next.text.replace(/^./, (x) => x.toLowerCase())}, in ${days(next.left)}. Keep ${K.cost[next.kind] || 2} influence for it.` };
    return { rule: 'idle', text: 'All in hand. Tap a civilisation to read its story, or a region to see what it needs.' };
  }

  const Sim = { YEAR, MONTH, K, create, step, act, alerts, advise, guarded, THREATS, month, gyr, era, habit, viewOf, stage, regionName, regionKind, look, legacy, legacyParts, stars, STARS, STAGES, circle, income, concordWorth, fate, coolsIn, kindReady, TRAITS, rivalOf, develop, collideMonth, spendable };
  if (typeof module !== 'undefined' && module.exports) module.exports = Sim; else root.Sim = Sim;
})(typeof window !== 'undefined' ? window : this);
