import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Archivo, Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: `${siteConfig.fullName} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.fullName,
    title: siteConfig.fullName,
    description: siteConfig.description,
    images: ["/brand/logo.jpg"],
  },
  icons: {
    icon: "/brand/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream-50 font-sans text-ink-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
