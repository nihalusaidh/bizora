"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/reports/stat-card";
import { generateGstr1, type Gstr1Report } from "@/server/actions/gstr";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, Download, Printer, FileText, Loader2 } from "lucide-react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function GstrReportPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(currentYear));
  const [data, setData] = useState<Gstr1Report | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const result = await generateGstr1(businessId, Number(month), Number(year));
      setData(result);
    } catch (err) {
      console.error("Failed to generate GSTR-1:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, month, year]);

  const exportCsv = () => {
    if (!data) return;
    const rows: string[] = ["Section,Field,Value"];
    rows.push(`Period,${data.period},`);
    rows.push(`Generated,${data.generated_at},`);
    rows.push(`Total Invoices,${data.document_summary.total_invoices},`);
    rows.push(`Total Taxable Value,,${data.document_summary.total_taxable_value}`);
    rows.push(`Total CGST,,${data.document_summary.total_cgst}`);
    rows.push(`Total SGST,,${data.document_summary.total_sgst}`);
    rows.push(`Total IGST,,${data.document_summary.total_igst}`);
    rows.push(`Total Invoice Value,,${data.document_summary.total_invoice_value}`);
    rows.push("");
    rows.push("B2B Invoices");
    rows.push("GSTIN,Invoice Number,Invoice Date,Invoice Value,Place of Supply,Reverse Charge,Invoice Type");
    for (const inv of data.b2b) {
      rows.push(`${inv.gstin},${inv.invoice_number},${inv.invoice_date},${inv.invoice_value},${inv.place_of_supply},${inv.reverse_charge},${inv.invoice_type}`);
    }
    rows.push("");
    rows.push("B2C Small");
    rows.push("Place of Supply,Rate,Taxable Value,CGST,SGST,IGST");
    for (const item of data.b2c_small) {
      rows.push(`${item.place_of_supply},${item.rate},${item.taxable_value.toFixed(2)},${item.cgst.toFixed(2)},${item.sgst.toFixed(2)},${item.igst.toFixed(2)}`);
    }
    rows.push("");
    rows.push("HSN Summary");
    rows.push("HSN Code,Description,UQC,Quantity,Total Value,Taxable Value,CGST,SGST,IGST");
    for (const item of data.hsn_summary) {
      rows.push(`${item.hsn_code},${item.description},${item.uqc},${item.total_quantity},${item.total_value.toFixed(2)},${item.taxable_value.toFixed(2)},${item.cgst.toFixed(2)},${item.sgst.toFixed(2)},${item.igst.toFixed(2)}`);
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GSTR1_${data.period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/insights")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GSTR-1 Report</h1>
            <p className="text-muted-foreground">Outward supplies summary for GST filing</p>
          </div>
        </div>
        {data && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1.5" />
              Print
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Month</label>
          <Select value={month} onValueChange={(v: string | null) => { if (v) setMonth(v); }}>
            <SelectTrigger className="w-full h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Year</label>
          <Select value={year} onValueChange={(v: string | null) => { if (v) setYear(v); }}>
            <SelectTrigger className="w-full h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerate} disabled={loading || !businessId} className="h-9">
          {loading ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-1.5" />
          )}
          Generate GSTR-1
        </Button>
      </div>

      {loading && !data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Invoices" value={String(data.document_summary.total_invoices)} />
            <StatCard label="Taxable Value" value={data.document_summary.total_taxable_value.toLocaleString()} prefix="₹" />
            <StatCard label="CGST" value={data.document_summary.total_cgst.toLocaleString()} prefix="₹" variant="success" />
            <StatCard label="SGST" value={data.document_summary.total_sgst.toLocaleString()} prefix="₹" variant="success" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="IGST" value={data.document_summary.total_igst.toLocaleString()} prefix="₹" />
            <StatCard label="Invoice Value" value={data.document_summary.total_invoice_value.toLocaleString()} prefix="₹" variant="success" />
          </div>

          <Tabs defaultValue="b2b">
            <TabsList className="w-full">
              <TabsTrigger value="b2b" className="flex-1">
                B2B ({data.b2b.length})
              </TabsTrigger>
              <TabsTrigger value="b2c" className="flex-1">
                B2C ({data.b2c_small.length})
              </TabsTrigger>
              <TabsTrigger value="hsn" className="flex-1">
                HSN ({data.hsn_summary.length})
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex-1">
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="b2b" className="space-y-3 mt-4">
              {data.b2b.length === 0 ? (
                <div className="rounded-xl border bg-card p-6 text-center">
                  <p className="text-muted-foreground">No B2B invoices for this period</p>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">B2B Invoices to Registered Businesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-semibold">GSTIN</th>
                            <th className="text-left py-2 font-semibold">Invoice No</th>
                            <th className="text-left py-2 font-semibold">Date</th>
                            <th className="text-right py-2 font-semibold">Value</th>
                            <th className="text-left py-2 font-semibold">POS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.b2b.map((inv) => (
                            <tr key={inv.invoice_number} className="border-b">
                              <td className="py-2 font-mono text-xs">{inv.gstin}</td>
                              <td className="py-2">{inv.invoice_number}</td>
                              <td className="py-2 text-muted-foreground">{inv.invoice_date}</td>
                              <td className="py-2 text-right font-medium">₹{inv.invoice_value.toLocaleString()}</td>
                              <td className="py-2 text-muted-foreground">{inv.place_of_supply}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 font-bold">
                            <td colSpan={3} className="py-2">Total ({data.b2b.length} invoices)</td>
                            <td className="py-2 text-right">
                              ₹{data.b2b.reduce((s, i) => s + i.invoice_value, 0).toLocaleString()}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="b2c" className="space-y-3 mt-4">
              {data.b2c_small.length === 0 ? (
                <div className="rounded-xl border bg-card p-6 text-center">
                  <p className="text-muted-foreground">No B2C transactions for this period</p>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">B2C Small Supplies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-semibold">POS</th>
                            <th className="text-right py-2 font-semibold">Rate %</th>
                            <th className="text-right py-2 font-semibold">Taxable</th>
                            <th className="text-right py-2 font-semibold">CGST</th>
                            <th className="text-right py-2 font-semibold">SGST</th>
                            <th className="text-right py-2 font-semibold">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.b2c_small.map((item, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="py-2">{item.place_of_supply}</td>
                              <td className="py-2 text-right">{item.rate}%</td>
                              <td className="py-2 text-right">₹{item.taxable_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="py-2 text-right">₹{item.cgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="py-2 text-right">₹{item.sgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="py-2 text-right font-medium">
                                ₹{(item.taxable_value + item.cgst + item.sgst).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 font-bold">
                            <td colSpan={2} className="py-2">Total</td>
                            <td className="py-2 text-right">
                              ₹{data.b2c_small.reduce((s, i) => s + i.taxable_value, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 text-right">
                              ₹{data.b2c_small.reduce((s, i) => s + i.cgst, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 text-right">
                              ₹{data.b2c_small.reduce((s, i) => s + i.sgst, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 text-right">
                              ₹{data.b2c_small.reduce((s, i) => s + i.taxable_value + i.cgst + i.sgst, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="hsn" className="space-y-3 mt-4">
              {data.hsn_summary.length === 0 ? (
                <div className="rounded-xl border bg-card p-6 text-center">
                  <p className="text-muted-foreground">No HSN data for this period</p>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">HSN-wise Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-semibold">HSN</th>
                            <th className="text-left py-2 font-semibold">Description</th>
                            <th className="text-right py-2 font-semibold">Qty</th>
                            <th className="text-right py-2 font-semibold">Value</th>
                            <th className="text-right py-2 font-semibold">Taxable</th>
                            <th className="text-right py-2 font-semibold">CGST</th>
                            <th className="text-right py-2 font-semibold">SGST</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.hsn_summary.map((item) => (
                            <tr key={item.hsn_code} className="border-b">
                              <td className="py-2 font-mono">{item.hsn_code}</td>
                              <td className="py-2">{item.description}</td>
                              <td className="py-2 text-right">{item.total_quantity}</td>
                              <td className="py-2 text-right">₹{item.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="py-2 text-right">₹{item.taxable_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="py-2 text-right">₹{item.cgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="py-2 text-right">₹{item.sgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="summary" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Document Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Period</span>
                      <span className="font-medium">{data.period}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total Invoices</span>
                      <span className="font-medium">{data.document_summary.total_invoices}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total Taxable Value</span>
                      <span className="font-medium">₹{data.document_summary.total_taxable_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total CGST</span>
                      <span className="font-medium text-green-600">₹{data.document_summary.total_cgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total SGST</span>
                      <span className="font-medium text-green-600">₹{data.document_summary.total_sgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total IGST</span>
                      <span className="font-medium">₹{data.document_summary.total_igst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total Invoice Value</span>
                      <span className="font-bold text-lg">₹{data.document_summary.total_invoice_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Generated At</span>
                      <span className="text-xs text-muted-foreground">{new Date(data.generated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
