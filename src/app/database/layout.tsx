import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from "react";
import DatabaseNavbar from "@/components/database/DatabaseNavBar";

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-[#F7F8FA] flex flex-col overflow-hidden">
      {/* Custom Minimal Header for Full Screen Mode */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-white border-b border-gray-100 shadow-sm shrink-0 z-50 relative">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>
        
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg md:text-xl font-bold text-gray-800 truncate px-4">
          Candidate Resume Data
        </h1>
        
        <div className="w-24"></div> {/* Spacer to keep title centered */}
      </header>
      
      <DatabaseNavbar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full relative md:p-4">
        {children}
      </div>
    </div>
  );
}
