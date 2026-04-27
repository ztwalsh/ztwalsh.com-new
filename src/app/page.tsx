import Link from "next/link";
import Header from "../components/Header";

const experiments = [
  {
    title: "Async design feedback",
    description:
      "Scales design by giving non-designers reliable, brand-specific design feedback on their vibe coded work.",
    url: "https://design-feedback-kappa.vercel.app/",
  },
  {
    title: "Conversational readme",
    description:
      "Get to know about working with me by chatting directly with my performance feedback, 360 feedback, and upward manager feedback. No secrets.",
    url: "https://readme-seven.vercel.app/",
  },
  {
    title: "Crew management",
    description:
      "Vibe coded solution for managing your racing boat crew and events. 10 years ago, this took months. This was a weekend.",
    url: "https://crew-management-j7w5o7dg5-zachwalsh-zapiercoms-projects.vercel.app/login",
  },
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </Link>
            <a
              href="https://www.linkedin.com/in/zacharywalsh/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="profile-link"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
              </svg>
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
