import { IRequest } from "itty-router";
import { Env } from ".";
import { Firebase } from "./firebase/Firebase";
import { Notification } from "./firebase/Notification";
import { NotificationPayload } from "./payload/NotificationPayload";
import { RegisterPayload } from "./payload/RegisterPayload";
import { RegisterResponse } from "./response/RegisterResponse";
import { Uuid } from "./uuid/uuid";

class App {
  public async firebase(env: Env): Promise<Firebase> {
    let savedToken: string | null = await env.CACHE.get("FcmOauth2");
    if (savedToken != null) {
      return Firebase.withOAuthToken(savedToken);
    }

    let f = await Firebase.withServiceAccount(JSON.parse(env.FCM_AUTH));
    await env.CACHE.put("FcmOauth2", f.token, { expirationTtl: 600 });
    return f;
  }

  public async registerNewDevice(req: IRequest, env: Env): Promise<Response> {
    let payload: RegisterPayload;
    try {
      payload = RegisterPayload.fromJson(await req.json());
    } catch (e) {
      return new Response(`could not parse the payload; ${e}`, {
        status: 400,
      });
    }
    const firebase = await this.firebase(env);
    if (!firebase.tokenIsValid(payload.token)) {
      return new Response(`the provided token is not valid`, {
        status: 400,
      });
    }

    let deviceId = new Uuid(env).new();
    await env.TOKENS.put(deviceId, payload.token, {
      expirationTtl: 60 * 60 * 24 * 30 * 3, // 60sec * 60min * 24h * 30days * 3months => 3months
    });

    return new RegisterResponse(deviceId);
  }

  public async readDevice(req: IRequest, env: Env): Promise<Response> {
    let deviceId = req.params["deviceId"];
    let fcmToken = req.headers.get("Authorization");

    if (fcmToken === null) {
      return new Response("not found", {
        status: 404,
      });
    }

    let token = await env.TOKENS.get(deviceId);
    if (token === null) {
      return new Response("not found", {
        status: 404,
      });
    }

    if (token !== fcmToken) {
      return new Response("not found", {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({
        token: token,
      })
    );
  }

  public async deleteDevice(req: IRequest, env: Env): Promise<Response> {
    let deviceId = req.params["deviceId"];
    let fcmToken = req.headers.get("Authorization");

    if (deviceId.trim().length === 0 || fcmToken === null) {
      return new Response(`unauthorized`, {
        status: 401,
      });
    }

    let token = await env.TOKENS.get(deviceId);
    if (token === null) {
      return new Response();
    }

    if (token !== fcmToken) {
      return new Response(`unauthorized`, {
        status: 401,
      });
    }
    await env.TOKENS.delete(deviceId);
    return new Response();
  }

  public async updateDevice(req: IRequest, env: Env): Promise<Response> {
    let deviceId = req.params["deviceId"];
    let fcmToken = req.headers.get("Authorization");

    let payload: RegisterPayload;
    try {
      payload = RegisterPayload.fromJson(await req.json());
    } catch (e) {
      return new Response(`could not parse the payload; ${e}`, {
        status: 400,
      });
    }

    let token = await env.TOKENS.get(deviceId);
    if (token == null) {
      return new Response(`the device does not exist`, {
        status: 404,
      });
    }

    if (token !== fcmToken) {
      return new Response(`unauthorized`, {
        status: 401,
      });
    }

    await env.TOKENS.put(deviceId, payload.token);
    return new Response("ok");
  }

  public async sendPushNotification(
    req: IRequest,
    env: Env
  ): Promise<Response> {
    let payload: NotificationPayload;
    try {
      payload = NotificationPayload.fromJson(await req.json());
    } catch (e) {
      return new Response(`could not parse the payload; ${e}`, {
        status: 400,
      });
    }

    let notification = new Notification();
    notification.title = payload.title;
    notification.body = payload.message;

    for (let token of payload.tokens) {
      let pushToken = await env.TOKENS.get(token);
      if (pushToken == null) {
        return new Response(
          `at least one of the provided tokens does not exist`,
          {
            status: 400,
          }
        );
      }
      notification.tokens.push(pushToken);
    }

    let firebase = await this.firebase(env);
    firebase.sendNotification(notification);

    return new Response();
  }
}

export { App };
