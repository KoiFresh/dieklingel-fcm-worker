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
  TOKENS: KVNamespace;
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
          "Content-Length": binary.length.toString(),
          "Access-Control-Allow-Origin": "*"
        },
      });
    }
    return new Response("Bad Request", { status: 400 });
  })
  .get("/", (request: Request) => new Response(request.url))
  .get("*", () => new Response("Not Found.", {
    status: 404,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }));

router
  .post("/fcm/send", async (request: Request, env: Env) => {
    let response = [];
    try {
      const body = await request.json();
      const notification: Notification = Notification.fromJSON(body);
      response = await sendToFcm(notification, env);
    } catch (exception) {
      return new Response(String(exception), {
        status: 400, headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  })
  .post("*", () => new Response("Not Found", { status: 404 }));

async function sendToFcm(notification: Notification, env: Env): Promise<any> {
  let uid: string = getUid();
  if (notification.image) {
    await env.IMAGES.put(uid, notification.image, { expirationTtl: 60 });
  }
  let oauth2: string;
  let savedToken: string | null = await env.TOKENS.get("FcmOauth2");
  if (savedToken != null) {
    oauth2 = savedToken;
  } else {
    firebase.init(JSON.parse(env.FCM_AUTH));
    let token: any = await firebase.getAccessToken();
    oauth2 = token["access_token"];
    await env.TOKENS.put("FcmOauth2", oauth2, { expirationTtl: 600 });
  }

  //firebase.init(JSON.parse(env.FCM_AUTH));
  // send notification
  //let token: any = await firebase.getAccessToken();
  let img_url = "https://fcm-worker.dieklingel.workers.dev/img/" + uid;
  let response_body = [];
  for (let device_token of notification.tokens) {
    let fcm = {
      "message": {
        "token": device_token,
        "android": {
          "data": {
            "title": notification.title,
            "body": notification.body,
            "sound": "ringtone",
            "icon": "icon_16x16",
            "image": img_url,
          }
        },
        "apns": {
          "headers": {
            "apns-collapse-id": notification.id ?? getUid(24),
            "apns-expiration": "0",
            "apns-priority": "10",
          },
          "payload": {
            "aps": {
              "alert": {
                "title": notification.title,
                "body": notification.body,
              },
              "sound": "ringtone.wav",
              "mutable-content": notification.image != null ? 1 : 0
            }
          },
          "fcm_options": {
            "image": img_url,
          }
        }
      }
    };
    let r: Response = await firebase.sendMessage(fcm, oauth2);
    response_body.push({ "status": r.status, "statusText": r.statusText, "debug": { "oauth": oauth2 } });
  }
  return response_body;
}

async function fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  return router.handle(request, env);
}

export default {
  fetch
};
