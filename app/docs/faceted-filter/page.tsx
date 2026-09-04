"use client";

import { useState } from "react";
import { FacetedFilter, type FacetOption } from "@/registry/default/faceted-filter";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable, type PropDef } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";

const STATUS_OPTIONS: FacetOption[] = [
  { value: "todo", label: "Todo", count: 12 },
  { value: "in-progress", label: "In Progress", count: 5 },
  { value: "done", label: "Done", count: 23 },
];

const basicCode = `import { FacetedFilter } from "./components";
import { useState } from "react";

const options = [
  { value: "todo", label: "Todo", count: 12 },
  { value: "in-progress", label: "In Progress", count: 5 },
  { value: "done", label: "Done", count: 23 },
];
const [selected, setSelected] = useState<Set<string>>(new Set());

<FacetedFilter
  title="Status"
  options={options}
  selected={selected}
  onChange={setSelected}
/>`;

const filterProps: PropDef[] = [
  { name: "title", type: "string", description: "Facet title shown in the trigger." },
  { name: "options", type: "FacetOption[]", description: "Options with value, label, optional icon and count." },
  { name: "selected", type: "Set<string>", description: "Controlled selection of option values." },
  { name: "onChange", type: "(next: Set<string>) => void", description: "Called with the next selection." },
  { name: "searchable", type: "boolean", default: "true", description: "Show the search box filtering options by label." },
  { name: "onClear", type: "() => void", description: "Called alongside onChange when the selection is cleared." },
  { name: "size", type: '"default" | "compact"', description: "Pins trigger and panel to one size-ladder step. Omitted, follows SizeProvider." },
];

const TASKS = [
  { title: "Design empty states", status: "todo" },
  { title: "Ship onboarding flow", status: "in-progress" },
  { title: "Migrate billing", status: "done" },
  { title: "Write changelog", status: "todo" },
  { title: "Audit shortcuts", status: "done" },
];

export default function FacetedFilterDoc() {
  const [basic, setBasic] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Set<string>>(new Set(["todo"]));

  const visible =
    tasks.size === 0 ? TASKS : TASKS.filter((t) => tasks.has(t.status));

  return (
    <DocPage
      title="FacetedFilter"
      slug="faceted-filter"
      description="Trigger button with badges, searchable checkbox popover, counts, and clear."
    >
      <DocSection title="Basic">
        <ComponentPreview code={basicCode}>
          <FacetedFilter
            title="Status"
            options={STATUS_OPTIONS}
            selected={basic}
            onChange={setBasic}
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Filtering a List">
        <ComponentPreview code={basicCode}>
          <div className="flex flex-col gap-3">
            <FacetedFilter
              title="Status"
              options={STATUS_OPTIONS}
              selected={tasks}
              onChange={setTasks}
            />
            <ul className="flex flex-col gap-1">
              {visible.map((t) => (
                <li
                  key={t.title}
                  className="text-body text-foreground"
                >
                  {t.title}
                  <span className="text-caption text-muted-foreground">
                    {" "}
                    · {t.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable props={filterProps} />
      </DocSection>
    </DocPage>
  );
}
