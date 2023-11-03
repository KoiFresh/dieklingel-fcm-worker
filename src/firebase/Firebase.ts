import { getTokenFromGCPServiceAccount } from "@sagi.io/workers-jwt";
import { Notification } from "./Notification";

class Firebase {
  private _token: string;

  private constructor(token: string) {
    this._token = token;
  }

  static async withOAuthToken(token: string): Promise<Firebase> {
    return new Firebase(token);
  }

  static async withServiceAccount(
    account: FcmServiceAccountJson
  ): Promise<Firebase> {
    const jwtToken = await getTokenFromGCPServiceAccount({
      serviceAccountJSON: account,
      aud: "https://oauth2.googleapis.com/token",
      payloadAdditions: {
        scope: [
          "https://www.googleapis.com/auth/firebase",
          "https://www.googleapis.com/auth/cloud-platform",
        ].join(" "),
      },
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwtToken, // the JWT token generated in the previous step
      }),
    });

    let accessToken = (await response.json()) as any;
    return new Firebase(accessToken["access_token"]);
  }

  public get token(): string {
    return this._token;
  }

  public tokenIsValid(fcmToken: string): boolean {
    // TODO: check if token is a valid fcm token
    return true;
  }

  public async sendNotification(
    notification: Notification
  ): Promise<Response[]> {
    let responses: Promise<Response>[] = [];

    for (let token of notification.tokens) {
      let message = {
        message: {
          token: token,
          data: {
            title: notification.title,
            body: notification.body,
          },
          android: {
            ttl: "0",
            priority: "HIGH",
          },
          apns: {
            headers: {
              "apns-expiration": "0",
              "apns-priority": "10",
            },
            payload: {
              aps: {
                "mutable-content": 1,
              },
            },
          },
        },
      };

      let resp = fetch(
        "https://fcm.googleapis.com/v1/projects/dieklingel/messages:send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + this._token,
          },
          redirect: "follow",
          body: JSON.stringify(message),
        }
      );
      responses.push(resp);
    }

    return await Promise.all(responses);
  }
}

export { Firebase };
