import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("auth flow", () => {
  it("registers a new user and returns a token pair", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "ada@example.com", password: "correct-horse-battery" });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  it("rejects registering the same email twice", async () => {
    await request(app).post("/api/auth/register").send({ email: "ada@example.com", password: "correct-horse-battery" });

    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "ada@example.com", password: "another-password" });

    expect(response.status).toBe(409);
  });

  it("rejects registration with a short password", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "grace@example.com", password: "short" });

    expect(response.status).toBe(400);
    expect(response.body.details).toContain("Password must be at least 8 characters");
  });

  it("logs in with correct credentials and rejects incorrect ones", async () => {
    await request(app).post("/api/auth/register").send({ email: "ada@example.com", password: "correct-horse-battery" });

    const good = await request(app).post("/api/auth/login").send({ email: "ada@example.com", password: "correct-horse-battery" });
    expect(good.status).toBe(200);

    const bad = await request(app).post("/api/auth/login").send({ email: "ada@example.com", password: "wrong-password" });
    expect(bad.status).toBe(401);
  });

  it("allows access to a protected route with a valid access token", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({ email: "ada@example.com", password: "correct-horse-battery" });

    const meResponse = await request(app)
      .get("/api/me")
      .set("Authorization", `Bearer ${registerResponse.body.accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.email).toBe("ada@example.com");
  });

  it("rejects a protected route without a token", async () => {
    const response = await request(app).get("/api/me");
    expect(response.status).toBe(401);
  });

  it("rotates the refresh token and invalidates the old one", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({ email: "ada@example.com", password: "correct-horse-battery" });
    const originalRefreshToken = registerResponse.body.refreshToken;

    const refreshResponse = await request(app).post("/api/auth/refresh").send({ refreshToken: originalRefreshToken });
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.refreshToken).not.toBe(originalRefreshToken);

    // The old, already-rotated token must no longer work.
    const reuseResponse = await request(app).post("/api/auth/refresh").send({ refreshToken: originalRefreshToken });
    expect(reuseResponse.status).toBe(401);
  });

  it("rejects an unknown refresh token", async () => {
    const response = await request(app).post("/api/auth/refresh").send({ refreshToken: "not-a-real-token" });
    expect(response.status).toBe(401);
  });

  it("logs out and revokes the refresh token", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({ email: "ada@example.com", password: "correct-horse-battery" });
    const { accessToken, refreshToken } = registerResponse.body;

    const logoutResponse = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${accessToken}`);
    expect(logoutResponse.status).toBe(204);

    const refreshAfterLogout = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(refreshAfterLogout.status).toBe(401);
  });
});
