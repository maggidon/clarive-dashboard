import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clarive AI — Dashboard",
  description: "Clarive AI clinic dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Clarive AI" />
      </head>
      <body>{children}</body>
    </html>
  );
}