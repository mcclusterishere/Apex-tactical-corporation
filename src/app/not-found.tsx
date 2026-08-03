import Link from "next/link";
import { Seal } from "@/components/Seal";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12 text-center">
      <div className="flex justify-center">
        <Seal size={72} />
      </div>
      <h1 className="display mt-4 text-xl">Nothing on file</h1>
      <p className="muted mt-2 text-sm">
        The register holds no such page or record. If you followed a record number from a certified
        copy, check the number and verify it directly — a record above your clearance is not
        distinguished from one that was never issued.
      </p>
      <p className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/" className="underline underline-offset-2">
          The Registrar&rsquo;s desk
        </Link>
        <Link href="/verify" className="underline underline-offset-2">
          Verify a certified copy
        </Link>
      </p>
    </main>
  );
}
