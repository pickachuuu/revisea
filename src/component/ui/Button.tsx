import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import type { ComponentType, SVGProps,  } from "react";

const ButtonVariants = cva(
  'inline-flex justify-center items-center gap-2 p-1 transition-colors',
  {
    variants: {
      variant: {
        primary: 'rounded-2xl bg-foreground text-background hover:opacity-90',
        secondary: 'rounded-md text-background border-1 border-zinc-400'
      },
      size: {
        md: 'min-h-9 px-4 py-2 text-sm w-full',
        sm: 'h-10 w-auto p-3 text-sm'
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type HugeIconType = ComponentType<SVGProps<SVGSVGElement>>;


interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ButtonVariants> {
  children: React.ReactNode;
  className?: string;
  iconSize?: number;
  Icon?: HugeIconType;
}

export default function Button({
  children,
  className,
  variant,
  size,
  Icon: Icon,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(ButtonVariants({ className, variant, size }))} {...props}>
      {Icon && <Icon className="h-5"/>}
      {children}
    </button>
  );
}
