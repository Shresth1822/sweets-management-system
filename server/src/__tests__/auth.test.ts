import request from "supertest";
import app from "../app";
import { query, pool } from "../db/index";

describe("Auth API", () => {
  beforeAll(async () => {
    // Clean up test users
    await query("DELETE FROM users WHERE email LIKE '%@test.com'");
  });

  afterAll(async () => {
    await query("DELETE FROM users WHERE email LIKE '%@test.com'");
    await pool.end();
  });

  const uniqueId = Date.now();
  const testUser = {
    email: `jest.auth.${uniqueId}@test.com`,
    password: "password123",
    role: "USER",
  };

  test("POST /api/auth/register should create a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", testUser.email);
  });

  test("POST /api/auth/register should fail for existing email", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Email already exists");
  });

  test("POST /api/auth/login should authenticate user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /api/auth/login should reject wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
  });
});
