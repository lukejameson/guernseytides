export interface TideData {
  Date: Date;
  BasicTide: Record<string, string>[] | null;
  PreciseTide: Record<string, string>[] | null;
}
