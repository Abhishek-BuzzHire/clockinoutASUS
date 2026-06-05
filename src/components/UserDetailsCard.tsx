"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ChangePassword from "./ChangePassword";

export function UserDetailsCard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { employee } = useCurrentEmployee();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [changePassPopUp, setChangePassPopUp] = useState(false);


  const displayName = employee?.name ?? user?.username ?? "User";
  const role = user?.role ?? "employee";
  const getAvatarSrc = () => {
    if (!employee?.profile_photo) return "/avatar.png";
    if (typeof employee.profile_photo === 'string') {
      if (employee.profile_photo.startsWith('/api/')) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        return `${apiUrl}${employee.profile_photo}`;
      }
      return employee.profile_photo.startsWith("data:")
        ? employee.profile_photo
        : `data:image/png;base64,${employee.profile_photo}`;
    }
    return `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(employee.profile_photo)))}`;
  };
  
  const avatarSrc = getAvatarSrc();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (<>
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-1"
          aria-label="Open user menu"
        >
          <div className="flex flex-col items-end">
            <span className="text-xs leading-3 font-medium text-gray-700">{displayName}</span>
            <span className="text-[10px] text-gray-500 capitalize">{role}</span>
          </div>
          <Image
            src={avatarSrc}
            alt=""
            width={36}
            height={36}
            className="rounded-full border-2 border-white shadow-sm"
            unoptimized={!!employee?.profile_photo}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-[280px] p-0 rounded-xl border border-slate-200 shadow-lg",
          "bg-card text-card-foreground"
        )}
      >
        <Card className="border-0 shadow-none rounded-xl bg-transparent">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Image
                  src={avatarSrc}
                  alt=""
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-slate-200"
                  unoptimized={!!employee?.profile_photo}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.username ?? "—"}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 py-0 space-y-2">
            <Separator className="mb-3" />
            <DetailRow label="User ID" value={user?.id ?? "—"} />
            <DetailRow label="Role" value={role} capitalize />
            <DetailRow label="Department" value={employee?.department ?? "—"} />
            <DetailRow label="Designation" value={employee?.designation ?? "—"} />
          </CardContent>
          <CardFooter className="pt-4 pb-5 px-5 border-t border-slate-100 mt-3">

            <div className="w-full flex flex-col gap-3">

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                onClick={() => {
                  setDropdownOpen(false);   // 👈 CLOSE DROPDOWN
                  setChangePassPopUp(true); // 👈 OPEN MODAL
                }}
              >
                Change Password
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                Logout
              </Button>

            </div>
          </CardFooter>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
    {changePassPopUp && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setChangePassPopUp(false)}
        />

        {/* Modal Content */}
        <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-lg p-6">
          <ChangePassword
            onCancel={() => setChangePassPopUp(false)}
          />
        </div>
      </div>
    )}</>
  );
}

function DetailRow({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline gap-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={cn(
          "font-medium text-slate-800 text-right truncate",
          capitalize && "capitalize"
        )}
      >
        {value}
      </span>
    </div>
  );
}
