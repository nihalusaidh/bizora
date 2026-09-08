"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/lib/store";
import { ScanBarcode, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BarcodeScannerProps {
  onProductFound: (product: any) => void;
  onBarcodeNotFound?: (barcode: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function BarcodeScanner({
  onProductFound,
  onBarcodeNotFound,
  placeholder = "Scan or type barcode...",
  disabled = false,
}: BarcodeScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [lastBarcode, setLastBarcode] = useState("");
  const { businessId } = useBusiness();

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if (
        !disabled &&
        document.activeElement !== inputRef.current &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.key.length === 1
      ) {
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keypress", handleGlobalKey);
    return () => document.removeEventListener("keypress", handleGlobalKey);
  }, [disabled]);

  const lookupBarcode = useCallback(
    async (barcode: string) => {
      if (!barcode.trim() || !businessId) return;

      setLoading(true);
      setLastBarcode(barcode.trim());

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select("*, category:categories(id, name)")
          .eq("business_id", businessId)
          .eq("barcode", barcode.trim())
          .eq("is_active", true)
          .single();

        if (error || !data) {
          onBarcodeNotFound?.(barcode.trim());
        } else {
          onProductFound(data);
        }
      } catch {
        onBarcodeNotFound?.(barcode.trim());
      } finally {
        setLoading(false);
        if (inputRef.current) {
          inputRef.current.value = "";
          inputRef.current.focus();
        }
      }
    },
    [businessId, onProductFound, onBarcodeNotFound]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      lookupBarcode(e.currentTarget.value);
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <ScanBarcode className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        disabled={disabled || loading}
        onKeyDown={handleKeyDown}
        className="h-10 pl-9 pr-3 text-base font-mono tracking-wider"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      {lastBarcode && !loading && (
        <div className="mt-1 text-xs text-muted-foreground">
          Last: {lastBarcode}
        </div>
      )}
    </div>
  );
}
