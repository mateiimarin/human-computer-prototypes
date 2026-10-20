import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Badge } from "./Badge.vue"

export const badgeVariants = cva(
  "inline-flex h-6 items-center justify-center gap-1.5 rounded-full border border-transparent px-2.5 text-xs font-medium leading-4 w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 [&>svg]:pointer-events-none transition-[color,background-color] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        neutral: "bg-foreground/[0.07] text-muted-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border-border text-muted-foreground",
        demonstrated: "bg-demonstrated text-demonstrated-foreground",
        partial: "bg-partial text-partial-foreground",
        gap: "bg-gap text-gap-foreground",
        unverified: "bg-unverified text-unverified-foreground border-dashed border-unverified-dot",
        assist: "bg-assist text-assist-foreground",
        check: "bg-check text-check-foreground",
        destructive: "bg-destructive-surface text-destructive",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
)
export type BadgeVariants = VariantProps<typeof badgeVariants>
