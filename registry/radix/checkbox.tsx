"use client";

import {
  forwardRef,
  useId,
  useRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";
import { useSize, type SizeVariant } from "@/lib/size-context";

interface CheckboxProps extends HTMLAttributes<HTMLDivElement> {
  /** Visible label. Omit for box-only mode (pass `aria-label` for AT). */
  label?: string;
  /** Secondary helper text rendered under the label. */
  description?: ReactNode;
  /** Checked state. `"indeterminate"` renders the dash (e.g. select-all). */
  checked: boolean | "indeterminate";
  /** Called with the next boolean state. Clicking from `indeterminate` resolves to `true`. */
  onCheckedChange?: (next: boolean) => void;
  /** Convenience alias for Switch/CheckboxGroup-style usage. Called alongside `onCheckedChange` when provided. */
  onToggle?: () => void;
  disabled?: boolean;
  /** Pins the checkbox to one step of the size ladder (see /docs/sizes).
   *  Omitted, it follows the surrounding SizeProvider. */
  size?: SizeVariant;
}

const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(
  (
    {
      label,
      description,
      checked,
      onCheckedChange,
      onToggle,
      disabled = false,
      size,
      className,
      ...props
    },
    ref
  ) => {
    const labelId = useId();
    const descriptionId = useId();
    const hasMounted = useRef(false);
    const [hovered, setHovered] = useState(false);
    const sizeClasses = useSize(size);
    const compact = sizeClasses.variant === "compact";
    const isChecked = checked !== false;

    useEffect(() => {
      hasMounted.current = true;
    }, []);

    const emit = (next: boolean | "indeterminate") => {
      if (disabled) return;
      // Radix reports the resolved boolean; normalize "indeterminate" just in case.
      const resolved = next === true;
      onCheckedChange?.(resolved);
      onToggle?.();
    };

    const box = (
      <CheckboxPrimitive.Root
        checked={checked}
        onCheckedChange={emit}
        disabled={disabled}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative shrink-0 appearance-none bg-transparent p-0 border-0 outline-none",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          "focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          compact ? "rounded-[4px] w-[14px] h-[14px]" : "rounded-[5px] w-[16px] h-[16px]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fill + border — hardcoded 4/5px radius so the box stays recognizable
            under both shape variants (see CheckboxGroup). Checked fills with
            bg-foreground (dark in light theme, light in dark theme, per
            --foreground); the mark flips to text-background for contrast. */}
        <div
          className={cn(
            "absolute inset-0 border-solid transition-all duration-80",
            compact ? "rounded-[4px]" : "rounded-[5px]",
            checked !== false
              ? "border-[1.5px] border-transparent bg-foreground"
              : hovered && !disabled
                ? "border-[1.5px] border-neutral-400 dark:border-neutral-500"
                : "border-[1.5px] border-border"
          )}
        />
        {/* Check / indeterminate mark */}
        <AnimatePresence mode="wait" initial={false}>
          {checked !== false && (
            <CheckboxPrimitive.Indicator forceMount asChild key={checked === "indeterminate" ? "dash" : "check"}>
              <motion.svg
                width={compact ? 16 : 18}
                height={compact ? 16 : 18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-background"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
              >
                <motion.path
                  d={checked === "indeterminate" ? "M6 12H18" : "M6 12L10 16L18 8"}
                  initial={{ pathLength: hasMounted.current ? 0 : 1 }}
                  animate={{
                    pathLength: 1,
                    transition: { duration: 0.08, ease: "easeOut" },
                  }}
                  exit={{
                    pathLength: 0,
                    transition: { duration: 0.04, ease: "easeIn" },
                  }}
                />
              </motion.svg>
            </CheckboxPrimitive.Indicator>
          )}
        </AnimatePresence>
      </CheckboxPrimitive.Root>
    );

    // Box-only mode: no label / description rows, primitive owns a11y
    // (pass aria-label through ...props).
    if (!label && !description) {
      return (
        <div
          ref={ref}
          className={cn(
            "inline-flex items-center justify-center select-none",
            disabled && "opacity-50 pointer-events-none",
            className
          )}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
          {...props}
        >
          {box}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex select-none",
          sizeClasses.gap,
          sizeClasses.px,
          description
            ? compact
              ? "min-h-7 h-auto py-1 items-start"
              : "min-h-9 h-auto py-2 items-start"
            : cn(sizeClasses.control, "items-center"),
          disabled ? "opacity-50 pointer-events-none" : "cursor-pointer",
          className
        )}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onClick={() => {
          if (disabled) return;
          emit(checked === true ? false : true);
        }}
        {...props}
      >
        <span className={cn("shrink-0 flex", description && (compact ? "mt-[1px]" : "mt-[2px]"))}>{box}</span>

        <span className="flex flex-col gap-[2px] min-w-0">
          {label && (
            <span
              id={labelId}
              className={cn(
                sizeClasses.text,
                "transition-colors duration-80 [text-box:trim-both_cap_alphabetic]",
                isChecked || hovered
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              id={descriptionId}
              className={cn(
                "text-muted-foreground leading-snug",
                compact ? "text-[11px]" : "text-[12px]"
              )}
            >
              {description}
            </span>
          )}
        </span>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
export type { CheckboxProps };
