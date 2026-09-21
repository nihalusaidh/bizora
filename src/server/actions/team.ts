"use server";

import { requireAuth, requireBusiness } from "@/lib/auth";
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
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data, error } = await supabase
    .from("memberships")
    .select("user_id, role, created_at, profiles(id, full_name, phone, avatar_url, email)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const members: TeamMember[] = [];

  for (const m of data || []) {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    members.push({
      user_id: m.user_id,
      role: m.role,
      created_at: m.created_at,
      profiles: profile || null,
      email: (profile as any)?.email || "",
    });
  }

  return members;
}

export async function inviteTeamMember(businessId: string, email: string, role: UserRole) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single() as { data: { id: string } | null };

  if (!existingUser) {
    throw new Error("No account found with this email. They must sign up first.");
  }

  const { data: existingMembership } = await supabase
    .from("memberships")
    .select("user_id")
    .eq("business_id", businessId)
    .eq("user_id", existingUser.id)
    .single();

  if (existingMembership) {
    throw new Error("This user is already a team member.");
  }

  const { error } = await supabase
    .from("memberships")
    .insert({
      user_id: existingUser.id,
      business_id: businessId,
      role,
    });

  if (error) throw new Error(error.message);

  try {
    const { data: business } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", businessId)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", auth.user!.id)
      .single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    await fetch(`${appUrl}/api/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "invite",
        to: email,
        data: {
          businessName: business?.name || "Your Business",
          inviterName: profile?.full_name || "Team Admin",
          role,
        },
      }),
    });
  } catch {
    // Email failure shouldn't block the invite
  }

  return { success: true };
}

export async function updateMemberRole(
  businessId: string,
  userId: string,
  newRole: UserRole
) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { error } = await supabase
    .from("memberships")
    .update({ role: newRole })
    .eq("business_id", businessId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function removeTeamMember(businessId: string, userId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("business_id", businessId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function getCurrentUserRole(businessId: string) {
  const auth = await requireAuth();
  if (auth.error || !auth.supabase) return null;
  const supabase = auth.supabase;

  const { data, error } = await supabase
    .from("memberships")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", auth.user!.id)
    .single();

  if (error) return null;
  return data.role as UserRole;
}
