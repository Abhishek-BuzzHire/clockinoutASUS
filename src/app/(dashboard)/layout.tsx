import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { UserDetailsCard } from "@/components/UserDetailsCard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">
      {/* LEFT */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
        <Link
          href="/admin"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/logo.png" alt="logo" width={128} height={128} />
        </Link>
        <Menu />
      </div>
      {/* RIGHT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col relative">
        <Navbar />
        {children}
        
        {/* Floating User Profile at Bottom Right */}
        <div className="fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-lg border border-slate-100 p-1">
          <UserDetailsCard />
        </div>
      </div>
    </div>
  );
}