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
  type ComponentProps,
} from "react";
import { motion } from "framer-motion";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
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
// Built on Base UI's Popover primitive, which owns the trigger wiring,
// positioning (anchor tracking + collision flipping), dismissal (outside
// press, focus-out, Escape), and focus management. The spring open/close
// animation stays via the actionsRef deferred-unmount pattern (same as the
// Base DropdownContent and ColorPickerPopover).
// ---------------------------------------------------------------------------

interface PopoverContextValue {
  open: boolean;
  disabled: boolean;
  actionsRef: React.RefObject<PopoverPrimitive.Root.Actions | null>;
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
  const actionsRef = useRef<PopoverPrimitive.Root.Actions | null>(null);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange]
  );

  const ctx = useMemo(
    () => ({ open, disabled, actionsRef }),
    [open, disabled]
  );

  // A size prop pins the whole compound (trigger content + portalled panel —
  // React context crosses portals) to one ladder step.
  const root = (
    <PopoverContext.Provider value={ctx}>
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={handleOpenChange}
        actionsRef={actionsRef}
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
// Base UI's Popover.Trigger, re-exported under the library name. Composes via
// the `render` prop, so any element can be the trigger:
//
//   <PopoverTrigger render={<Button variant="secondary">Open</Button>} />
// ---------------------------------------------------------------------------

type PopoverTriggerProps = ComponentProps<typeof PopoverPrimitive.Trigger>;

// Root-level `disabled` parity with the Radix flavour: the flag flows through
// context onto the trigger (Base's Root takes no `disabled` of its own).
const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ disabled, ...props }, ref) => {
    const { disabled: rootDisabled } = usePopoverContext();
    return (
      <PopoverPrimitive.Trigger
        ref={ref}
        disabled={disabled || rootDisabled}
        {...props}
      />
    );
  }
);

PopoverTrigger.displayName = "PopoverTrigger";

// ---------------------------------------------------------------------------
// PopoverContent (popup panel)
//
// Portal > Positioner > Popup carrying the Elevated popover surface with the
// spring open/close animation. Generic content panel (unlike DropdownContent,
// no menu-row machinery) — shadcn's w-72 p-4 content on the Fluid
// Functionalism elevation system.
// ---------------------------------------------------------------------------

type PopoverPositionerProps = ComponentProps<typeof PopoverPrimitive.Positioner>;

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  side?: PopoverPositionerProps["side"];
  align?: PopoverPositionerProps["align"];
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
    const { open, actionsRef } = usePopoverContext();

    // Release Base UI's deferred unmount once the exit tween has played.
    // onAnimationComplete on the motion.div is the primary signal; this
    // timeout is a fallback for throttled/background tabs where rAF-driven
    // animation callbacks can stall (spring.fast.exit is 100ms — 150ms
    // covers it with margin).
    useEffect(() => {
      if (open) return;
      const id = setTimeout(() => actionsRef.current?.unmount(), 150);
      return () => clearTimeout(id);
    }, [open, actionsRef]);

    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="z-50 outline-none"
        >
          <motion.div
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
            // Base UI defers unmount while actionsRef is set; release it once
            // the exit spring has finished so the close animation fully plays.
            onAnimationComplete={() => {
              if (!open) actionsRef.current?.unmount();
            }}
          >
            <PopoverPrimitive.Popup
              render={<div ref={ref} />}
              className="outline-none"
            >
              <Elevated
                offset={2}
                shadowLevel={3}
                className={cn(
                  `relative w-72 max-w-full ${shape.container} p-4 outline-none`,
                  className
                )}
              >
                {children}
              </Elevated>
            </PopoverPrimitive.Popup>
          </motion.div>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    );
  }
);

PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
export type { PopoverProps, PopoverTriggerProps, PopoverContentProps };
