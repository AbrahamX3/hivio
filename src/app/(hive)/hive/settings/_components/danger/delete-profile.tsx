"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { deleteAccount } from "../../actions";

export default function DeleteAccount() {
  const { execute } = useAction(deleteAccount, {
    onError: ({ serverError }) => {
      toast.error("Server Error", {
        description: serverError,
        id: "delete-account",
      });
    },
    onExecute: () => {
      toast.loading("Deleting your hive account...", {
        id: "delete-account",
      });
    },
    onSuccess: ({ success }) => {
      if (success) {
        toast.success("Account deleted successfully!", {
          id: "delete-account",
        });
      } else {
        toast.dismiss("delete-account");
      }
    },
  });

  return (
    <Card className="border border-red-500">
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Delete your account from Hivio. This will completely remove your
          account from our database including your hive data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8"></CardContent>
      <CardFooter className="justify-end border-t px-6 py-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¡Warning!</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Are you sure you want to delete your Hivio account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => execute({ confirm: true })}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
