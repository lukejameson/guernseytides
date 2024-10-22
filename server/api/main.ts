import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { closeDB } from "../common/database-worker.ts";
import { getTideForDate } from "./worker.ts";

const app = new Application();
const router = new Router();

router.get("/tide/date", async (context) => {
  if (context.params && context.params.date) {
    try {
      const tideData = await getTideForDate(context.params.date);

      context.response.body = tideData;
    } catch (error) {
      console.error("Error reading tide data:", error);
      context.response.status = 500;
      context.response.body = { error: "Internal server error" };
    }
  } else {
    context.response.status = 400;
    context.response.body = { error: "Date parameter is required" };

    console.log("");
  }
});

app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 200;
    return;
  }

  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

const cleanup = () => {
  console.log("Shutting down...");
  closeDB();

  Deno.exit();
};

if (Deno.build.os === "windows") {
  Deno.addSignalListener("SIGINT", cleanup);
} else {
  Deno.addSignalListener("SIGINT", cleanup);
  Deno.addSignalListener("SIGTERM", cleanup);
}

const port = 8001;
console.log(`Server running on http://localhost:${port}`);
await app.listen({ port });
