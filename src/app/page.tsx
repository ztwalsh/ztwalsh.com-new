"use client";

import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <main className="container flex-1 flex items-center">
        <div className="content-hero">
          <h1 className="hero-name mb-6">zach walsh</h1>
          <h2 className="subtitle mb-8">designer & leader</h2>
          <p className="tagline max-w-2xl">
            connecting people, simplifying complexity, shipping products that matter
          </p>
        </div>
      </main>

      {/* Selected Projects */}
      <section id="work" className="projects-section">
        <div className="container">
          <div className="projects-grid">
            <article className="project-card">
              <div className="project-image gradient-orange-1">
              <a href="/work/zapier-ai-vision"><img src="images/zapier-ai-building-01-main-canvas.png" alt="Project preview" /></a>

              </div>
              <div className="project-meta">
                <p className="project-title">
                  <strong>Vision for building with AI on zapier</strong>
                  <span className="project-desc"> / creating a frictionless, unified experience for building automation through agents, steps, and code.</span>
                  <a href="/work/zapier-ai-vision" className="see-more">See more</a>
                </p>
                <p className="project-sub">zapier 2025</p>
              </div>
            </article>

            <article className="project-card">
              <div className="project-image gradient-orange-1">
              <img src="images/zapier-ai-building-01-main-canvas.png" alt="Project preview" />
              </div>
              <div className="project-meta">
                <p className="project-title">
                  <strong>Unifying the zapier platform</strong>
                  <span className="divider"> / </span>
                  <span className="project-desc">a unified experience for building automation through agents, steps, and code.</span>
                  <a href="#" className="see-more">See more</a>
                </p>
                <p className="project-sub">zapier 2024</p>
              </div>
            </article>

            <article className="project-card">
              <div className="project-image gradient-orange-1">
              <img src="images/zapier-ai-building-01-main-canvas.png" alt="Project preview" />
              </div>
              <div className="project-meta">
                <p className="project-title">
                  <strong>Vision for a multi-product platform</strong>
                  <span className="divider"> / </span>
                  <span className="project-desc">creating a frictionless, unified experience for building automation.</span>
                  <a href="#" className="see-more">See more</a>
                </p>
                <p className="project-sub">zapier 2023</p>
              </div>
            </article>

            <article className="project-card">
              <div className="project-image gradient-orange-1">
              <img src="images/zapier-ai-building-01-main-canvas.png" alt="Project preview" />
              </div>
              <div className="project-meta">
                <p className="project-title">
                  <strong>Rebranded zapier</strong>
                  <span className="divider"> / </span>
                  <span className="project-desc">a frictionless, unified experience for building automation through agents, steps, and code.</span>
                  <a href="#" className="see-more">See more</a>
                </p>
                <p className="project-sub">zapier 2021</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}