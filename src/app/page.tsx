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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="brutal-border bg-white px-4 py-2">
              <h1 className="font-serif text-lg font-bold text-gray-900">ZW</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#work" className="font-sans text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Work</a>
              <a href="#about" className="font-sans text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">About</a>
              <a href="#contact" className="font-sans text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <div className="mb-8">
                <div className="inline-block brutal-accent-border bg-accent px-3 py-1 mb-4">
                  <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">Head of Design</span>
                </div>
                <h1 className="font-serif text-7xl md:text-9xl font-bold text-gray-900 leading-none mb-6 text-brutal">
                  Zachary Walsh
                </h1>
                <h2 className="font-sans text-2xl md:text-3xl font-medium text-gray-700 mb-8 max-w-2xl">
                  Leading design at Zapier. Building the future of automation through experimentation and fearless iteration.
                </h2>
              </div>
              
              <div className="brutal-border bg-white p-8 mb-8">
                <p className="font-sans text-lg text-gray-700 leading-relaxed mb-4">
                  I believe great design emerges from continuous experimentation, tinkering, and building. 
                  At Zapier, I lead a team of designers creating tools that empower millions to automate their work.
                </p>
                <p className="font-sans text-base text-gray-600">
                  Currently focused on AI-powered workflows, mobile-first experiences, and scaling design systems across 50+ product teams.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="brutal-shadow bg-white px-6 py-3">
                  <span className="font-sans text-sm font-medium text-gray-900">8+ Years Experience</span>
                </div>
                <div className="brutal-shadow bg-white px-6 py-3">
                  <span className="font-sans text-sm font-medium text-gray-900">50+ Team Members</span>
                </div>
                <div className="brutal-shadow bg-white px-6 py-3">
                  <span className="font-sans text-sm font-medium text-gray-900">Millions of Users</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4">
              <div className="brutal-shadow bg-white p-8 text-center">
                <div className="w-32 h-32 bg-gray-200 mx-auto mb-6 brutal-border"></div>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Currently</h3>
                <p className="font-sans text-sm text-gray-600 mb-4">Head of Design at Zapier</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-xs text-gray-500">Location</span>
                    <span className="font-sans text-xs font-medium text-gray-900">San Francisco</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-xs text-gray-500">Status</span>
                    <span className="font-sans text-xs font-medium text-accent">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="work" className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="brutal-border bg-white p-8 mb-8">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-brutal">
                Selected Work
              </h2>
              <p className="font-sans text-lg text-gray-700 max-w-2xl">
                A collection of projects that showcase my approach to design leadership, 
                product strategy, and building at scale.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div 
                key={project.id}
                className="group cursor-pointer"
              >
                <div className="brutal-shadow bg-white hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300">
                  <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden brutal-border-b">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 brutal-border mx-auto mb-4 flex items-center justify-center">
                          <span className="font-serif text-2xl font-bold text-white">{index + 1}</span>
                        </div>
                        <span className="font-sans text-sm font-medium text-white/90">{project.title}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-sans text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {project.category}
                        </span>
                        <span className="font-sans text-xs text-gray-400">•</span>
                        <span className="font-sans text-xs font-medium text-gray-500">{project.year}</span>
                      </div>
                      <div className={`px-2 py-1 text-xs font-medium ${
                        project.status === 'Live' ? 'bg-green-100 text-green-800' :
                        project.status === 'Beta' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </div>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">
                      {project.title}
                    </h3>
                    <p className="font-sans text-gray-700 leading-relaxed mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center text-sm font-medium text-gray-900 group-hover:text-accent transition-colors">
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
      <section id="about" className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="brutal-accent-border bg-accent px-4 py-2 mb-6 inline-block">
                <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">About</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-brutal">
                Design Philosophy
              </h2>
              <div className="space-y-6">
                <p className="font-sans text-lg text-gray-700 leading-relaxed">
                  I approach design as a continuous experiment. Every product decision is a hypothesis, 
                  every user interaction is data, and every iteration brings us closer to something meaningful.
                </p>
                <p className="font-sans text-base text-gray-600 leading-relaxed">
                  My leadership style centers on empowering teams to take risks, learn fast, and build with intention. 
                  I believe the best designs emerge from constraints, not from unlimited freedom.
                </p>
              </div>
            </div>
            <div className="brutal-shadow bg-gray-50 p-8">
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-6">Core Principles</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent mt-2"></div>
                  <div>
                    <h4 className="font-sans font-medium text-gray-900 mb-1">Experiment Fearlessly</h4>
                    <p className="font-sans text-sm text-gray-600">Embrace failure as a path to innovation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent mt-2"></div>
                  <div>
                    <h4 className="font-sans font-medium text-gray-900 mb-1">Build at Scale</h4>
                    <p className="font-sans text-sm text-gray-600">Design systems that grow with teams</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent mt-2"></div>
                  <div>
                    <h4 className="font-sans font-medium text-gray-900 mb-1">Lead with Empathy</h4>
                    <p className="font-sans text-sm text-gray-600">Understand users and teams deeply</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-8 bg-gray-900">
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
              <div className="brutal-border bg-white p-6">
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">Get in Touch</h3>
                <div className="space-y-3">
                  <a 
                    href="mailto:zachary@zapier.com"
                    className="flex items-center font-sans text-gray-700 hover:text-accent transition-colors"
                  >
                    <span className="mr-3">📧</span>
                    zachary@zapier.com
                  </a>
                  <a 
                    href="https://linkedin.com/in/zacharywalsh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center font-sans text-gray-700 hover:text-accent transition-colors"
                  >
                    <span className="mr-3">💼</span>
                    LinkedIn
                  </a>
                </div>
              </div>
              <div className="text-center">
                <p className="font-sans text-sm text-gray-400">
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