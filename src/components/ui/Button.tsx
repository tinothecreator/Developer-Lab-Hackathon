"use client";

import type { ButtonHTMLAttributes } from "react";

export const buttonClassName = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--green)] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--green-dark)] disabled:cursor-not-allowed disabled:opacity-45";

export function Button({ className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`${buttonClassName} ${className}`} {...props} />;
}
