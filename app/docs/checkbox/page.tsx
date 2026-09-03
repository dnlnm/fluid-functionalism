"use client";

import { useState } from "react";
import { Checkbox } from "@/registry/radix/checkbox";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable, type PropDef } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";

const basicCode = `import { Checkbox } from "./components";
import { useState } from "react";

const [checked, setChecked] = useState(false);

<Checkbox
  label="Email notifications"
  checked={checked}
  onCheckedChange={setChecked}
/>`;

const indeterminateCode = `import { Checkbox } from "./components";
import { useState } from "react";

const [items, setItems] = useState([true, false, false]);
const all = items.every(Boolean);
const some = items.some(Boolean);

<>
  <Checkbox
    label="Select all"
    checked={all ? true : some ? "indeterminate" : false}
    onCheckedChange={(next) => setItems(items.map(() => next))}
  />
  {items.map((checked, i) => (
    <Checkbox
      key={i}
      label={\`Option \${i + 1}\`}
      checked={checked}
      onCheckedChange={(next) =>
        setItems(items.map((v, j) => (j === i ? next : v)))
      }
    />
  ))}
</>`;

const descriptionCode = `<Checkbox
  label="Marketing emails"
  description="Get notified about new features and releases."
  checked={checked}
  onCheckedChange={setChecked}
/>`;

const disabledCode = `<Checkbox
  label="Disabled option"
  checked={false}
  onCheckedChange={() => {}}
  disabled
/>`;

const boxOnlyCode = `// No label — pass aria-label so assistive tech still names the box.
<Checkbox checked={checked} onCheckedChange={setChecked} aria-label="Accept terms" />`;

const checkboxProps: PropDef[] = [
  { name: "label", type: "string", description: "Visible label. Omit for box-only mode (pass aria-label)." },
  { name: "description", type: "ReactNode", description: "Secondary helper text under the label." },
  { name: "checked", type: 'boolean | "indeterminate"', description: "Checked state. \"indeterminate\" renders the dash." },
  { name: "onCheckedChange", type: "(next: boolean) => void", description: "Called with the next boolean state. Indeterminate resolves to true." },
  { name: "onToggle", type: "() => void", description: "Convenience alias called alongside onCheckedChange (Switch/CheckboxGroup-style)." },
  { name: "disabled", type: "boolean", default: "false", description: "Disables the checkbox." },
  { name: "size", type: '"default" | "compact"', description: "Pins the checkbox to one size-ladder step. Omitted, follows SizeProvider." },
];

export default function CheckboxDoc() {
  const [basic, setBasic] = useState(false);
  const [withDescription, setWithDescription] = useState(true);
  const [boxOnly, setBoxOnly] = useState(false);
  const [items, setItems] = useState([true, false, false]);
  const all = items.every(Boolean);
  const some = items.some(Boolean);

  return (
    <DocPage
      title="Checkbox"
      slug="checkbox"
      description="Standalone checkbox with animated check, indeterminate state, and optional description."
    >
      <DocSection title="Basic">
        <ComponentPreview code={basicCode}>
          <Checkbox
            label="Email notifications"
            checked={basic}
            onCheckedChange={setBasic}
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Indeterminate">
        <ComponentPreview code={indeterminateCode}>
          <div className="flex flex-col">
            <Checkbox
              label="Select all"
              checked={all ? true : some ? "indeterminate" : false}
              onCheckedChange={(next) => setItems(items.map(() => next))}
            />
            {items.map((checked, i) => (
              <Checkbox
                key={i}
                label={`Option ${i + 1}`}
                checked={checked}
                onCheckedChange={(next) =>
                  setItems(items.map((v, j) => (j === i ? next : v)))
                }
              />
            ))}
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="With description">
        <ComponentPreview code={descriptionCode}>
          <Checkbox
            label="Marketing emails"
            description="Get notified about new features and releases."
            checked={withDescription}
            onCheckedChange={setWithDescription}
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Disabled">
        <ComponentPreview code={disabledCode}>
          <div className="flex flex-col">
            <Checkbox
              label="Disabled option"
              checked={false}
              onCheckedChange={() => {}}
              disabled
            />
            <Checkbox
              label="Disabled checked"
              checked
              onCheckedChange={() => {}}
              disabled
            />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Box only">
        <ComponentPreview code={boxOnlyCode}>
          <Checkbox
            checked={boxOnly}
            onCheckedChange={setBoxOnly}
            aria-label="Accept terms"
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable props={checkboxProps} />
      </DocSection>
    </DocPage>
  );
}
