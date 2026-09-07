export class AppError extends Error {
  public readonly code: string;

  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
    code = "AppError",
  ) {
    super(message);
    this.name = code;
    this.code = code;
  }
}
