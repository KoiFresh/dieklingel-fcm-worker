import { Env } from "..";

class Uuid {
  private _env: Env;

  public constructor(env: Env) {
    this._env = env;
  }

  public new(): string {
    let uuid = this.getUid(16);
    return this.getUid(16);
  }

  private getUid(length: number = 16): string {
    let uid = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i: number = 0; i < length; i++) {
      let index: number = Math.floor(Math.random() * characters.length);
      uid += characters.charAt(index);
    }
    return uid;
  }
}

export { Uuid };
