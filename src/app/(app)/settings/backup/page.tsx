"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBusiness } from "@/lib/store";
import { createBackup, getBackups, restoreBackup } from "@/server/actions/backups";
import { ArrowLeft, Download, Upload, Database, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function BackupPage() {
  const { businessId } = useBusiness();
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!businessId) return;
    try {
      setBackups(await getBackups(businessId));
    } catch {}
    setLoading(false);
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const handleBackup = async () => {
    if (!businessId) return;
    setCreating(true);
    try {
      await createBackup(businessId);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Backup failed");
    }
    setCreating(false);
  };

  const handleRestore = async (id: string) => {
    if (!confirm("This will overwrite current data. Continue?")) return;
    if (!businessId) return;
    setRestoring(id);
    try {
      await restoreBackup(businessId, id);
      alert("Data restored successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Restore failed");
    }
    setRestoring(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Backup & Restore</h1>
          <p className="text-muted-foreground">Export and restore your business data</p>
        </div>
        <Button onClick={handleBackup} disabled={creating}>
          {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Create Backup
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" /> Backup History</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : backups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No backups yet. Create your first backup above.</p>
          ) : backups.map(b => (
            <div key={b.id} className="flex items-center gap-4 rounded-lg border p-3">
              <div className="flex-shrink-0">
                {b.status === "completed" ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                 b.status === "failed" ? <XCircle className="h-5 w-5 text-[#DC2626]" /> :
                 <Clock className="h-5 w-5 text-yellow-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{b.backup_type === "manual" ? "Manual" : "Scheduled"} Backup</span>
                  <Badge variant={b.status === "completed" ? "default" : b.status === "failed" ? "destructive" : "secondary"}>{b.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(b.created_at).toLocaleString()}
                  {b.tables_backed_up && ` · ${b.tables_backed_up.length} tables`}
                  {b.file_size_bytes && ` · ${(b.file_size_bytes / 1024).toFixed(1)} KB`}
                </p>
              </div>
              <div className="flex gap-2">
                {b.file_path && (
                  <a href={b.file_path} download>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
                  </a>
                )}
                {b.status === "completed" && (
                  <Button variant="outline" size="sm" onClick={() => handleRestore(b.id)} disabled={restoring === b.id}>
                    {restoring === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
