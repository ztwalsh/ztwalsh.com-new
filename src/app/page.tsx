import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, Linkedin01Icon } from "@hugeicons/core-free-icons";
import Header from "../components/Header";

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
    title: "Conversational readme",
    description:
      "No secrets. Get to know about working with me by chatting directly with my performance feedback, 360 feedback, and upward manager feedback.",
    url: "https://readme.ztwalsh.com/",
  },
  /*{
    title: "Async design feedback",
    description:
      "Scales design by giving non-designers reliable, brand-specific design feedback on their vibe coded work.",
    url: "https://design-feedback-kappa.vercel.app/",
  },*/
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="container">
        <div className="profile">
          <h1 className="profile-name">zach walsh</h1>
          <p className="profile-bio">
            I connect people, simplify complexity, and ship products that
            matter.
          </p>

          <div className="profile-links">
            <Link
              href="/contact"
              aria-label="Contact"
              className="profile-link"
            >
              <HugeiconsIcon
                icon={Mail01Icon}
                size={26}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
            <a
              href="https://www.linkedin.com/in/zacharywalsh/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="profile-link"
            >
              <HugeiconsIcon
                icon={Linkedin01Icon}
                size={26}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <section className="section">
          <h2 className="section-label">Experiments</h2>
          <ul className="link-list">
            {experiments.map((e) => (
              <li key={e.title} className="link-list-item">
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-list-link"
                >
                  <span className="link-title">
                    {e.title}
                    <span className="link-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </span>
                  <span className="link-description">{e.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
