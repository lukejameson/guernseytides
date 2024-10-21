import { Client } from 'https://deno.land/x/mysql/mod.ts';
import type { TideData } from '../common/models/tide-data.ts';
import { formatDateToString } from './common-functions.ts';

const client = await new Client().connect({
  hostname: '127.0.0.1',
  username: 'admin',
  password: 'Pass.Word!',
  db: 'tides',
});

export async function closeDB() {
  await client.close();
}

export async function insertTideData(tideData: TideData) {
  try {
    const formattedDate = formatDateToString(tideData.Date);
    await client.execute(
      `
            INSERT INTO
                tide_log
                    (
                        date,
                        basicTide,
                        preciseTide
                    )
                VALUES
                    (
                        ?,
                        ?,
                        ?
                    )
        `,
      [
        formattedDate,
        JSON.stringify(tideData.BasicTide),
        JSON.stringify(tideData.PreciseTide),
      ],
    );

    console.log('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
  }
}

export async function readTideData(date: string): Promise<TideData> {
  const data = await client.query(
    `Select * from tide_log where date = DATE('${date}')`,
  );

  return data.map((row: Record<string, unknown>) => {
    const dateTime = row.date;
    return {
      Date: dateTime instanceof Date ? date : new Date(dateTime as string),
      BasicTide: JSON.parse(row.basicTide as string) as Record<
        string,
        string
      >[],
      PrecisionTides: JSON.parse(row.preciseTide as string) as Record<
        string,
        string
      >[],
    };
  });
}
