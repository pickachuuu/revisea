import Navbar from "@/component/Layout/navbar/navbar";

export default function DashboardLayout({ children }:Readonly<{
  children: React.ReactNode;
}>){
    return (
        <div>
            <nav>
            <Navbar/>
            </nav>
            <main className="p-8">
            {children}
            </main>
        </div>
    )
}