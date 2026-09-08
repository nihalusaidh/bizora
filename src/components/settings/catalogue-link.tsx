"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusiness } from "@/lib/store";
import { Globe, Copy, ExternalLink, Check } from "lucide-react";

export function CatalogueLink() {
  const { business } = useBusiness();
  const [copied, setCopied] = useState(false);

  if (!business) return null;

  const slug = business.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const catalogueUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/shop/${slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(catalogueUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Online Catalogue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Share your product catalogue with customers via a public link.
        </p>
        <div className="flex gap-2">
          <Input
            value={catalogueUrl}
            readOnly
            className="font-mono text-sm"
          />
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-foreground" /> : <Copy className="h-4 w-4" />}
          </Button>
          <a href={`/shop/${slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          URL slug: <span className="font-mono">/shop/{slug}</span>
        </p>
      </CardContent>
    </Card>
  );
}
