"use client";
import "../../public/fonts.css";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon } from 'lucide-react';

export default function Navbar({ activePage }: { activePage: string }) {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "https://github.com/Amaan-Kazi/Chess", label: "GitHub" },
  ];

  return (
    <>
      <style>{`
        .navbar-background {
          background-color: rgb(194, 194, 194);
        }

        .dark .navbar-background {
          background-color: hsl(45, 5%, 14%);
        }
      `}</style>

      <nav className="flex navbar-background shadow-md">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center pl-2 pr-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="favicon.ico"
              alt="Favicon"
              className="w-10 h-10"
            />
            <p className="text-3xl font-academiaM54 py-3">Chess</p>
          </div>

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
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={`block mx-4 my-2 md:py-0 relative group ${
                  activePage === link.label && "text-primary font-bold"
                }`}
              >
                {link.label}
                {/* Underline effect */}
                <span
                  className={`
                    absolute left-1/2 bottom-0 h-[2px] w-0
                    ${activePage !== link.label ? 'bg-primary' : theme === 'light' ? 'bg-black' : 'bg-white'}
                    transition-all duration-300 ease-out group-hover:w-full group-hover:left-0`
                  }
                ></span>
              </a>
            ))}
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
