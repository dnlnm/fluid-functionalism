"use client";

import { useState } from "react";
import { useIcon } from "@/lib/icon-context";
import { Input } from "@/registry/default/input";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable, type PropDef } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";

const basicCode = `import { Input } from "./components";
import { useState } from "react";

const [value, setValue] = useState("");

<Input
  label="Name"
  placeholder="Your name"
  value={value}
  onChange={setValue}
/>`;

const iconCode = `import { Input } from "./components";
import { Search } from "lucide-react";

<Input
  label="Search"
  placeholder="Search teamspaces..."
  icon={Search}
  labelHidden
  value={value}
  onChange={setValue}
/>`;

const errorCode = `import { Input } from "./components";
import { Mail } from "lucide-react";

<Input
  label="Email"
  placeholder="you@example.com"
  icon={Mail}
  value={value}
  onChange={setValue}
  error="Please enter a valid email address."
/>`;

const uncontrolledCode = `import { Input } from "./components";

<Input
  label="City"
  placeholder="Where are you based?"
  defaultValue="Berlin"
/>`;

const disabledCode = `<Input
  label="Disabled field"
  placeholder="Can't type here"
  value=""
  onChange={() => {}}
  disabled
/>`;

const inputProps: PropDef[] = [
  { name: "label", type: "string", description: "Visible label. Hidden with labelHidden (kept for assistive tech)." },
  { name: "labelHidden", type: "boolean", default: "false", description: "Hides the label visually; placeholder carries the meaning." },
  { name: "placeholder", type: "string", description: "Placeholder text." },
  { name: "icon", type: "IconComponent", description: "Leading icon slot." },
  { name: "value", type: "string", description: "Controlled value." },
  { name: "defaultValue", type: "string", default: '""', description: "Initial value for uncontrolled usage." },
  { name: "onChange", type: "(value: string) => void", description: "Called with the next value." },
  { name: "error", type: "string", description: "Error message. Marks the field invalid." },
  { name: "disabled", type: "boolean", default: "false", description: "Disables the field." },
  { name: "type", type: "string", default: '"text"', description: "Native input type (text, password, email, …)." },
  { name: "size", type: '"default" | "compact"', description: "Pins the field to one size-ladder step. Omitted, follows SizeProvider." },
];

export default function InputDoc() {
  const Search = useIcon("search");
  const Mail = useIcon("mail");
  const [basic, setBasic] = useState("");
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");

  return (
    <DocPage
      title="Input"
      slug="input"
      description="Standalone text field with label, icon slot, and error state."
    >
      <DocSection title="Basic">
        <ComponentPreview code={basicCode}>
          <Input
            label="Name"
            placeholder="Your name"
            value={basic}
            onChange={setBasic}
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="With Icon">
        <ComponentPreview code={iconCode}>
          <Input
            label="Search"
            placeholder="Search teamspaces..."
            icon={Search}
            labelHidden
            value={search}
            onChange={setSearch}
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Error State">
        <ComponentPreview code={errorCode}>
          <Input
            label="Email"
            placeholder="you@example.com"
            icon={Mail}
            value={email}
            onChange={setEmail}
            error="Please enter a valid email address."
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Uncontrolled">
        <ComponentPreview code={uncontrolledCode}>
          <Input
            label="City"
            placeholder="Where are you based?"
            defaultValue="Berlin"
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Disabled">
        <ComponentPreview code={disabledCode}>
          <Input
            label="Disabled field"
            placeholder="Can't type here"
            value=""
            onChange={() => {}}
            disabled
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable props={inputProps} />
      </DocSection>
    </DocPage>
  );
}
