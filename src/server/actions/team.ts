"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/types/database";

export interface TeamMember {
  user_id: string;
  role: UserRole;
  created_at: string;
  profiles?: {
    id: string;
    full_name?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  } | null;
  email?: string;
}

export async function getTeamMembers(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("user_id, role, created_at, profiles(id, full_name, phone, avatar_url)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const admin = createAdminClient();
  const members: TeamMember[] = [];

  for (const m of data || []) {
    const { data: userData } = await admin.auth.admin.getUserById(m.user_id);
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    members.push({
      user_id: m.user_id,
      role: m.role,
      created_at: m.created_at,
      profiles: profile || null,
      email: userData?.user?.email || "",
    });
  }

  return members;
}

export async function inviteTeamMember(businessId: string, email: string, role: UserRole) {
  const admin = createAdminClient();

  const { data: existingMember } = await admin
    .from("memberships")
    .select("user_id")
    .eq("business_id", businessId)
    .limit(1);

  const { data: userData } = await admin.auth.admin.listUsers();
  const targetUser = userData?.users?.find((u) => u.email === email);

  if (!targetUser) {
    throw new Error("No account found with this email. They must sign up first.");
  }

  if (existingMember?.some((m) => m.user_id === targetUser.id)) {
    throw new Error("This user is already a team member.");
  }

  const { error } = await admin
    .from("memberships")
    .insert({
      user_id: targetUser.id,
      business_id: businessId,
      role,
    });

  if (error) throw new Error(error.message);

  revalidatePath("/settings/team");
  return { success: true };
}

export async function updateMemberRole(
  businessId: string,
  userId: string,
  newRole: UserRole
) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("memberships")
    .update({ role: newRole })
    .eq("business_id", businessId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/settings/team");
  return { success: true };
}

export async function removeTeamMember(businessId: string, userId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("memberships")
    .delete()
    .eq("business_id", businessId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/settings/team");
  return { success: true };
}

export async function getCurrentUserRole(businessId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("memberships")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data.role as UserRole;
}
