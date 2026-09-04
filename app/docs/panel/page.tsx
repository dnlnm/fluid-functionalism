"use client";

import { Button } from "@/registry/radix/button";
import { Badge } from "@/registry/default/badge";
import {
  Panel,
  PanelHeader,
  PanelInset,
  PanelFooter,
} from "@/registry/default/panel";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable, type PropDef } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";

const basicCode = `import { Button } from "./components";
import { Panel, PanelHeader, PanelInset } from "./components";

<Panel>
  <PanelHeader
    title="Today's Classes"
    action={
      <Button variant="ghost" size="compact">
        View Schedule
      </Button>
    }
  />
  <PanelInset>{/* schedule rows… */}</PanelInset>
</Panel>`;

const footerCode = `import { Button } from "./components";
import { Panel, PanelHeader, PanelInset, PanelFooter } from "./components";

<Panel>
  <PanelHeader title="Export" />
  <PanelInset>Pick a format below.</PanelInset>
  <PanelFooter>
    <Button variant="tertiary">Cancel</Button>
    <Button>Download</Button>
  </PanelFooter>
</Panel>`;

const nestedCode = `import { Badge } from "./components";
import { Button } from "./components";
import { Panel, PanelInset } from "./components";

// Content inside the well elevates off the well floor automatically.
<Panel>
  <PanelInset>
    <div className="flex items-center gap-2">
      <Badge>Live</Badge>
      <Button variant="secondary" size="compact">
        Inspect
      </Button>
    </div>
  </PanelInset>
</Panel>`;

const panelProps: PropDef[] = [
  { name: "children", type: "ReactNode", description: "PanelHeader, PanelInset, and optional PanelFooter." },
  { name: "size", type: '"default" | "compact"', description: "Pins header rows to one size-ladder step. Omitted, follows SizeProvider." },
];

const headerProps: PropDef[] = [
  { name: "title", type: "ReactNode", description: "Title pinned to the leading edge." },
  { name: "action", type: "ReactNode", description: "Trailing slot, e.g. a ghost Button." },
  { name: "children", type: "ReactNode", description: "Custom layout. Overrides title/action when provided." },
];

const insetProps: PropDef[] = [
  { name: "children", type: "ReactNode", description: "Well content. Re-provided one surface rung below the panel." },
];

export default function PanelDoc() {
  return (
    <DocPage
      title="Panel"
      slug="panel"
      description="Sheet above the page with a recessed inset well and optional header/footer."
    >
      <DocSection title="Basic">
        <ComponentPreview code={basicCode}>
          <div className="w-full max-w-[300px]">
          <Panel>
            <PanelHeader
              title="Today's Classes"
              action={
                <Button variant="ghost" size="compact">
                  View Schedule
                </Button>
              }
            />
              <PanelInset>
                <p className="text-body text-muted-foreground">
                  No classes scheduled yet.
                </p>
              </PanelInset>
            </Panel>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="With Footer">
        <ComponentPreview code={footerCode}>
          <div className="w-full max-w-[300px]">
            <Panel>
              <PanelHeader title="Export" />
              <PanelInset>Pick a format below.</PanelInset>
              <PanelFooter>
                <Button variant="tertiary">Cancel</Button>
                <Button>Download</Button>
              </PanelFooter>
            </Panel>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Nested Elevation">
        <ComponentPreview code={nestedCode}>
          <div className="w-full max-w-[300px]">
            <Panel>
              <PanelInset>
                <div className="flex items-center gap-2">
                  <Badge>Live</Badge>
                  <Button variant="secondary" size="compact">
                    Inspect
                  </Button>
                </div>
              </PanelInset>
            </Panel>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference — Panel">
        <PropsTable props={panelProps} />
      </DocSection>

      <DocSection title="API Reference — PanelHeader">
        <PropsTable props={headerProps} />
      </DocSection>

      <DocSection title="API Reference — PanelInset">
        <PropsTable props={insetProps} />
      </DocSection>
    </DocPage>
  );
}
