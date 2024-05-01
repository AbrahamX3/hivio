import { useEffect, useRef, useState, useTransition } from "react";

// https://github.com/vercel/next.js/discussions/51371#discussioncomment-8671340
export function useServerAction<P extends any[], R>(
  action: (...args: P) => Promise<R>,
  onFinished?: (_: R | undefined) => void
): [(...args: P) => Promise<R | undefined>, boolean] {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<R>();
  const [finished, setFinished] = useState(false);
  const resolver = useRef<(value?: R | PromiseLike<R>) => void>();

  useEffect(() => {
    if (!finished) return;

    if (onFinished) onFinished(result);
    resolver.current?.(result);
  }, [result, finished, onFinished]);

  const runAction = async (...args: P): Promise<R | undefined> => {
    startTransition(() => {
      action(...args).then((data) => {
        setResult(data);
        setFinished(true);
      });
    });

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  return [runAction, isPending];
}
