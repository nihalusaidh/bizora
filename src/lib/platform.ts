export function isCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).Capacitor;
}

export function isNativeApp(): boolean {
  return isCapacitor();
}
