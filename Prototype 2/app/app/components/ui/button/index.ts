import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium leading-5 select-none transition-[background-color,box-shadow,transform,color,border-color] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:bg-muted disabled:bg-none disabled:text-muted-foreground disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px] shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-ring aria-invalid:outline-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        soft: "bg-foreground/[0.07] text-foreground hover:bg-foreground/[0.12]",
        outline: "border border-input/60 bg-transparent text-foreground hover:bg-accent hover:border-input",
        ghost: "text-foreground hover:bg-accent",
        check: "bg-check text-check-foreground hover:brightness-95 dark:hover:brightness-125",
        assist: "bg-assist text-assist-foreground hover:brightness-95 dark:hover:brightness-125",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        link: "rounded-md text-link underline decoration-link/40 underline-offset-4 hover:decoration-link active:scale-100",
      },
      size: {
        "default": "h-10 px-5 has-[>svg]:px-4",
        "xs": "h-7 gap-1 px-3 text-xs has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        "sm": "h-9 gap-1.5 px-4 has-[>svg]:px-3.5 [&_svg:not([class*='size-'])]:size-4",
        "lg": "h-12 px-6 text-[15px] has-[>svg]:px-5",
        "xl": "h-14 px-8 text-base has-[>svg]:px-7",
        "icon": "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
