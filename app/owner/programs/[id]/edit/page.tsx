"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import EditProgramForm from "@/components/EditProgramForm";

export default function EditOwnerProgramPage() {
  const params = useParams<{ id: string }>();
  const programId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <Suspense fallback={<p className="text-sm text-slate-600">Loading program...</p>}>
      <EditProgramForm programId={programId || ""} />
    </Suspense>
  );
}
