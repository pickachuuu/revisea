import Navbar from "@/component/Layout/navbar/navbar";

export default function DashboardLayout({ children }:Readonly<{
  children: React.ReactNode;
}>){
    return (
        <div>
            <nav>
            <Navbar/>
            </nav>
            <main>
            {children}
            </main>
        </div>
    )
}