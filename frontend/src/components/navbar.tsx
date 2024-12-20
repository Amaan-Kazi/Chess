"use client";
import "../../public/fonts.css";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon } from 'lucide-react';

export default function Navbar({ activePage }: { activePage: string }) {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  
  console.log(activePage);

  return (
    <>
      <style>{`
        .navbar-background {
          background-color: rgb(194, 194, 194);
        }

        .dark .navbar-background {
          background-color: rgb(9, 9, 11);
        }
      `}</style>

      <nav className="flex navbar-background shadow-md">
        <div className="w-full flex justify-between items-center">
          <div className="text-3xl font-academiaM54 p-3">Chess</div>

          {/* Button for expanding navbar vertically on small devices */}
          <button
            className="block md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
          </button>

          {/* Links */}
          <div
            className={`md:flex absolute md:relative top-14 left-0 right-0 navbar-background md:bg-transparent md:top-auto transition-all ${
              menuOpen ? "block" : "hidden"
            }`}
          >
            <a href="#" className="block px-4 py-2 md:py-0">
              Home
            </a>
            <a href="#" className="block px-4 py-2 md:py-0">
              About
            </a>
            <a href="#" className="block px-4 py-2 md:py-0">
              Contact
            </a>
          </div>
        </div>

        {/* Theme switch button */}
        <button
          className="mx-3"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon /> : <Sun />}
        </button>
      </nav>
    </>
  );
}
