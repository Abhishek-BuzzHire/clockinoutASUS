import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">
      {/* LEFT */}
      <div className="hidden md:flex flex-col w-[8%] lg:w-[16%] xl:w-[14%] p-2 md:p-4 shrink-0 overflow-y-auto overflow-x-hidden border-r border-gray-100">
        <Link
          href="/admin"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/logo.png" alt="logo" width={128} height={128} className="w-8 lg:w-32 h-auto" />
        </Link>
        <Menu />
      </div>
      {/* RIGHT */}
      <div className="flex-1 bg-[#F7F8FA] overflow-y-auto flex flex-col">
        <Navbar />
        {children}
      </div>
    </div>
  );
}