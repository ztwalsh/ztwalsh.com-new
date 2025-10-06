import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
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

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zachary Walsh - Head of Design",
  description: "Design leader focused on experimentation, tinkering, and building at Zapier",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cabinetGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
