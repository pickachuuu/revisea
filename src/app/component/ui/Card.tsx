import { cn } from "@/app/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const CardVariants = cva(
    'rounded-xl shadow-lg p-3',
    {
        variants: {
            variant: {
                primary: 'bg-background-muted',
            },
            size: {
                xl: 'min-w-120',
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'xl'
        }
    }
)


interface CardProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof CardVariants>{
        children: React.ReactNode
        className?: string
    }   


export default function Card({ children, className, variant, size, ...props}: CardProps){
    return (
        <div className={cn(CardVariants({className, variant, size}))} {...props}>
            {children}
        </div>
    )
}


Card.Header = function({ children, className }: CardProps){
    return (
        <div className={`text-center text-3xl font-semibold my-5 ${className}`}>
            {children}
        </div>
    )
}

Card.Content = function({children, className}: CardProps){
    return (
        <div className={`px-12 my-5`}>
            {children}
        </div>
    )
}