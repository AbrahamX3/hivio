"use client";
import { Button } from "@/components/ui/button";

import { useStepper } from "@/components/ui/stepper";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SkipForwardIcon,
} from "lucide-react";

export function StepperFormActions({
  submitFn,
  isSubmitFnPending,
}: {
  submitFn?: () => void;
  isSubmitFnPending?: boolean;
}) {
  const {
    prevStep,
    nextStep,
    resetSteps,
    isDisabledStep,
    hasCompletedAllSteps,
    isLastStep,
    isOptionalStep,
  } = useStepper();

  return (
    <div className="w-full flex justify-end gap-2">
      {hasCompletedAllSteps ? (
        <Button size="sm" onClick={resetSteps}>
          Reset
        </Button>
      ) : (
        <>
          <Button
            disabled={isDisabledStep}
            onClick={prevStep}
            size="sm"
            type="submit"
            className="w-fit px-4 justify-between gap-2 flex items-center align-middle"
            variant="secondary"
          >
            <ChevronLeftIcon className="size-4 ml-2" />
            <span>Previous</span>
          </Button>

          {isLastStep ? (
            <Button
              onClick={() => {
                nextStep();
                if (submitFn) {
                  submitFn();
                }
              }}
              disabled={isSubmitFnPending}
              size="sm"
              type="button"
              className="w-fit px-4 justify-between gap-2 flex items-center align-middle"
            >
              {!isSubmitFnPending ? (
                <>
                  <span>Finish</span>
                  <CheckCircleIcon className="size-4" />
                </>
              ) : (
                <span>Adding to Hive...</span>
              )}
            </Button>
          ) : isOptionalStep ? (
            <Button
              size="sm"
              type="submit"
              className="w-fit px-4 justify-between gap-2 flex items-center align-middle"
            >
              <span>Skip</span>
              <SkipForwardIcon className="size-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              type="submit"
              className="w-fit px-4 justify-between gap-2 flex items-center align-middle"
            >
              <span>Next</span>
              <ChevronRightIcon className="size-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
