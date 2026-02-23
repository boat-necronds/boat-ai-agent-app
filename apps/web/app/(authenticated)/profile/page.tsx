import { createClient } from "@workspace/supabase/server";
import { getAccount } from "@workspace/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { AvatarChange } from "@/components/profile/avatar-change";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { Mail, Calendar, User as UserIcon } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const account = await getAccount(user!.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Your avatar and basic info</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <AvatarChange
              userId={user!.id}
              avatarUrl={account?.avatarUrl ?? null}
              fullName={account?.fullName}
              email={user?.email}
            />
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">
                {account?.fullName || "User"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {account?.username || "No username"}
              </p>
              <Badge variant="secondary" className="mt-2">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">
                    {account?.fullName || "Not set"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {account?.createdAt
                      ? new Date(account.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {account?.bio && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Bio</p>
                  <p className="text-sm text-muted-foreground">{account.bio}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ProfileEditForm
        defaultValues={{
          fullName: account?.fullName,
          username: account?.username,
          bio: account?.bio,
        }}
      />
    </div>
  );
}
