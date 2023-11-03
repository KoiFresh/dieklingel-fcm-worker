class RegisterPayload {
  private _token: string;

  private constructor(token: string) {
    this._token = token;
  }

  public static fromJson(data: unknown): RegisterPayload {
    if (typeof data !== "object" || data === null) {
      throw Error("the RegisterPayload has to be an object");
    }
    if (!("token" in data) || typeof data["token"] !== "string") {
      throw Error(
        "the RegisterPayload has to have a key 'token' of type string"
      );
    }

    return new RegisterPayload(data["token"]);
  }

  public get token(): string {
    return this._token;
  }
}

export { RegisterPayload };
