import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="container flex-1 flex items-center">
        <div className="content-hero">
          <h1 className="hero-statement">
            i&apos;m <em className="hero-accent">zach walsh</em>. I{" "}
            <em className="hero-accent">connect</em>{" "}
            people, <em className="hero-accent">simplify</em>{" "}
            complexity, and <em className="hero-accent">ship</em>{" "}
            products that matter.
          </h1>
          <p className="hero-subtitle">product design leadership</p>
        </div>
      </main>
    </div>
  );
}
