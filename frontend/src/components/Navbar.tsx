"use client";

import { JSX, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const links: string[] = ["Home", "About", "Services", "Login", "Register"];

  return (
    <nav className="bg-blue-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Left side: Logo + Clinic Name */}
        <div className="flex items-center space-x-3">
          <img
            src="/images/Logo.png"
            alt="SC Dental Clinic Logo"
            className="h-10 w-10 rounded-full"
          />
          <span className="text-lg sm:text-xl font-bold text-blue-light">
            Sabado - Cuaton Dental Clinic
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4 lg:space-x-6 font-medium">
          {links.map((item) => {
            const href =
              `/${item.toLowerCase() === "home" ? "" : item.toLowerCase()}`;
            const isActive =
              pathname === href ||
              (pathname === "/" && item.toLowerCase() === "home");

            return (
              <a
                key={item}
                href={href}
                className={`px-3 py-2 rounded-md text-sm lg:text-base transition ${
                  isActive
                    ? "bg-blue-dark text-blue-light"
                    : "text-blue-light hover:bg-blue-light hover:text-blue-dark"
                }`}
              >
                {item}
              </a>
            );
          })}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-light"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 font-medium bg-blue-primary">
          {links.map((item) => {
            const href =
              `/${item.toLowerCase() === "home" ? "" : item.toLowerCase()}`;
            const isActive =
              pathname === href ||
              (pathname === "/" && item.toLowerCase() === "home");

            return (
              <a
                key={item}
                href={href}
                className={`block px-3 py-2 rounded-md text-sm transition ${
                  isActive
                    ? "bg-blue-light text-blue-dark"
                    : "text-blue-light hover:bg-blue-light hover:text-blue-dark"
                }`}
              >
                {item}
              </a>
            );
          })}
        </div>
      )}
    </nav>
  );
}
