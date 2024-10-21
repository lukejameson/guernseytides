import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { readTideData, closeDB } from "../common/database-worker.ts"

const app = new Application();
const router = new Router();

router.get("/tide:date", async (context) => {
    if (context.params && context.params.date) {
        try {
            const formattedDate = context.params.date.slice(6);
            const tideData = await readTideData(formattedDate);

            context.response.body = tideData;
        } catch (error) {
            console.error("Error reading tide data:", error);
            context.response.status = 500;
            context.response.body = { error: "Internal server error" };
        }
    } else {
        context.response.status = 400;
        context.response.body = { error: "Date parameter is required" };
    }
});

app.use(router.routes());
app.use(router.allowedMethods());

// Setup shutdown handler
const cleanup = () => {
    console.log("Shutting down...");
    // Add any cleanup logic here, such as closing the database connection
    closeDB()

    Deno.exit();
};

if (Deno.build.os === "windows") {
    Deno.addSignalListener("SIGINT", cleanup);
} else {
    Deno.addSignalListener("SIGINT", cleanup);
    Deno.addSignalListener("SIGTERM", cleanup);
}

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
