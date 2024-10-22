import {
  DOMParser,
  type HTMLDocument,
} from 'https://deno.land/x/deno_dom@v0.1.48/deno-dom-wasm.ts';

export function parseHtml(html: string): HTMLDocument {
  const document = new DOMParser().parseFromString(html, 'text/html');

  return document;
}

export function getBasicTidesTable(html: HTMLDocument): Record<string, string>[] | null {
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

export function getExtendedTideTimes(html: HTMLDocument): Record<string, string>[] | null {
  if (html) {
    const container = [...html.querySelectorAll('div.parent:nth-child(7) > div > table')];

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
