import { cn } from "@/lib/utils";
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
                lg: 'min-w-96',
                md: 'min-w-64',
                auto: 'w-auto h-auto'
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
        <div className={`text-3xl font-semibold ${className}`}>
            {children}
        </div>
    )
}

Card.Subtitle = function({ children, className}: CardProps){
    return (
        <p className={`text-background-muted shadow-foreground text-md font-semibold ${className}`} >
            {children}
        </p>
    )
}

Card.Content = function({children, className}: CardProps){
    return (
        <div className={`p-3 my-2 ${className}`}>
            {children}
        </div>
    )
}