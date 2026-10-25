/* Landing sketches: connect to the embedded galaxy, show the house look (the default
   Andromeda-style galaxy, unsaved, so a visitor's own galaxy is untouched), and offer
   a few camera helpers. */
(function () {
  'use strict';
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function connect(frame) {
    return new Promise((resolve) => {
      const tryNow = () => { try { const g = frame.contentWindow && frame.contentWindow.galaxy; if (g) { resolve(g); return true; } } catch (e) {} return false; };
      if (tryNow()) return;
      const iv = setInterval(() => { if (tryNow()) clearInterval(iv); }, 50);
    });
  }
  async function start(opts) {
    const G = await connect(document.getElementById('sky'));
    G.setLive(Object.assign({}, G.base, opts && opts.look), false);   // the house galaxy, this visit only
    return G;
  }
  // Glide the camera from where it is to a target over ms, eased (for handoffs and scroll).
  function glide(G, to, ms, done) {
    const from = G.camera(), t0 = performance.now();
    const lerp = (a, b, k) => a + (b - a) * k;
    const ease = (k) => 1 - Math.pow(1 - k, 3);
    (function step(now) {
      const k = still() ? 1 : Math.min(1, (now - t0) / ms), e = ease(k);
      G.setCamera({
        yaw: lerp(from.yaw, to.yaw ?? from.yaw, e), pitch: lerp(from.pitch, to.pitch ?? from.pitch, e), roll: lerp(from.roll, to.roll ?? from.roll, e),
        focus: from.focus.map((v, i) => lerp(v, (to.focus || from.focus)[i], e)),
        dist: Math.exp(lerp(Math.log(from.dist), Math.log(to.dist ?? from.dist), e)),
      });
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    })(performance.now());
  }
  window.Landing = { start, glide, still };
})();
