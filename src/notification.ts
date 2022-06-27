export default class Notification {
	static fromJSON(input: any): Notification {
		let notification: Notification = new Notification();
		if (!Array.isArray(input["tokens"])) {
			throw new TypeError("tokens has to be of type string[]");
		}
		notification.tokens = input["tokens"].map(value => String(value));
		if (!input["title"]) {
			throw new TypeError("title cannot be undefined");
		}
		notification.title = String(input["title"]);
		if (!input["body"]) {
			throw new TypeError("body cannot be undefined");
		}
		notification.body = String(input["body"]);
		if (input["image"]) {
			notification.image = String(input["image"]);
		}
		return notification;
	}

	private constructor() { };

	public tokens: string[] = [];
	public title: string = "";
	public body: string = "";
	public image: string | null = null;
}