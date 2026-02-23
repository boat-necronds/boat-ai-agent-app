"use client";

import { useRef } from "react";
import { useAction } from "next-safe-action/hooks";
import { createClient } from "@workspace/supabase/client";
import { uploadAvatarAction, deleteAvatarAction } from "@/actions/account";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type AvatarChangeProps = {
  userId: string;
  avatarUrl: string | null;
  fullName?: string | null;
  email?: string;
};

function getInitials(name?: string | null, email?: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.charAt(0).toUpperCase() || "U";
}

export function AvatarChange({
  userId,
  avatarUrl,
  fullName,
  email,
}: AvatarChangeProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { execute: upload, isExecuting: isUploading } = useAction(
    uploadAvatarAction,
    {
      onSuccess: () => {
        toast.success("Profile photo updated");
      },
      onError: () => {
        toast.error("Upload failed");
      },
    }
  );

  const { execute: remove, isExecuting: isRemoving } = useAction(
    deleteAvatarAction,
    {
      onSuccess: () => {
        toast.success("Profile photo removed");
      },
      onError: () => {
        toast.error("Remove failed");
      },
    }
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error(uploadError.message || "Upload failed");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    upload({ avatarUrl: publicUrl });
    e.target.value = "";
  };

  const isBusy = isUploading || isRemoving;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className="h-32 w-32">
          <AvatarImage
            src={avatarUrl || undefined}
            alt={fullName || email || "Avatar"}
          />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {getInitials(fullName, email)}
          </AvatarFallback>
        </Avatar>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isBusy}
        />
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full h-9 w-9 shadow-md"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          <span className="sr-only">Change photo</span>
        </Button>
      </div>
      {avatarUrl && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => remove()}
          disabled={isBusy}
        >
          {isRemoving ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-1 h-4 w-4" />
          )}
          Remove photo
        </Button>
      )}
    </div>
  );
}
