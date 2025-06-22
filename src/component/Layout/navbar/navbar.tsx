'use client';

import { navItems } from "./navConfig";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar(){
    const pathname = usePathname()

    return (
        <div className="sticky top-0 w-full min-h-10 bg-background-muted shadow-md rounded-b-3xl font-serif">
            <div className="flex justify-between p-4">
                <div className="text-foreground font-semibold text-3xl">
                    Revisea.
                </div>

                <div className="flex gap-6">

                {navItems && (navItems.map((item, index) => {
                    return (
                        <div className="relative" key={index}>
                            <Link href={item.href} className="text-foreground font-light text-2xl">
                                {item.name}
                            </Link>
                            <span className={`absolute left-0 w-full h-[2px] rounded-full bg-foreground-muted bottom-0.5`}></span>
                        </div> 
                    )
                }))}

                </div>
            </div>
        </div>
    )
}