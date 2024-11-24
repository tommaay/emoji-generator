import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

const fontHeading = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const fontBody = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Image Generator",
  description: "Generate custom images with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased relative flex flex-col",
            fontHeading.variable,
            fontBody.variable
          )}
        >
          <Header />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
