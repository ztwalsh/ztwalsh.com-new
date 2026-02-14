import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="container flex-1 flex items-center">
        <div className="content-hero">
          <h1 className="hero-statement">
            i&apos;m <strong className="hero-bold">zach walsh</strong>—a
            design leader who <strong className="hero-bold">connects</strong>{" "}
            people, <strong className="hero-bold">simplifies</strong>{" "}
            complexity, and <strong className="hero-bold">ships</strong>{" "}
            products that matter.
          </h1>
        </div>
      </main>
    </div>
  );
}
