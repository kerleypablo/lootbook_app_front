export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
    name = "AppError",
  ) {
    super(message);
    this.name = name;
  }
}
