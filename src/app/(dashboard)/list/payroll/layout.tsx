
import Link from "next/link";

export default function PayrollLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
        <header className="bg-white">
            <div className="container mx-auto px-6 py-4 flex items-center justify-end">
                <nav className="flex items-center gap-6">
                    <Link href="/list/payroll/payslips" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Payslips</Link>
                    <Link href="/list/employees" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Employees</Link>
                </nav>
            </div>
        </header>
        { children }
        </div>
  );
}