"use client";

import { useEffect, useRef } from "react";

export default function ZapierAIVision() {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const header = headerRef.current;
      if (!header) return;
      if (y > 8) {
        header.classList.add("condensed");
      } else {
        header.classList.remove("condensed");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header ref={headerRef} className="site-header">
        <div className="container flex items-center justify-between navigation">
          <div className="logo">ZW</div>
          <nav className="flex space-x-8">
            <a href="/#work" className="nav-link active">work</a>
            <a href="#experiments" className="nav-link">experiments</a>
            <a href="#contact" className="nav-link">get in touch</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {/* Project Title */}
        <div className="project-hero">
          <h1 className="project-title-large">zapier product vision</h1>
          <p className="project-intro">
            As Zapier expanded from a single product to a platform with multiple products, we were faced with the task rearchitecting the product experience to build the mental model of what Zapier is capable of.
          </p>
        </div>

        {/* Main Visual */}
        <div className="project-visual gradient-orange-1">
          <img src="/images/zapier-ai-building-01-main-canvas.png" alt="Zapier AI Building Interface" />
        </div>

        {/* Problem Section */}
        <div className="project-section">
          <h2 className="section-heading">The problem</h2>
          <div className="section-content">
            <p>
              As Zapier's customer base grew, so did the complexity of the systems they were building. Customers were using dozens of apps to build sophisticated automated systems that were becoming increasingly difficult to manage and maintain.
            </p>
            <p>
              These systems were often brittle and prone to breaking, as customers were bending these apps for use cases for which they were not designed. We needed to provide a more robust and flexible platform that could handle the complexity of modern automation workflows.
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
            <p>
              Passionate and innovative professional with a keen eye for design and detail. Skilled in design leadership, I bring a unique blend of creativity and technical expertise to every project. Committed to delivering exceptional results and exceeding expectations.
            </p>
          </div>
        </div>

        <div className="project-section">
          <div className="section-content">
            <p>
              Passionate and innovative professional with a keen eye for design and detail. Skilled in design leadership, I bring a unique blend of creativity and technical expertise to every project. Committed to delivering exceptional results and exceeding expectations.
            </p>
          </div>
        </div>

        <div className="project-section">
          <div className="section-content">
            <p>
              Passionate and innovative professional with a keen eye for design and detail. Skilled in design leadership, I bring a unique blend of creativity and technical expertise to every project. Committed to delivering exceptional results and exceeding expectations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
