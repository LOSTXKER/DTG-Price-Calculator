import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-thai",
});

export const metadata: Metadata = {
  title: "DTG Price Calculator",
  description: "คำนวณต้นทุนและราคาขายงาน DTG - Brother GTX Pro Bulk",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${notoSansThai.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-[family-name:var(--font-inter),var(--font-noto-thai)] antialiased bg-[var(--bg)] text-[var(--text-primary)] min-h-screen transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
