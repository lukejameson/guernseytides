import { differenceInDays } from 'date-fns';
import { readTideData } from './database-worker.ts';
import type { TideData } from './models/tide-data.ts';
import { getWeather } from '@server/scraper/weather.ts';
import { getDayOfYear, getYear } from 'date-fns';
import { insertTideData } from '../common/database-worker.ts';
import { getWebContent } from '@server/scraper/scraper.ts';
import { getBasicTidesTable, getExtendedTideTimes, parseHtml } from '@server/scraper/parser.ts';

export async function scrapeDataForDate(date: string): Promise<void> {
  const year = getYear(date);
  const yearDay = getDayOfYear(date);

  const tidesResponse = await getWebContent(`https://tides.digimap.gg/?year=${year}}&yearDay=${yearDay}`);
  const weatherResponse = await getWeather(date);
  const parsedDocument = parseHtml(tidesResponse);
  const basicTideData = getBasicTidesTable(parsedDocument);
  const precisionTideData = getExtendedTideTimes(parsedDocument);


  const tideData: TideData = {
    Date: new Date(date),
    Weather: weatherResponse,
    BasicTide: basicTideData,
    PreciseTide: precisionTideData,
  };

  await insertTideData(tideData).finally(() => {
    console.log(`Data inserted for ${date}`);
  });
}

export async function getTideForDate(date: string): Promise<TideData | null | string> {
  if (!isWithinFiveDays(date)) {
    return 'Date cannot be less then yesterday or more than tomorrow';
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
  return Math.abs(diffInDays) <= 1;
}
