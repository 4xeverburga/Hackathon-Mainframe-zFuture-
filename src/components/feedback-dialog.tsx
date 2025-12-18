"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type FeedbackDialogState = {
  open: boolean;
  title: string;
  description?: string;
};

export function FeedbackDialog({
  state,
  onOpenChange,
  actionLabel = "Listo",
}: {
  state: FeedbackDialogState;
  onOpenChange: (open: boolean) => void;
  actionLabel?: string;
}) {
  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
          {state.description ? (
            <DialogDescription>{state.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button">
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


