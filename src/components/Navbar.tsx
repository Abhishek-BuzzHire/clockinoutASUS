"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ActionButton from "./ActionButton";
import { useAuth } from "@/context/AuthContext";
import { UserDetailsCard } from "./UserDetailsCard";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role ?? "employee";

  const navLinks = [
    { name: "Dashboard", href: `/${role === "admin" ? "admin" : "employee"}` },
    { name: "AI Assistance", href: "/ai-assist" },
    { name: "Candidate Search", href: "/database" },
  ];

  return (
    <div className="flex items-center justify-between p-4">
      <div className="hidden md:flex items-center gap-2 text-2xl font-bold px-2 text-gray-700">
        <span className="capitalize">{role}</span>
      </div>
      <div className="flex items-center gap-4 justify-end w-full">
        <ul className="flex space-x-4 md:space-x-6">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`font-semibold text-md transition-colors rounded-md p-2 ${isActive ? "text-white bg-indigo-600 " : "text-gray-600 hover:text-gray-800"}`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center gap-4 justify-end w-full">
        <ActionButton />
        <div className="flex items-center space-x-2 transition-all duration-300 ease-in-out">
          <input
            type="text"
            placeholder="Search..."
            className={`p-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out ${isSearchOpen ? "w-48 opacity-100 px-4" : "w-0 opacity-0 px-0"}`}
          />
          <div
            className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative shadow-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Image src="/search.png" alt="Search" width={20} height={20} />
          </div>
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/bell.png" alt="" width={20} height={20} />
          <div className="absolute -top-0 -right-0 w-2 h-2 flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs"></div>
        </div>
        <UserDetailsCard />
      </div>
    </div>
  );
};

export default Navbar;