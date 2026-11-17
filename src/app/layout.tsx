import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Charity Eats | Shared groceries, shared good",
  description: "A fictional grocery funding demo. Payments and delivery are simulated.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-ZA"><body><main>{children}</main></body></html>;
}
