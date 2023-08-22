function getUid(length: number = 16): string {
  let uid = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i: number = 0; i < length; i++) {
    let index: number = Math.floor(Math.random() * characters.length);
    uid += characters.charAt(index);
  }
  return uid;
}

export {
  getUid,
}
