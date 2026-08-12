"use client";

import { Loader2 } from "lucide-react";

export function FullLoader({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted">
      <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}
