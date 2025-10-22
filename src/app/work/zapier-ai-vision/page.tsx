"use client";

import Header from "../../../components/Header";
import ImageCarousel from "../../../components/ImageCarousel";

export default function ZapierAIVision() {
  // Define images for each carousel
  const mainImages = [
    "/images/zapier-ai-orchestration/07_callable-agent-preview.png"
    // Add more images here as needed
  ];
  
  const secondaryImages = [
    "/images/zapier-ai-orchestration/01_getting-started_member-home.png",
    "/images/zapier-ai-orchestration/02_copilot-conversation.png",
    "/images/zapier-ai-orchestration/03_getting-started_system-folder-view.png",
    // Add more images here as needed
  ];

  const tertiaryImages = [
    "/images/zapier-ai-orchestration/01_getting-started_member-home.png",
    "/images/zapier-ai-orchestration/02_copilot-conversation.png",
    "/images/zapier-ai-orchestration/03_getting-started_system-folder-view.png",
    "/images/zapier-ai-orchestration/04_workflow-default.png",
    "/images/zapier-ai-orchestration/05_form-preview.png",
    "/images/zapier-ai-orchestration/05.b_form-full-builder.png",
    "/images/zapier-ai-orchestration/06_callable-workflow-preview.png",
    "/images/zapier-ai-orchestration/07_callable-agent-preview.png",
    "/images/zapier-ai-orchestration/07.b_callable-agent-full-builder.png",
    "/images/zapier-ai-orchestration/07.b_callable-agent-full-builder.png",
    "/images/zapier-ai-orchestration/08_callable-code-preview.png",
    "/images/zapier-ai-orchestration/08.b_callable-code-full-builder.png",
    "/images/zapier-ai-orchestration/09_table-preview.png",
    "/images/zapier-ai-orchestration/09.b_table-full-builder.png",
    "/images/zapier-ai-orchestration/10_callable-library-in-editor.png"
    // Add more images here as needed
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="container">
        {/* Project Title */}
        <div className="project-hero">
          <h1 className="project-title-large">zapier ai orchestration</h1>
          <p className="project-intro">
          How we reimagined Zapier's fragmented building experience into a unified platform for building and deploying AI—enabling humans and AI agents to work seamlessly together.
          </p>
        </div>

        {/* Main Visual */}
        <ImageCarousel images={mainImages} alt="Zapier AI Building Interface" className="gradient-orange-1 project-visual-slides" />

        {/* Problem Section */}
        <div className="project-section">
          <h2 className="section-heading">the challenge</h2>
          <div className="section-content">
            <p>
            At the start of 2025, development in the AI space was continuing to accelerate. AI agents were becoming more capable, more reliable, and more saught after. Our customers, more and more, were coming to us searching for solutions in how to use AI and agents across their organization, but lacked the tools, expertise, and infrastructure to do so.
            </p>
            <p>
            Zapier had the tools, but our product was still quite siloed. There were only loose integrations between our  deterministic workflow builder (what Zapier is known for) and our Agents product which was still in beta. On top of that, our solution for handling custom code, another key ingredient in automating complex systems, was fragmented across our platform.
            </p>
            <p>
            We faced a fundamental question: How do we create a builder for an AI-first future—one where humans and AI agents collaborate fluidly, and where automation components are blended seamlessly?
            </p>
          </div>
        </div>


        {/* Second Visual */}
        <ImageCarousel images={secondaryImages} alt="Zapier AI Building Interface" className="gradient-purple-1" captions={[
    "Main dashboard view showing key metrics",
    "Detailed analytics page with user insights", 
    "Settings panel for configuration options"
  ]} />
        
        <div className="project-section">
          <div className="section-content">
          <h3 className="section-heading">the vision</h3>
          <p>We decided to take a step back. Rather than incrementally improving existing products, we set aside current boundaries to envision the ultimate building experience for AI orchestration. I pulled together a cross functional group made up of two lead designers, two product directors, and a staff engineer. Over the course of the next three weeks, we worked with our founders and senior leaders across product and engineering to pull together existing ideas from across the company into a single view of our future building experience. Guiding our work was a set of principles: 
          </p>
          <ul className="list-disc list-inside">
            <li><strong>AI-first building</strong> / Assume a future where natural language configuration becomes the norm.</li>
            <li><strong>Agent-forward design</strong> / Assume a future where people and AI agents are collaborators within a workforce.</li>
            <li><strong>Break existing product constructs</strong> / Don’t be hindered by our existing product architecture, let the right approach emerge based the customer experience.</li>
          </ul>

          <p>Zapier's unified builder vision positions automation as the foundational element that orchestrates triggers, deterministic logic, AI agents, and supporting tools into complete systems. AI becomes a primary means of building, testing, and troubleshooting—transforming natural language descriptions into working solutions and democratizing automation creation across technical skill levels.</p>

          <p>All platform components become composable: workflows can call AI agents and custom code, agents can trigger workflows, creating interconnected and reusable systems that technical builders can share with their teams. The visual interface supports both granular workflow construction and system-level visualization, letting users zoom between detailed editing and holistic documentation. Testing and troubleshooting work consistently across all automation types.</p>
          
          <p>Most importantly, all these capabilities exist within a single building environment—eliminating the need to switch between separate tools and enabling seamless end-to-end automation development.</p>
          </div>
        </div>

        {/* Third Visual */}
        <ImageCarousel images={tertiaryImages} alt="Zapier AI Building Interface" className="gradient-purple-1" />

        <div className="project-section">
          <div className="section-content">
          <h3 className="section-heading">the reality</h3>
            <p>While our vision guides us, we were simply unable to tackle the complete vision at once. Based on our technical spikes, we also uncovered technical limitations in how we could architect a single builder experience for all of these different tools. We determined that we'd start with the most critical components that enabled using the products together and reducing the product collisions we had introduced. This boiled down to:</p>
            <ul className="list-disc list-inside">
              <li><strong>Agent steps in workflows</strong> / The first true integration point between deterministic and agentic automation</li>
              <li><strong>Unified code</strong> / Custom actions, functions, and code steps become one reusable, shareable asset type</li>
              <li><strong>Canvas as a folder view</strong> / System visualization becomes built-in, not a separate product</li>
              <li><strong>Consolidated chat interfaces</strong> / Chatbots merge into the Agents product as embeddable interfaces</li>
            </ul>
          </div>
        </div>

        <div className="project-section">
          <div className="section-content">
            <h3 className="section-heading">the impact</h3>
            <p>Early signals suggest this approach unlocks enterprise adoption by addressing the core blocker: automation heroes can now scale their impact. They build reusable systems, share components centrally, and enable non-technical teammates to build confidently on their work.</p>
            <p>The result isn't just a better builder—it's a platform reimagined for a future where human orchestration and AI execution work in concert, where the line between products dissolves into seamless capability, and where building sophisticated automation becomes accessible to entire teams.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
