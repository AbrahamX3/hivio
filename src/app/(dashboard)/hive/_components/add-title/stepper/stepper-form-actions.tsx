"use client";

import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SkipForwardIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStepper } from "@/components/ui/stepper";

export function StepperFormActions({
  submitFn,
  isSubmitFnPending,
}: {
  submitFn?: () => Promise<boolean>;
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
    <div className="flex w-full justify-end gap-2">
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
            className="flex w-fit items-center justify-between gap-2 px-4 align-middle disabled:cursor-not-allowed disabled:opacity-80"
            variant="secondary"
          >
            <ChevronLeftIcon className="size-4" />
            <span className="sr-only">Previous</span>
          </Button>

          {isLastStep ? (
            <>
              <Button size="sm" variant="secondary" onClick={resetSteps}>
                Reset
              </Button>
              <Button
                onClick={async () => {
                  if (submitFn) {
                    const isSuccess = await submitFn();
                    if (isSuccess) {
                      nextStep();
                    }
                  }
                }}
                disabled={isSubmitFnPending}
                size="sm"
                type="button"
                className="flex w-fit items-center justify-between gap-2 px-4 align-middle"
              >
                {!isSubmitFnPending ? (
                  <>
                    <span>Add to Hive</span>
                    <CheckCircleIcon className="size-4" />
                  </>
                ) : (
                  <span>Adding to Hive...</span>
                )}
              </Button>
            </>
          ) : isOptionalStep ? (
            <Button
              size="sm"
              type="submit"
              className="flex w-fit items-center justify-between gap-2 px-4 align-middle"
            >
              <span className="sr-only">Skip</span>
              <SkipForwardIcon className="size-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              type="submit"
              className="flex w-fit items-center justify-between gap-2 px-4 align-middle"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="size-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
