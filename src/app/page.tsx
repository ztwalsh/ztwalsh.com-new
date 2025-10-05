export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container py-8">
        <div className="flex items-center justify-between">
          <div className="logo">ZW</div>
          <nav className="flex space-x-8">
            <a href="#work" className="nav-link active">work</a>
            <a href="#experiments" className="nav-link">experiments</a>
            <a href="#contact" className="nav-link">get in touch</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container">
        <div className="content-left pt-20 pb-32">
          <h1 className="hero-name mb-6">zach walsh</h1>
          <h2 className="subtitle mb-8">designer & leader</h2>
          <p className="tagline max-w-2xl">
            connecting people, simplifying complexity, shipping products that matter
          </p>
        </div>
      </main>
    </div>
  );
}