"use client";

import dynamic from "next/dynamic";

const CursorProvider = dynamic(() => import("../../components/CursorProvider"), { ssr: false });

export default function CursorProviderWrapper({ children }: { children: React.ReactNode }) {
  return <CursorProvider>{children}</CursorProvider>;
}