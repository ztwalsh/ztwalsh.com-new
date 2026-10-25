/* Galaxy Creator playground kit: connects to the live galaxy (../index.html?embed)
   and builds the shared controls, following MOTION.md. Prototypes decide where
   the controls live and how they open; the controls themselves come from here. */
(function () {
  'use strict';
  // The shared pieces (icons, motion, toast, theme, easing) and the controls come from ui.js.
  const { clamp, EASE, still, ICON, swapHTML, rollText, morphHeight, leave, enter, toast, pillTrack, tooltips, roving, theme, setTheme } = UI;
  // Create galaxy leads the rail; Settings sits with the actions at the bottom.
  const CATS = [
    { id: 'create', label: 'Create galaxy', hint: 'A new one, or a surprise' },
    { id: 'galaxy', label: 'Structure', hint: 'Type and shape' },
    { id: 'matter', label: 'Stars & gas', hint: 'What it is made of' },
    { id: 'motion', label: 'Motion', hint: 'Spin, drift, zoom' },
    { id: 'light', label: 'Light', hint: 'Exposure and lens' },
    { id: 'colour', label: 'Color', hint: 'Palettes and inks' },
  ];

  // ---- snapping: grab the galaxy alone and hand it to the viewer ---------------------------
  function flash() {
    let f = document.getElementById('flash');
    if (!f) { f = document.createElement('div'); f.id = 'flash'; document.body.append(f); }
    f.animate(still() ? [{ opacity: 0.25 }, { opacity: 0 }] : [{ opacity: 0.55 }, { opacity: 0 }], { duration: still() ? 160 : 420, easing: EASE.exit });
  }
  async function download(blob, name) {
    // Inside the claude.ai viewer the page offers the file and the viewer confirms; elsewhere a link will do.
    const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
    if (dl) { await dl.save({ filename: name, data: blob }); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  let shotN = 0;
  async function shoot(G) {
    flash();
    const blob = await G.snap();
    if (!blob) throw new Error('could not encode');
    const n = String(++shotN).padStart(2, '0');
    await download(blob, `galaxy-${String(G.state.type).toLowerCase()}-${G.state.seed}-${n}.png`);
  }

  // ---- the galaxy ---------------------------------------------------------------------
  function connect(frame) {
    return new Promise((resolve) => {
      const tryNow = () => {
        try { const g = frame.contentWindow && frame.contentWindow.galaxy; if (g) { resolve(g); return true; } } catch (e) {}
        return false;
      };
      if (tryNow()) return;
      frame.addEventListener('load', () => { const iv = setInterval(() => { if (tryNow()) clearInterval(iv); }, 50); });
    });
  }

  const views = new Set();   // rendered controls that re-read state on refresh()
  function refresh(G) { views.forEach((v) => v(G)); }

  // The galaxy's sliders, typeSeg and switches: UI controls bound to G and kept in step by refresh().
  function slider(G, key) {
    const d = G.sliders.find((x) => x.key === key);
    const el = UI.slider({
      label: d.label, min: d.min, max: d.max, step: d.step, format: d.format,
      get: () => G.state[key], set: (v) => G.set(key, v), reset: () => G.base[key],
      off: key === 'arms' || key === 'twist' ? () => !['Spiral', 'Barred', 'Cycle'].includes(G.state.type) : undefined,
    });
    views.add(el.sync);
    return el;
  }

  function typeSeg(G) {
    const el = UI.segmented({ label: 'Galaxy type', options: G.types.filter((t) => t !== 'Cycle').map((t) => [t, t]), fit: true, get: () => G.state.type, onChange: (t) => { G.setType(t); refresh(G); } });
    views.add(() => el.sync(true));
    return el;
  }

  // Style: the telescope the galaxy is seen through. Switching brings that look's palette.
  function lookSeg(G) {
    const el = UI.segmented({ label: 'Style', options: [['Webb', 'James Webb'], ['Hubble', 'Hubble']], get: () => G.state.look, onChange: (v) => { G.setLook(v); refresh(G); } });
    views.add(() => el.sync(true));
    return el;
  }

  function switchEl(G, id, label) {
    const keyOf = { spikes: 'spikes', companions: 'companions', caps: 'captions' };
    const el = UI.toggle({ label, get: () => G.state[keyOf[id]], onChange: () => G.toggle(id) });
    views.add(el.sync);
    return el;
  }

  const swatchStyle = (p) => `background: radial-gradient(circle at 50% 50%, ${p.old} 0 18%, ${p.young} 38%, ${p.gasA} 62%, ${p.gasB} 100%)`;
  function colourControls(G) {
    const wrap = document.createElement('div'); wrap.className = 'ctl';
    const LABELS = { old: 'Old stars', young: 'Young stars', gasA: 'Gas', gasB: 'Gas, second' };
    const sw = UI.swatches({ items: Object.keys(G.presets).map((n) => ({ id: n, label: n + ' palette', style: swatchStyle(G.presets[n]) })), get: () => G.state.preset, onPick: (n) => { G.setPreset(n); picks.sync(); } });
    const picks = UI.colorPicks({ items: Object.keys(LABELS).map((k) => ({ id: k, label: LABELS[k] })), get: (k) => G.state[k], onInput: (k, v) => { G.setColour(k, v); sw.sync(); } });
    views.add(() => { sw.sync(); picks.sync(); });
    wrap.append(sw, picks);
    return wrap;
  }

  function createControls(G) {
    const wrap = document.createElement('div'); wrap.className = 'pair';
    const twirl = (b) => { const ic = b.querySelector('svg'); if (ic && !still()) ic.animate([{ transform: 'rotate(0deg) scale(0.8)' }, { transform: 'rotate(360deg) scale(1)' }], { duration: 600, easing: EASE.pop }); };
    wrap.append(
      UI.button({ icon: 'seed', label: 'New seed', onClick: (e) => { twirl(e.currentTarget); G.reseed(); refresh(G); toast('Seed #' + G.state.seed, 'seed'); } }),
      UI.button({ icon: 'dice', label: 'Surprise', onClick: (e) => {
        twirl(e.currentTarget); G.surprise(); refresh(G);
        toast(`${G.typeNames[Math.max(0, G.types.indexOf(G.state.type))]} · ${G.state.preset}`, 'dice');
      } }));
    return wrap;
  }

  const choice = (label, opts, get, set) => UI.segmented({ label, options: opts, get, onChange: set });
  const label = UI.label;
  const button = (icon, text, variant) => UI.button({ icon, label: text, variant });
  const setButton = (b, icon, text) => b.setContent(icon, text);

  // Sharing: a link to exactly this galaxy, copied from the rail or with L.
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
    const t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(t); t.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    t.remove();
    return ok;
  }
  async function copyLink(G) {
    if (await copyText(G.link())) toast('Link copied', 'tick');
    else toast('Could not copy the link');
  }
  const pref = (k, v) => { try { if (v === undefined) return localStorage.getItem('galaxy-share-' + k); localStorage.setItem('galaxy-share-' + k, v); } catch (e) {} return null; };
  // The camera's card: stills at screen size or far bigger, and loops.
  function captureControls(G) {
    const wrap = document.createElement('div'); wrap.className = 'ctl';

    // Stills: the screen as it is (what S snaps), or the long edge at 4K, 6K or 8K, framed the same.
    const EDGES = [['screen', 'Screen']].concat([['3840', '4K'], ['6144', '6K'], ['7680', '8K']].filter(([v]) => +v <= (G.maxEdge || 16384)));
    let edge = EDGES.some(([v]) => v === pref('edge')) ? pref('edge') : 'screen';
    const image = button('camera', 'Save image', 'primary');
    let rendering = false;
    image.addEventListener('click', async () => {
      if (rendering) return;
      if (edge === 'screen') {
        try { await shoot(G); toast('Snapped', 'tick'); } catch (e) { if (!(e && e.code === 'declined')) toast('Could not save the image'); }
        return;
      }
      rendering = true;
      setButton(image, 'spin', 'Rendering');
      try {
        flash();
        const { blob, w, h } = await G.exportImage(+edge);
        await download(blob, `galaxy-${String(G.state.type).toLowerCase()}-${G.state.seed}-${w}x${h}.png`);
        toast(`Saved ${w} × ${h}`, 'tick');
      } catch (e) {
        if (!(e && e.code === 'declined')) toast(e && e.code === 'size' ? 'Too big for this device' : 'Could not save the image');
      }
      setButton(image, 'camera', 'Save image');
      rendering = false;
    });

    // Loops: one full turn of the camera, in 10, 20 or 30 seconds.
    let secs = ['10', '20', '30'].includes(pref('loop')) ? pref('loop') : '20';
    const loop = button('record', 'Record loop');
    let recording = false;
    loop.addEventListener('click', async () => {
      if (recording) { G.cancelLoop(); return; }
      recording = true;
      loop.classList.add('busy');
      loop.innerHTML = '<i class="bar"></i>' + ICON.stop + '<span>Recording</span>';
      const span = loop.lastChild;
      try {
        const { blob, ext } = await G.recordLoop(+secs, (k) => { loop.style.setProperty('--p', k); span.textContent = `Recording ${Math.floor(k * 100)}%`; });
        await download(blob, `galaxy-${String(G.state.type).toLowerCase()}-${G.state.seed}-loop-${secs}s.${ext}`);
        toast('Loop saved', 'tick');
      } catch (e) {
        const why = { cancelled: 'Recording stopped', hidden: 'Stopped: the tab was hidden', unsupported: 'This browser cannot record video', declined: '' }[e && e.code];
        if (why !== '') toast(why || 'Could not save the loop');
      }
      loop.classList.remove('busy'); loop.style.removeProperty('--p');
      setButton(loop, 'record', 'Record loop');
      recording = false;
    });
    const loops = G.canLoop && G.canLoop();

    wrap.append(
      label('Image'), choice('Image size', EDGES, () => edge, (v) => { edge = v; pref('edge', v); }), image,
      ...(loops ? [label('Loop · one full turn'), choice('Loop length', [['10', '10 s'], ['20', '20 s'], ['30', '30 s']], () => secs, (v) => { secs = v; pref('loop', v); }), loop] : []),
      ...(loops && G.music && G.music.available ? [videoMusicSwitch(G)] : []));
    return wrap;
  }

  // Settings: the share link, appearance, captions, and every key command, one per line.
  const KEYS = [
    ['Snap an image', ['S']],
    ['Copy share link', ['L']],
    ['Galaxy only', ['⌘', '.']],
    ['Hide tools', ['H']],
    ['Pause', ['Space']],
    ['New seed', ['R']],
    ['Front, side, top', ['1', '3', '7']],
    ['Turn 15°', ['2', '4', '6', '8']],
    ['Reset view', ['Home']],
    ['Orbit', ['Drag']],
    ['Pan', ['Shift', 'Drag']],
    ['Zoom', ['Scroll']],
    ['Close a tool', ['Esc']],
    ['Create or Direct', ['Tab']],
    ['Keyframe, in Direct', ['K']],
    ['Play the shot', ['Space']],
    ['Preview the shot', ['P']],
  ];
  function settingsControls(G) {
    const wrap = document.createElement('div'); wrap.className = 'ctl';
    const seg = UI.segmented({ label: 'Appearance', options: [['light', 'Light'], ['dark', 'Dark'], ['system', 'System']], get: theme, onChange: setTheme });
    const keys = UI.keys(KEYS);
    const link = button('link', 'Copy share link', 'primary');
    link.addEventListener('click', () => copyLink(G));
    const sound = G.music && G.music.available ? [label('Sound'), musicSwitch(G), videoMusicSwitch(G)] : [];
    wrap.append(label('Share'), link, label('Appearance'), seg, switchEl(G, 'caps', 'Captions on screen'), ...sound, label('Keys'), keys);
    return wrap;
  }

  // Music: a preference of this browser, not part of the galaxy or its share link.
  const musicSwitch = (G) => UI.toggle({ label: 'Music', get: () => G.music.on, onChange: (v) => G.music.set(v) });
  // Music in exported videos (loops and Direct shots); on by default, even with Music off.
  const videoMusicSwitch = (G) => { const el = UI.toggle({ label: 'Music in videos', get: () => G.music.inVideo, onChange: (v) => G.music.setInVideo(v) }); views.add(el.sync); return el; };

  // The controls for one category.
  function section(G, id) {
    const box = document.createElement('div'); box.className = 'ctl';
    const add = (...els) => els.forEach((e) => box.append(e));
    if (id === 'galaxy') add(typeSeg(G), ...['arms', 'twist', 'core', 'spread', 'halo', 'hole'].map((k) => slider(G, k)));
    if (id === 'matter') add(...['stars', 'size', 'nebula', 'dust', 'clump', 'form'].map((k) => slider(G, k)));
    if (id === 'motion') add(...['spin', 'orbit', 'zoom'].map((k) => slider(G, k)));
    if (id === 'light') add(lookSeg(G), ...['bright', 'bloom', 'sat', 'sky'].map((k) => slider(G, k)), switchEl(G, 'spikes', 'Diffraction spikes'), switchEl(G, 'companions', 'Companion galaxies'));
    if (id === 'colour') add(colourControls(G));
    if (id === 'create') add(createControls(G));
    if (id === 'settings') add(settingsControls(G));
    if (id === 'capture') add(captureControls(G));
    return box;
  }

  // Is the user typing into a field? Then keys are text, not commands.
  const typing = (t) => !!t && (t.isContentEditable || t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && !/^(range|color|checkbox|radio|button|submit)$/i.test(t.type)));
  // Keyboard: the galaxy hands its keys up to us; we handle the ones the
  // prototype doesn't, and toast the camera views.
  const VIEW_NAMES = { 1: ['Front view', 'Back view'], 3: ['Right view', 'Left view'], 7: ['Top view', 'Bottom view'], 9: ['Other side', 'Other side'], 0: ['Home view', 'Home view'], 5: ['Home view', 'Home view'] };
  function bindKeys(G, handlers) {
    const onKey = (e) => {
      // ⌘. (Ctrl+. elsewhere): everything off the screen but the galaxy.
      if ((e.metaKey || e.ctrlKey) && (e.key === '.' || e.code === 'Period')) { if (handlers && handlers.bare) handlers.bare(); return; }
      if (e.metaKey || e.altKey) return;
      const k = (e.key || '').toLowerCase();
      if (handlers && handlers.key && handlers.key(e) === true) return;
      if (k === 's' && !e.ctrlKey && handlers && handlers.snap) { handlers.snap(); return; }
      if (k === 'l' && !e.ctrlKey) { copyLink(G); return; }
      if (k === 'h' && handlers && handlers.hide) { handlers.hide(); return; }
      if (k === 'escape' && handlers && handlers.escape) { handlers.escape(); return; }
      if (e.key === ' ') { const p = G.pause(); toast(p ? 'Paused' : 'Playing', p ? 'pause' : 'play'); return; }
      if (k === 'r' && !e.ctrlKey) { G.reseed(); refresh(G); toast('Seed #' + G.state.seed, 'seed'); return; }
      const m = /^(?:Numpad|Digit)([0-9])$/.exec(e.code || '');
      if (G.view(e)) {
        if (m && VIEW_NAMES[m[1]]) toast(VIEW_NAMES[m[1]][e.ctrlKey ? 1 : 0], 'view');
        if (e.key === 'Home') toast('Home view', 'view');
        refresh(G);
      }
    };
    window.addEventListener('message', (ev) => { if (ev.data && ev.data.type === 'galaxy-key') onKey(ev.data); });
    document.addEventListener('keydown', (e) => {
      const t = e.target;
      const bareKey = (e.metaKey || e.ctrlKey) && (e.key === '.' || e.code === 'Period');
      if (bareKey) e.preventDefault();
      if (!bareKey && typing(t) && e.key !== 'Escape') return;   // typing a name: no shortcuts
      if (!bareKey && t && (t.tagName === 'INPUT' || t.getAttribute('role') === 'slider') && e.key !== 'h' && e.key !== 'Escape') return;
      if (e.key === ' ') e.preventDefault();
      onKey(e);
    });
    // Zoom also changes from the scroll wheel inside the galaxy.
    (function poll() { refresh(G); setTimeout(poll, 400); })();
  }

  function backbar(name) {
    const b = document.createElement('div');
    b.className = 'backbar';
    b.innerHTML = `<a href="./">← Playground</a><span>·</span><span></span>`;
    b.lastChild.textContent = name;
    document.body.append(b);
  }

  window.Kit = { UI, ICON, CATS, EASE, still, clamp, typing, theme, setTheme, flash, download, shoot, copyLink, swapHTML, rollText, morphHeight, leave, enter, toast, pillTrack, tooltips, roving, connect, refresh, slider, typeSeg, switchEl, section, bindKeys, backbar };
})();
