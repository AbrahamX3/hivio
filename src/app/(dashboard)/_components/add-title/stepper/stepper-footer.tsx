"use client";

import { XIcon } from "lucide-react";

import { LogoIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { useStepper } from "@/components/ui/stepper";

export function StepperFooter() {
  const { activeStep, resetSteps, steps } = useStepper();

  if (activeStep !== steps.length) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 align-middle text-2xl font-bold">
        <h2 className="text-2xl leading-relaxed">
          Successfully added title to your hive!
        </h2>
        <span className="rounded-full border border-dashed p-4">
          <LogoIcon className="size-12 text-primary" />
        </span>
        <div id="finished-title" className="w-full"></div>
        <div className="flex w-full justify-center gap-2">
          <DrawerClose asChild>
            <Button type="button" size="lg" variant="outline">
              Close <XIcon className="ml-2 size-4" />
            </Button>
          </DrawerClose>
          <Button onClick={resetSteps}>Add another title?</Button>
        </div>
      </div>
    </div>
  );
}
