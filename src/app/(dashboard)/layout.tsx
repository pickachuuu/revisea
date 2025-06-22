import Navbar from "@/component/Layout/navbar/navbar";

export default function DashboardLayout({ children }:Readonly<{
  children: React.ReactNode;
}>){
    return (
        <div>
            <nav>
            <Navbar/>
            </nav>
            <main className="py-6 px-20">
            {children}
            </main>
        </div>
    )
}