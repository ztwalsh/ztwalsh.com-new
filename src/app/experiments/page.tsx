"use client";

import Header from "../../components/Header";

export default function Experiments() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="container">
        {/* Project Title */}
        <div className="project-hero">
          <h1 className="project-title-large">experiments</h1>
          <p className="project-intro">
            A collection of design experiments, prototypes, and explorations that push the boundaries of what's possible in digital experiences.
          </p>
        </div>

        {/* Main Visual */}
        <div className="project-visual gradient-orange-1">
          <img src="/images/zapier-ai-building-01-main-canvas.png" alt="Experiments Visual" />
        </div>

        {/* Problem Section */}
        <div className="project-section">
          <h2 className="section-heading">The approach</h2>
          <div className="section-content">
            <p>
              These experiments represent moments of curiosity and exploration in design. Each project started with a simple question: "What if we tried this differently?"
            </p>
            <p>
              From exploring new interaction patterns to testing unconventional layouts, these experiments help inform better design decisions and push creative boundaries.
            </p>
          </div>
        </div>

        {/* Second Visual */}
        <div className="project-visual">
          <img src="/images/zapier-ai-building-01-main-canvas.png" alt="Experiments Visual" />
        </div>

        {/* Additional Content */}
        <div className="project-section">
          <div className="section-content">
            <p>
              Each experiment is documented with its hypothesis, process, and learnings. The goal is not perfection, but understanding how different approaches can lead to better user experiences.
            </p>
          </div>
        </div>

        <div className="project-section">
          <div className="section-content">
            <p>
              These explorations often inform larger projects and help establish new patterns that can be applied across different contexts and platforms.
            </p>
          </div>
        </div>

        <div className="project-section">
          <div className="section-content">
            <p>
              The process of experimentation is as valuable as the outcomes, teaching us to embrace uncertainty and learn from both successes and failures.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
