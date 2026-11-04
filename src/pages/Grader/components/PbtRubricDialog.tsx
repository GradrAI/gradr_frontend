import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updatePbtRubric } from "@/requests/category";
import type { Category, PbtRubric } from "@/types/Category";
import PbtRubricEditor from "./PbtRubricEditor";
import { defaultPbtRubric, validatePbtRubric } from "../helpers/pbtRubricSchema";

type PbtRubricDialogProps = {
  category: Partial<Category>;
  onClose: () => void;
};

/** Edits a category's exam rules. Mount it only while open so it seeds from the category. */
const PbtRubricDialog = ({ category, onClose }: PbtRubricDialogProps) => {
  const queryClient = useQueryClient();
  const maxScoreAttainable = Number(category.maxScoreAttainable ?? 0);
  const [rubric, setRubric] = useState<PbtRubric>(
    () => category.pbtRubric ?? defaultPbtRubric()
  );
  const invalid = validatePbtRubric(rubric, maxScoreAttainable) !== null;

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updatePbtRubric(String(category.courseId), String(category._id), rubric),
    onSuccess: () => {
      toast.success("Exam rules saved");
      queryClient.invalidateQueries({ queryKey: ["singleCourse"] });
      onClose();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message ?? "Could not save the exam rules"
      );
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exam rules — {category.name}</DialogTitle>
          <DialogDescription>
            Marks per question and how many questions count toward the total.
          </DialogDescription>
        </DialogHeader>
        <PbtRubricEditor
          value={rubric}
          onChange={setRubric}
          maxScoreAttainable={maxScoreAttainable}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => mutate()} disabled={invalid || isPending}>
            {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Save rules
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PbtRubricDialog;
