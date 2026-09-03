"use client";

import { useState } from "react";
import { Button } from "@/registry/radix/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/registry/radix/popover";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable, type PropDef } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";

const basicCode = `import { Button } from "./components";
import { Popover, PopoverTrigger, PopoverContent } from "./components";

<Popover>
  <PopoverTrigger render={<Button variant="secondary">Open popover</Button>} />
  <PopoverContent>
    <p className="text-body text-foreground">Popover content</p>
    <p className="text-caption text-muted-foreground">
      Arbitrary content lives here.
    </p>
  </PopoverContent>
</Popover>`;

const controlledCode = `import { useState } from "react";

const [open, setOpen] = useState(false);

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger render={<Button variant="secondary">Toggle</Button>} />
  <PopoverContent>
    <p className="text-body text-foreground">Controlled popover.</p>
  </PopoverContent>
</Popover>`;

const placementCode = `<Popover>
  <PopoverTrigger render={<Button variant="tertiary">Top aligned</Button>} />
  <PopoverContent side="top" align="center">
    <p className="text-body text-foreground">Flips on collision.</p>
  </PopoverContent>
</Popover>`;

const popoverProps: PropDef[] = [
  { name: "open", type: "boolean", description: "Controlled open state." },
  { name: "defaultOpen", type: "boolean", default: "false", description: "Initial open state (uncontrolled)." },
  { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the open state changes." },
  { name: "modal", type: "boolean", default: "false", description: "Traps focus and locks scroll when true." },
  { name: "disabled", type: "boolean", default: "false", description: "Disables the trigger." },
  { name: "size", type: '"default" | "compact"', description: "Pins trigger and panel to one size-ladder step. Omitted, follows SizeProvider." },
];

const contentProps: PropDef[] = [
  { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Preferred side of the trigger. Flips on collision." },
  { name: "align", type: '"start" | "center" | "end"', default: '"start"', description: "Alignment against the trigger edge." },
  { name: "sideOffset", type: "number", default: "6", description: "Gap between trigger and panel." },
  { name: "children", type: "ReactNode", description: "Panel content." },
];

export default function PopoverDoc() {
  const [open, setOpen] = useState(false);

  return (
    <DocPage
      title="Popover"
      slug="popover"
      description="Anchored popup panel with spring animation and collision-aware positioning."
    >
      <DocSection title="Basic">
        <ComponentPreview code={basicCode}>
          <Popover>
            <PopoverTrigger
              render={<Button variant="secondary">Open popover</Button>}
            />
            <PopoverContent>
              <p className="text-body text-foreground">Popover content</p>
              <p className="text-caption text-muted-foreground">
                Arbitrary content lives here.
              </p>
            </PopoverContent>
          </Popover>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <ComponentPreview code={controlledCode}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={<Button variant="secondary">Toggle</Button>}
            />
            <PopoverContent>
              <p className="text-body text-foreground">Controlled popover.</p>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </PopoverContent>
          </Popover>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Placement">
        <ComponentPreview code={placementCode}>
          <Popover>
            <PopoverTrigger
              render={<Button variant="tertiary">Top aligned</Button>}
            />
            <PopoverContent side="top" align="center">
              <p className="text-body text-foreground">Flips on collision.</p>
            </PopoverContent>
          </Popover>
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference — Popover">
        <PropsTable props={popoverProps} />
      </DocSection>

      <DocSection title="API Reference — PopoverContent">
        <PropsTable props={contentProps} />
      </DocSection>
    </DocPage>
  );
}
