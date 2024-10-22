import { Client } from "https://deno.land/x/mysql/mod.ts";
import type { TideData } from "../common/models/tide-data.ts";
import { format } from 'date-fns';

let client: Client | null = null;

async function getClient(): Promise<Client> {
  if (!client) {
    client = await new Client().connect({
      hostname: "127.0.0.1",
      username: "admin",
      password: "Pass.Word!",
      db: "tides",
    });
  }
  return client;
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
  }
}

export async function insertTideData(tideData: TideData) {
  try {
    const formattedDate = format(tideData.Date, "yyyy-MM-dd");
    const client = await getClient();
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
      [formattedDate, JSON.stringify(tideData.BasicTide), JSON.stringify(tideData.PreciseTide)]
    );

    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

export async function readTideData(date: string): Promise<TideData | null> {
  const client = await getClient();
  const data = await client.query(`Select * from tide_log where date = DATE('${format(date, "yyyy-MM-dd")}')`);

  // console.log(data);
  // console.log(format(date, "yyyy-MM-dd"));
  // console.log(Object.keys(data).length == 0);

  if (Object.keys(data).length == 0) {
    return null;
  }

  return data.map((row: Record<string, unknown>) => {
    const dateTime = row.date;
    return {
      Date: dateTime instanceof Date ? date : new Date(dateTime as string),
      BasicTide: JSON.parse(row.basicTide as string) as Record<string, string>[],
      PrecisionTides: JSON.parse(row.preciseTide as string) as Record<string, string>[],
    };
  });
}

export async function doesTideDataExist(date: string): Promise<boolean> {
  const client = await getClient();
  const data = await client.query(`Select date from tide_log where date = DATE('${date}')`);

  if (Object.keys(data).length == 0) {
    return false;
  }

  return true;
}
