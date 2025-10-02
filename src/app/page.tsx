export default function Home() {
  const projects = [
    {
      id: 1,
      title: "Zapier Canvas",
      description: "Redesigning how teams visualize and build automation workflows",
      category: "Product Design",
      year: "2024",
      status: "Live"
    },
    {
      id: 2,
      title: "Design System Evolution",
      description: "Scaling design consistency across 50+ product teams",
      category: "Design Systems",
      year: "2023",
      status: "Live"
    },
    {
      id: 3,
      title: "Mobile-First Automation",
      description: "Bringing powerful automation to mobile users",
      category: "Mobile Design",
      year: "2024",
      status: "Beta"
    },
    {
      id: 4,
      title: "AI-Powered Workflows",
      description: "Designing the future of intelligent automation",
      category: "AI/ML Design",
      year: "2024",
      status: "Research"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="px-0 py-0">
              <h1 className="font-serif text-xl tracking-tight">ZACHARY WALSH</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#work" className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Work</a>
              <a href="#about" className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#contact" className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="font-sans text-xs uppercase tracking-[0.35em] text-gray-500 mb-6">UI & Product Design Leader</p>
            <h1 className="font-serif text-[10vw] leading-[0.9] md:text-[9rem] font-normal text-white mb-4">
              Creating delightful
              <br className="hidden md:block" />
              experiences
            </h1>
            <p className="font-sans text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              for automation at scale — experimentation, systems thinking, and shipping.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="work" className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-5xl md:text-6xl">Selected Work</h2>
            <span className="font-sans text-xs uppercase tracking-widest text-gray-500">2023—2025</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project, index) => (
              <div 
                key={project.id}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden border border-white/10 group-hover:border-white transition-colors">
                  <div className="aspect-[16/9] bg-gray-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-serif text-4xl text-white/80 mix-blend-screen">{project.title}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-sans text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {project.category}
                        </span>
                        <span className="font-sans text-xs text-gray-600">•</span>
                        <span className="font-sans text-xs font-medium text-gray-400">{project.year}</span>
                      </div>
                      <div className={`px-2 py-1 text-xs font-medium ${
                        project.status === 'Live' ? 'bg-green-900 text-green-200' :
                        project.status === 'Beta' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-gray-900 text-gray-200'
                      }`}>
                        {project.status}
                      </div>
                    </div>
                    <h3 className="font-serif text-3xl text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="font-sans text-gray-400 leading-relaxed mb-2">
                      {project.description}
                    </p>
                    <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-accent transition-colors">
                      View Project
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="brutal-accent-border bg-accent px-4 py-2 mb-6 inline-block">
                <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">About</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-8 text-brutal">
                Design Philosophy
              </h2>
              <div className="space-y-6">
                <p className="font-sans text-lg text-gray-300 leading-relaxed">
                  I approach design as a continuous experiment. Every product decision is a hypothesis, 
                  every user interaction is data, and every iteration brings us closer to something meaningful.
                </p>
                <p className="font-sans text-base text-gray-400 leading-relaxed">
                  My leadership style centers on empowering teams to take risks, learn fast, and build with intention. 
                  I believe the best designs emerge from constraints, not from unlimited freedom.
                </p>
              </div>
            </div>
            <div className="brutal-shadow bg-gray-800 p-8">
              <h3 className="font-serif text-2xl font-bold text-white mb-6">Core Principles</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent mt-2"></div>
                  <div>
                    <h4 className="font-sans font-medium text-white mb-1">Experiment Fearlessly</h4>
                    <p className="font-sans text-sm text-gray-400">Embrace failure as a path to innovation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent mt-2"></div>
                  <div>
                    <h4 className="font-sans font-medium text-white mb-1">Build at Scale</h4>
                    <p className="font-sans text-sm text-gray-400">Design systems that grow with teams</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent mt-2"></div>
                  <div>
                    <h4 className="font-sans font-medium text-white mb-1">Lead with Empathy</h4>
                    <p className="font-sans text-sm text-gray-400">Understand users and teams deeply</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="brutal-accent-border bg-accent px-4 py-2 mb-6 inline-block">
                <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">Contact</span>
              </div>
              <h2 className="font-serif text-4xl font-bold text-white mb-6 text-brutal">
                Let&apos;s Build Something Together
              </h2>
              <p className="font-sans text-lg text-gray-300 mb-8 max-w-md">
                Always interested in new challenges, collaborations, and conversations about the future of design.
              </p>
            </div>
            <div className="space-y-6">
              <div className="brutal-border bg-gray-900 p-6">
                <h3 className="font-serif text-xl font-bold text-white mb-3">Get in Touch</h3>
                <div className="space-y-3">
                  <a 
                    href="mailto:zachary@zapier.com"
                    className="flex items-center font-sans text-gray-300 hover:text-accent transition-colors"
                  >
                    <span className="mr-3">📧</span>
                    zachary@zapier.com
                  </a>
                  <a 
                    href="https://linkedin.com/in/zacharywalsh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center font-sans text-gray-300 hover:text-accent transition-colors"
                  >
                    <span className="mr-3">💼</span>
                    LinkedIn
                  </a>
                </div>
              </div>
              <div className="text-center">
                <p className="font-sans text-sm text-gray-500">
                  © 2024 Zachary Walsh. Built with Next.js and Tailwind CSS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}