"use client";

import Header from "../../../components/Header";

export default function ZapierAIVision() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="container">
        {/* Project Title */}
        <div className="project-hero">
          <h1 className="project-title-large">zapier product vision</h1>
          <p className="project-intro">
          How Zapier reimagined its fragmented building experience into a unified platform for AI orchestration—enabling humans and AI agents to work seamlessly together.
          </p>
        </div>

        {/* Main Visual */}
        <div className="project-visual gradient-orange-1">
          <img src="/images/zapier-ai-building-01-main-canvas.png" alt="Zapier AI Building Interface" />
        </div>

        {/* Problem Section */}
        <div className="project-section">
          <h2 className="section-heading">The challenge</h2>
          <div className="section-content">
            <p>
            Zapier's building experience had evolved into a collection of siloed products—each with its own builder, each optimized for deterministic workflows. But the world was changing. As AI agents began handling routine tasks and human roles shifted toward orchestration, our fragmented approach created friction: overlapping products confused users, deterministic and agentic workflows couldn't be combined, and teams struggled to share reusable components.
            </p>
            <p>
            We faced a fundamental question: How do we create a builder for an AI-first future—one where humans and AI agents collaborate fluidly, where automation components blend seamlessly, and where natural language describes intent while LLMs build solutions?
            </p>
          </div>
        </div>

        {/* Second Visual */}
        <div className="project-visual">
          <img src="/images/zapier-ai-building-01-main-canvas.png" alt="Zapier AI Building Interface" />
        </div>

        {/* Additional Content */}
        <div className="project-section">
          <div className="section-content">
            <h3 className="section-heading">The approach</h3>
            <p>
            Rather than incrementally improving existing products, we set aside current boundaries to envision the ultimate building experience for AI orchestration. A cross-functional team spent three weeks exploring bold ideas that made us uncomfortable—a signal we were pushing in the right direction.
            </p>
            <p>
            Our guiding principles:
            </p>
            <ul className="list-disc list-inside">
              <li>AI-first interaction: Assume 80% of initial setup happens through natural language</li>
              <li>Agent-forward design: Optimize for agents as primary actors, humans as orchestrators</li>
              <li>Unified mental model: One platform with multiple capabilities, not separate products</li>
              <li>Break existing constructs: Let the right approach emerge based on the task, not product boundaries</li>
            </ul>
          </div>
        </div>

        <div className="project-section">
          <div className="section-content">
          <h3 className="section-heading">The Vision</h3>
          <p>We're building toward a unified platform where:</p>
          <p>Workflows and agents work together seamlessly. No more choosing between deterministic and agentic automation—hybrid systems become possible, with agents callable as workflow steps and vice versa.</p>
          <p>Components are reusable and shareable. Technical builders create callable components (code, agents, sub-workflows) that less technical teammates can leverage, enabling team-wide automation scaling.</p>
          <p>Building happens in natural language. Copilot assistance evolves from support tool to primary interface, where users describe outcomes and AI codifies solutions.</p>
          <p>One builder, multiple views. Asset-level and system-level perspectives coexist—edit individual workflows or visualize entire automation ecosystems with dependency mapping.</p>
          </div>
        </div>

          <div className="project-section">
            <div className="section-content">
              <h3 className="section-heading">The Reality</h3>
              <p>Vision guides us, but execution is iterative. By 2026, we're shipping:</p>
              <p>Agent steps in workflows: The first true integration point between deterministic and agentic automation</p>
              <p>Unified code: Custom actions, functions, and code steps become one reusable, shareable asset type</p>
              <p>Canvas as a folder view: System visualization becomes built-in, not a separate product</p>
              <p>Consolidated chat interfaces: Chatbots merge into the Agents product as embeddable interfaces</p>
            </div>
          </div>

          <div className="project-section">
            <div className="section-content">
              <h3 className="section-heading">The Impact</h3>
              <p>Early signals suggest this approach unlocks enterprise adoption by addressing the core blocker: automation heroes can now scale their impact. They build reusable systems, share components centrally, and enable non-technical teammates to build confidently on their work.</p>
              <p>The result isn't just a better builder—it's a platform reimagined for a future where human orchestration and AI execution work in concert, where the line between products dissolves into seamless capability, and where building sophisticated automation becomes accessible to entire teams.</p>
            </div>
          </div>
      </main>
    </div>
  );
}
