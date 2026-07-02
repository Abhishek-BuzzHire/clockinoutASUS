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
    { icon: "/dashboard.png", label: "Dashboard", href: dashboardHref, visible: ["admin", "employee", "developer"] },
    { icon: "/candidates.png", label: "Employees", href: "/list/employees", visible: ["admin", "developer"] },
    { icon: "/calendar.png", label: "Attendance", href: attendanceHref, visible: ["admin", "employee", "developer"] },
    { icon: "/profile.png", label: "Profile", href: "/profile", visible: ["admin", "employee", "developer"] },
  ].filter(item => item.visible.includes(role));

  return (
    <>
      <div className="w-full bg-white shadow-xs select-none [-webkit-tap-highlight-color:transparent]">
        {/* Top Row: Logo & Logout */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
          <Link href={dashboardHref} className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={110} height={32} className="h-7 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>Logout</span>
          </button>
        </div>

        {/* Bottom Row: Horizontal Navigation Bar */}
        <div className="flex items-center justify-start gap-2 px-3 py-2 bg-slate-50/80 backdrop-blur-md overflow-x-auto border-b border-slate-200/60 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  isActive
                    ? "bg-sky-100 text-blue-700 border border-sky-300/80 shadow-xs"
                    : "text-slate-600 hover:bg-sky-50/80 active:bg-sky-100/80 active:text-blue-700 border border-transparent"
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={16}
                  height={16}
                  className="opacity-80 shrink-0"
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
