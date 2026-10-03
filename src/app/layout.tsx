import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "@/src/components/pwa-register";
import FastTap from "@/src/components/fast-tap";
import { ToastProvider } from "@/src/components/toast-provider";

export const metadata: Metadata = {
  title: "OpStays",
  description: "Gestione operativa appartamenti e strutture ricettive",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OpStays",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1b4b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <PWARegister />
        <FastTap />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
