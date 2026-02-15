"use client";

import Header from "../../components/Header";

const experiments = [
  {
    title: "Async design feedback",
    description:
      "Scales design by giving non-designers reliable, brand-specific design feedback on their vibe coded work.",
    thumbnail: "/images/design-feedback.png",
    url: "https://design-feedback-kappa.vercel.app/",
  },
  {
    title: "Conversational readme",
    description:
      "Get to know about working with me through chatting directly with my performance feedback, 360 feedback, and upward manager feedback. No secrets.",
    thumbnail: "/images/placeholder-experiment.png",
    url: "#",
  },
  {
    title: "Crew management",
    description:
      "Vibe coded solution for managing your racing boat crew and events. 10 years ago, this took months. This was a weekend.",
    thumbnail: "/images/crew-management.png",
    url: "#",
  },
];

export default function Experiments() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container">
        <div className="page-hero">
          <h1 className="page-title">experiments</h1>
          <p className="page-intro">
            A collection of design experiments, prototypes, and explorations
            pushing on applications of AI.
          </p>
        </div>
      </main>

      <div className="experiments-grid">
        {experiments.map((experiment) => (
          <a
            key={experiment.title}
            href={experiment.url}
            className="experiment-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={experiment.thumbnail}
              alt={experiment.title}
              className="experiment-bg"
            />
            <div className="experiment-overlay">
              <h2 className="experiment-title">{experiment.title}</h2>
              <p className="experiment-description">
                {experiment.description}
              </p>
              <span className="experiment-link">visit project</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
