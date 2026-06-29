"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ActionButton from "./ActionButton";
import { useAuth } from "@/context/AuthContext";
import { UserDetailsCard } from "./UserDetailsCard";
import { Menu as MenuIcon, X } from "lucide-react";
import AppMenu from "./Menu";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role ?? "employee";

  const navLinks = [
    { name: "Dashboard", href: `/${role === "admin" ? "admin" : "employee"}` },
    { name: "AI Assistance", href: "/ai-assist" },
    { name: "Candidate Search", href: "/database" },
  ];

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <div className="hidden md:flex items-center justify-between p-4 gap-4 bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-2 text-2xl font-bold px-2 text-gray-800 shrink-0">
          <span className="capitalize">{role}</span>
        </div>
        <div className="flex items-center justify-center w-full">
          <ul className="flex space-x-6 w-max bg-gray-50/80 px-5 py-2 rounded-full border border-gray-100">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`font-semibold text-sm transition-all rounded-full px-4 py-2 block ${
                      isActive
                        ? "text-white bg-indigo-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex items-center gap-4 justify-end shrink-0">
          <ActionButton />
          <div className="flex items-center space-x-2 transition-all duration-300 ease-in-out">
            <input
              type="text"
              placeholder="Search..."
              className={`p-2 rounded-full border border-gray-300 focus:outline-none focus:border-indigo-500 transition-all duration-300 ease-in-out ${
                isSearchOpen ? "w-48 opacity-100 px-4" : "w-0 opacity-0 px-0"
              }`}
            />
            <div
              className="bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer relative shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors shrink-0"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Image src="/search.png" alt="Search" width={18} height={18} />
            </div>
          </div>
          <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer relative border border-gray-100 shadow-sm shrink-0">
            <Image src="/bell.png" alt="" width={18} height={18} />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-2 border-white bg-red-500 rounded-full"></div>
          </div>
          <UserDetailsCard />
        </div>
      </div>

      {/* --- MOBILE NAVBAR --- */}
      <div className="md:hidden flex flex-col p-4 bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm"
            >
              <MenuIcon size={22} className="text-gray-700" />
            </button>
            <Image src="/logo.png" alt="logo" width={110} height={32} className="h-8 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-50 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer relative border border-gray-100 shadow-sm">
              <Image src="/bell.png" alt="" width={18} height={18} />
              <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 border-2 border-white bg-red-500 rounded-full"></div>
            </div>
            <UserDetailsCard />
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY (DRAWER) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col p-5 md:hidden overflow-y-auto animate-in slide-in-from-left-4 fade-in duration-200">
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
            <Image src="/logo.png" alt="logo" width={130} height={40} className="w-32 h-auto" />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-gray-50 rounded-full border border-gray-100 shadow-sm"
            >
              <X size={22} className="text-gray-700" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4">QUICK LINKS</h3>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`font-semibold text-lg block p-3.5 rounded-xl transition-all ${
                        isActive
                          ? "text-white bg-indigo-600 shadow-md"
                          : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Using generic group class to pass down mobile context to Menu */}
          <div className="is-mobile group pb-8" onClick={() => setIsMobileMenuOpen(false)}>
            <AppMenu />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;