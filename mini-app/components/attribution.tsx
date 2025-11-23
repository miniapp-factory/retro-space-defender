"use client";

import { parseERC8021Suffix } from "@/lib/erc8021";
import { useEffect, useState } from "react";

export function AttributionViewer({ calldata }: { calldata: string }) {
  const [info, setInfo] = useState<ReturnType<typeof parseERC8021Suffix>>(null);

  useEffect(() => {
    const hex = calldata.replace(/^0x/, "");
    const bytes = Uint8Array.from(Buffer.from(hex, "hex"));
    setInfo(parseERC8021Suffix(bytes));
  }, [calldata]);

  if (!info) return <div>No attribution data found.</div>;

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Attribution Info</h3>
      <pre className="bg-muted p-2 rounded text-sm overflow-auto">
        {JSON.stringify(info, null, 2)}
      </pre>
    </div>
  );
}
