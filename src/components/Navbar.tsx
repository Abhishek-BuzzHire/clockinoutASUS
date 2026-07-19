"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role ?? "employee";

  const navLinks = [
    { name: "Dashboard", href: `/${role === "admin" ? "admin" : "employee"}` },
    { name: "AI Assistance", href: "/ai-assist" },
    { name: "Candidate Resume Data", href: "/database" },
  ];

  return (
    <div className="hidden md:flex items-center justify-between p-4">
      <div className="hidden md:flex items-center gap-2 text-2xl font-bold px-2 text-gray-700">
        <span className="capitalize">{role}</span>
      </div>
      {/* Navigation Links - Hidden on Mobile */}
      <div className="hidden md:flex items-center gap-4 justify-end w-full">
        <ul className="flex space-x-4 md:space-x-6">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`font-semibold text-md transition-colors rounded-md p-2 ${isActive ? "text-black" : "text-gray-600 hover:text-gray-800"}`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
};

export default Navbar;