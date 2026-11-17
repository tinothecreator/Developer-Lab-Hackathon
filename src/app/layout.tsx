import type { Metadata } from "next";
import { AppHeader } from "@/components/shell/AppHeader";
import "./globals.css";
import { RoleProvider } from "@/components/shell/RoleProvider";
import { AppHeader } from "@/components/shell/AppHeader";

export const metadata: Metadata = {
  title: "Charity Eats | Shared groceries, shared good",
  description: "A fictional grocery funding demo. Payments and delivery are simulated.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA">
      <body>
        <AppHeader />
        <main className="mx-auto min-h-[calc(100vh-78px)] max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
