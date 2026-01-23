"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const settingsFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  defaultStatus: z.union([
    z.literal("FINISHED"),
    z.literal("WATCHING"),
    z.literal("PLANNED"),
    z.literal("ON_HOLD"),
    z.literal("DROPPED"),
    z.literal("REWATCHING"),
  ]),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS = [
  { value: "FINISHED", label: "Finished" },
  { value: "WATCHING", label: "Watching" },
  { value: "PLANNED", label: "Planned" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "DROPPED", label: "Dropped" },
  { value: "REWATCHING", label: "Rewatching" },
] as const;

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const user = useQuery(api.auth.getCurrentUser);
  const generateUploadUrl = useMutation(api.auth.generateUploadUrl);
  const updateDefaultStatus = useMutation(api.auth.updateDefaultStatus);
  const updateAuthProfile = useMutation(api.auth.updateAuthProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedStorageId, setUploadedStorageId] =
    useState<Id<"_storage"> | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const previewObjectUrlRef = useRef<string | null>(null);

  const defaultStatusValue = user?.defaultStatus ?? "PLANNED";

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: user?.name || "",
      defaultStatus: defaultStatusValue,
    },
  });

  const revokePreviewObjectUrl = useCallback(() => {
    const url = previewObjectUrlRef.current;
    if (url) {
      URL.revokeObjectURL(url);
      previewObjectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => revokePreviewObjectUrl();
  }, [revokePreviewObjectUrl]);

  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.name,
        defaultStatus: user.defaultStatus || "PLANNED",
      });
      setPreviewImage(user.image || null);
      setUploadedStorageId(null);
      setImageRemoved(false);
    }
  }, [form, open, user, user?._id]);

  const uploadedImageUrl = useQuery(
    api.auth.getStorageUrl,
    uploadedStorageId ? { storageId: uploadedStorageId } : "skip"
  );

  useEffect(() => {
    if (uploadedImageUrl) {
      revokePreviewObjectUrl();
      setPreviewImage(uploadedImageUrl);
    }
  }, [uploadedImageUrl, revokePreviewObjectUrl]);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setIsUploading(true);
      try {
        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          const json = await result.json();
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }

        const { storageId } = (await result.json()) as {
          storageId: Id<"_storage">;
        };
        setUploadedStorageId(storageId);
        setImageRemoved(false);

        revokePreviewObjectUrl();
        const objectUrl = URL.createObjectURL(file);
        previewObjectUrlRef.current = objectUrl;
        setPreviewImage(objectUrl);

        await updateAuthProfile({ image: storageId });

        toast.success("Profile image updated");
      } catch (error) {
        toast.error("Failed to upload image");
        if (error instanceof Error) {
          console.error("Upload error:", error.message);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl, revokePreviewObjectUrl, updateAuthProfile]
  );

  const onSubmit = useCallback(
    async (data: SettingsFormValues) => {
      setIsSaving(true);
      try {
        const updateData: { name?: string; image?: string | null } = {};
        if (data.name !== user?.name) updateData.name = data.name;

        if (imageRemoved) {
          updateData.image = null;
        }

        if (Object.keys(updateData).length > 0) {
          await updateAuthProfile(updateData);
        }

        if (data.defaultStatus !== user?.defaultStatus) {
          await updateDefaultStatus({
            defaultStatus: data.defaultStatus,
          });
        }

        toast.success("Settings saved successfully");
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to save settings");
        if (error instanceof Error) {
          console.error("Save error:", error.message);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [
      imageRemoved,
      onOpenChange,
      updateAuthProfile,
      updateDefaultStatus,
      user?.defaultStatus,
      user?.name,
    ]
  );

  const canSave = useMemo(
    () => !isSaving && !isUploading,
    [isSaving, isUploading]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                {previewImage || user?.image ? (
                  <AvatarImage
                    src={previewImage || user?.image || undefined}
                    alt={user?.name || "Profile"}
                  />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
                {(previewImage || uploadedStorageId || user?.image) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (uploadedStorageId) {
                        revokePreviewObjectUrl();
                        setPreviewImage(user?.image || null);
                        setUploadedStorageId(null);
                        setImageRemoved(false);
                      } else {
                        revokePreviewObjectUrl();
                        setPreviewImage(null);
                        setImageRemoved(true);
                      }
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    {uploadedStorageId ? "Cancel" : "Remove"}
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Default Status */}
            <FormField
              control={form.control}
              name="defaultStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select default status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving || isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSave}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
