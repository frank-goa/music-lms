'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export async function updateProfile(data: UpdateProfileInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const result = updateProfileSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input data' };
  }

  const { fullName } = result.data;

  // Update user metadata in auth
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (authError) {
    console.error('Error updating auth user:', authError);
    return { error: 'Failed to update profile' };
  }

  // Update users table
  const { error: dbError } = await supabase
    .from('users')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (dbError) {
    console.error('Error updating user record:', dbError);
    return { error: 'Failed to update profile' };
  }

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function updateAvatar(avatarUrl: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Update user metadata in auth
  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });

  if (authError) {
    console.error('Error updating auth user avatar:', authError);
    return { error: 'Failed to update avatar' };
  }

  // Update users table
  const { error: dbError } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (dbError) {
    console.error('Error updating user avatar in db:', dbError);
    return { error: 'Failed to update avatar' };
  }

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function updatePassword(data: UpdatePasswordInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const result = updatePasswordSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid input data' };
  }

  const { newPassword } = result.data;

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Error updating password:', error);
    return { error: error.message };
  }

  return { success: true };
}

export async function getUserProfile() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!user) {
    return null;
  }

  // Get role-specific profile
  let profile = null;
  if (user.role === 'teacher') {
    const { data } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    profile = data;
  } else {
    const { data } = await supabase
      .from('student_profiles')
      .select('*, users!student_profiles_teacher_id_fkey(full_name, email)')
      .eq('user_id', user.id)
      .single();
    profile = data;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    profile,
  };
}
