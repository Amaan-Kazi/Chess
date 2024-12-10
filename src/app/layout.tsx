// "use client"

import "./globals.css";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
// import { useEffect, useState } from "react";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  // // ThemeProvider detects system theme and applies it dynamically
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // if (!mounted) {
  //   return <div>Loading...</div>;
  // }

  // console.log("Mounted")

  return (
    <html lang="en">
      <head>
        <title>Chess</title>
        <meta name="description" content="Chess, play online, locally or with bot, created by Amaan Kazi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
