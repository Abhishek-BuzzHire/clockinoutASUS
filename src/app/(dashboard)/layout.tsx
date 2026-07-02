import Menu from "@/components/Menu";
import MobileMenu from "@/components/MobileMenu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* MOBILE TOP HORIZONTAL MENU (< md) */}
      <div className="md:hidden w-full shrink-0 z-50">
        <MobileMenu />
      </div>

      {/* DESKTOP LEFT SIDEBAR (>= md) */}
      <div className="hidden md:block md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 shrink-0 h-full overflow-y-auto">
        <Link
          href="/admin"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/logo.png" alt="logo" width={128} height={128} />
        </Link>
        <Menu />
      </div>

      {/* RIGHT / MAIN CONTENT AREA */}
      <div className="w-full md:w-[92%] lg:w-[84%] xl:w-[86%] flex-1 bg-[#F7F8FA] overflow-y-auto flex flex-col relative h-full">
        <Navbar />
        {children}
      </div>
    </div>
  );
}