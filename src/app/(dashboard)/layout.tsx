import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getNotifications } from "./dashboard/notifications-actions";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Get the user's profile and notifications
  const [{ data: user }, notifications] = await Promise.all([
    supabase.from("users").select("*").eq("id", authUser.id).single(),
    getNotifications(),
  ]);

  // If no user profile exists yet (new OAuth user), create one
  if (!user) {
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        id: authUser.id,
        email: authUser.email!,
        role: "teacher", // Default to teacher for OAuth signups
        full_name: authUser.user_metadata?.full_name || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      redirect("/login");
    }

    // Also create teacher profile
    await supabase.from("teacher_profiles").insert({
      user_id: authUser.id,
    });

    return <DashboardLayout user={newUser} initialNotifications={[]}>{children}</DashboardLayout>;
  }

  return <DashboardLayout user={user} initialNotifications={notifications}>{children}</DashboardLayout>;
}
