import type { Metadata, Viewport } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAG Knowledge Assistant",
  description: "Upload documents and chat with your knowledge base.",
};

/** Explicit mobile viewport — pairs with safe-area + visualViewport chat handling */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a1018" },
    { media: "(prefers-color-scheme: light)", color: "#0a1018" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full overflow-hidden antialiased font-sans",
        poppins.variable,
        geist.variable,
      )}
    >
      <body className="h-full overflow-hidden font-[family-name:var(--font-poppins)]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
