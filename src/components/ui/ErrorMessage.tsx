"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ErrorMessage({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-950" role="alert">
      <p>{message}</p>
      <Button className="mt-3" variant="secondary" onClick={() => router.refresh()}>Try again</Button>
    </div>
  );
}
