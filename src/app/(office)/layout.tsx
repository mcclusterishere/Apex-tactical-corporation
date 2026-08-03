import type { ReactNode } from "react";
import { getPrincipal } from "@/lib/auth";
import { Chrome } from "@/components/Chrome";

export default async function OfficeLayout({ children }: { children: ReactNode }) {
  const principal = await getPrincipal();
  return <Chrome principal={principal}>{children}</Chrome>;
}
