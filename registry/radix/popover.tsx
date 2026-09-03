"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
  forwardRef,
  type ReactNode,
  type ReactElement,
  type ComponentPropsWithoutRef,
} from "react";
import { motion } from "framer-motion";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { spring, exitFallbackMs } from "@/lib/springs";
import { shapeMap } from "@/lib/shape-context";
import { SizeProvider, type SizeVariant } from "@/lib/size-context";
import { Elevated } from "@/lib/elevated";

// Popover opts out of the global pill/rounded shape context — popover surfaces
// look cleaner with the smaller "rounded" radii regardless of how the rest of
// the UI is shaped (same call as Dropdown).
const shape = shapeMap.rounded;

// ---------------------------------------------------------------------------
// Popover (root)
//
// Built on Radix's Popover primitive, which owns the trigger wiring,
// positioning (collision flipping, anchor tracking), and dismissal (outside
// press, focus-out, Escape). This layer keeps the spring open/close animation.
// Radix has no actionsRef-style deferred unmount, so the portal lifetime is
// managed with local `mounted` state (the same pattern DropdownContent,
// Dialog, and MobileDrawer use).
// ---------------------------------------------------------------------------

interface PopoverContextValue {
  open: boolean;
  disabled: boolean;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const ctx = useContext(PopoverContext);
  if (!ctx)
    throw new Error("Popover compound components must be inside <Popover>");
  return ctx;
}

interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Modal popovers trap focus and lock scroll. Default is non-modal: the
   *  page keeps scrolling and the panel tracks its anchor. */
  modal?: boolean;
  disabled?: boolean;
  /** Pins trigger-side content and the portalled panel to one step of the
   *  size ladder (default 36px, compact 28px — see /docs/sizes). Omitted,
   *  they follow the surrounding SizeProvider. */
  size?: SizeVariant;
}

function Popover({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = false,
  disabled = false,
  size,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp !== undefined ? openProp : internalOpen;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange]
  );

  const ctx = useMemo(() => ({ open, disabled }), [open, disabled]);

  const root = (
    <PopoverContext.Provider value={ctx}>
      {/* Root is always controlled by `open` (defaultOpen seeds local state
          instead of being forwarded), so PopoverContent can drive the exit
          animation before the portal unmounts. */}
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={handleOpenChange}
        modal={modal}
      >
        {children}
      </PopoverPrimitive.Root>
    </PopoverContext.Provider>
  );

  return size ? <SizeProvider size={size}>{root}</SizeProvider> : root;
}

Popover.displayName = "Popover";

// ---------------------------------------------------------------------------
// PopoverTrigger
//
// Radix's Popover.Trigger behind a Base-UI-style `render` prop, so any
// element can be the trigger:
//
//   <PopoverTrigger render={<Button variant="secondary">Open</Button>} />
// ---------------------------------------------------------------------------

interface PopoverTriggerProps
  extends Omit<
    ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>,
    "asChild"
  > {
  /** Element to render as the trigger (Base-UI-style `render` composition
   *  API). */
  render?: ReactElement;
}

const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ render, children, disabled, ...props }, ref) => {
    const { disabled: rootDisabled } = usePopoverContext();
    const isDisabled = disabled || rootDisabled;

    if (render) {
      return (
        <PopoverPrimitive.Trigger
          ref={ref}
          asChild
          disabled={isDisabled}
          {...props}
        >
          {render}
        </PopoverPrimitive.Trigger>
      );
    }
    return (
      <PopoverPrimitive.Trigger ref={ref} disabled={isDisabled} {...props}>
        {children}
      </PopoverPrimitive.Trigger>
    );
  }
);

PopoverTrigger.displayName = "PopoverTrigger";

// ---------------------------------------------------------------------------
// PopoverContent (popup panel)
//
// Portal > Content carrying the Elevated popover surface with the spring
// open/close animation. Generic content panel (unlike DropdownContent, no
// menu-row machinery) — shadcn's w-72 p-4 content on the Fluid
// Functionalism elevation system.
// ---------------------------------------------------------------------------

type RadixContentProps = ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
>;

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  side?: RadixContentProps["side"];
  align?: RadixContentProps["align"];
  sideOffset?: number;
}

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      className,
      children,
      side = "bottom",
      align = "start",
      sideOffset = 6,
    },
    ref
  ) => {
    const { open } = usePopoverContext();

    // Portal lifetime: mounts as soon as `open` flips true; on close it stays
    // mounted (forceMount below) until the exit tween finishes.
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      if (open) setMounted(true);
    }, [open]);

    // Fallback release for the deferred unmount: onAnimationComplete on the
    // motion.div is the primary signal, but rAF-driven animation callbacks
    // can stall in throttled/background tabs. The popup exits with
    // spring.fast, so the fallback tracks that tier's exit duration plus a
    // safety buffer.
    useEffect(() => {
      if (open) return;
      const id = setTimeout(() => setMounted(false), exitFallbackMs(spring.fast));
      return () => clearTimeout(id);
    }, [open]);

    if (!mounted) return null;

    return (
      <PopoverPrimitive.Portal forceMount>
        <PopoverPrimitive.Content
          asChild
          forceMount
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <motion.div
            className="z-50 outline-none"
            // A popup opening upward grows from its bottom edge — the edge
            // anchored to the trigger — so the offset and origin flip with
            // `side`.
            initial={{ opacity: 0, y: side === "top" ? 4 : -4, scaleY: 0.96 }}
            animate={
              open
                ? { opacity: 1, y: 0, scaleY: 1 }
                : { opacity: 0, y: side === "top" ? 4 : -4, scaleY: 0.96 }
            }
            transition={open ? spring.fast : spring.fast.exit}
            style={{
              transformOrigin: side === "top" ? "bottom center" : "top center",
            }}
            // Release the deferred unmount once the exit spring has finished
            // so the close animation fully plays.
            onAnimationComplete={() => {
              if (!open) setMounted(false);
            }}
          >
            <Elevated
              offset={2}
              shadowLevel={3}
              ref={ref}
              className={cn(
                `relative w-72 max-w-full ${shape.container} p-4 outline-none`,
                className
              )}
            >
              {children}
            </Elevated>
          </motion.div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }
);

PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
export type { PopoverProps, PopoverTriggerProps, PopoverContentProps };
