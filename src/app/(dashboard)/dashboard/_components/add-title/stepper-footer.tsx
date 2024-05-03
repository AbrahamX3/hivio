"use client";

import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";

import { useStepper } from "@/components/ui/stepper";
import { XIcon } from "lucide-react";

export function StepperFooter() {
  const { activeStep, resetSteps, steps } = useStepper();

  if (activeStep !== steps.length) {
    return null;
  }

  return (
    <div className="flex justify-center w-full items-center gap-2">
      <DrawerClose asChild>
        <Button type="button" size="lg" variant="outline">
          Close <XIcon className="size-4 ml-2" />
        </Button>
      </DrawerClose>
      <Button onClick={resetSteps}>Add another title?</Button>
    </div>
  );
}
