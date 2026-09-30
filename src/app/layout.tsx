import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAI Alert — Autonomous Cyclonic Civil Vulnerability Command Center",
  description: "Autonomous Hyper-Local Cyclone Impact Simulation & Infrastructure Vulnerability Forecaster",
  icons: {
    icon: "/kai-alert-logo.png",
    shortcut: "/kai-alert-logo.png",
    apple: "/kai-alert-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
