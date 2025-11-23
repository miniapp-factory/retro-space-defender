export interface Attribution {
  codes: string[];
  registry?: string;
  chainId?: number;
  address?: string;
}

export function parseERC8021Suffix(data: Uint8Array): Attribution | null {
  const suffix = new TextEncoder().encode("80218021802180218021802180218021");
  if (data.length < suffix.length + 1) return null;
  const suffixStart = data.length - suffix.length;
  const suffixBytes = data.slice(suffixStart);
  for (let i = 0; i < suffix.length; i++) {
    if (suffixBytes[i] !== suffix[i]) return null;
  }
  const schemaId = data[suffixStart - 1];
  const schemaData = data.slice(0, suffixStart - 1);

  // Schema ID 0: simple comma‑separated codes
  if (schemaId === 0) {
    if (schemaData.length < 1) return null;
    const codesLength = schemaData[0];
    const codesBytes = schemaData.slice(1, 1 + codesLength);
    const codesStr = new TextDecoder().decode(codesBytes);
    const codes = codesStr.split(",");
    return { codes };
  }

  // Other schema IDs are not implemented in this minimal example
  return null;
}
