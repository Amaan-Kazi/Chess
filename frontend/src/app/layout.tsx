import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Chess</title>
        <meta name="description" content="Chess, play online, locally or with bot, created by Amaan Kazi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased min-h-screen bg-background">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
