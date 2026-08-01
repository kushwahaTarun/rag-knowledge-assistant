import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

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
            <AppHeader />
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
