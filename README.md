# dieklingel-fcm-worker

This repo contains a worker running on cloudlflare, providing an environment and exposing an api, to send
a push notification within [firebase](https://firebase.google.com) to the [dieklingel-app](https://dieklingel.com/#/app).

## API

The API allows to get a token for a device running dieKlingel APP (<https://app.dieklingel.de/>)

### `GET /devices/${DEVICE_ID}`

Get the FCM Push Token for the device with the id of `${DEVICE_ID}`. In order to retrive the device token and get a successfull response, you have to authorize youself. To authorize yourself you have to pass the header `Authorization: ${FCM_TOKEN}` to the request. This request is more likely used to check if a device is already registers, than to retrive the FCM Token, because the token has to be known when performing the request.

```javascript
// response body
{
  token: String; // the fcm token
}
```

### `POST /devices`

Register a new device on the service. A device can be registerd if it passes a valid fcm token. The device will get `${DEVICE_ID}` from the service, by wich it will be identified in future request. The fcm token has to be valid to perform a succesfull request.

```javascript
// request body
{
  token: String; // the valid fcm token
}
```

```javascript
// response body
{
  token: String; // the uniqe id of the device
}
```

### `PATCH /devices/${DEVICE_ID}`

Change the FCM token associated with the device identified by `${DEVICE_ID}`. To perform a succesfull request youn have to authenticate yourself by passing the header `Authorization: ${FCM_TOKEN}`. The `${FCM_TOKEN}` is the current FCM token, which should be replaced by the new FCM token.

```javascript
// request body
{
  token: String; // the new fcm token
}
```

### `DELETE /devices/${DEVICE_ID}`

Deletes the device identified by `${DEVICE_ID}`. To perform a succesfull request youn have to authenticate yourself by passing the header `Authorization: ${FCM_TOKEN}`. This action is irreversible and there is no such thing like a dry-run. If the device shoudl be used again after deletion, the device has to perform a registration again and will get a new `${DEVICE_ID}`. The deletion will also performed three months after registration, if there isn't a `PATCH /devices/${DEVICE_ID}` request. The `PATCH` request will reset the three months.

### `POST /notifications`

Sends a push notification to the devices identified by the id's in the payload. The device's has to be registerd be able to receive a notification.

```javascript
// request body
{
  tokens: String[]; // the device id's to send the notification to
  title: String // the title if the message
  message: String // the body of the message
}
```

## todo

- [ ] add image support
- [ ] allow to push mqtt payload

## cloudflare worker

To run this worker locally, you have to execute:

```bash
wrangler dev
```

also checkout the [cloudflare docs](https://developers.cloudflare.com/workers/) for more information
