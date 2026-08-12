"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setEmail("");
        toast.success("Berhasil berlangganan newsletter TIXCONCERT!");
      }}
      className="flex flex-col gap-2"
    >
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
      />
      <Button type="submit" size="sm" className="w-full">
        <Send className="h-4 w-4" /> Subscribe
      </Button>
      <p className="flex items-center justify-center gap-1 text-[11px] text-muted">
        <Check className="h-3 w-3 text-emerald-400" />
        No spam, unsubscribe anytime.
      </p>
    </form>
  );
}
