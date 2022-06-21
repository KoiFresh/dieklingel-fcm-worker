import { Router } from "itty-router";

import Notification from "./notification";
import { getUid } from "./random";

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  IMAGES: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

const router = Router();

router
  .get("/img/:id", ({ params }) => {
    if (!params) return new Response("Bad Request", { status: 400 });
    return new Response("Hallo Welt" + params["id"]);
  })
  .get("/", () => new Response("dieklingel.com"))
  .get("*", () => new Response("Not Found.", { status: 404 }));

router
  .post("/fcm/send", async (request: Request) => {
    try {
      const body = await request.json();
      const notification: Notification = Notification.fromJSON(body);
      sendToFcm(notification);
    } catch (exception) {
      return new Response(String(exception), { status: 400 });
    }
    return new Response(getUid());
  })
  .post("*", () => new Response("Not Found", { status: 404 }));

async function sendToFcm(notification: Notification): Promise<void> {

}

async function fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  return router.handle(request);
}

export default {
  fetch
};
