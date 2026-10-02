import { Suspense } from "react";
import EditProgramForm from "@/components/EditProgramForm";

export const dynamic = "force-dynamic";

export default function EditOwnerProgramPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<p className="text-sm text-slate-600">Loading program...</p>}>
      <EditProgramForm programId={params.id} />
    </Suspense>
  );
}
