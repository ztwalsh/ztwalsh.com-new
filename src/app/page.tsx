import { CrtRoot, InvertButton } from "../components/Crt";

const experiments = [
  {
    title: "Harps",
    description:
      "A local-first push-to-talk dictation app for Mac. Hold a key, speak, and the text lands right at your cursor, transcribed entirely on-device.",
    url: "https://getharps.app/",
  },
  {
    title: "move/think",
    description:
      "An iOS app that pairs movement with reflection, helping you think through what's on your mind while you walk.",
    url: "https://apps.apple.com/us/app/move-think/id6770284427",
  },
  {
    title: "Wallypaper",
    description:
      "My hobby collection AI wallpaper generated from MidJourney available for download.",
    url: "https://wallypaper.design/",
  },
  {
    title: "Solid State",
    description:
      "A pure-fun toy: a lattice of points morphing between sphere, cube, and pyramid through a CRT shader. Drag to spin it, retune it live, save a still.",
    url: "/solid-state/index.html",
  },
  {
    title: "Conversational readme",
    description:
      "No secrets. Get to know about working with me by chatting directly with my performance feedback, 360 feedback, and upward manager feedback.",
    url: "https://readme.ztwalsh.com/",
  },
];

export default function Home() {
  return (
    <CrtRoot>
      <main className="wrap">
        <header className="profile">
          <h1>zach walsh</h1>
          <p className="bio">
            I connect people, simplify complexity, and ship products that
            matter.
          </p>
        </header>

        <section className="section" aria-labelledby="exp">
          <h2 id="exp" className="label">
            Experiments
          </h2>
          <ul className="list">
            {experiments.map((e) => (
              <li key={e.title} className="item">
                <a href={e.url} target="_blank" rel="noopener noreferrer">
                  <span className="title">
                    {e.title}
                    <span className="arrow" aria-hidden="true">
                      ↗
                    </span>
                  </span>
                  <span className="desc">{e.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <footer className="foot">
          <a href="/contact">contact</a>
          <a
            href="https://www.linkedin.com/in/zacharywalsh/"
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin
          </a>
          <InvertButton />
        </footer>
      </main>
    </CrtRoot>
  );
}
