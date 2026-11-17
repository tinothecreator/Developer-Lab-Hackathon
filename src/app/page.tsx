import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SHOWCASE_NGO_ID } from "@/lib/constants";
import { fixtureNgos } from "@/lib/fixtures";

export default function Home() {
  const ngo = fixtureNgos[0];
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-emerald-950 px-6 py-10 text-white sm:px-10 sm:py-14">
        <Badge className="bg-white/15 text-emerald-50">Charity Eats · demo</Badge>
        <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Shared groceries, shared good.</h1>
        <p className="mt-4 max-w-xl text-lg text-emerald-100">Join a fictional grocery basket and help a local community kitchen reach its goal.</p>
        <p className="mt-4 text-sm text-emerald-100">Verification mocked (demo)</p>
        <Link className="mt-7 inline-block" href={`/ngos/${SHOWCASE_NGO_ID}`}>
          <Button type="button" className="bg-amber-300 text-emerald-950 hover:bg-amber-200">Support Ubuntu Table</Button>
        </Link>
      </section>
      <Card className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Featured NGO · fictional</p>
          <h2 className="mt-2 text-2xl font-bold">{ngo.name}</h2>
          <p className="mt-1 text-stone-600">{ngo.city}, {ngo.province}</p>
          <p className="mt-3 text-stone-700">{ngo.mission}</p>
        </div>
        <Link href={`/ngos/${SHOWCASE_NGO_ID}`} className="font-semibold text-emerald-900 underline underline-offset-4">View grocery needs</Link>
      </Card>
    </div>
  );
}
