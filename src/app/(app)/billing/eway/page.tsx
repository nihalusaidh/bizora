"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEwayBill, getEwayBillLog } from "@/server/actions/einvoice";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, Truck, Loader2 } from "lucide-react";

interface EwayEntry { id: string; eway_number?: string | null; from_state?: string | null; to_state?: string | null; vehicle_number?: string | null; status: string; valid_upto?: string | null; created_at: string; }

export default function EwayBillPage() {
  const { businessId, business } = useBusiness();
  const router = useRouter();
  const [fromState, setFromState] = useState(business?.state || "");
  const [toState, setToState] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [transportMode, setTransportMode] = useState<"road" | "rail" | "air" | "ship">("road");
  const [distance, setDistance] = useState("");
  const [log, setLog] = useState<EwayEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLog(await getEwayBillLog(businessId));
    setDataLoading(false);
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    if (!businessId || !fromState || !toState) return;
    setLoading(true);
    try {
      await generateEwayBill(businessId, {
        from_state: fromState, to_state: toState, vehicle_number: vehicleNumber || undefined,
        transport_mode: transportMode, distance_km: distance ? parseInt(distance) : undefined,
      });
      setToState(""); setVehicleNumber(""); setDistance("");
      load();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/billing")}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold tracking-tight">E-Way Bill</h1><p className="text-muted-foreground">Generate e-way bill for goods &gt;₹50,000</p></div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Generate E-Way Bill</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>From State *</Label><Input placeholder="MH" value={fromState} onChange={(e) => setFromState(e.target.value)} /></div>
            <div className="space-y-2"><Label>To State *</Label><Input placeholder="DL" value={toState} onChange={(e) => setToState(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>Vehicle No</Label><Input placeholder="MH 12 AB 1234" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} /></div>
            <div className="space-y-2"><Label>Mode</Label>
              <Select value={transportMode} onValueChange={(v) => setTransportMode(v as typeof transportMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">Road</SelectItem><SelectItem value="rail">Rail</SelectItem>
                  <SelectItem value="air">Air</SelectItem><SelectItem value="ship">Ship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Distance (km)</Label><Input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} /></div>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !fromState || !toState}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
            Generate E-Way Bill
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">E-Way Bill Log</CardTitle></CardHeader>
        <CardContent>
          {dataLoading ? <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
          : log.length === 0 ? <p className="text-sm text-muted-foreground">No e-way bills generated yet</p>
          : (
            <div className="space-y-2">
              {log.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    {entry.eway_number && <div className="font-mono text-sm font-medium">{entry.eway_number}</div>}
                    <div className="text-xs text-muted-foreground">{entry.from_state} → {entry.to_state} {entry.vehicle_number ? `• ${entry.vehicle_number}` : ""}</div>
                    {entry.valid_upto && <div className="text-xs text-muted-foreground">Valid till: {new Date(entry.valid_upto).toLocaleString()}</div>}
                  </div>
                  <Badge variant={entry.status === "generated" ? "default" : "destructive"}>{entry.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
