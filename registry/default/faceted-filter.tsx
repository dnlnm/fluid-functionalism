"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  type HTMLAttributes,
} from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/registry/radix/popover";
import { Checkbox } from "@/registry/radix/checkbox";
import { Button } from "@/registry/radix/button";
import { Badge } from "@/registry/default/badge";
import { cn } from "@/lib/utils";
import { useIcon } from "@/lib/icon-context";
import { SizeProvider, useSize, type SizeVariant } from "@/lib/size-context";
import type { IconComponent } from "@/lib/icon-context";

interface FacetOption {
  value: string;
  label: string;
  icon?: IconComponent;
  /** Trailing count. Hidden when omitted. */
  count?: number;
}

interface FacetedFilterProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Facet title shown in the trigger, e.g. "Status". */
  title: string;
  options: FacetOption[];
  /** Controlled selection of option values. */
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  /** Show the search box. Filters options by label substring. */
  searchable?: boolean;
  /** Called alongside onChange when the selection is cleared. */
  onClear?: () => void;
  /** Pins trigger and panel to one step of the size ladder (default 36px,
   *  compact 28px — see /docs/sizes). Omitted, they follow the surrounding
   *  SizeProvider. */
  size?: SizeVariant;
}

// Max option badges shown in the trigger before collapsing to a count.
const MAX_TRIGGER_BADGES = 2;

const FacetedFilter = forwardRef<HTMLDivElement, FacetedFilterProps>(
  (
    {
      title,
      options,
      selected,
      onChange,
      searchable = true,
      onClear,
      size,
      className,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const searchRef = useRef<HTMLInputElement | null>(null);
    const sizeClasses = useSize(size);
    const compact = sizeClasses.variant === "compact";
    const PlusIcon = useIcon("plus");
    const SearchIcon = useIcon("search");

    // Focus the search box whenever the panel opens (both flavours keep
    // their own portal lifetime; autoFocus would only fire on first mount).
    useEffect(() => {
      if (open && searchable) searchRef.current?.focus();
    }, [open, searchable]);

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return options;
      return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, query]);

    const toggle = (value: string) => {
      const next = new Set(selected);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      onChange(next);
    };

    const clear = () => {
      onChange(new Set());
      onClear?.();
    };

    const selectedOptions = useMemo(
      () => options.filter((o) => selected.has(o.value)),
      [options, selected]
    );
    const visibleBadges = selectedOptions.slice(0, MAX_TRIGGER_BADGES);
    const overflowCount = selected.size - visibleBadges.length;

    const root = (
      <div ref={ref} className={cn("inline-flex", className)} {...props}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="tertiary"
                leadingIcon={PlusIcon}
                active={open}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>{title}</span>
                  {selected.size > 0 && (
                    <>
                      <span
                        aria-hidden
                        className="h-4 w-px bg-border"
                      />
                      {overflowCount > 0 && visibleBadges.length === MAX_TRIGGER_BADGES ? (
                        <>
                          {visibleBadges.map((o) => (
                            <Badge key={o.value}>{o.label}</Badge>
                          ))}
                          <Badge>+{overflowCount}</Badge>
                        </>
                      ) : (
                        <Badge>
                          {selected.size} selected
                        </Badge>
                      )}
                    </>
                  )}
                </span>
              </Button>
            }
          />
          <PopoverContent className="w-64 p-0" align="start">
            {searchable && (
              <div
                className={cn(
                  "flex items-center border-b border-border",
                  sizeClasses.gap,
                  compact ? "h-8 px-2" : "h-9 px-2.5"
                )}
              >
                <SearchIcon
                  size={sizeClasses.icon}
                  strokeWidth={1.5}
                  className="shrink-0 text-muted-foreground"
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  aria-label={`Search ${title}`}
                  className={cn(
                    "w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none",
                    sizeClasses.text
                  )}
                />
              </div>
            )}
            <div className="max-h-48 overflow-y-auto p-1">
              {filtered.map((option) => {
                const checked = selected.has(option.value);
                return (
                  <div
                    key={option.value}
                    onMouseDown={(e) => {
                      // Keep focus where it is (search box, trigger): letting
                      // it drop to <body> on row padding / count fires the
                      // primitive's focus-outside dismissal and the panel
                      // closes. Click still fires. Same technique as the
                      // CheckboxGroup rows.
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      // Clicks inside the Checkbox wrapper are already
                      // handled by it — this covers the row padding and the
                      // count, so the whole row toggles with one handler.
                      const box = e.currentTarget.firstElementChild;
                      if (box?.contains(e.target as Node)) return;
                      toggle(option.value);
                    }}
                    className="flex cursor-pointer items-center gap-1"
                  >
                    <Checkbox
                      label={option.label}
                      checked={checked}
                      onCheckedChange={() => toggle(option.value)}
                      size={size}
                      className="min-w-0 flex-1 px-1"
                    />
                    {option.count != null && (
                      <span
                        aria-hidden
                        className={cn(
                          "shrink-0 tabular-nums text-muted-foreground",
                          compact ? "pr-2 text-[11px]" : "pr-2.5 text-[12px]"
                        )}
                      >
                        {option.count}
                      </span>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div
                  className={cn(
                    "text-muted-foreground",
                    compact ? "px-2 py-2 text-[12px]" : "px-2.5 py-2 text-[13px]"
                  )}
                >
                  No results found.
                </div>
              )}
            </div>
            {selected.size > 0 && (
              <div className="flex items-center justify-between border-t border-border px-2 py-1">
                <span
                  className={cn(
                    "text-muted-foreground",
                    compact ? "pl-1 text-[11px]" : "pl-1.5 text-[12px]"
                  )}
                >
                  {selected.size} selected
                </span>
                <Button variant="ghost" size="sm" onClick={clear}>
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    );

    // A size prop pins trigger and panel to one ladder step.
    return size ? <SizeProvider size={size}>{root}</SizeProvider> : root;
  }
);

FacetedFilter.displayName = "FacetedFilter";

export { FacetedFilter };
export type { FacetedFilterProps, FacetOption };
