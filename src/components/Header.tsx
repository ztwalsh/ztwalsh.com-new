"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

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
    <header ref={headerRef} className="site-header">
      <div className="container flex items-center justify-between navigation">
        <div className="logo"><a href="/">ZW</a></div>
        <nav className="flex space-x-8">
          <a href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>home</a>
          <a href="/experiments" className={`nav-link ${pathname === '/experiments' ? 'active' : ''}`}>experiments</a>
          <a href="/contact" className={`nav-link ${pathname === '/contact' ? 'active' : ''}`}>contact</a>
        </nav>
      </div>
    </header>
  );
}
