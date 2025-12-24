"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { Database } from "@/types/database";

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  instrument: z.string().min(1),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

export async function acceptInvite(data: AcceptInviteInput) {
  const result = acceptInviteSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid input data" };
  }

  const { token, email, password, fullName, instrument, skillLevel } = result.data;

  // Use regular client to validate invite
  const supabase = await createClient();

  // Validate the invite token
  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .select("id, teacher_id, email, expires_at")
    .eq("token", token)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (inviteError || !invite) {
    return { error: "This invite link is invalid or has expired." };
  }

  // If invite has a specific email, verify it matches
  if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
    return { error: "This invite was sent to a different email address." };
  }

  // Check if user already exists
  const adminClient = createAdminClient();

  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    return { error: "An account with this email already exists. Please log in instead." };
  }

  // Create user with admin API (auto-confirmed, no email verification needed)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm the email
    user_metadata: {
      full_name: fullName,
      role: "student",
    },
  });

  if (authError) {
    console.error("Error creating user:", authError);
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create user account" };
  }

  const userId = authData.user.id;

  // Wait for the trigger to create the user record in public.users table
  // The trigger runs asynchronously, so we need to poll for the record
  let userExists = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!userExists && attempts < maxAttempts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingUser } = await (adminClient as any)
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingUser) {
      userExists = true;
    } else {
      attempts++;
      // Wait 200ms before retrying
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  if (!userExists) {
    console.error("User record was not created in public.users table after waiting");
    // Try to insert directly as fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any)
      .from("users")
      .insert({
        id: userId,
        email: email,
        role: "student",
        full_name: fullName,
      });
  } else {
    // Update the user record in public.users table with correct role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: userError } = await (adminClient as any)
      .from("users")
      .update({
        role: "student",
        full_name: fullName,
      })
      .eq("id", userId);

    if (userError) {
      console.error("Error updating user role:", userError);
    }
  }

  // Create student profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (adminClient as any)
    .from("student_profiles")
    .insert({
      user_id: userId,
      teacher_id: invite.teacher_id,
      instrument,
      skill_level: skillLevel,
    });

  if (profileError) {
    console.error("Error creating student profile:", profileError);
    // Continue anyway - user was created
  }

  // Mark invite as used
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (adminClient as any)
    .from("invites")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invite.id);

  return {
    success: true,
    message: "Account created successfully! You can now log in.",
  };
}
