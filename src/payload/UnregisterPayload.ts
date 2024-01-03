class UnregisterPayload {
  private _token: string;

  private constructor(token: string) {
    this._token = token;
  }

  public static fromJson(data: unknown): UnregisterPayload {
    if (typeof data !== "object" || data === null) {
      throw Error("the UnregisterPayload has to be an object");
    }
    if (!("token" in data) || typeof data["token"] !== "string") {
      throw Error(
        "the UnregisterPayload has to have a key 'token' of type string"
      );
    }

    return new UnregisterPayload(data["token"]);
  }

  public get token(): string {
    return this._token;
  }
}

export { UnregisterPayload };
