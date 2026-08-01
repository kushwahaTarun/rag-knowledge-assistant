import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

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
        <SidebarProvider className="!h-full !min-h-0">
          <AppSidebar />
          <SidebarInset className="mesh-bg min-h-0 min-w-0 overflow-hidden">
            <header className="glass-soft relative z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 px-4">
              <SidebarTrigger className="transition-transform duration-200 hover:scale-105" />
              <div className="h-4 w-px bg-border/70" />
              <p className="text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
                Intelligent document search & chat
              </p>
            </header>
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
