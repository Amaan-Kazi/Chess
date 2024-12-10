"use client"

import "./globals.css";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  // ThemeProvider detects system theme and applies it dynamically
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div></div>;
  }

  return (
    <html lang="en">
      <head>
      <title>Chess</title>
        <meta name="description" content="Chess, play online, locally or with bot, created by Amaan Kazi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
