"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container navigation">
        <div className="logo">
          <Link href="/">zw</Link>
        </div>
      </div>
    </header>
  );
}
