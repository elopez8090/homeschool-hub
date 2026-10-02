import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token || "";
  if (!token) {
    redirect("/owner/login?error=missing_token");
  }

  redirect(`/api/auth/verify?token=${encodeURIComponent(token)}`);
}
