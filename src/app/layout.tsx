import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { clientConfig } from "@/config/client";
import { ConfigProvider } from "@/contexts/config";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/layout/app-layout";
import { AlertsProvider } from "@/contexts/alerts";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConfigProvider config={clientConfig}>
            <AlertsProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </AlertsProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
