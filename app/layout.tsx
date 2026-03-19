import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FuelWatch LK – Real-time Fuel Availability Dashboard",
  description:
    "Track fuel availability, prices, and station locations across Sri Lanka in real time. Community-powered updates for 92 Octane, 95 Octane, Diesel, and Super Diesel.",
  keywords: ["fuel", "Sri Lanka", "fuel availability", "petrol", "diesel", "fuel stations"],
  openGraph: {
    title: "FuelWatch LK",
    description: "Real-time fuel availability for Sri Lanka",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100`}>
        {children}
      </body>
    </html>
  );
}
