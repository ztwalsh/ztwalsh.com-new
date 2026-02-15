import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Inria_Serif } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const cabinetGrotesk = localFont({
  src: [
    {
      path: "../../public/CabinetGrotesk-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/CabinetGrotesk-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-cabinet",
  display: "swap",
});

const inriaSerif = Inria_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["italic"],
  variable: "--font-inria",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zach Walsh: Product design lover and leader",
  description: "Design leader focused on experimentation, tinkering, and building at Zapier",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8H02CWQTGC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8H02CWQTGC');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${cabinetGrotesk.variable} ${inriaSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
