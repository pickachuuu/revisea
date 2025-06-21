import { cn } from "@/app/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import type { ComponentType, SVGProps } from "react";

const ButtonVariants = cva(
  'inline-flex justify-center items-center gap-2 p-1 rounded-2xl transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-foreground text-background hover:opacity-90',
      },
      size: {
        md: 'min-h-9 px-4 py-2 text-sm w-full',
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
      {Icon && <Icon />}
      {children}
    </button>
  );
}
