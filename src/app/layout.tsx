import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConfigProvider } from "@/contexts/config";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { AppLayout } from "@/components/layout/app-layout";
import { AlertsProvider } from "@/contexts/alerts";
import { TooltipProvider } from "@/components/ui/tooltip";

export const dynamic = "force-dynamic";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Radar",
  description: "Dashboard for AlertManager Prometheus",
  icons: [
    { rel: "shortcut icon", type: "image/x-icon", url: "/icons/favicon.ico", },
    { rel: "icon", type: "image/png", sizes: "96x96", url: "/icons/manifest-any-96x96.png", },
    { rel: "icon", type: "image/png", sizes: "192x192", url: "/icons/manifest-any-192x192.png", },
    { rel: "icon", type: "image/png", sizes: "256x256", url: "/icons/manifest-any-256x256.png", },
    { rel: "icon", type: "image/png", sizes: "384x384", url: "/icons/manifest-any-384x384.png", },
    { rel: "icon", type: "image/png", sizes: "512x512", url: "/icons/manifest-any-512x512.png", },
    { rel: "icon", type: "image/png", sizes: "1024x1024", url: "/icons/manifest-any-1024x1024.png", },
    { rel: "icon", type: "image/svg+xml", sizes: "96x96", url: "/icons/favicon.svg", },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/icons/apple-touch-icon.png", },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider delayDuration={150}>
              <ConfigProvider>
                <AlertsProvider>
                  <AppLayout>
                    {children}
                  </AppLayout>
                </AlertsProvider>
              </ConfigProvider>
            </TooltipProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
