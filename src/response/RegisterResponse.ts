class RegisterResponse extends Response {
  public constructor(name: string) {
    super(
      JSON.stringify({
        token: name,
      })
    );
  }
}

export { RegisterResponse };
