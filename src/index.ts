import { IRequest, Router, withParams } from "itty-router";
import { App } from "./app";

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
  FCM_AUTH: string;
  IMAGES: KVNamespace;
  TOKENS: KVNamespace;
  CACHE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

const app = new App();
const router = Router();

router
  .get("/", (request: Request) => new Response(request.url))
  .get("/devices/:deviceId", (req, env) => app.readDevice(req, env))
  .post("/devices", (req, env) => app.registerNewDevice(req, env))
  .post("/notifications", (req, env) => app.sendPushNotification(req, env))
  .delete("/devices/:deviceId", (req, env) => app.deleteDevice(req, env))
  .patch("/devices/:deviceId", (req, env) => app.updateDevice(req, env))
  .all("*", () => new Response("Not Found", { status: 404 }));

async function fetch(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  return router.handle(request, env);
}

export default {
  fetch,
};
