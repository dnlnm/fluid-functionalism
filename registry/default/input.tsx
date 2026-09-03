"use client";

import {
  useRef,
  useState,
  forwardRef,
  type InputHTMLAttributes,
} from "react";
import { Field } from "@base-ui/react/field";
import type { IconComponent } from "@/lib/icon-context";
import { cn } from "@/lib/utils";
import { fontWeights } from "@/lib/font-weight";
import { useShape } from "@/lib/shape-context";
import { SizeProvider, useSize, type SizeVariant } from "@/lib/size-context";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  label: string;
  /** Keep the label for assistive tech but don't render it — for inline
   *  fields (a toolbar search) where the placeholder carries the meaning. */
  labelHidden?: boolean;
  placeholder?: string;
  icon?: IconComponent;
  /** Controlled value. Omit with `defaultValue` for uncontrolled usage. */
  value?: string;
  /** Initial value for uncontrolled usage. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  /** Pins the field to one step of the size ladder (default 36px,
   *  compact 28px — see /docs/sizes). Omitted, it follows the surrounding
   *  SizeProvider. */
  size?: SizeVariant;
  className?: string;
}

const Input = forwardRef<HTMLDivElement, InputProps>(
  (
    {
      label,
      labelHidden,
      placeholder,
      icon: Icon,
      value: valueProp,
      defaultValue = "",
      onChange,
      error,
      disabled,
      size,
      className,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const shape = useShape();
    const sizeClasses = useSize(size);
    const compact = sizeClasses.variant === "compact";

    const isControlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = isControlled ? valueProp : internalValue;

    const handleChange = (next: string) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    };

    const isActive = hovered;
    const labelActive = isActive || isFocused;

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    // Input container classes (same four-state matrix as InputField).
    let bgClass: string;
    let ringClass: string;

    if (disabled) {
      bgClass = "bg-transparent";
      ringClass = "ring-border";
    } else if (error) {
      bgClass = isFocused ? "bg-card" : isActive ? "bg-destructive-light/60" : "bg-transparent";
      ringClass = "ring-destructive/50";
    } else if (isFocused) {
      bgClass = "bg-card";
      ringClass = "ring-border";
    } else if (isActive) {
      bgClass = "bg-muted/50";
      ringClass = "ring-border";
    } else {
      bgClass = "bg-transparent";
      ringClass = "ring-border";
    }

    const field = (
      // Base UI Field wires the accessibility plumbing: Field.Label's htmlFor
      // targets the control, Field.Error's generated id lands in the control's
      // aria-describedby, and `invalid` drives aria-invalid / data-invalid.
      <Field.Root
        ref={ref}
        invalid={!!error}
        disabled={disabled}
        className={cn(
          "flex flex-col gap-1 cursor-text w-72 max-w-full",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Label — sr-only when hidden so the field keeps its accessible
            name and the htmlFor wiring. */}
        <Field.Label
          className={cn(
            labelHidden ? "sr-only" : "inline-grid",
            sizeClasses.text,
            // One notch tighter than the ladder's control padding — the field
            // ring is invisible at rest, so the roomier inset reads as a gap.
            !labelHidden && (compact ? "pl-2" : "pl-2.5")
          )}
        >
          <span
            className="col-start-1 row-start-1 invisible"
            style={{ fontVariationSettings: fontWeights.semibold }}
            aria-hidden="true"
          >
            {label}
          </span>
          <span
            className={cn(
              "col-start-1 row-start-1",
              error ? "text-destructive" : "text-muted-foreground"
            )}
            style={{
              fontVariationSettings: fontWeights.normal,
            }}
          >
            {label}
          </span>
        </Field.Label>

        {/* Input container */}
        <div
          onMouseDown={(e) => {
            // A click anywhere (icon, padding) focuses the input, without
            // disturbing the input's own caret placement.
            if (e.target === inputRef.current) return;
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className={cn(
            // Fixed height (was py-2 around the line box) so the field sits
            // exactly on the ladder's control height.
            `flex items-center ${sizeClasses.gap} ${shape.input} ${
              compact ? "px-2" : "px-2.5"
            } ${sizeClasses.control} ring-1 transition-all duration-80`,
            bgClass,
            ringClass
          )}
        >
          {Icon && (
            <Icon
              size={sizeClasses.icon}
              strokeWidth={labelActive ? 2 : 1.5}
              className={cn(
                "shrink-0 transition-[color,stroke-width] duration-80",
                labelActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            />
          )}
          <Field.Control
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-[inherit]",
              sizeClasses.text
            )}
            style={{ fontVariationSettings: fontWeights.normal }}
            {...props}
          />
        </div>

        {/* Error message — `match` pins it visible while our controlled
            `error` prop is standing. */}
        {error && (
          <Field.Error
            match
            className={cn(
              "text-destructive",
              compact ? "text-[11px] pl-2" : "text-[12px] pl-2.5"
            )}
            style={{ fontVariationSettings: fontWeights.medium }}
          >
            {error}
          </Field.Error>
        )}
      </Field.Root>
    );

    // A size prop pins the field to one ladder step.
    return size ? <SizeProvider size={size}>{field}</SizeProvider> : field;
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
