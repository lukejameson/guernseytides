import {
  DOMParser,
  HTMLDocument,
} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import type { TideData } from '../common/models/tide-data.ts';
import { closeDB, insertTideData, readTideData } from '../common/database-worker.ts';
import { formatDateToString } from '../common/common-functions.ts';

async function getWebContent(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Error');
  }

  return response.text();
}

function parseHtml(html: string): HTMLDocument {
  const document = new DOMParser().parseFromString(html, 'text/html');

  return document;
}

function getBasicTidesTable(
  html: HTMLDocument,
): Record<string, string>[] | null {
  if (html) {
    const tidesTable: Record<string, string>[] = [
      ...html.querySelectorAll('div.float-left:nth-child(3) > table tr'),
    ].slice(1).map((tr) => {
      const [name, time, height] = [...tr.querySelectorAll('td')];

      return {
        key: name?.textContent?.trim() || '',
        value: `Time: ${time?.textContent?.trim() || ''}, Height: ${
          height?.textContent?.trim() || ''
        }`,
      };
    });

    return tidesTable;
  }

  return null;
}

function getExtendedTideTimes(
  html: HTMLDocument,
): Record<string, string>[] | null {
  if (html) {
    const container = [
      ...html.querySelectorAll('div.parent:nth-child(7) > div > table'),
    ];

    const tables: Record<string, string>[] = [];

    container.forEach((tr) => {
      const rows = [...tr.querySelectorAll('tbody tr')].splice(1);
      rows.forEach((tr) => {
        const [timeCell, heightCell] = [...tr.querySelectorAll('td')];

        tables.push({
          time: timeCell?.textContent?.trim() || '',
          height: heightCell?.querySelector('div')?.textContent?.trim() || '',
        });
      });
    });

    return tables;
  }

  return null;
}

function getDateFromYearDay(year: number, dayOfYear: number) {
  const date = new Date(year, 0);
  date.setDate(dayOfYear);
  return date;
}

try {
  const year: number = 2024;
  const yearDay: number = 293;

  const existingRecordForDate = await readTideData(
    formatDateToString(getDateFromYearDay(year, yearDay)),
  );

  if (Object.keys(existingRecordForDate).length == 0) {
    const webpage = await getWebContent(
      `https://tides.digimap.gg/?year=${year}}&yearDay=${yearDay}`,
    );
    const parsedDocument = parseHtml(webpage);
    const basicTideData = getBasicTidesTable(parsedDocument);
    const precisionTideData = getExtendedTideTimes(parsedDocument);

    const tideData: TideData = {
      Date: getDateFromYearDay(year, yearDay),
      BasicTide: basicTideData,
      PreciseTide: precisionTideData,
    };

    await insertTideData(tideData).finally(() => {
      console.log(
        `Data inserted for ${
          formatDateToString(getDateFromYearDay(year, yearDay))
        }`,
      );
    });
  } else {
    console.log(
      `Record already exists for ${
        formatDateToString(getDateFromYearDay(year, yearDay))
      }`,
    );
  }
} catch (error) {
  console.error(error);
} finally {
  await closeDB();
}
