import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/components/shell/RoleProvider";
import { AppHeader } from "@/components/shell/AppHeader";

export const metadata: Metadata = {
  title: "Charity Eats | Shared groceries, shared good",
  description: "A fictional grocery funding demo. Payments and delivery are simulated.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-ZA"><body><RoleProvider>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <AppHeader />
    <main id="main-content" tabIndex={-1} className="mx-auto min-h-[65vh] w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">{children}</main>
    <footer className="mx-auto max-w-5xl border-t border-[var(--border)] px-5 py-7 text-xs leading-6 text-[var(--muted)] sm:px-8">
      <p className="font-bold text-[var(--ink)]">Small gifts. Shared tables.</p>
      <p>Fictional organisations · Payments and delivery are simulated (demo).</p>
      <p>The role toggle changes the view only. No sign-in or authorisation.</p>
    </footer>
  </RoleProvider></body></html>;
}
