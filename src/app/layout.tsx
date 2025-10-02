import type { Metadata } from "next";
import { Gloock, Space_Grotesk } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const display = Gloock({
  variable: "--font-display",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zachary Walsh — Head of Design",
  description: "Confident, editorial portfolio. Experimentation, systems, and building at scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${grotesk.variable} ${display.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
