"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

export async function createInvite(email: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify user is a teacher
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher") {
    return { error: "Only teachers can invite students" };
  }

  // Check if student already exists
  const { data: existingStudent } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingStudent) {
    // Check if they're already linked to this teacher
    const { data: existingProfile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", existingStudent.id)
      .eq("teacher_id", user.id)
      .single();

    if (existingProfile) {
      return { error: "This student is already in your studio" };
    }
  }

  // Check for existing unused invite
  const { data: existingInvite } = await supabase
    .from("invites")
    .select("id")
    .eq("teacher_id", user.id)
    .eq("email", email)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (existingInvite) {
    return { error: "An active invite already exists for this email" };
  }

  // Generate unique token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create invite
  const { error: insertError } = await supabase.from("invites").insert({
    teacher_id: user.id,
    email,
    token,
    expires_at: expiresAt.toISOString(),
  });

  if (insertError) {
    console.error("Error creating invite:", insertError);
    return { error: "Failed to create invite" };
  }

  revalidatePath("/dashboard/students");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${token}`;

  return { inviteUrl };
}

export async function cancelInvite(inviteId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Delete the invite (only if it belongs to this teacher)
  const { error } = await supabase
    .from("invites")
    .delete()
    .eq("id", inviteId)
    .eq("teacher_id", user.id);

  if (error) {
    console.error("Error cancelling invite:", error);
    return { error: "Failed to cancel invite" };
  }

  revalidatePath("/dashboard/students");

  return { success: true };
}

export async function updateStudentNotes(studentUserId: string, notes: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Update the student profile (only if teacher owns this student)
  const { error } = await supabase
    .from("student_profiles")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("user_id", studentUserId)
    .eq("teacher_id", user.id);

  if (error) {
    console.error("Error updating student notes:", error);
    return { error: "Failed to update notes" };
  }

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${studentUserId}`);

  return { success: true };
}

export async function removeStudent(studentUserId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Delete the student profile (only if teacher owns this student)
  // This doesn't delete the user account, just removes them from the studio
  const { error } = await supabase
    .from("student_profiles")
    .delete()
    .eq("user_id", studentUserId)
    .eq("teacher_id", user.id);

  if (error) {
    console.error("Error removing student:", error);
    return { error: "Failed to remove student" };
  }

  revalidatePath("/dashboard/students");

  return { success: true };
}
