"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";

type CrtApi = { toggleTheme: () => void };
type CrtWindow = Window & { CRT?: { mount: (opts: Record<string, unknown>) => CrtApi } };

const CrtContext = createContext<{ toggle: () => void }>({ toggle: () => {} });

export function CrtRoot({ children }: { children: ReactNode }) {
  const apiRef = useRef<CrtApi | null>(null);

  useEffect(() => {
    const w = window as CrtWindow;
    const reveal = () => document.documentElement.classList.add("crt-ready");
    // Never leave the page invisible: reveal it plainly if mounting hangs.
    const safety = setTimeout(reveal, 2000);

    function init() {
      try {
        if (w.CRT) {
          apiRef.current = w.CRT.mount({
            root: "#page",
            params: {
              scanlineIntensity: 0.35,
              bloomIntensity: 0.4,
              rgbShift: 0.2,
              curvature: 0,
              vignetteStrength: 0.35,
            },
          });
        }
      } finally {
        clearTimeout(safety);
        reveal();
      }
    }

    if (w.CRT) {
      init();
      return () => clearTimeout(safety);
    }

    const script = document.createElement("script");
    script.src = "/crt.js";
    script.onload = init;
    script.onerror = () => {
      clearTimeout(safety);
      reveal();
    };
    document.body.appendChild(script);
    return () => clearTimeout(safety);
  }, []);

  return (
    <CrtContext.Provider value={{ toggle: () => apiRef.current?.toggleTheme() }}>
      <div id="page">{children}</div>
    </CrtContext.Provider>
  );
}

export function InvertButton() {
  const { toggle } = useContext(CrtContext);
  return (
    <button type="button" className="invert" aria-label="Invert colours" onClick={toggle}>
      invert
    </button>
  );
}
