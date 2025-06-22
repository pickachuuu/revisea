import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const CardVariants = cva(
  'rounded-xl shadow-sm border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-surface border-border hover:shadow-md',
        elevated: 'bg-surface border-border shadow-md hover:shadow-lg',
        outline: 'bg-transparent border-border',
        ghost: 'bg-transparent border-transparent hover:bg-background-muted',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof CardVariants> {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ 
  children, 
  className, 
  variant, 
  size, 
  ...props 
}: CardProps) {
  return (
    <div className={cn(CardVariants({ className, variant, size }))} {...props}>
      {children}
    </div>
  );
}

Card.Header = function({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
};

Card.Title = function({ children, className, ...props }: CardProps) {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
};

Card.Description = function({ children, className, ...props }: CardProps) {
  return (
    <p className={cn("text-sm text-foreground-muted", className)} {...props}>
      {children}
    </p>
  );
};

Card.Content = function({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("flex items-center pt-4", className)} {...props}>
      {children}
    </div>
  );
};