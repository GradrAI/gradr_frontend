import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { AttemptStatus } from "@/types/Attempt";

const STATUS_DISPLAY: Record<
  AttemptStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  "in-progress": { label: "In progress", variant: "outline" },
  submitted: { label: "Submitted", variant: "secondary" },
  grading: { label: "Grading", variant: "secondary" },
  graded: { label: "Graded", variant: "default" },
  pending_review: { label: "In review", variant: "outline" },
  grading_failed: { label: "Grading failed", variant: "destructive" },
};

const AttemptStatusBadge = ({ status }: { status: AttemptStatus }) => {
  const { label, variant } = STATUS_DISPLAY[status] ?? {
    label: status,
    variant: "outline",
  };
  return <Badge variant={variant}>{label}</Badge>;
};

export default AttemptStatusBadge;
