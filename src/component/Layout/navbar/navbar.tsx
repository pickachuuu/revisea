import { navItems } from "./navConfig"
import Link from "next/link"

export default function Navbar(){
    return (
        <div className="sticky top-0 w-full min-h-10 bg-background-muted shadow-md rounded-b-3xl">
            <div className="flex justify-between p-4">
                <div className="text-foreground font-semibold text-2xl">
                    Revisea.
                </div>

                <div className="flex gap-6">
                {navItems && (navItems.map((item, index) => {
                    return (
                        <Link key={index} href={item.href} className="text-foreground font-medium text-xl">
                            {item.name}
                        </Link> 
                    )
                }))}
                </div>
            </div>
        </div>
    )
}