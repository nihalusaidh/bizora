import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppBoot } from "@/components/providers/app-boot";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#DC2626",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
      style={{ colorScheme: "light" }}
    >
      <head>
        <link rel="preconnect" href="https://nzfpgkloqwjrsbvdegsx.supabase.co" />
        <link rel="dns-prefetch" href="https://nzfpgkloqwjrsbvdegsx.supabase.co" />
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        {/* Installed app: skip the marketing landing before first paint.
           The native bridge can inject a tick after parsing, so poll briefly
           and hide the page the instant the app is detected — no site flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{(function(){function go(){if(window.Capacitor){var p=location.pathname;if(p==="/"||p==="/pricing"||p==="/download"||p==="/faq"||p==="/security"){try{document.documentElement.style.display="none";}catch(e){}location.replace("/login");}return true;}return false;}if(go())return;var t=0;var i=setInterval(function(){t++;if(go()||t>40){clearInterval(i);}},50);})();}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AppBoot />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
