import { Badge } from "@/components/ui/Badge";
import { NgoOrders } from "@/app/ngo/NgoOrders";

export default function NgoWorkspacePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Badge>NGO view · demo</Badge>
        <h1 className="mt-3 text-3xl font-bold">Funded grocery orders</h1>
        <p className="mt-2 text-stone-600">Choose a fictional NGO from the header selector to view its orders.</p>
        <p className="mt-2 text-sm text-stone-700">Verification mocked (demo)</p>
      </div>
      <NgoOrders />
    </div>
  );
}
