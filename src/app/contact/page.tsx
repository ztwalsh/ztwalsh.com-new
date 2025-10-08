"use client";

import Header from "../../components/Header";

export default function Contact() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="container">
        {/* Project Title */}
        <div className="project-hero">
          <h1 className="project-title-large">get in touch</h1>
          <p className="project-intro">
            I'm always interested in connecting with fellow designers, product leaders, and anyone passionate about creating meaningful digital experiences.
          </p>
        </div>

        {/* Contact Information */}
        <div className="project-section">
          <div className="section-content contact">
            <p>
              <strong>Email:</strong> ztwalsh@gmail.com<br />
              <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/zacharywalsh/" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 transition-colors">linkedin.com/in/zacharywalsh/</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
