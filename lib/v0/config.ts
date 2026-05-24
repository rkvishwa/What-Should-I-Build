export function getV0ApiKey(): string | null {
  const key = process.env.V0_API_KEY?.trim();
  return key || null;
}

export function assertV0ApiKey(): string {
  const key = getV0ApiKey();
  if (!key) {
    throw new Error(
      "V0 is not configured. Set V0_API_KEY in your environment.",
    );
  }
  return key;
}

export function isV0Configured(): boolean {
  return getV0ApiKey() !== null;
}
