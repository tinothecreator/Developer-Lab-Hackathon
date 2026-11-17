"use client";

import Link from "next/link";
import { getBasketForNgo } from "@/lib/services";
import { SHOWCASE_NGO_ID } from "@/lib/constants";
import { useService } from "@/components/ui/useService";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FundingSummary } from "./FundingSummary";

const load = () => getBasketForNgo(SHOWCASE_NGO_ID);
export function DonorHome() {
  const { result, retry } = useService(load);
  return <div className="space-y-12">
    <section className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
      <div><p className="eyebrow">Good food. A little closer.</p><h1 className="mt-4 text-[clamp(2.8rem,7vw,4.6rem)] leading-[1.02] font-extrabold tracking-[-.055em]">Small gifts.<br /><span className="text-[var(--green)]">Fuller tables.</span></h1><p className="mt-6 max-w-md text-base leading-7 text-[var(--muted)]">Join a shared grocery basket. Give what you can, help a community kitchen stock up, and see the receipt when it arrives.</p><div className="mt-6 flex flex-wrap gap-2"><Badge>Fictional NGO demo</Badge><Badge>No payment details needed</Badge></div></div>
      <div className="relative overflow-hidden rounded-3xl bg-[#e8eddd] p-7 sm:p-10">
        <svg viewBox="0 0 320 170" className="mx-auto mb-5 h-36 w-full" aria-hidden="true" fill="none"><circle cx="160" cy="85" r="77" fill="#d8e2c8" /><path d="M86 67h148l-15 89H102L86 67Z" fill="#b66b43" /><path d="M117 68c0-58 88-58 88 0" stroke="#714731" strokeWidth="9" /><path d="M108 83h105M111 105h98M114 127h91" stroke="#dcaa7e" strokeWidth="7" /><path d="M127 59v-34h38v34" fill="#f8f4e7" /><path d="M133 39h26M133 46h26" stroke="#8e9d6c" strokeWidth="3" /><path d="M174 59V31h20v28" fill="#e5b44e" /><path d="M177 25h14v8h-14z" fill="#456740" /><path d="M211 65c-22-24-13-41-13-41 25 8 28 28 13 41Z" fill="#527542" /><path d="M211 65c6-39 28-40 28-40 2 26-13 40-28 40Z" fill="#72945d" /></svg>
        <p className="text-center text-sm font-bold text-[var(--green)]">A basket filled by all of us.</p><p className="mt-2 text-center text-xs text-[var(--muted)]">Groceries and supplier fulfilment simulated (demo)</p>
      </div>
    </section>
    <section><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">The community basket</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">A small contribution goes a long way.</h2></div><span className="text-xs text-[var(--muted)]">01 / Our showcase kitchen</span></div>
      <Card className="grid gap-7 sm:grid-cols-2"><div><Badge tone="success">Verification mocked (demo)</Badge><h3 className="mt-4 text-2xl font-bold">Ubuntu Table</h3><p className="mt-1 text-sm text-[var(--muted)]">Soweto, Gauteng</p><p className="mt-4 text-sm leading-6">Community meals for local households. This week’s fixed basket brings together maize meal and cooking oil.</p><Link className="text-link mt-3" href={`/ngos/${SHOWCASE_NGO_ID}`}>Meet Ubuntu Table <span aria-hidden="true" className="ml-2">→</span></Link></div>
        <div className="space-y-5 sm:border-l sm:border-[var(--border)] sm:pl-7">{!result ? <LoadingState /> : !result.ok ? <ErrorState message={result.error.message} onRetry={retry} /> : <><FundingSummary view={result.data} /><Link className={`${buttonClassName} w-full`} href={`/ngos/${SHOWCASE_NGO_ID}`}>Explore this basket <span aria-hidden="true">→</span></Link></>}</div>
      </Card>
    </section>
    <section className="grid gap-5 sm:grid-cols-3" aria-label="How the demo works">{[["01", "Choose a basket", "Groceries are based on a fictional kitchen’s seeded needs."], ["02", "Give a little", "A simulated contribution joins others to fund the whole basket."], ["03", "See the receipt", "The NGO adds a photo and note after simulated delivery."]].map(([step, title, text]) => <div key={step} className="border-t border-[var(--border)] pt-5"><p className="eyebrow">{step}</p><h3 className="mt-2 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p></div>)}</section>
  </div>;
}
