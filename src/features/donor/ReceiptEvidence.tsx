"use client";

import Image from "next/image";
import { useState } from "react";
import type { Order } from "@/lib/types";
import { getProofUrl } from "@/lib/services";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function ReceiptEvidence({ order, ngoName }: { order: Order; ngoName: string }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  if (order.status !== "delivered") return null;
  const url = order.proof_photo_path ? getProofUrl(order.proof_photo_path) : "";
  return <section className="space-y-4"><h2 className="text-xl font-bold">A receipt from {ngoName}</h2><p className="text-xs text-[var(--muted)]">Delivery simulated (demo) · Non-sensitive proof photo</p>
    {url && !photoFailed ? <Image unoptimized src={url} width={960} height={640} alt={`Non-sensitive grocery receipt photo uploaded by ${ngoName} for this simulated delivery`} className="max-h-96 w-full rounded-xl object-contain bg-stone-100" onError={() => setPhotoFailed(true)} /> : <ErrorMessage message="The receipt photo could not be loaded." onRetry={() => { setPhotoFailed(false); window.dispatchEvent(new Event("charity-eats:refresh")); }} />}
    <blockquote className="border-l-4 border-[var(--green)] pl-4 text-base leading-7 whitespace-pre-wrap">{order.receipt_note}</blockquote>{order.delivered_at && <p className="text-xs text-[var(--muted)]">Confirmed <time dateTime={order.delivered_at}>{new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Johannesburg" }).format(new Date(order.delivered_at))} SAST</time></p>}
  </section>;
}
