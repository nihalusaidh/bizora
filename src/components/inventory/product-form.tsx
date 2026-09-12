"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { createProduct, updateProduct, createVariant, updateVariant, deleteVariant } from "@/server/actions/products";
import { Loader2, ArrowLeft, Plus, Trash2, Package } from "lucide-react";

interface ProductFormProps {
  businessId: string;
  categories: Array<{ id: string; name: string }>;
  suppliers: Array<{ id: string; name: string }>;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    category_id?: string | null;
    brand?: string | null;
    cost_price: number;
    selling_price: number;
    gst_rate?: number | null;
    hsn_sac?: string | null;
    min_stock?: number | null;
    supplier_id?: string | null;
    has_variants?: boolean;
    variants?: Array<{
      id: string;
      name: string;
      sku?: string | null;
      barcode?: string | null;
      cost_price?: number | null;
      selling_price?: number | null;
      attributes?: Record<string, string>;
      stock_quantity?: number;
    }>;
  };
  onCancel?: () => void;
}

export function ProductForm({
  businessId,
  categories,
  suppliers,
  product,
  onCancel,
}: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.name || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [barcode, setBarcode] = useState(product?.barcode || "");
  const [imageUrl, setImageUrl] = useState((product as any)?.image_url || "");
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [brand, setBrand] = useState(product?.brand || "");
  const [costPrice, setCostPrice] = useState(product?.cost_price?.toString() || "0");
  const [sellingPrice, setSellingPrice] = useState(product?.selling_price?.toString() || "0");
  const [gstRate, setGstRate] = useState(product?.gst_rate?.toString() || "0");
  const [hsnSac, setHsnSac] = useState(product?.hsn_sac || "");
  const [minStock, setMinStock] = useState(product?.min_stock?.toString() || "0");
  const [supplierId, setSupplierId] = useState(product?.supplier_id || "");
  const [hasVariants, setHasVariants] = useState(product?.has_variants || false);
  const [batchNumber, setBatchNumber] = useState((product as any)?.batch_number || "");
  const [expiryDate, setExpiryDate] = useState((product as any)?.expiry_date || "");
  const [manufacturingDate, setManufacturingDate] = useState((product as any)?.manufacturing_date || "");
  const [mrp, setMrp] = useState((product as any)?.mrp?.toString() || "");
  const [hsnCode, setHsnCode] = useState((product as any)?.hsn_code || "");
  const [variants, setVariants] = useState(product?.variants || []);
  const [newVariant, setNewVariant] = useState({ name: "", sku: "", cost_price: "", selling_price: "", stock_quantity: "0" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        name,
        sku: sku || null,
        barcode: barcode || null,
        image_url: imageUrl || null,
        category_id: categoryId || null,
        brand: brand || null,
        cost_price: parseFloat(costPrice) || 0,
        selling_price: parseFloat(sellingPrice) || 0,
        gst_rate: parseFloat(gstRate) || 0,
        hsn_sac: hsnSac || null,
        min_stock: parseInt(minStock) || 0,
        supplier_id: supplierId || null,
        has_variants: hasVariants,
        is_active: true,
        batch_number: batchNumber || null,
        expiry_date: expiryDate || null,
        manufacturing_date: manufacturingDate || null,
        mrp: mrp ? parseFloat(mrp) : null,
        hsn_code: hsnCode || null,
      };

      if (product) {
        await updateProduct(businessId, product.id, data);
      } else {
        await createProduct(businessId, data);
      }
      router.refresh();
      onCancel?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.name || !product) return;

    try {
      const variant = await createVariant(businessId, product.id, {
        name: newVariant.name,
        sku: newVariant.sku || null,
        cost_price: parseFloat(newVariant.cost_price) || null,
        selling_price: parseFloat(newVariant.selling_price) || null,
        stock_quantity: parseInt(newVariant.stock_quantity) || 0,
        attributes: {},
        is_active: true,
      });
      setVariants([...variants, variant]);
      setNewVariant({ name: "", sku: "", cost_price: "", selling_price: "", stock_quantity: "0" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add variant");
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteVariant(businessId, variantId);
      setVariants(variants.filter((v) => v.id !== variantId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete variant");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Blue Shirt, iPhone 15"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="e.g. BS-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                placeholder="e.g. 8901234567890"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Image</Label>
            <ImageUpload
              bucket="product-images"
              path={`products/${businessId}`}
              value={imageUrl}
              onUpload={setImageUrl}
              onRemove={() => setImageUrl("")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="e.g. Nike, Samsung"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing & Tax</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price (₹) *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gstRate">GST Rate (%)</Label>
              <Input
                id="gstRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hsnSac">HSN/SAC Code</Label>
              <Input
                id="hsnSac"
                placeholder="e.g. 6109"
                value={hsnSac}
                onChange={(e) => setHsnSac(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Min Stock</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
              />
            </div>
          </div>

          {costPrice && sellingPrice && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <span className="text-muted-foreground">Margin: </span>
              <span className="font-medium">
                {((parseFloat(sellingPrice) - parseFloat(costPrice)) / parseFloat(costPrice) * 100).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-2">
                (₹{(parseFloat(sellingPrice) - parseFloat(costPrice)).toFixed(2)} per unit)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select value={supplierId} onValueChange={(v) => setSupplierId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((sup) => (
                  <SelectItem key={sup.id} value={sup.id}>
                    {sup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Batch & Expiry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Batch & Expiry Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                placeholder="e.g. BT-2026-001"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrp">MRP (₹)</Label>
              <Input
                id="mrp"
                type="number"
                step="0.01"
                min="0"
                placeholder="Maximum Retail Price"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturingDate">Manufacturing Date</Label>
              <Input
                id="manufacturingDate"
                type="date"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              {expiryDate && (
                <p className={`text-xs ${new Date(expiryDate) < new Date(Date.now() + 30 * 86400000) ? "text-[#DC2626]" : "text-muted-foreground"}`}>
                  {new Date(expiryDate) < new Date() ? "⚠️ Expired" :
                   new Date(expiryDate) < new Date(Date.now() + 30 * 86400000) ? "⚠️ Expiring within 30 days" :
                   `Valid for ${Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)} days`}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hsnCodeBatch">HSN Code (for e-invoice)</Label>
            <Input
              id="hsnCodeBatch"
              placeholder="e.g. 6109"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Variants</CardTitle>
          <Label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Has variants</span>
          </Label>
        </CardHeader>
        {hasVariants && (
          <CardContent className="space-y-4">
            {variants.length > 0 && (
              <div className="space-y-2">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">{variant.name}</span>
                      {variant.sku && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          SKU: {variant.sku}
                        </span>
                      )}
                    </div>
                    {variant.selling_price != null && (
                      <span className="text-sm font-medium">
                        ₹{variant.selling_price}
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteVariant(variant.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border border-dashed p-3 space-y-3">
              <p className="text-sm font-medium">Add Variant</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Variant name (e.g. Size M, Blue)"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                />
                <Input
                  placeholder="SKU (optional)"
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Cost price"
                  value={newVariant.cost_price}
                  onChange={(e) => setNewVariant({ ...newVariant, cost_price: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Selling price"
                  value={newVariant.selling_price}
                  onChange={(e) => setNewVariant({ ...newVariant, selling_price: e.target.value })}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariant}
                disabled={!newVariant.name}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : product ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
}
