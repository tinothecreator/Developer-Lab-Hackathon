"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Order } from "@/lib/types";
import { uploadProof, confirmDelivery } from "@/lib/services";
import { validateProof, receiptNoteSchema } from "@/lib/validation";
import { RECEIPT_NOTE_MAX } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function ReceiptForm({ order, onDelivered }: { order: Order; onDelivered: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving">("idle");
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const submitting = useRef(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function chooseFile(next: File | null) {
    setUploadedPath(null);
    setFile(next);
    setError(null);
    if (!next) { setPreview(null); return; }
    const valid = validateProof(next);
    if (!valid.ok) { setPreview(null); setError(valid.error.message); return; }
    setPreview(URL.createObjectURL(next));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || order.status !== "awaiting_delivery") return;
    if (!file) { setError("Choose a non-sensitive demo receipt photo."); return; }
    const validFile = validateProof(file);
    const validNote = receiptNoteSchema.safeParse(note);
    if (!validFile.ok) { setError(validFile.error.message); return; }
    if (!validNote.success) { setError("Write a receipt note of 1–280 characters after trimming spaces."); return; }
    submitting.current = true;
    setError(null);
    try {
      let path = uploadedPath;
      if (!path) {
        setPhase("uploading");
        const upload = await uploadProof(order.id, file);
        if (!upload.ok) { setError(`${upload.error.message} Your form is kept for retry.`); return; }
        path = upload.data.path;
        setUploadedPath(path);
      }
      setPhase("saving");
      const receipt = await confirmDelivery({ orderId: order.id, proofPath: path, note: validNote.data });
      if (!receipt.ok) { setError(`${receipt.error.message} Your uploaded photo and note are kept. Retry confirmation.`); return; }
      onDelivered();
    } finally { submitting.current = false; setPhase("idle"); }
  }
  if (order.status !== "awaiting_delivery") return <p role="status">This receipt has already been confirmed.</p>;
  const pending = phase !== "idle";
  return <form className="space-y-5" onSubmit={submit} noValidate><div><h2 className="text-xl font-bold">Confirm simulated receipt</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use a non-sensitive grocery photo. No personal documents, faces or identifying details.</p></div>
    <div><label htmlFor="receipt-photo" className="mb-2 block text-sm font-bold">Receipt photo</label><input id="receipt-photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={(e) => chooseFile(e.target.files?.[0] ?? null)} aria-describedby="photo-help" /><p id="photo-help" className="mt-2 text-xs text-[var(--muted)]">JPEG, PNG or WebP · Up to 5 MB</p></div>
    {preview && <Image unoptimized src={preview} width={640} height={420} alt="Preview of your selected non-sensitive grocery receipt photo" className="max-h-64 w-full rounded-xl bg-stone-100 object-contain" />}
    <div><label htmlFor="receipt-note" className="mb-2 block text-sm font-bold">Receipt note</label><textarea id="receipt-note" rows={4} maxLength={RECEIPT_NOTE_MAX} value={note} disabled={pending} onChange={(e) => setNote(e.target.value)} aria-describedby="note-count" placeholder="What arrived, and a short message for the donors." /><p id="note-count" className="mt-2 text-xs text-[var(--muted)]" aria-live="polite">{note.trim().length} / {RECEIPT_NOTE_MAX} characters after trimming</p></div>
    {error && <ErrorMessage message={error} />}
    {uploadedPath && <p className="text-xs text-[var(--green)]">Photo uploaded. Retrying will reuse it.</p>}
    <p role="status" className="text-sm text-[var(--muted)]">{phase === "uploading" ? "Uploading your photo…" : phase === "saving" ? "Saving the receipt…" : "Photo upload completes before delivery status is saved."}</p>
    <Button type="submit" className="w-full" disabled={pending}>{pending ? "Please wait…" : uploadedPath ? "Retry receipt confirmation (demo)" : "Confirm receipt (demo)"}</Button><p className="text-xs text-[var(--muted)]">Delivery simulated (demo)</p>
  </form>;
}
