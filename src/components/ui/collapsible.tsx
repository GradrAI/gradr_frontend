import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * Radix Collapsible wires aria-expanded / aria-controls between trigger and
 * content automatically, which is why it is used for the question editor
 * rather than a bare useState toggle.
 */
const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
