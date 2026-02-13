import DatabaseNavbar from "@/components/database/DatabaseNavBar";

interface DatabaseLayoutProps {
    children: React.ReactNode;
}

export default function DatabaseLayout({ children }: DatabaseLayoutProps) {
    
    return (
        <>
        <DatabaseNavbar />
        <main>{children}</main>
        </>
    )
}

