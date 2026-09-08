"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeDisplayProps {
  value: string;
  width?: number;
  height?: number;
  format?: string;
  className?: string;
}

export function BarcodeDisplay({
  value,
  width = 2,
  height = 40,
  format = "CODE128",
  className,
}: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue: true,
          fontSize: 12,
          margin: 4,
        });
      } catch {
        // Invalid barcode value
      }
    }
  }, [value, width, height, format]);

  if (!value) return null;

  return <svg ref={svgRef} className={className} />;
}
