import { getTideForDate } from '@server/common/worker.ts';
import { closeDB } from '@server/common/database-worker.ts';

async function main() {
  const date = '2024-10-18';

  await getTideForDate(date);
}

try {
  await main();
} catch (error) {
  console.error(error);
} finally {
  await closeDB();
}
