import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-semibold tracking-[-0.005em] transition-[background-color,box-shadow,transform,border-color,color] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px] shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-glow hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_14px_28px_-8px_rgb(255_170_0/75%)]",
        dark: "bg-foreground text-background hover:bg-foreground/88 hover:-translate-y-px shadow-md",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border-2 border-foreground/12 bg-card text-foreground hover:border-foreground/35 hover:bg-card",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        ghost: "text-foreground hover:bg-foreground/7",
        soft: "bg-guidance text-guidance-foreground hover:bg-guidance/70",
        link: "text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground rounded-md active:scale-100",
      },
      size: {
        "default": "h-11 px-5 has-[>svg]:px-4",
        "xs": "h-7 gap-1 px-3 text-xs has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        "sm": "h-9 gap-1.5 px-4 text-sm has-[>svg]:px-3.5 [&_svg:not([class*='size-'])]:size-4",
        "lg": "h-[52px] px-7 text-base has-[>svg]:px-6",
        "xl": "h-14 px-8 text-base has-[>svg]:px-7",
        "icon": "size-11",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
