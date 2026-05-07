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
      <body>{children}</body>
    </html>
  );
}