import type { Metadata } from "next";
import { TechnicalEvidence, type EvidenceView } from "@/features/evidence/components/technical-evidence";

export const metadata: Metadata = { title: "Technical Evidence" };

export default async function TechnicalEvidencePage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const activeView: EvidenceView = view === "architecture" ? "architecture" : "evaluations";
  return <TechnicalEvidence activeView={activeView}/>;
}
