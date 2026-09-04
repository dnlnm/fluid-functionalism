"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { fontWeights } from "@/lib/font-weight";
import { useShape } from "@/lib/shape-context";
import { SizeProvider, useSize, type SizeVariant } from "@/lib/size-context";
import { useSurface, SurfaceProvider } from "@/lib/surface-context";
import { SURFACE_BG } from "@/lib/surface-classes";
import { Elevated } from "@/lib/elevated";

// ---------------------------------------------------------------------------
// Panel — a sheet one rung above the page with a recessed inset well.
//
// Outer renders at substrate + 1 through Elevated (which re-provides the
// level, so header/footer read the panel as their substrate). The well drops
// back to the outer level minus one — darker than the panel in dark mode,
// surface-1 grey in light mode — with a subtle inner shadow for the carved
// read, and re-provides its own level so nested controls elevate correctly
// off the well floor.
// ---------------------------------------------------------------------------

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Pins header/footer rows to one step of the size ladder (default 36px,
   *  compact 28px — see /docs/sizes). Omitted, they follow the surrounding
   *  SizeProvider. */
  size?: SizeVariant;
}

const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ children, size, className, ...props }, ref) => {
    const shape = useShape();

    const panel = (
      <Elevated
        offset={1}
        ref={ref}
        data-slot="panel"
        className={cn(
          `flex flex-col gap-2 p-2 ${shape.container} border border-border/60 overflow-hidden`,
          className
        )}
        {...props}
      >
        {children}
      </Elevated>
    );

    return size ? <SizeProvider size={size}>{panel}</SizeProvider> : panel;
  }
);

Panel.displayName = "Panel";

// ---------------------------------------------------------------------------
// PanelHeader — title left, action slot right. Dividerless (the well below
// carries the visual separation).
// ---------------------------------------------------------------------------

interface PanelHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

const PanelHeader = forwardRef<HTMLDivElement, PanelHeaderProps>(
  ({ title, action, children, className, ...props }, ref) => {
    const sizeClasses = useSize();
    const compact = sizeClasses.variant === "compact";

    return (
      <div
        ref={ref}
        data-slot="panel-header"
        className={cn(
          // Content-driven row (Card rhythm): density comes from padding and
          // type, never a fixed control height. Padding stays slim so a
          // default-size action button doesn't inflate the bar. Horizontal
          // padding matches the well's inner padding so the title column
          // aligns with the well content column.
          `flex shrink-0 items-center justify-between ${sizeClasses.gap}`,
          compact ? "px-2 py-1.5" : "px-3 py-2",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <span
              className={cn(
                "min-w-0 truncate text-foreground [text-box:trim-both_cap_alphabetic]",
                compact ? "text-[13px]" : "text-[14px]"
              )}
              style={{ fontVariationSettings: fontWeights.semibold }}
            >
              {title}
            </span>
            {action && <span className="shrink-0">{action}</span>}
          </>
        )}
      </div>
    );
  }
);

PanelHeader.displayName = "PanelHeader";

// ---------------------------------------------------------------------------
// PanelInset — the recessed well. Auto height with a floor (override with
// className), re-provides its level for nested elevation.
// ---------------------------------------------------------------------------

interface PanelInsetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const PanelInset = forwardRef<HTMLDivElement, PanelInsetProps>(
  ({ children, className, ...props }, ref) => {
    const shape = useShape();
    const compact = useSize().variant === "compact";
    // The Elevated outer re-provided substrate + 1, so stepping back down
    // one lands the well on the page substrate — darker than the panel.
    const well = Math.max(1, useSurface() - 1);

    return (
      <SurfaceProvider value={well}>
        <div
          ref={ref}
          data-slot="panel-inset"
          className={cn(
            SURFACE_BG[well],
            shape.inset,
            compact ? "p-2" : "p-3",
            "border border-border/40 shadow-[inset_0_1px_2px_rgb(0_0_0/0.15)]",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </SurfaceProvider>
    );
  }
);

PanelInset.displayName = "PanelInset";

// ---------------------------------------------------------------------------
// PanelFooter — right-aligned action row. Dividerless, mirroring the header.
// ---------------------------------------------------------------------------

interface PanelFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const PanelFooter = forwardRef<HTMLDivElement, PanelFooterProps>(
  ({ children, className, ...props }, ref) => {
    const compact = useSize().variant === "compact";
    return (
      <div
        ref={ref}
        data-slot="panel-footer"
        className={cn(
          // Same horizontal inset as the header so action boxes align with
          // the well content column.
          "flex shrink-0 items-center justify-end gap-2",
          compact ? "px-2" : "px-3",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PanelFooter.displayName = "PanelFooter";

export { Panel, PanelHeader, PanelInset, PanelFooter };
export type { PanelProps, PanelHeaderProps, PanelInsetProps, PanelFooterProps };
