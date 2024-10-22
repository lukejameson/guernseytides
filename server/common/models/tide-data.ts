import type { HourlyWeather } from '@server/common/models/weather.model.ts';

export interface TideData {
  Date: Date;
  Weather: HourlyWeather[];
  BasicTide: Record<string, string>[] | null;
  PreciseTide: Record<string, string>[] | null;
}
