import "dotenv/config";
import cron from "node-cron";
import { performAllApartmentsIcalSync } from "../lib/server/ical-sync";

async function runSync() {
  console.log(`[Cron] Starting global iCal sync cycle at ${new Date().toISOString()}`);
  try {
    const results = await performAllApartmentsIcalSync();
    
    for (const res of results) {
      if (res.success) {
        console.log(`[Cron] Successfully synced ${res.count} bookings for apartment ${res.id}.`);
      } else {
        console.error(`[Cron] Error syncing apartment ${res.id}:`, res.error);
      }
    }
    
    console.log(`[Cron] Sync cycle completed at ${new Date().toISOString()}`);
  } catch (error) {
    console.error(`[Cron] Global sync cycle fatal error:`, error);
  }
}

// Schedule: every 10 minutes
cron.schedule('*/10 * * * *', runSync);

console.log("iCal Synchronization Cron Job started. Running every 10 minutes.");
// Run immediately on start
runSync();
