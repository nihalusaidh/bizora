"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/lib/store";
import { ScanBarcode, Loader2, Camera, X, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const { businessId } = useBusiness();

  useEffect(() => {
    if (!disabled && !cameraMode) {
      inputRef.current?.focus();
    }
  }, [disabled, cameraMode]);

  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if (
        !disabled &&
        !cameraMode &&
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
  }, [disabled, cameraMode]);

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

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      stream.getTracks().forEach((t) => t.stop());
      setCameraMode(true);
    } catch {
      setCameraError("Camera access denied. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    setCameraMode(false);
  };

  useEffect(() => {
    if (!cameraMode) return;

    let html5QrCode: any = null;
    let scanning = false;

    const startScanning = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        html5QrCode = new Html5Qrcode("barcode-reader");
        scanning = true;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 120 },
            aspectRatio: 1.5,
          },
          (decodedText: string) => {
            if (scanning) {
              lookupBarcode(decodedText);
              stopCamera();
            }
          },
          () => {}
        );
      } catch {
        setCameraError("Could not start camera scanner.");
        setCameraMode(false);
      }
    };

    startScanning();

    return () => {
      scanning = false;
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
        html5QrCode.clear().catch(() => {});
      }
    };
  }, [cameraMode, lookupBarcode]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      lookupBarcode(e.currentTarget.value);
    }
  }

  if (cameraMode) {
    return (
      <div className="relative rounded-lg overflow-hidden border-2 border-red-500/50 bg-black">
        <div id="barcode-reader" className="w-full" />

        {/* Red laser scanning line overlay */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Scanning frame border */}
            <div className="relative h-[120px] w-[280px]">
              {/* Corner brackets */}
              <div className="absolute -left-1 -top-1 h-5 w-5 border-l-2 border-t-2 border-red-500" />
              <div className="absolute -right-1 -top-1 h-5 w-5 border-r-2 border-t-2 border-red-500" />
              <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-2 border-l-2 border-red-500" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-2 border-r-2 border-red-500" />

              {/* Red laser line */}
              <div className="laser-line absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]" />
            </div>
          </div>

          {/* Status bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-red-500 animate-pulse" />
              <span className="text-white font-medium">Point camera at barcode</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <Button
          onClick={stopCamera}
          size="sm"
          variant="destructive"
          className="absolute top-2 right-2 z-20 gap-1"
        >
          <X className="h-3 w-3" />
          Close
        </Button>

        {/* CSS for laser animation */}
        <style jsx global>{`
          @keyframes laser-scan {
            0% { top: 0%; }
            50% { top: calc(100% - 2px); }
            100% { top: 0%; }
          }
          .laser-line {
            animation: laser-scan 2s ease-in-out infinite;
          }
          #barcode-reader video {
            border: none !important;
            border-radius: 0 !important;
          }
          #barcode-reader__scan_region {
            min-height: 200px;
          }
          #barcode-reader__dashboard {
            display: none !important;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-2">
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

      <Button
        onClick={startCamera}
        variant="outline"
        size="sm"
        className="w-full gap-2"
        disabled={disabled || loading}
      >
        <Camera className="h-4 w-4" />
        Scan with Camera
      </Button>

      {cameraError && (
        <p className="text-xs text-destructive">{cameraError}</p>
      )}
    </div>
  );
}
