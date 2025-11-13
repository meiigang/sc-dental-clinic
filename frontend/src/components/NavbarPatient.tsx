"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NotificationBell } from "./ui/notification-bell";
import Image from "next/image";
import Link from "next/link";

// FIX: Corrected component name
export default function NavbarPatient() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token");
    router.push("/");
  };

  // MODIFICATION: Removed 'Notifications' from this array as it will be handled by the bell icon.
  const links: string[] = ["Patient Information Record", "Dashboard", "Log Out"];

  return (
    <nav className="bg-blue-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Left side: Logo + Clinic Name */}
        <div className="flex items-center space-x-3">
          <Image
            src="/images/Logo.png"
            alt="SC Dental Clinic Logo"
            className="h-10 w-10"
            width={40}
            height={40}
          />
          <span className="text-lg sm:text-xl font-bold text-blue-light">
            Sabado-Cuaton Dental Clinic
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6 font-medium">
          {links.map((item) => {
            if (item === "Log Out") {
              return (
                <Link
                  key={item}
                  href="/"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm lg:text-base transition text-blue-light hover:bg-blue-light hover:text-blue-dark"
                  style={{cursor: "pointer"}}>
                  {item}
                </Link>
              )
            }
            let href = "";
              if (item === "Dashboard") {
                href = "/dashboard";
              }else {
                href = `/${item.toLowerCase().replace(/\s+/g, "-")}`;
              }
              const isActive =
                pathname === href ||
                (pathname === "/" && item === "Dashboard");

            return (
              <Link
                key={item}
                href={href}
                className={`px-3 py-2 rounded-md text-sm lg:text-base transition ${
                  isActive
                    ? "bg-blue-dark text-blue-light"
                    : "text-blue-light hover:bg-blue-light hover:text-blue-dark"
                }`}
              >
                {item}
              </Link>
            );
          })}
          {/* MODIFIED: Pass the correct href for patients */}
          <NotificationBell href="/notifications" />
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
          {/* MODIFICATION: Manually add all links for mobile view for clarity */}
          <Link href="/dashboard" className={`block px-3 py-2 rounded-md text-sm transition ${pathname === '/dashboard' ? "bg-blue-light text-blue-dark" : "text-blue-light hover:bg-blue-light hover:text-blue-dark"}`}>Dashboard</Link>
          <Link href="/patient-information-record" className={`block px-3 py-2 rounded-md text-sm transition ${pathname === '/patient-information-record' ? "bg-blue-light text-blue-dark" : "text-blue-light hover:bg-blue-light hover:text-blue-dark"}`}>Patient Information Record</Link>
          <Link href="/notifications" className={`block px-3 py-2 rounded-md text-sm transition ${pathname === '/notifications' ? "bg-blue-light text-blue-dark" : "text-blue-light hover:bg-blue-light hover:text-blue-dark"}`}>Notifications</Link>
          <Link href="/" onClick={handleLogout} className="block px-3 py-2 rounded-md text-sm transition text-blue-light hover:bg-blue-light hover:text-blue-dark">Log Out</Link>
        </div>
      )}
    </nav>
  );
}
