"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { useSizeVariant } from "@/lib/size-context";
import { useSurface } from "@/lib/surface-context";
import { SURFACE_SHADOW, surfaceClasses } from "@/lib/surface-classes";

const badgeColors = {
  gray: "#a3a3a3",
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  pink: "#ec4899",
  rose: "#f43f5e",
} as const;

type BadgeColor = keyof typeof badgeColors;

const badgeVariants = cva(
  "inline-flex items-center font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        solid: "",
        dot: "border border-border text-foreground",
      },
      // The two-step size ladder shared by every control — see /docs/sizes.
      size: {
        default: "h-6 px-2.5 text-[12px] gap-1.5",
        compact: "h-5 px-2 text-[11px] gap-1",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
    },
  }
);

type BadgeSizeCanonical = "default" | "compact";

/** Public size values: the canonical two-size scale plus the pre-sizes-system
 *  aliases, kept so existing call sites keep compiling. Aliases resolve onto
 *  the canonical ladder (sm → compact; md/lg → default). */
type BadgeSize = BadgeSizeCanonical | "sm" | "md" | "lg";

const legacySizeAliases: Partial<Record<BadgeSize, BadgeSizeCanonical>> = {
  sm: "compact",
  md: "default",
  lg: "default",
};

interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color">,
    Omit<VariantProps<typeof badgeVariants>, "size"> {
  color?: BadgeColor;
  /** Lift two surface steps above the substrate, with shadow. Combines with
   *  both variants: solid keeps its tinted ground and gains the shadow;
   *  dot swaps its transparent ground for the elevated surface. */
  elevated?: boolean;
  /** Omitted, the badge follows the surrounding SizeProvider. Legacy
   *  sm/md/lg values still resolve. */
  size?: BadgeSize;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "solid",
      elevated = false,
      size: sizeProp,
      color = "gray",
      children,
      style,
      ...props
    },
    ref
  ) => {
    const shape = useShape();
    // Resolve the size: explicit prop (legacy aliases mapped onto the
    // canonical ladder) > surrounding SizeProvider > default.
    const contextSize = useSizeVariant();
    const size: BadgeSizeCanonical = sizeProp
      ? legacySizeAliases[sizeProp] ?? (sizeProp as BadgeSizeCanonical)
      : contextSize === "compact"
        ? "compact"
        : "default";
    const colorValue = badgeColors[color];
    const isSolid = variant === "solid";
    const dotSize = size === "compact" ? 6 : 7;

    // Elevated badges sit two steps (+2, the popover offset) above the current
    // substrate so they lift off cards and images in both light and dark mode.
    // Solid keeps its tinted ground (inline style beats the bg class, so only
    // the shadow is applied); dot takes the full elevated surface and drops
    // its transparent-ground border. The lookup tables keep the literal
    // Tailwind classes visible to the v4 scanner. Badge is a leaf span, so no
    // SurfaceProvider re-provide.
    const substrate = useSurface();
    const level = Math.min(substrate + 2, 8);
    const elevatedClasses = elevated
      ? isSolid
        ? SURFACE_SHADOW[level]
        : cn("text-foreground", surfaceClasses(level))
      : "";

    const colorStyle = isSolid
      ? color === "gray"
        ? { backgroundColor: "var(--accent)", color: "var(--foreground)" }
        : {
            color: "var(--foreground)",
            backgroundColor: `color-mix(in srgb, ${colorValue} 15%, var(--background))`,
          }
      : {};

    const dotColor = color === "gray" ? "var(--muted-foreground)" : colorValue;

    return (
      <span
        ref={ref}
        className={cn(
          // Elevated dot drops the transparent-ground border (the surface +
          // shadow draws the edge instead), so it builds on the solid base.
          badgeVariants({
            variant: elevated && !isSolid ? "solid" : variant,
            size,
          }),
          shape.item,
          elevatedClasses,
          className
        )}
        style={{ ...colorStyle, ...style }}
        {...props}
      >
        {!isSolid && (
          <span
            className="shrink-0 rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: dotColor,
            }}
          />
        )}
        {/* text-box needs a block container — the badge root is a flex
            container, so the label gets its own span. Height is fixed (h-*),
            so trimming only recenters the letterforms. */}
        <span className="[text-box:trim-both_cap_alphabetic]">{children}</span>
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants, badgeColors };
export type { BadgeProps, BadgeColor, BadgeSize };
