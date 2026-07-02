"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";
import LogoutConfirmModal from "./LogoutConfirmModal";

const MobileMenu = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const role = user?.role ?? "employee";
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dashboardHref = role === "admin" ? "/admin" : "/employee";
  const attendanceHref = role === "admin" ? "/list/attendance/admin" : "/list/attendance/employee";

  const navItems = [
    { icon: "/dashboard.png", label: "Dashboard", href: dashboardHref },
    { icon: "/candidates.png", label: "Employees", href: "/list/employees" },
    { icon: "/calendar.png", label: "Attendance", href: attendanceHref },
    { icon: "/profile.png", label: "Profile", href: "/profile" },
  ];

  return (
    <>
      <div className="w-full bg-white shadow-xs">
        {/* Top Row: Logo & Logout */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
          <Link href={dashboardHref} className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={110} height={32} className="h-7 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>Logout</span>
          </button>
        </div>

        {/* Bottom Row: Horizontal Navigation Bar */}
        <div className="flex items-center justify-around px-2 py-1.5 bg-slate-50/90 overflow-x-auto gap-1.5 border-b border-slate-200/60">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={16}
                  height={16}
                  className={isActive ? "invert brightness-0" : ""}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default MobileMenu;
