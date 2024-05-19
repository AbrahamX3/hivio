import { useEffect } from "react";
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
  isSubmitSuccessful,
  setIsSubmitSuccessful,
}: {
  submitFn?: () => boolean;
  isSubmitFnPending?: boolean;
  isSubmitSuccessful: boolean;
  setIsSubmitSuccessful: (isSuccess: boolean) => void;
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

  useEffect(() => {
    if (isSubmitSuccessful) {
      nextStep();
      setIsSubmitSuccessful(false);
    }
  }, [isSubmitSuccessful, nextStep, setIsSubmitSuccessful]);

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
                    submitFn();
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
