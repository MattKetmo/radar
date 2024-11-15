import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConfigProvider } from "@/contexts/config";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { AppLayout } from "@/components/layout/app-layout";
import { AlertsProvider } from "@/contexts/alerts";

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
    { rel: "shortcut icon", type: "image/x-icon", url: "/favicon.ico", },
    { rel: "icon", type: "image/png", sizes: "96x96", url: "/favicon-96x96.png", },
    { rel: "icon", type: "image/png", sizes: "192x192", url: "/web-app-manifest-192x192.png", },
    { rel: "icon", type: "image/png", sizes: "512x512", url: "/web-app-manifest-512x512.png", },
    { rel: "icon", type: "image/svg+xml", sizes: "96x96", url: "/favicon.svg", },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/apple-touch-icon.png", },
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
            <ConfigProvider>
              <AlertsProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              </AlertsProvider>
            </ConfigProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
