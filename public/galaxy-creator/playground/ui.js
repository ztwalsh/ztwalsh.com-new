/* Galaxy Creator UI: the component library. Icons, motion helpers, theme, easing,
   and the controls every surface is built from (buttons, chips, segmented controls,
   switches, sliders, swatches, panels, menus, the curve editor, the toast). Nothing
   here knows about the galaxy; kit.js and director.js wire these to it. The styles
   live in kit.css and director.css; design/index.html shows them all. */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const EASE = { snappy: cssVar('--spring-snappy'), pop: cssVar('--spring-pop'), smooth: cssVar('--spring-smooth'), exit: cssVar('--ease-exit') };
  const still = () => (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || !Element.prototype.animate;

  const svg = (body, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"${extra || ''}>${body}</svg>`;
  const ICON = {
    galaxy: svg('<circle class="fill" cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7"/><path d="M13.6 11.1c1.1-2.9 4.5-4.2 7.2-2.7M10.4 12.9c-1.1 2.9-4.5 4.2-7.2 2.7M12.9 13.6c2.9 1.1 4.2 4.5 2.7 7.2M11.1 10.4c-2.9-1.1-4.2-4.5-2.7-7.2"/>'),
    matter: svg('<path class="fill" d="M12 3.5l1.9 5.2 5.1 1.9-5.1 1.9L12 17.7l-1.9-5.2L5 10.6l5.1-1.9z" fill="currentColor"/><path d="M12 3.5l1.9 5.2 5.1 1.9-5.1 1.9L12 17.7l-1.9-5.2L5 10.6l5.1-1.9z"/><path d="M18.5 16l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"/>'),
    motion: svg('<ellipse cx="12" cy="12" rx="9.2" ry="4" transform="rotate(-24 12 12)"/><circle class="fill" cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.4"/><circle cx="19.6" cy="8.6" r="1.3" fill="currentColor" stroke="none"/>'),
    light: svg('<circle class="fill" cx="12" cy="12" r="3.8" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="3.6"/><path d="M12 2.8V5M12 19v2.2M2.8 12H5M19 12h2.2M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M5.5 18.5l1.6-1.6M16.9 7.1l1.6-1.6"/>'),
    colour: svg('<path class="fill" d="M12 3a9 9 0 1 0 0 18c1.3 0 1.9-.8 1.9-1.7 0-1.3-1-1.6-1-2.8 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z" fill="currentColor" fill-opacity=".14" stroke="none"/><path d="M12 3a9 9 0 1 0 0 18c1.3 0 1.9-.8 1.9-1.7 0-1.3-1-1.6-1-2.8 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z"/><circle cx="7.5" cy="11.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="10" cy="7.6" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.6" cy="7.6" r="1.1" fill="currentColor" stroke="none"/>'),
    create: svg('<rect class="fill" x="4" y="4" width="16" height="16" rx="4.5" fill="currentColor" fill-opacity=".14" stroke="none"/><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.2" fill="currentColor" stroke="none"/>'),
    save: svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'),
    hide: svg('<path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c5.5 0 9 7 9 7a15 15 0 0 1-2.9 3.7M6.5 6.6C4.2 8.2 3 12 3 12s3.5 7 9 7c1.6 0 3-.4 4.2-1"/>'),
    show: svg('<path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"/><circle cx="12" cy="12" r="2.8"/>'),
    keys: svg('<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    seed: svg('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4"/>'),
    dice: svg('<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>'),
    spin: svg('<circle cx="12" cy="12" r="8" stroke-opacity=".25"/><path d="M12 4a8 8 0 0 1 8 8"/>', ' class="spin"'),
    tick: svg('<path d="M5 12.5 10 17.5 19 7"/>', ' class="tick" stroke-width="2"'),
    view: svg('<path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"/><circle cx="12" cy="12" r="2.8"/>'),
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.3"/><rect x="14" y="5" width="4" height="14" rx="1.3"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5Z"/></svg>',
  };
  ICON.moon = svg('<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>');
  ICON.sun = svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>');
  ICON.camera = svg('<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.4-2h5l1.4 2h1.6A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5Z"/><circle cx="12" cy="12.5" r="3.4"/>');
  ICON.create = svg('<path d="M12 5v14M5 12h14"/>');
  ICON.capture = ICON.camera;
  ICON.share = svg('<path d="M12 3.5v11M8 7.5l4-4 4 4"/><path d="M8.5 10.5H7A2.5 2.5 0 0 0 4.5 13v4.5A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5V13a2.5 2.5 0 0 0-2.5-2.5h-1.5"/>');
  ICON.link = svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>');
  ICON.record = svg('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.6" fill="currentColor" stroke="none"/>');
  ICON.stop = svg('<rect x="7" y="7" width="10" height="10" rx="2.5" fill="currentColor" stroke="none"/>');
  ICON.settings = svg('<path class="fill" d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" fill="currentColor" fill-opacity=".14" stroke="none"/><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.6 7.6 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 2.6-1.5l2.4 1 2-3.4Z"/>');
  Object.assign(ICON, {
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="2.6" height="14" rx="1"/><path d="M19 6.2v11.6a1 1 0 0 1-1.6.8l-8-5.8a1 1 0 0 1 0-1.6l8-5.8a1 1 0 0 1 1.6.8Z"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="16.4" y="5" width="2.6" height="14" rx="1"/><path d="M5 6.2v11.6a1 1 0 0 0 1.6.8l8-5.8a1 1 0 0 0 0-1.6l-8-5.8A1 1 0 0 0 5 6.2Z"/></svg>',
    key: svg('<path d="M12 4.5 19.5 12 12 19.5 4.5 12Z"/><path d="M12 9v6M9 12h6"/>'),
    preview: svg('<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M10 9.2v5.6a.6.6 0 0 0 .9.5l4.4-2.8a.6.6 0 0 0 0-1l-4.4-2.8a.6.6 0 0 0-.9.5Z" fill="currentColor" stroke="none"/>'),
    export: svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'),
    shots: svg('<rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="M3.5 10h17M8 6v4M13 6v4"/>'),
    more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg>',
    trash: svg('<path d="M5 7h14M10 7V5h4v2M7 7l.8 12h8.4L17 7"/>'),
    refresh: svg('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4"/>'),
    restart: svg('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4h4"/>'),
    saved: svg('<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z"/>'),
    sliders: svg('<path d="M5 7h9M18 7h1M5 17h3M12 17h7"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
    film: svg('<rect class="fill" x="3.5" y="5.5" width="17" height="13" rx="3" fill="currentColor" fill-opacity=".14" stroke="none"/><rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="M8 5.5v13M16 5.5v13M3.5 10h4.5M3.5 14h4.5M16 10h4.5M16 14h4.5"/>'),
    pencil: svg('<path d="M14.5 5.5l4 4M4 20l1-5L15.5 4.5a1.4 1.4 0 0 1 2 0l2 2a1.4 1.4 0 0 1 0 2L9 19Z"/>'),
  });

  // ---- motion helpers -----------------------------------------------------------------
  function swapHTML(el, html, isText) {
    const same = isText ? el.textContent === html : el.innerHTML === html;
    if (el._next === undefined && same) return;
    const put = (v) => { if (isText) el.textContent = v; else el.innerHTML = v; };
    if (still()) { put(html); return; }
    if (el._next !== undefined) { el._next = html; return; }
    el._next = html;
    const out = el.animate([{ opacity: 1, filter: 'blur(0px)', transform: 'none' }, { opacity: 0, filter: 'blur(4px)', transform: 'translateY(-4px)' }], { duration: 120, easing: EASE.exit, fill: 'forwards' });
    out.onfinish = () => {
      put(el._next); el._next = undefined; out.cancel();
      el.animate([{ opacity: 0, filter: 'blur(4px)', transform: 'translateY(4px)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }], { duration: 300, easing: EASE.pop });
    };
  }
  function rollText(el, text) {
    const old = el.dataset.v;
    el.dataset.v = text;
    if (old === undefined || still()) { el.textContent = text; return; }
    if (old === text) return;
    const num = (t) => parseFloat(t.replace(/[^0-9.]/g, '')) || 0;
    const dir = num(text) >= num(old) ? 1 : -1;
    el.textContent = '';
    const n = text.length;
    for (let i = 0; i < n; i++) {
      const ch = text[i], prev = old[old.length - n + i];
      if (ch === prev) { el.append(ch); continue; }
      const wrap = document.createElement('span'), inner = document.createElement('span');
      wrap.className = 'roll'; inner.textContent = ch; wrap.append(inner); el.append(wrap);
      inner.animate([{ transform: `translateY(${dir * 80}%)`, opacity: 0, filter: 'blur(2px)' }, { transform: 'none', opacity: 1, filter: 'blur(0px)' }],
        { duration: 280, delay: (n - 1 - i) * 25, easing: EASE.snappy, fill: 'backwards' });
    }
  }
  // Animate an element's height from its current size to whatever its new content needs.
  function morphHeight(el, change, opts) {
    const from = el.getBoundingClientRect();
    change();
    const to = el.getBoundingClientRect();
    if (still() || (from.height === to.height && from.width === to.width)) return;
    const kf = [{ height: from.height + 'px' }, { height: to.height + 'px' }];
    if (opts && opts.width) { kf[0].width = from.width + 'px'; kf[1].width = to.width + 'px'; }
    if (opts && opts.radius) { kf[0].borderRadius = opts.radius[0]; kf[1].borderRadius = opts.radius[1]; }
    // Leaving is quicker than arriving (MOTION.md): closes use the exit curve.
    return el.animate(kf, opts && opts.exit ? { duration: 200, easing: EASE.exit } : { duration: 420, easing: EASE.smooth });
  }
  // Blur a group out quickly, then run `then` (used before a container shrinks).
  function leave(els, then) {
    els = Array.from(els).filter(Boolean);
    if (still() || !els.length) { then(); return; }
    let left = els.length;
    els.forEach((el) => {
      const a = el.animate([{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(4px)' }], { duration: 150, easing: EASE.exit, fill: 'forwards' });
      a.onfinish = () => { if (--left === 0) { then(); els.forEach((x) => x.getAnimations().forEach((an) => an.cancel())); } };
    });
  }
  const enter = (el, from, delay) => {
    if (still()) return;
    el.animate([Object.assign({ opacity: 0, filter: 'blur(6px)' }, from || {}), { opacity: 1, filter: 'blur(0px)', transform: 'none' }],
      { duration: 380, delay: delay || 0, easing: EASE.smooth, fill: 'backwards' });
  };

  // Toast: one black pill that morphs between messages.
  let toastEl = null, toastTimer = 0, toastOn = false, toastHide = null;
  function toast(msg, icon) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.id = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.hidden = true; document.body.append(toastEl); }
    const fill = () => { toastEl.innerHTML = (icon ? ICON[icon] : '') + '<span></span>'; toastEl.lastChild.textContent = msg; };
    clearTimeout(toastTimer);
    if (toastHide) { toastHide.cancel(); toastHide = null; }
    if (!toastOn) {
      fill(); toastEl.hidden = false; toastOn = true;
      if (!still()) toastEl.animate([{ opacity: 0, transform: 'translateX(-50%) translateY(14px) scale(0.9)', filter: 'blur(8px)' }, { opacity: 1, transform: 'translateX(-50%)', filter: 'blur(0px)' }], { duration: 450, easing: EASE.pop });
    } else {
      const w0 = toastEl.offsetWidth; fill(); const w1 = toastEl.offsetWidth;
      if (!still()) {
        toastEl.animate([{ width: w0 + 'px' }, { width: w1 + 'px' }], { duration: 340, easing: EASE.snappy });
        Array.from(toastEl.children).forEach((c) => c.animate([{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: 260 }));
      }
    }
    toastTimer = setTimeout(() => {
      toastOn = false;
      if (still()) { toastEl.hidden = true; return; }
      toastHide = toastEl.animate([{ opacity: 1, filter: 'blur(0px)', transform: 'translateX(-50%)' }, { opacity: 0, filter: 'blur(4px)', transform: 'translateX(-50%) translateY(6px) scale(0.98)' }], { duration: 180, easing: EASE.exit, fill: 'forwards' });
      toastHide.onfinish = () => { toastEl.hidden = true; toastHide.cancel(); toastHide = null; };
    }, 1700);
  }

  // A sliding grey pill for any row or column of items.
  function pillTrack(container, items, getActive) {
    let ind = container.querySelector(':scope > .pill-ind');
    if (!ind) { ind = document.createElement('div'); ind.className = 'pill-ind'; container.prepend(ind); }
    let at = null;
    function place(animate) {
      const b = items().find(getActive);
      if (!b || !container.offsetWidth) { ind.style.opacity = b ? '' : '0'; return; }
      ind.style.opacity = '';
      const box = { left: b.offsetLeft, top: b.offsetTop, right: container.clientWidth - b.offsetLeft - b.offsetWidth, bottom: container.clientHeight - b.offsetTop - b.offsetHeight };
      container.classList.remove('go-fwd', 'go-back');
      if (animate && at && !still()) container.classList.add(box.left + box.top >= at.left + at.top ? 'go-fwd' : 'go-back');
      else ind.style.transition = 'none';
      for (const k in box) ind.style[k] = box[k] + 'px';
      if (ind.style.transition === 'none') { void ind.offsetWidth; ind.style.transition = ''; }
      at = box;
    }
    return { place, hide() { ind.style.opacity = '0'; at = null; } };
  }

  // Tooltips for icon buttons (aria-label), placed on the given side.
  function tooltips(root, side) {
    let tip = null;
    const show = (b) => {
      if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; document.body.append(tip); }
      tip.textContent = b.getAttribute('aria-label');
      const r = b.getBoundingClientRect(), t = tip.getBoundingClientRect();
      const at = typeof side === 'function' ? side() : side;
      const pos = at === 'right' ? { x: r.right + 10, y: r.top + r.height / 2 - t.height / 2 }
        : at === 'top' ? { x: r.left + r.width / 2 - t.width / 2, y: r.top - t.height - 10 }
        : { x: r.left + r.width / 2 - t.width / 2, y: r.bottom + 10 };
      tip.style.left = Math.max(8, Math.min(innerWidth - t.width - 8, pos.x)) + 'px'; tip.style.top = pos.y + 'px';   // kept on screen
      if (!still()) tip.animate([{ opacity: 0, filter: 'blur(4px)', transform: 'scale(0.94)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }], { duration: 220, easing: EASE.pop });
      tip.hidden = false;
    };
    const hide = () => { if (tip) tip.hidden = true; };
    root.querySelectorAll('[data-tip]').forEach((b) => {
      b.addEventListener('pointerenter', () => show(b));
      b.addEventListener('pointerleave', hide);
      b.addEventListener('pointerdown', hide);
      b.addEventListener('focus', () => { if (b.matches(':focus-visible')) show(b); });
      b.addEventListener('blur', hide);
    });
    return { hide };
  }

  // Arrow keys move between the buttons of a tablist or toolbar.
  function roving(container, selector, vertical) {
    container.addEventListener('keydown', (e) => {
      const next = vertical ? ['ArrowDown', 'ArrowUp'] : ['ArrowRight', 'ArrowLeft'];
      const i = next.indexOf(e.key);
      if (i < 0) return;
      const items = Array.from(container.querySelectorAll(selector)).filter((b) => b.offsetParent);
      const at = items.indexOf(document.activeElement);
      if (at < 0) return;
      e.preventDefault(); e.stopPropagation();
      items[(at + (i === 0 ? 1 : -1) + items.length) % items.length].focus();
    });
  }

  // ---- theme: Light, Dark or System; dark by default; remembered per viewer ----------------
  const THEME_KEY = 'galaxy-creator-theme';
  const systemDark = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function theme() {                                 // the choice: 'light' | 'dark' | 'system'
    try { const t = localStorage.getItem(THEME_KEY); if (t === 'light' || t === 'dark' || t === 'system') return t; } catch (e) {}
    return 'dark';
  }
  const resolve = (t) => (t === 'system' ? (systemDark && systemDark.matches ? 'dark' : 'light') : t);
  function setTheme(t) {
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    const next = resolve(t);
    if (document.documentElement.dataset.theme === next) return;
    const go = () => { document.documentElement.dataset.theme = next; };
    // The whole chrome cross-fades between themes rather than snapping.
    if (document.startViewTransition && !still()) document.startViewTransition(go); else go();
  }
  document.documentElement.dataset.theme = resolve(theme());
  if (systemDark && systemDark.addEventListener) systemDark.addEventListener('change', () => { if (theme() === 'system') setTheme('system'); });

  // Easing into a keyframe. Smooth comes to rest on every key; the others flow through.
  const EASES = {
    smooth: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    linear: (t) => t,
    in: (t) => t * t * t,
    out: (t) => 1 - Math.pow(1 - t, 3),
  };
  const EASE_NAMES = [['smooth', 'Smooth'], ['linear', 'Linear'], ['in', 'Ease in'], ['out', 'Ease out']];
  // A custom easing is a cubic Bézier, as in CSS: from (0,0) to (1,1), shaped by two handles.
  // Their heights may leave 0–1, so a move can overshoot its key and settle back.
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (s) => ((ax * s + bx) * s + cx) * s, Y = (s) => ((ay * s + by) * s + cy) * s, dX = (s) => (3 * ax * s + 2 * bx) * s + cx;
    return (t) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      let s = t;
      for (let i = 0; i < 8; i++) { const e = X(s) - t, g = dX(s); if (Math.abs(e) < 1e-6 || Math.abs(g) < 1e-6) break; s -= e / g; }
      if (!(s >= 0 && s <= 1) || Math.abs(X(s) - t) > 1e-4) {         // Newton wandered off: bisect
        let lo = 0, hi = 1; s = t;
        for (let i = 0; i < 40; i++) { if (X(s) < t) lo = s; else hi = s; s = (lo + hi) / 2; }
      }
      return Y(s);
    };
  }
  const CURVE_Y = [-0.6, 1.6];
  const isCurve = (e) => Array.isArray(e) && e.length === 4 && e.every((v) => typeof v === 'number' && isFinite(v));
  const r2 = (v) => Math.round(v * 100) / 100;
  const cleanCurve = (e) => e.map((v, i) => r2(i % 2 ? Math.max(CURVE_Y[0], Math.min(CURVE_Y[1], v)) : Math.max(0, Math.min(1, v))));
  const validEase = (e) => (typeof e === 'string' && EASES[e] ? e : isCurve(e) ? cleanCurve(e) : 'smooth');
  const curveCache = new Map();
  function easeFn(e) {
    if (typeof e === 'string') return EASES[e] || EASES.smooth;
    if (!isCurve(e)) return EASES.smooth;
    const id = e.join();
    if (!curveCache.has(id)) curveCache.set(id, bezier(e[0], e[1], e[2], e[3]));
    return curveCache.get(id);
  }
  // Where the handles sit for the named easings (Smooth and the rest are exact cubics; these
  // Béziers match them closely), and the presets the curve editor offers.
  const EASE_CURVES = { smooth: [0.65, 0, 0.35, 1], linear: [0.25, 0.25, 0.75, 0.75], in: [0.32, 0, 0.67, 0], out: [0.33, 1, 0.68, 1] };
  const CURVE_PRESETS = [['smooth', 'Smooth'], ['linear', 'Linear'], ['in', 'Ease in'], ['out', 'Ease out'], [[0.37, 0, 0.63, 1], 'Gentle'], [[0.16, 1, 0.3, 1], 'Snappy'], [[0.34, 1.56, 0.64, 1], 'Overshoot']];
  const handlesOf = (e) => (typeof e === 'string' ? EASE_CURVES[e] || EASE_CURVES.smooth : e);
  const sameEase = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const easeName = (e) => { const p = CURVE_PRESETS.find(([v]) => sameEase(v, e)); return p ? p[1] : 'Custom'; };
  // ---- the easing curve: a thumbnail for the keyframe strip, and an editor card -----------------
  // Named easings draw as their real function; custom ones as the Bézier they are.
  function curveD(e, X, Y, n) {
    if (isCurve(e)) return `M${X(0)} ${Y(0)} C${X(e[0])} ${Y(e[1])} ${X(e[2])} ${Y(e[3])} ${X(1)} ${Y(1)}`;
    const f = easeFn(e);
    let s = '';
    for (let i = 0; i <= n; i++) { const t = i / n; s += (i ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(f(t)).toFixed(1); }
    return s;
  }
  const curveIcon = (e) => `<svg class="cv" viewBox="0 0 24 24" aria-hidden="true"><path d="${curveD(e, (v) => 4 + v * 16, (v) => 20 - v * 16, 16)}"/></svg>`;


  // ---- components ---------------------------------------------------------------------
  // Each factory builds one control from plain options and returns its element. Controls
  // that show a value read it through `get` (a function, so they can follow outside
  // state) and expose `el.sync(animate)` to redraw from it; nothing here knows the galaxy.
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
  const iconHTML = (icon) => (!icon ? '' : icon.trim().startsWith('<') ? icon : ICON[icon] || '');
  const valueOf = (v) => (typeof v === 'function' ? v() : v);

  // Button: full width, grey; `variant: 'primary'` makes it ink. setContent swaps icon and label.
  function button({ icon, label = '', variant, onClick, className } = {}) {
    const b = h('button', ['btn', variant, className].filter(Boolean).join(' '));
    b.type = 'button';
    b.setContent = (ic, text) => { b.innerHTML = `${iconHTML(ic)}<span></span>`; b.lastChild.textContent = text; };
    b.setContent(icon, label);
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }
  // Icon button: an icon with its name as aria-label (and a tooltip when `tip`).
  // size 'sm' is the compact one; variant 'play' is the round ink one.
  function iconButton({ icon, label, size, variant, tip = true, pressed, onClick, className } = {}) {
    const b = h('button', ['ib', size, variant, className].filter(Boolean).join(' '), iconHTML(icon));
    b.type = 'button';
    if (label) b.setAttribute('aria-label', label);
    if (tip) b.setAttribute('data-tip', '');
    if (pressed !== undefined) b.setAttribute('aria-pressed', String(!!valueOf(pressed)));
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }
  // Chip: a small pill button; variant 'ink' for the one that matters.
  function chip({ icon, label = '', variant, pressed, disabled, onClick, className } = {}) {
    const b = h('button', ['chip', variant, className].filter(Boolean).join(' '));
    b.type = 'button';
    b.setContent = (ic, text) => { b.innerHTML = `${iconHTML(ic)}${text ? '<span></span>' : ''}`; if (text) b.lastChild.textContent = text; };
    b.setContent(icon, label);
    if (pressed !== undefined) b.setAttribute('aria-pressed', String(!!valueOf(pressed)));
    if (disabled) b.disabled = true;
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }
  // Segmented control: one choice of a few, with the stretching pill.
  // options: [[value, label], ...]; get() → the current value; onChange(value).
  // fit: each choice as wide as its label (sharing out the spare room), for long ones like the types.
  function segmented({ label, options, get, onChange, columns, fit, className } = {}) {
    const el = h('div', ['seg', className].filter(Boolean).join(' '));
    el.setAttribute('role', 'radiogroup'); if (label) el.setAttribute('aria-label', label);
    el.style.gridTemplateColumns = `repeat(${columns || options.length}, ${fit ? 'auto' : '1fr'})`;
    options.forEach(([v, t]) => { const b = h('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.v = String(v); b.textContent = t; el.append(b); });
    const btns = () => Array.from(el.querySelectorAll('button'));
    const cur = () => String(valueOf(get));
    const pill = pillTrack(el, btns, (b) => b.dataset.v === cur());
    el.sync = (animate) => { btns().forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === cur()))); pill.place(animate); };
    el._place = () => el.sync(false);
    btns().forEach((b) => b.addEventListener('click', () => { if (onChange) onChange(b.dataset.v); el.sync(true); }));
    requestAnimationFrame(() => el.sync(false));
    return el;
  }
  // Switch: a labelled on/off row. get() → boolean; onChange(next).
  function toggle({ label, get, onChange } = {}) {
    const el = h('button', 'sw', '<span></span><i></i>');
    el.type = 'button'; el.setAttribute('role', 'switch');
    el.firstChild.textContent = label;
    el.sync = () => el.setAttribute('aria-checked', String(!!valueOf(get)));
    el.addEventListener('click', () => { if (onChange) onChange(!valueOf(get)); el.sync(); });
    el.sync();
    return el;
  }
  // Slider: a grey pill with an ink fill, the label and value inverting over it. Drag
  // anywhere (it stretches a little past its ends), tap to jump, double-click to reset,
  // arrow keys to step (Shift for ten). get() → value; set(v) → the value actually kept.
  function slider({ label, min = 0, max = 1, step = 0.01, format = (v) => v.toFixed(2), get, set, reset, off } = {}) {
    const el = h('div', 'sl', '<div class="sl-fill"></div><div class="sl-txt"><span></span><output></output></div>');
    el.tabIndex = 0; el.setAttribute('role', 'slider');
    el.setAttribute('aria-label', label); el.setAttribute('aria-valuemin', min); el.setAttribute('aria-valuemax', max);
    el.querySelector('.sl-txt span').textContent = label;
    const out = el.querySelector('output');
    const span = max - min, discrete = step >= 1;
    el.render = (v) => {
      el.style.setProperty('--v', clamp((v - min) / span, 0, 1));
      const t = format(v);
      if (discrete) rollText(out, t); else out.textContent = t;
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuetext', t);
      if (off) el.classList.toggle('off', !!off());
    };
    const commit = (v) => { const nv = set ? set(v) : v; el.render(nv === undefined ? valueOf(get) : nv); };
    function stretch(px) {
      if (!px || still()) { el.style.transform = ''; return; }
      const r = Math.min(12, Math.abs(px) * 0.5 / (1 + Math.abs(px) / 80));
      el.style.transformOrigin = px > 0 ? 'left center' : 'right center';
      el.style.transform = `scaleX(${1 + r / el.offsetWidth})`;
    }
    let grab = null;
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      grab = { x: e.clientX, v: valueOf(get), moved: false, w: el.getBoundingClientRect().width };
    });
    el.addEventListener('pointermove', (e) => {
      if (!grab) return;
      const dx = e.clientX - grab.x;
      if (!grab.moved && Math.abs(dx) < 3) return;
      if (!grab.moved) { grab.moved = true; el.classList.add('drag'); }
      const raw = grab.v + dx / grab.w * span;
      commit(raw);
      stretch(raw > max ? (raw - max) / span * grab.w : raw < min ? (raw - min) / span * grab.w : 0);
    });
    const release = (e) => {
      if (!grab) return;
      if (!grab.moved && e.type === 'pointerup') { const r = el.getBoundingClientRect(); commit(min + clamp((e.clientX - r.left) / r.width, 0, 1) * span); }
      grab = null; el.classList.remove('drag'); stretch(0);
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    if (reset !== undefined) el.addEventListener('dblclick', () => commit(valueOf(reset)));
    el.addEventListener('keydown', (e) => {
      const k = e.key, big = e.shiftKey ? 10 : 1, v0 = valueOf(get);
      const v = k === 'ArrowRight' || k === 'ArrowUp' ? v0 + step * big
        : k === 'ArrowLeft' || k === 'ArrowDown' ? v0 - step * big
        : k === 'Home' ? min : k === 'End' ? max : null;
      if (v === null) return;
      e.preventDefault(); e.stopPropagation(); commit(v);
    });
    el.sync = () => { if (valueOf(get) !== +el.getAttribute('aria-valuenow') || off) el.render(valueOf(get)); };
    el.render(valueOf(get));
    return el;
  }
  // Swatches: round colour buttons. items: [{ id, label, style }]; get() → the chosen id.
  function swatches({ items, get, onPick } = {}) {
    const el = h('div', 'swatches');
    items.forEach((it) => { const b = h('button'); b.type = 'button'; b.dataset.id = it.id; b.setAttribute('aria-label', it.label); b.title = it.label; b.setAttribute('style', it.style); el.append(b); });
    el.sync = () => el.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === valueOf(get))));
    el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { if (onPick) onPick(b.dataset.id); el.sync(); }));
    el.sync();
    return el;
  }
  // Colour picks: labelled colour wells. items: [{ id, label }]; get(id) → '#rrggbb'.
  function colorPicks({ items, get, onInput } = {}) {
    const el = h('div', 'picks');
    items.forEach((it) => { const l = h('label', 'pick', '<input type="color"><span></span>'); l.firstChild.dataset.k = it.id; l.lastChild.textContent = it.label; el.append(l); });
    el.sync = () => el.querySelectorAll('input').forEach((i) => { i.value = get(i.dataset.k); });
    el.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => { if (onInput) onInput(i.dataset.k, i.value); el.sync(); }));
    el.sync();
    return el;
  }
  // Small section label inside a panel.
  const label = (text) => { const l = h('div', 'ctl-label'); l.textContent = text; return l; };
  // A key cap, and a list of key commands: [[what, ['K', ...]], ...].
  const kbd = (text) => { const k = h('kbd'); k.textContent = text; return k; };
  function keys(list) {
    const el = h('div', 'keys');
    list.forEach(([what, ks]) => { const row = h('div', 'key', '<span></span><span></span>'); row.firstChild.textContent = what; ks.forEach((k) => row.lastChild.append(kbd(k))); el.append(row); });
    return el;
  }
  // Panel: a card with the headline and hint, then its controls.
  function panel({ title, hint, body = [], className } = {}) {
    const el = h('section', ['card', 'concentric', className].filter(Boolean).join(' '), '<div class="ctl-title"><b></b><span></span></div>');
    el.querySelector('b').textContent = title || '';
    el.querySelector('.ctl-title span').textContent = hint || '';
    const box = h('div', 'ctl'); body.forEach((x) => box.append(x)); el.append(box);
    return el;
  }
  // Menu: a small card above (or below) a button. items: [label, fn, hint], a string
  // heading, or '-' for a rule. Clicking away or picking closes it.
  let openMenu = null;
  function menu(anchor, items, below, className) {
    if (openMenu) { const was = openMenu.anchor; openMenu.close(); if (was === anchor) return null; }
    const m = h('div', ['menu card', className].filter(Boolean).join(' '));
    items.forEach((it) => {
      if (it === '-') { m.append(h('hr')); return; }
      if (typeof it === 'string') { const l = h('div', 'lab'); l.textContent = it; m.append(l); return; }
      const b = h('button', '', '<span></span><kbd hidden></kbd>'); b.type = 'button';
      b.firstChild.textContent = it[0];
      if (it[2]) { b.lastChild.hidden = false; b.lastChild.textContent = it[2]; }
      b.addEventListener('click', () => { close(); it[1](); });
      m.append(b);
    });
    document.body.append(m);
    const r = anchor.getBoundingClientRect(), mr = m.getBoundingClientRect();
    m.style.left = Math.max(12, Math.min(innerWidth - mr.width - 12, r.left + r.width / 2 - mr.width / 2)) + 'px';
    m.style.top = (below ? r.bottom + 8 : r.top - mr.height - 8) + 'px';
    if (!still()) m.animate([{ opacity: 0, transform: `translateY(${below ? -6 : 6}px) scale(0.96)`, filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }], { duration: 260, easing: EASE.pop });
    const away = (e) => { if (!m.contains(e.target) && !anchor.contains(e.target)) close(); };
    function close() { document.removeEventListener('pointerdown', away, true); m.remove(); openMenu = null; }
    setTimeout(() => document.addEventListener('pointerdown', away, true));
    openMenu = { anchor, close };
    return m;
  }
  // Curve editor: the easing graph (time across, progress up) with two handles to drag,
  // presets, and optional Preview and Apply to all. get() → a named easing or
  // [x1, y1, x2, y2]; set(e) stores it (and may tidy it), and the editor redraws.
  function curveEditor({ title = 'Easing', get, set, onPreview, onApplyAll, className } = {}) {
    const card = h('div', ['card curve-card', className].filter(Boolean).join(' '));
    // The plot fills the card's width and is a little shorter than wide, with a band above
    // and below for overshoot; handles pulled further than that still draw, outside the box.
    const SX = 300, SY = 210, P = 12, ROOM = 0.12;
    const W = SX + 2 * P, H = SY * (1 + 2 * ROOM) + 2 * P;
    const X = (v) => P + v * SX, Y = (v) => P + (ROOM + 1 - v) * SY;
    card.innerHTML = `
      <div class="ctl-title"><b></b><span data-r="name"></span></div>
      <svg class="graph" viewBox="0 0 ${W} ${H}" aria-label="Easing curve: time across, progress up">
        <rect class="box" x="${X(0)}" y="${Y(1)}" width="${SX}" height="${SY}" rx="8"/>
        <path class="diag" d="M${X(0)} ${Y(0)}L${X(1)} ${Y(1)}"/>
        <line class="arm" data-r="a0" x1="${X(0)}" y1="${Y(0)}"/><line class="arm" data-r="a1" x1="${X(1)}" y1="${Y(1)}"/>
        <path class="curve" data-r="curve"/>
        <circle class="end" cx="${X(0)}" cy="${Y(0)}" r="3.5"/><circle class="end" cx="${X(1)}" cy="${Y(1)}" r="3.5"/>
        <circle class="h" data-h="0" r="8" tabindex="0" role="slider" aria-label="First handle"/>
        <circle class="h" data-h="1" r="8" tabindex="0" role="slider" aria-label="Second handle"/>
      </svg>
      <div class="presets"></div>
      <div class="row"></div>`;
    card.querySelector('.ctl-title b').textContent = title;
    const presets = card.querySelector('.presets');
    CURVE_PRESETS.forEach(([v, t], j) => { const b = chip({ icon: curveIcon(v), label: t, onClick: () => put(v) }); b.dataset.p = j; presets.append(b); });
    const row = card.querySelector('.row');
    if (onPreview) row.append(chip({ icon: 'play', label: 'Preview move', disabled: onPreview === 'disabled', onClick: () => onPreview !== 'disabled' && onPreview() }));
    if (onApplyAll) row.append(chip({ label: 'Apply to all', onClick: () => onApplyAll(get()) }));
    if (!row.children.length) row.remove();
    const svgEl = card.querySelector('svg'), $ = (r) => card.querySelector(`[data-r="${r}"]`);
    const hs = Array.from(card.querySelectorAll('.h'));
    let cur = handlesOf(get()).slice();
    function render() {
      const e = get();
      $('curve').setAttribute('d', curveD(e, X, Y, 48));
      $('a0').setAttribute('x2', X(cur[0])); $('a0').setAttribute('y2', Y(cur[1]));
      $('a1').setAttribute('x2', X(cur[2])); $('a1').setAttribute('y2', Y(cur[3]));
      hs.forEach((hd, j) => { hd.setAttribute('cx', X(cur[j * 2])); hd.setAttribute('cy', Y(cur[j * 2 + 1])); hd.setAttribute('aria-valuetext', `${cur[j * 2].toFixed(2)}, ${cur[j * 2 + 1].toFixed(2)}`); });
      $('name').textContent = isCurve(e) && easeName(e) === 'Custom' ? e.join(', ') : easeName(e);
      presets.querySelectorAll('[data-p]').forEach((b) => b.setAttribute('aria-pressed', String(sameEase(CURVE_PRESETS[+b.dataset.p][0], e))));
    }
    const put = (e) => { set(e); cur = handlesOf(get()).slice(); render(); };
    const toVals = (ev) => {
      const pt = svgEl.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const q = pt.matrixTransform(svgEl.getScreenCTM().inverse());
      return [(q.x - P) / SX, ROOM + 1 - (q.y - P) / SY];
    };
    hs.forEach((hd, j) => {
      // Drag a handle: it becomes a custom curve.
      hd.addEventListener('pointerdown', (ev) => {
        ev.preventDefault(); hd.setPointerCapture(ev.pointerId); hd.classList.add('drag');
        const move = (e2) => { const [x, y] = toVals(e2); cur[j * 2] = x; cur[j * 2 + 1] = y; put(cleanCurve(cur)); };
        const up = () => { hd.classList.remove('drag'); hd.removeEventListener('pointermove', move); hd.removeEventListener('pointerup', up); hd.removeEventListener('pointercancel', up); };
        hd.addEventListener('pointermove', move); hd.addEventListener('pointerup', up); hd.addEventListener('pointercancel', up);
      });
      // Arrow keys nudge the focused handle (Shift for bigger steps).
      hd.addEventListener('keydown', (ev) => {
        const st = ev.shiftKey ? 0.1 : 0.02;
        const dx = ev.key === 'ArrowRight' ? st : ev.key === 'ArrowLeft' ? -st : 0;
        const dy = ev.key === 'ArrowUp' ? st : ev.key === 'ArrowDown' ? -st : 0;
        if (!dx && !dy) return;
        ev.preventDefault(); ev.stopPropagation();
        cur[j * 2] += dx; cur[j * 2 + 1] += dy; put(cleanCurve(cur));
      });
    });
    card.sync = () => { cur = handlesOf(get()).slice(); render(); };
    render();
    return card;
  }

  window.UI = {
    // tokens and helpers
    EASE, still, clamp, svg, ICON,
    // motion
    swapHTML, rollText, morphHeight, leave, enter, pillTrack, tooltips, roving, toast,
    // theme
    theme, setTheme,
    // easing
    EASES, EASE_NAMES, bezier, isCurve, cleanCurve, validEase, easeFn, EASE_CURVES, CURVE_PRESETS, handlesOf, sameEase, easeName, curveD, curveIcon,
    // components
    button, iconButton, chip, segmented, toggle, slider, swatches, colorPicks, label, kbd, keys, panel, menu, curveEditor,
  };
})();
