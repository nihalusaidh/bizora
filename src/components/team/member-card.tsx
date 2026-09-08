"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateMemberRole, removeTeamMember } from "@/server/actions/team";
import { BUSINESS_ROLES } from "@/lib/constants";
import { ROLE_DESCRIPTIONS } from "@/lib/rbac";
import type { UserRole } from "@/types/database";
import { Loader2, Trash2, Shield } from "lucide-react";

interface MemberCardProps {
  businessId: string | null;
  member: {
    user_id: string;
    role: UserRole;
    created_at: string;
    user_profiles?: {
      email: string;
      full_name?: string | null;
      phone?: string | null;
      avatar_url?: string | null;
    } | null;
  };
  isCurrentUser: boolean;
  isOwner: boolean;
  onRefresh: () => void;
}

export function MemberCard({ businessId, member, isCurrentUser, isOwner, onRefresh }: MemberCardProps) {
  const [changing, setChanging] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const profile = member.user_profiles;
  const displayName = profile?.full_name || profile?.email || "Unknown";
  const email = profile?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleRoleChange = async (newRole: string) => {
    if (!businessId || newRole === member.role) return;
    setChanging(true);
    setError("");
    try {
      await updateMemberRole(businessId, member.user_id, newRole as UserRole);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setChanging(false);
    }
  };

  const handleRemove = async () => {
    if (!businessId) return;
    if (!confirm(`Remove ${displayName} from the team?`)) return;
    setRemoving(true);
    try {
      await removeTeamMember(businessId, member.user_id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setRemoving(false);
    }
  };

  const roleInfo = ROLE_DESCRIPTIONS[member.role];

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-12 w-12 rounded-full" />
          ) : (
            <span className="text-sm font-bold text-primary">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{displayName}</span>
            {isCurrentUser && (
              <span className="text-xs text-muted-foreground">(You)</span>
            )}
            {member.role === "owner" && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Owner</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{email}</div>
          {roleInfo && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {roleInfo.description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {member.role !== "owner" && (
            <>
              <Select
                value={member.role}
                onValueChange={(v: string | null) => v && handleRoleChange(v)}
                disabled={isOwner === false || isCurrentUser}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BUSINESS_ROLES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isOwner && !isCurrentUser && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={handleRemove}
                  disabled={removing}
                >
                  {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-2 text-xs text-destructive">{error}</div>
      )}
    </div>
  );
}
