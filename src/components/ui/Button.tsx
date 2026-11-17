import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
};

const variants = {
  primary: "bg-emerald-800 text-white hover:bg-emerald-900",
  secondary: "border border-emerald-800 text-emerald-900 hover:bg-emerald-50",
  quiet: "text-emerald-900 hover:bg-emerald-50",
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`min-h-11 rounded-xl px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
