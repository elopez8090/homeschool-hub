import JsonLd from "@/components/JsonLd";
import StateDirectory from "@/components/StateDirectory";
import { countPrograms } from "@/lib/programs";
import { generateDirectoryCollectionSchema } from "@/lib/schema";
import { generateMetadata, pageMetadata } from "@/lib/seo";
import { getServerSupabase } from "@/lib/supabase-server";

export const metadata = generateMetadata(pageMetadata.home);

export const revalidate = 3600;

async function publishedProgramCount() {
  try {
    return await countPrograms(getServerSupabase());
  } catch {
    return undefined;
  }
}

export default async function HomePage() {
  const programCount = await publishedProgramCount();

  return (
    <div className="space-y-12">
      <JsonLd data={generateDirectoryCollectionSchema(programCount)} />
      <section className="rounded-2xl border border-navy/10 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-700">
          Multi-state directory
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-blue-900 sm:text-5xl">
          Christian Homeschools Hub
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-slate-600">
          Find Christ-centered homeschool programs, co-ops, and resources by
          state. Browse a state below to open that directory.
        </p>
      </section>

      <StateDirectory />
    </div>
  );
}
