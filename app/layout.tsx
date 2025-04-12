import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monorail curve radius calculator",
  description: "Calculate the curvature of a bent pipe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
