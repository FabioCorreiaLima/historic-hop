import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm md:text-base font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quiz-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 md:[&_svg]:size-5 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-quiz-primary text-black hover:bg-quiz-primary-dark shadow-lg shadow-quiz-primary/10",
        destructive: "bg-quiz-wrong text-white hover:bg-quiz-wrong/90 shadow-lg shadow-quiz-wrong/10",
        outline: "border-2 border-quiz-border bg-transparent hover:border-quiz-primary hover:text-quiz-primary text-quiz-text-main",
        secondary: "bg-quiz-surface text-quiz-text-main border border-quiz-border hover:border-quiz-primary/50",
        ghost: "text-quiz-text-muted hover:text-quiz-text-main hover:bg-quiz-surface",
        link: "text-quiz-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2 md:h-14 md:px-8",
        sm: "h-10 rounded-lg px-4 text-[10px] md:text-xs",
        lg: "h-14 md:h-16 rounded-2xl px-10 md:px-12 text-base md:text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
