import { DOMParser, HTMLDocument } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

interface TideData {
  Date: Date,
  BasicTideData: Record<string, string>[] | null;
  PreciseTideData: Record<string, string>[] | null
}

async function getWebContent(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error")
  }

  return response.text();
}

function parseHtml(html: string): HTMLDocument {
  const document = new DOMParser().parseFromString(html, 'text/html');

  return document;
}

function getBasicTidesTable(html: HTMLDocument): Record<string, string>[] | null {
  if (html) {
    const tidesTable: Record<string, string>[] = [...html.querySelectorAll('div.float-left:nth-child(3) > table tr')].slice(1).map(tr => {
      const [name, time, height] = [...tr.querySelectorAll('td')];

      return {
        key: name?.textContent?.trim() || '',
        value: `Time: ${time?.textContent?.trim() || ''}, Height: ${height?.textContent?.trim() || ''}`
      };
    })

    return tidesTable;
  }

  return null;
}

function getExtendedTideTimes(html: HTMLDocument): Record<string, string>[] | null {
  if (html) {
    const container = [...html.querySelectorAll('div.parent:nth-child(7) > div > table')];

    const tables: Record<string, string>[] = [];

    container.forEach(tr => {
      const rows = [...tr.querySelectorAll('tbody tr')].splice(1);
      rows.forEach(tr => {
        const [timeCell, heightCell] = [...tr.querySelectorAll('td')];

        tables.push({
          time: timeCell?.textContent?.trim() || '',
          height: heightCell?.querySelector('div')?.textContent?.trim() || ''
        })
      })
    })

    return tables;
  }

  return null
}

function getDateFromYearDay(year: number, dayOfYear: number) {
  const date = new Date(year, 0); // Initialize to January 1st of the given year
  date.setDate(dayOfYear); // Set the day of the year
  return date;
}

const year: number = 2024;
const yearDay: number = 296;

const webpage = await getWebContent(`https://tides.digimap.gg/?year=${year}}&yearDay=${yearDay}`);
const parsedDocument = parseHtml(webpage);
const basicTideData = getBasicTidesTable(parsedDocument);
const precisionTideData = getExtendedTideTimes(parsedDocument);

const model: TideData = {
  Date: getDateFromYearDay(year, yearDay),
  BasicTideData: basicTideData,
  PreciseTideData: precisionTideData
}

console.log(model);




