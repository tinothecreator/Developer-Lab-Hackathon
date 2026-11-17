"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { RECEIPT_NOTE_MAX } from "@/lib/constants";
import { validateProofFile } from "@/lib/validation";
import { uploadProof } from "@/lib/services/storage";
import { confirmDelivery } from "@/lib/services/orders";

export function ReceiptForm({ orderId }: { orderId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  const inFlight = useRef(false);
  const router = useRouter();

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function chooseFile(nextFile: File | null) {
    setError("");
    setUploadedPath(null);
    if (nextFile) {
      const validationError = validateProofFile(nextFile);
      if (validationError) setError(validationError);
    }
    setFile(nextFile);
  }

  async function submit() {
    if (inFlight.current) return;
    setError("");
    const trimmedNote = note.trim();
    if (!file) {
      setError("Choose a receipt photo before confirming delivery.");
      return;
    }
    const fileError = validateProofFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }
    if (trimmedNote.length < 1 || trimmedNote.length > RECEIPT_NOTE_MAX) {
      setError("Enter a trimmed receipt note between 1 and 280 characters.");
      return;
    }

    inFlight.current = true;
    setIsSubmitting(true);
    let proofPath = uploadedPath;
    if (!proofPath) {
      const uploadResult = await uploadProof(orderId, file);
      if (!uploadResult.ok) {
        setError(uploadResult.error.message);
        inFlight.current = false;
        setIsSubmitting(false);
        return;
      }
      proofPath = uploadResult.data.path;
      setUploadedPath(proofPath);
    }

    const result = await confirmDelivery({ orderId, proofPath, note: trimmedNote });
    if (!result.ok) {
      setError(result.error.message);
      inFlight.current = false;
      setIsSubmitting(false);
      return;
    }
    setIsComplete(true);
    setIsSubmitting(false);
    inFlight.current = false;
    router.refresh();
  }

  return (
    <section className="space-y-4">
      <div>
        <label htmlFor="proof-photo" className="font-semibold">Receipt photo (JPEG, PNG or WebP, max 5 MB)</label>
        <input
          id="proof-photo"
          className="mt-2 block min-h-11 w-full rounded-xl border border-stone-300 p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-800"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          disabled={isSubmitting || isComplete}
        />
      </div>
      {previewUrl && file && !validateProofFile(file) && (
        <Image src={previewUrl} alt="Preview of the selected grocery delivery receipt photo" width={1000} height={750} unoptimized className="max-h-72 w-full rounded-xl object-contain" />
      )}
      <div>
        <label htmlFor="receipt-note" className="font-semibold">Receipt note</label>
        <textarea
          id="receipt-note"
          className="mt-2 min-h-28 w-full rounded-xl border border-stone-300 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-800"
          value={note}
          maxLength={RECEIPT_NOTE_MAX}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Describe the simulated receipt"
          disabled={isSubmitting || isComplete}
        />
        <p className="mt-1 text-right text-sm text-stone-600">{note.trim().length} / {RECEIPT_NOTE_MAX} characters</p>
      </div>
      {uploadedPath && <p className="text-sm text-emerald-900">Photo uploaded; it will be reused if confirmation needs a retry.</p>}
      {error && <p className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-950" role="alert">{error}</p>}
      {isSubmitting && <Spinner label={uploadedPath ? "Saving receipt…" : "Uploading receipt photo…"} />}
      {isComplete && <Toast>Delivery confirmation saved (demo).</Toast>}
      <Button type="button" className="w-full sm:w-auto" disabled={isSubmitting || isComplete} onClick={submit}>
        Delivery simulated (demo) · confirm receipt
      </Button>
    </section>
  );
}
