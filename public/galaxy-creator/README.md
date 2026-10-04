# Galaxy Creator

A three-dimensional galaxy you build from a panel: pick its type, set its arms,
stars, gas, dust and spin, then fly from the edge of the universe into its core.
Drag to orbit it, scroll or pinch to zoom, snap a PNG of whatever it is doing, and
share it: a link that opens exactly this galaxy, a still at up to 8K, or a looping
video of one full turn.

It is built the way [Solid State](https://ztwalsh.com/solid-state/) is: one HTML
file and one font, with no build step and no dependencies. Anything that can
serve a static file can serve it.

```
galaxy-creator/
├── index.html         the piece, self-contained
├── geist.woff2        the one typeface it uses
├── preview.png        1200×630 share image
└── README.md          this file
```

The one outside request is Google Analytics. Because this is a static file, a
framework's own analytics never runs for it, so the tag is in the page itself.
Near the top of `index.html`:

```js
window.ANALYTICS_ID = 'G-8H02CWQTGC';   // '' removes it entirely
```

## Run it

On ztwalsh.com it lives in the Next.js app's `public/galaxy-creator/` and is
served at `/galaxy-creator/`. Anywhere else, open `index.html` from any static
server:

```
python3 -m http.server
```

then visit `http://localhost:8000/`. Opening it straight from the file system
works too in most browsers.

## Controls

| | |
|---|---|
| Drag or swipe | orbit the camera; it keeps its momentum |
| Pinch or scroll | zoom |
| The rail | Create galaxy, Structure, Stars & gas, Motion, Light, Colour, then the camera, Settings and hide. Each category, the camera and Settings open a card beside the rail |
| Camera | save a still at screen size, 4K, 6K or 8K, or record a 10, 20 or 30 second loop |
| `S` | snap the galaxy alone to a PNG at screen size (numbered, so rapid snaps never overwrite) |
| Settings › Copy share link, or `L` | copy a link to this exact galaxy, camera included |
| `⌘` `.` (Ctrl `.`) | everything off the screen but the galaxy; again, or `Esc`, to bring it back |
| `Space` | pause |
| `R` | new seed: the same settings, a different galaxy |
| `H` | hide the toolbar; the Show tools pill or `H` brings it back |
| Settings | the share link, Light, Dark or System appearance (dark by default), captions on screen, and every key command |

**Direct mode.** The switch at the top, or `Tab`, trades the rail for a timeline,
the way Blender switches workspaces. The camera stops drifting, so it only moves
when you move it.

| | |
|---|---|
| `K` or `+` | keep what the camera sees as a keyframe, at the playhead |
| Drag the line | scrub; the camera follows |
| Drag a dot | retime that keyframe; hover one to see its picture |
| Pick a dot | its easing (Smooth, Linear, Ease in, Ease out), Use this view, Delete |
| `Space` | play the camera between the keyframes |
| `←` `→` | previous or next keyframe |
| `P` | preview: the shot alone, start to end, nothing else on screen |
| Start over (↺) | clears the timeline at once; Undo appears for a few seconds |
| `⋯` | starting shots (Approach, Orbit, Reveal, Flyover), length (6 to 30 s), Export video, Start over |

The camera moves on Catmull-Rom curves through the keyframes, each with its own
easing. Export video records the shot at its length, the same way loops are
recorded. The shot is kept in this browser.

**Blender-style navigation.** If your hands know Blender, they know this:

| | |
|---|---|
| Middle-drag (or left-drag) | orbit |
| Shift + drag | pan |
| Ctrl + drag | zoom (drag up to go in) |
| Scroll / Shift + scroll | zoom / pan up and down |
| Alt + drag, Shift+Alt, Ctrl+Alt | the same three, for trackpads (Emulate 3 Button Mouse) |
| `1` `3` `7` | front, right, top; with Ctrl, back, left, bottom |
| `2` `4` `6` `8` | orbit down, left, right, up by 15° (Ctrl pans instead) |
| `9` | the opposite side |
| `+` `-` | zoom |
| `Home`, `0`, `.` or Shift+C | back to the opening view |

The number keys work on the numpad and on the top row, like Blender's Emulate
Numpad. Front and side views are edge-on, since the disk lies flat the way
Blender's ground plane does.

**Types.** Spiral, Barred spiral, Elliptical (with globular clusters and a
Centaurus A style dust lane), Ring (Hoag's object), and Irregular (a Magellanic
cloud). **Cycle** morphs through all five: every star keeps its identity and
slides from where it sits in one galaxy to where it belongs in the next.

**Companion galaxies** adds two small ellipticals beside the main one, like M32
and M110 beside Andromeda. The default view follows the classic M31 plates: a
steep tilt, turned onto the diagonal, with a gold core, a blue rim, dark-brown
dust filaments and small pink star-forming knots.

**Surprise me** rolls the type, the shape, the gas, the palette and the seed.

**Share and capture.** The link carries every setting, the palette, the seed and the camera
in the address's `#g=` part, so it needs no server. Opening one shows that
galaxy without touching the visitor's own; it becomes theirs, and leaves the
address bar, the moment they change something.

Stills keep the screen's framing and render off screen with the long edge at
3840, 6144 or 7680 pixels. Stars, spikes and bloom scale with the size, so the
picture matches the screen, only sharper. The screen's buffers are freed while
it renders; if the GPU still cannot fit the size, it steps down to the next
one. They are PNGs, and an 8K one can run to 50 MB or more.

Loops record one full turn of the camera live from the canvas, at most 1920
pixels on the long edge, as MP4 where the browser can (WebM otherwise). The
camera ends where it began, but the stars' orbits do not, so the last stretch
cross-fades into the first and the video plays as one endless turn. Keep the
tab in front while it records.

## How it works

Every star carries eight fixed random numbers, and the GPU turns them into a
position, colour and brightness every frame. That is why each slider is live
and why the types can morph without rebuilding anything. The Stars slider draws
a prefix of one large buffer, and since the randoms are independent, any prefix
is a fair sample of the whole galaxy.

Spiral arms come from density waves. Each star circles the centre on a slightly
oval orbit, and each orbit is turned a little further than the one inside it.
Where neighbouring orbits crowd together you get arms, and the arms keep their
shape while the stars stream through them. Young blue stars, glowing gas and
dust are born on the arm crests, with the dust gathering on the inner edge.

The frame is drawn in floating point, in these layers:

1. Stars, plus a sky of distant stars and far-off galaxies.
2. A half-resolution layer of unresolved starlight and emission nebulae.
3. A transmittance layer for dust. It absorbs more blue than red, so the light
   that gets through is reddened, and the thin dust sheet only darkens much
   when you see it edge-on.
4. Bloom, ACES filmic tone mapping, saturation, a touch of lens fringing,
   vignette and grain.

The few hundred brightest stars get six-point diffraction spikes, fixed to the
screen the way a telescope's would be.

## Configure

Near the top of the script:

```js
const HOME_URL   = '/';        // where the panel's back link goes
const HOME_LABEL = '← back';   // what it says; HOME_URL = '' removes it
```

The toolbar follows [DESIGN.md](DESIGN.md) and [MOTION.md](MOTION.md). It is designed in `playground/` (`kit.css`, `kit.js`, `left-rail-flyout.html`) and copied into this page with `python3 tools/sync-toolbar.py`.

The opening state is the `BASE` object near the top of the script, and the six
colour palettes are in `PRESETS` just above it. A visitor's own changes are
saved to their browser under the key `galaxy-creator`, so editing `BASE`
changes what a new visitor sees, not what a returning one does.

URL options:

- `?seed=1234` grows a specific galaxy.
- `?clean` opens on the galaxy alone (the ⌘. view).
- `#g=…` is a share link: every setting and the camera (see Share above).

## Notes

It needs WebGL2, which every current browser has; anything older gets a line of
text instead of a blank page. With `EXT_color_buffer_float` (nearly everywhere)
it renders in HDR. Without it, it still runs, just flatter. Touch devices get a
smaller star budget.

A visitor who asks their system for reduced motion gets a still galaxy and no
opening swoop, with the controls still there.
