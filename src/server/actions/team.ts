import { createClient } from "@/lib/supabase/client";
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
  const supabase = createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("user_id, role, created_at, profiles(id, full_name, phone, avatar_url)")
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
      email: "",
    });
  }

  return members;
}

export async function inviteTeamMember(businessId: string, email: string, role: UserRole) {
  const supabase = createClient();

  const { data: existingMembers } = await supabase
    .from("memberships")
    .select("user_id")
    .eq("business_id", businessId);

  if (existingMembers && existingMembers.length > 0) {
    const membership = existingMembers[0];
    if (membership.user_id) {
      throw new Error("This user is already a team member.");
    }
  }

  const { data: userData } = await supabase.auth.admin.listUsers();
  const targetUser = userData?.users?.find((u) => u.email === email);

  if (!targetUser) {
    throw new Error("No account found with this email. They must sign up first.");
  }

  const { error } = await supabase
    .from("memberships")
    .insert({
      user_id: targetUser.id,
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

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("full_name").eq("id", user.id).single()
      : { data: null };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
  const supabase = createClient();

  const { error } = await supabase
    .from("memberships")
    .update({ role: newRole })
    .eq("business_id", businessId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function removeTeamMember(businessId: string, userId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("business_id", businessId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function getCurrentUserRole(businessId: string) {
  const supabase = createClient();
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
