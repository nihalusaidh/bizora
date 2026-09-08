"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteForm } from "@/components/team/invite-form";
import { MemberCard } from "@/components/team/member-card";
import { getTeamMembers, getCurrentUserRole } from "@/server/actions/team";
import { useBusiness } from "@/lib/store";
import { ROLE_DESCRIPTIONS } from "@/lib/rbac";
import type { UserRole } from "@/types/database";
import {
  ArrowLeft, Users, Shield, UserPlus, Crown
} from "lucide-react";

interface TeamMember {
  user_id: string;
  role: UserRole;
  created_at: string;
  user_profiles?: {
    id: string;
    email: string;
    full_name?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  } | null;
}

export default function TeamPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [teamData, role] = await Promise.all([
        getTeamMembers(businessId),
        getCurrentUserRole(businessId),
      ]);
      setMembers(teamData);
      setCurrentRole(role);

      // Get current user ID from supabase
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = currentRole === "owner";
  const canManageTeam = isOwner;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team</h1>
            <p className="text-muted-foreground">{members.length} team members</p>
          </div>
        </div>
        {canManageTeam && (
          <Button onClick={() => setShowInvite(!showInvite)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite
          </Button>
        )}
      </div>

      {/* Invite Form */}
      {showInvite && canManageTeam && (
        <InviteForm
          businessId={businessId}
          onSuccess={() => {
            load();
            setShowInvite(false);
          }}
        />
      )}

      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.entries(ROLE_DESCRIPTIONS) as [UserRole, { label: string; description: string }][]).map(
              ([role, info]) => (
                <div key={role} className="rounded-lg border p-3">
                  <div className="font-medium text-sm">{info.label}</div>
                  <div className="text-xs text-muted-foreground">{info.description}</div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Members
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members</h3>
            <p className="text-muted-foreground">Invite your first team member to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <MemberCard
                key={member.user_id}
                businessId={businessId}
                member={member}
                isCurrentUser={member.user_id === currentUserId}
                isOwner={isOwner}
                onRefresh={load}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
