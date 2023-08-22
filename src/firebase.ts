import { getTokenFromGCPServiceAccount } from "@sagi.io/workers-jwt";

const firebase = {
  init,
  getAccessToken,
  sendMessage,
}

var serviceAccountJson: FcmServiceAccountJson | null = null;

function init(json: FcmServiceAccountJson): void {
  serviceAccountJson = json;
}

async function getAccessToken() {
  const jwtToken = await getTokenFromGCPServiceAccount({
    serviceAccountJSON: serviceAccountJson,
    aud: 'https://oauth2.googleapis.com/token',
    payloadAdditions: {
      scope: [
        'https://www.googleapis.com/auth/firebase',
        'https://www.googleapis.com/auth/cloud-platform',
      ].join(' '),
    },
  })
  const accessToken = await (
    await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken, // the JWT token generated in the previous step
      }),
    })
  ).json()
  return accessToken
}

async function sendMessage(message: any, token: any): Promise<Response> {
  return await fetch("https://fcm.googleapis.com/v1/projects/dieklingel/messages:send", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    redirect: 'follow',
    body: JSON.stringify(message),
  });
}

export {
  firebase
};
