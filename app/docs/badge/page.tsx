"use client";

import { Badge, badgeColors, type BadgeColor } from "@/registry/default/badge";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable, type PropDef } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";

const solidCode = `import { Badge } from "./components";

<Badge color="violet">Fiction</Badge>
<Badge color="amber">Science</Badge>
<Badge color="green">Philosophy</Badge>
<Badge color="blue">History</Badge>
<Badge color="rose">Poetry</Badge>`;

const dotCode = `import { Badge } from "./components";

<Badge variant="dot" color="violet">Fiction</Badge>
<Badge variant="dot" color="amber">Science</Badge>
<Badge variant="dot" color="green">Philosophy</Badge>
<Badge variant="dot" color="blue">History</Badge>
<Badge variant="dot" color="rose">Poetry</Badge>`;

const elevatedCode = `import { Badge } from "./components";

<Badge variant="solid" elevated color="violet">Fiction</Badge>
<Badge variant="solid" elevated color="amber">Science</Badge>
<Badge variant="solid" elevated color="green">Philosophy</Badge>
<Badge variant="dot" elevated color="violet">Fiction</Badge>
<Badge variant="dot" elevated color="amber">Science</Badge>
<Badge variant="dot" elevated color="green">Philosophy</Badge>`;

const allColors = Object.keys(badgeColors) as BadgeColor[];

const colorsCode = `import { Badge } from "./components";

{/* All available Tailwind colors */}
<Badge color="gray">Gray</Badge>
<Badge color="red">Red</Badge>
<Badge color="blue">Blue</Badge>
<Badge color="green">Green</Badge>
{/* ... and more */}`;

const badgeProps: PropDef[] = [
  {
    name: "variant",
    type: '"solid" | "dot"',
    default: '"solid"',
    description:
      "Visual style. Solid uses a tinted background; dot shows a colored indicator on a transparent ground.",
  },
  {
    name: "elevated",
    type: "boolean",
    default: "false",
    description:
      "Lift two surface steps above the substrate, with shadow. Combines with both variants: solid keeps its tint; dot swaps to the elevated surface.",
  },
  {
    name: "size",
    type: '"default" | "compact"',
    default: "from SizeProvider",
    description:
      "Step on the size ladder (see /docs/sizes). Legacy sm/md/lg values resolve as aliases.",
  },
  {
    name: "color",
    type: "BadgeColor",
    default: '"gray"',
    description:
      "Color from the Tailwind palette: gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, blue, indigo, violet, purple, fuchsia, pink, rose.",
  },
];

export default function BadgeDoc() {
  return (
    <DocPage
      title="Badge"
      slug="badge"
      description="Compact label for status, category, or metadata. Supports solid and dot variants with Tailwind colors, each optionally elevated."
    >
      <DocSection title="Solid">
        <ComponentPreview code={solidCode}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="violet">Fiction</Badge>
            <Badge color="amber">Science</Badge>
            <Badge color="green">Philosophy</Badge>
            <Badge color="blue">History</Badge>
            <Badge color="rose">Poetry</Badge>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Elevated">
        <ComponentPreview code={elevatedCode}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="solid" elevated color="violet">Fiction</Badge>
              <Badge variant="solid" elevated color="amber">Science</Badge>
              <Badge variant="solid" elevated color="green">Philosophy</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="dot" elevated color="violet">Fiction</Badge>
              <Badge variant="dot" elevated color="amber">Science</Badge>
              <Badge variant="dot" elevated color="green">Philosophy</Badge>
            </div>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Dot">
        <ComponentPreview code={dotCode}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="dot" color="violet">Fiction</Badge>
            <Badge variant="dot" color="amber">Science</Badge>
            <Badge variant="dot" color="green">Philosophy</Badge>
            <Badge variant="dot" color="blue">History</Badge>
            <Badge variant="dot" color="rose">Poetry</Badge>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Colors">
        <ComponentPreview code={colorsCode}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {allColors.map((c) => (
                <Badge key={c} color={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {allColors.map((c) => (
                <Badge key={c} variant="dot" color={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable props={badgeProps} />
      </DocSection>
    </DocPage>
  );
}
