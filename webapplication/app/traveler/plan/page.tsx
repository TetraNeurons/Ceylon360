// app/(traveler)/plan-maker/page.tsx
"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the entire component to avoid SSR issues with Leaflet
const PlanMakerContent = dynamic(() => import("@/components/traveler/PlanMakerContent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  ),
});

export default function PlanMakerPage() {
  return <PlanMakerContent />;
}
