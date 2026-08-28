export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export class EmailAlreadyRegisteredError extends AppError {
  constructor() {
    super("An account with this email already exists", 409);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("Invalid email or password", 401);
  }
}

export class InvalidRefreshTokenError extends AppError {
  constructor() {
    super("Invalid or expired refresh token", 401);
  }
}
