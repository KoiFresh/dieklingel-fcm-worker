class NotificationPayload {
  private _tokens: string[];
  private _title: string;
  private _message: string;

  private constructor(tokens: string[], title: string, message: string) {
    this._tokens = tokens;
    this._title = title;
    this._message = message;
  }

  public static fromJson(data: unknown): NotificationPayload {
    if (typeof data !== "object" || data === null) {
      throw Error("the NotificationPayload has to be an object");
    }
    if (!("tokens" in data) || !Array.isArray(data["tokens"])) {
      throw Error(
        "the NotificationPayload has to have a key 'tokens' of type string[]"
      );
    }
    if (data["tokens"].every((item) => typeof item === "string")) {
      throw Error(
        "the NotificationPayload has to have a key 'tokens' of type string[]"
      );
    }
    if (!("title" in data) || typeof data["title"] !== "string") {
      throw Error(
        "the NotificationPayload has to have a key 'title' of type string"
      );
    }
    if (!("message" in data) || typeof data["message"] !== "string") {
      throw Error(
        "the NotificationPayload has to have a key 'message' of type string"
      );
    }

    return new NotificationPayload(
      data["tokens"],
      data["title"],
      data["message"]
    );
  }

  public get tokens(): string[] {
    return this._tokens;
  }

  public get title(): string {
    return this._title;
  }

  public get message(): string {
    return this._message;
  }
}

export { NotificationPayload };
