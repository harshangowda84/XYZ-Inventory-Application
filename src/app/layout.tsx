import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XYZ Fulfillment Hub | Operations Dashboard",
  description: "Simple, easy-to-use e-commerce fulfillment, pick-pack, and staging system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900">
      <body className="min-h-full flex flex-col antialiased selection:bg-slate-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
