import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement>{
    children: React.ReactNode
    className?: string
}

export default function Header( {children, className}: HeaderProps ){
    return (
        <div className="">
            {children}
        </div>
    )
}

Header.Subtitle = function Subtitle({children, className}: HeaderProps){
    return (
        <div>
            {children}
        </div>
    )
}