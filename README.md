# dieklingel-fcm-worker

This repo contains a worker running on cloudlflare, providing an environment and exposing an api, to send 
a push notification within [firebase](https://firebase.google.com) to the [dieklingel-app](https://dieklingel.com/#/app).

## API

To use the api you have to make a POST request to the worker, running on fcm-worker.dieklingel.workers.dev. The body of your Request is in json format and has to contain the following keys:

1. tokens
"tokens" is an array, containing all device tokens, to wich the notification should send to.

2. title
"title" contains the title of the notification as string

3. body
"body" contains the the of the notification as string

4. image
"image" contains an image, smaller than 5MB, as base64 string. The image will deliverd into the push notification.

an example body of a request could look like this:
```json
{
	"tokens": [ "exampletoken1", "exampletoken2" ],
	"title": "Hello World",
	"body": "This is a push notification",
	"image": "data:image/png;base64,iVB..."
}
```

This would trigger a push notification.
