"use client";

import Header from "../../../components/Header";
import ImageCarousel from "../../../components/ImageCarousel";

export default function ZapierPlatformUnification() {
  // Define images for each carousel
  const mainImages = [
    "/images/zapier-ai-building-01-main-canvas.png",
    // Add more images here as needed
  ];
  
  const secondaryImages = [
    "/images/zapier-ai-building-01-main-canvas.png",
    // Add more images here as needed
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="container">
        {/* Project Title */}
        <div className="project-hero">
          <h1 className="project-title-large">zapier platform unification</h1>
          <p className="project-intro">
            [Your project description here - how Zapier unified its platform experience]
          </p>
        </div>

        {/* Main Visual */}
        <ImageCarousel images={mainImages} alt="Zapier Platform Interface" className="gradient-orange-1" />

        {/* Problem Section */}
        <div className="project-section">
          <h2 className="section-heading">The challenge</h2>
          <div className="section-content">
            <p>
              [Describe the challenge - what problems were you solving with platform unification?]
            </p>
            <p>
              [Additional context about the problem space]
            </p>
          </div>
        </div>

        {/* Second Visual */}
        <ImageCarousel images={secondaryImages} alt="Zapier Platform Interface" />

        {/* Additional Content */}
        <div className="project-section">
          <div className="section-content">
            <h3 className="section-heading">The approach</h3>
            <p>
              [Describe your approach to solving the platform unification challenge]
            </p>
            <p>
              Key principles:
            </p>
            <ul className="list-disc list-inside">
              <li>[Principle 1]</li>
              <li>[Principle 2]</li>
              <li>[Principle 3]</li>
              <li>[Principle 4]</li>
            </ul>
          </div>
        </div>

        <div className="project-section">
          <div className="section-content">
            <h3 className="section-heading">The Solution</h3>
            <p>[Describe the unified platform solution]</p>
            <p>[Key feature/benefit 1]</p>
            <p>[Key feature/benefit 2]</p>
            <p>[Key feature/benefit 3]</p>
            <p>[Key feature/benefit 4]</p>
          </div>
        </div>

        <div className="project-section">
          <div className="section-content">
            <h3 className="section-heading">The Implementation</h3>
            <p>[Describe how you implemented the solution]</p>
            <p>[Implementation detail 1]</p>
            <p>[Implementation detail 2]</p>
            <p>[Implementation detail 3]</p>
            <p>[Implementation detail 4]</p>
          </div>
        </div>

        <div className="project-section">
          <div className="section-content">
            <h3 className="section-heading">The Impact</h3>
            <p>[Describe the impact and results of the platform unification]</p>
            <p>[Additional impact details and outcomes]</p>
          </div>
        </div>
      </main>
    </div>
  );
}
