import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AYVER STORE | Espace Vestiaire",
  description: "Streetwear, Sneakers, et Jerseys Premium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ backgroundColor: "#F0EDE6", color: "#131C14" }}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: "#F0EDE6", color: "#131C14", margin: 0, padding: 0 }}
      >
        {children}
      </body>
    </html>
  );
}