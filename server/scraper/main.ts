import { closeDB, doesTideDataExist, insertTideData } from "../common/database-worker.ts";
import type { TideData } from "../common/models/tide-data.ts";
import { getBasicTidesTable, getExtendedTideTimes, parseHtml } from "./parser.ts";
import { getDayOfYear, getYear } from "date-fns";
import { getWebContent } from "./scraper.ts";

export async function scrapeDataForDate(date: string): Promise<void> {
  const year = getYear(date);
  const yearDay = getDayOfYear(date);

  const webpage = await getWebContent(`https://tides.digimap.gg/?year=${year}}&yearDay=${yearDay}`);
  const parsedDocument = parseHtml(webpage);
  const basicTideData = getBasicTidesTable(parsedDocument);
  const precisionTideData = getExtendedTideTimes(parsedDocument);

  const tideData: TideData = {
    Date: new Date(date),
    BasicTide: basicTideData,
    PreciseTide: precisionTideData,
  };

  await insertTideData(tideData).finally(() => {
    console.log(`Data inserted for ${date}`);
  });
}

async function main() {
  const date = "2024-10-18";

  const existingRecordForDate = await doesTideDataExist(date);

  if (!existingRecordForDate) {
    await scrapeDataForDate(date);

    return;
  }
  console.log(`Record already exists for ${date}`);
}

try {
  await main();
} catch (error) {
  console.error(error);
} finally {
  await closeDB();
}
