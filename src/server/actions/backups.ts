import { createClient } from "@/lib/supabase/client";

export async function createBackup(businessId: string) {
  const supabase = createClient();
  
  // Create backup record
  const { data: backup, error } = await supabase
    .from("db_backups")
    .insert({ business_id: businessId, backup_type: "manual", status: "running" })
    .select()
    .single();
  
  if (error) throw new Error(error.message);

  // Export key tables
  const tables = ["products", "customers", "invoices", "expenses", "categories", "suppliers"];
  const backupData: Record<string, unknown[]> = {};

  for (const table of tables) {
    const { data } = await supabase
      .from(table)
      .select("*")
      .eq("business_id", businessId);
    backupData[table] = data || [];
  }

  // Create JSON blob
  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });

  // Upload to storage
  const fileName = `backups/${businessId}/${new Date().toISOString().split("T")[0]}.json`;
  const { error: uploadError } = await supabase.storage
    .from("db-backups")
    .upload(fileName, blob, { contentType: "application/json" });

  if (uploadError) {
    await supabase.from("db_backups").update({ status: "failed", error_message: uploadError.message }).eq("id", backup.id);
    throw new Error(uploadError.message);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from("db-backups").getPublicUrl(fileName);

  await supabase.from("db_backups").update({
    status: "completed",
    tables_backed_up: tables,
    file_path: urlData?.publicUrl,
    file_size_bytes: blob.size,
    completed_at: new Date().toISOString(),
  }).eq("id", backup.id);

  return backup;
}

export async function getBackups(businessId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("db_backups")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function restoreBackup(businessId: string, backupId: string) {
  const supabase = createClient();
  
  const { data: backup, error } = await supabase
    .from("db_backups")
    .select("*")
    .eq("id", backupId)
    .eq("business_id", businessId)
    .single();
  
  if (error || !backup?.file_path) throw new Error("Backup not found");

  // Download and parse
  const response = await fetch(backup.file_path);
  const data = await response.json();

  // Restore each table
  const tables = Object.keys(data);
  for (const table of tables) {
    if (!data[table]?.length) continue;
    // Delete existing and insert backup
    await supabase.from(table).delete().eq("business_id", businessId);
    if (data[table].length > 0) {
      await supabase.from(table).insert(data[table]);
    }
  }

  return { restored: tables };
}
