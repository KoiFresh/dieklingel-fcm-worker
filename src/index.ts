import { Router } from "itty-router";
import Notification from "./notification";
import { getUid } from "./random";
import { base64ToUint8Array } from "./convert";
import { firebase } from "./firebase";
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
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

const router = Router();

router
  .get("/img/:id", async ({ params }, env: Env) => {
    if (!params) return new Response("Bad Request", { status: 400 });
    let uid: string = params["id"];
    let image: string | null = await env.IMAGES.get(uid);
    if (image) {
      let binary = base64ToUint8Array(image);
      return new Response(binary, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": binary.length.toString()
        },
      });
    }
    return new Response("Bad Request", { status: 400 });
  })
  .get("/", (request: Request) => new Response(request.url))
  .get("*", () => new Response("Not Found.", { status: 404 }));

router
  .post("/fcm/send", async (request: Request, env: Env) => {
    try {
      const body = await request.json();
      const notification: Notification = Notification.fromJSON(body);
      await sendToFcm(notification, env);
    } catch (exception) {
      return new Response(String(exception), { status: 400 });
    }
    return new Response("Ok", { status: 200 });
  })
  .post("*", () => new Response("Not Found", { status: 404 }));

async function sendToFcm(notification: Notification, env: Env): Promise<void> {
  let uid: string = getUid();
  if (notification.image) {
    await env.IMAGES.put(uid, notification.image, { expirationTtl: 60 });
  }
  firebase.init(JSON.parse(env.FCM_AUTH));
  // send notification
  let token: any = await firebase.getAccessToken();
  let img_url = "https://fcm-worker.dieklingel.workers.dev/img/" + uid;
  for (let device_token of notification.tokens) {
    let fcm = {
      "message": {
        "token": device_token,
        "android": {
          "notification": {
            "title": notification.title,
            "body": notification.body,
            "sound": "ringtone",
            "icon": "icon_16x16"
          }
        },
        "apns": {
          "payload": {
            "aps": {
              "alert": {
                "title": notification.title,
                "subtitle": "dieklingel.com",
                "body": notification.body,
              },
              "sound": "ringtone.wav",
              "mutable-content": 1
            }
          },
          "fcm_options": {
            "image": img_url,
          }
        }
      }
    };
    firebase.sendMessage(fcm, token["access_token"]);
  }
}

async function fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  return router.handle(request, env);
}

export default {
  fetch
};
