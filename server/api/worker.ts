import { differenceInDays } from "date-fns";
import { readTideData } from "../common/database-worker.ts";
import type { TideData } from "../common/models/tide-data.ts";
import { scrapeDataForDate } from "../scraper/main.ts";

export async function getTideForDate(date: string): Promise<TideData | null | string> {
  if (!isWithinFiveDays(date)) {
    return "Date is out of 5 day range";
  }

  try {
    let tideData = await readTideData(date);

    if (!tideData) {
      await scrapeDataForDate(date);

      tideData = await readTideData(date);
    }

    return tideData ? tideData : null;
  } catch (error) {
    console.error(`Error in getTideForDate for date ${date}:`, error);
    throw error;
  }
}

function isWithinFiveDays(dateToCheck: string, referenceDate = new Date()) {
  const diffInDays = differenceInDays(dateToCheck, referenceDate);
  return Math.abs(diffInDays) <= 5;
}
