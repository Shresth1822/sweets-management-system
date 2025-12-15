import request from "supertest";
import app from "../app";
import { query, pool } from "../db/index";

describe("Sweets API", () => {
  let adminToken: string;
  let userToken: string;
  let testSweetId: string;

  beforeAll(async () => {
    const uniqueId = Date.now();
    // Setup test users
    await request(app)
      .post("/api/auth/register")
      .send({
        email: `admin.sweets.${uniqueId}@test.com`,
        password: "password123",
        role: "ADMIN",
      });

    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: `admin.sweets.${uniqueId}@test.com`,
        password: "password123",
      });
    adminToken = adminRes.body.token;

    await request(app)
      .post("/api/auth/register")
      .send({
        email: `user.sweets.${uniqueId}@test.com`,
        password: "password123",
        role: "USER",
      });

    const userRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: `user.sweets.${uniqueId}@test.com`,
        password: "password123",
      });
    userToken = userRes.body.token;
  });

  afterAll(async () => {
    await query("DELETE FROM users WHERE email LIKE '%.sweets@test.com'");
    if (testSweetId) {
      await query("DELETE FROM sweets WHERE id = $1", [testSweetId]);
    }
    await pool.end();
  });

  test("POST /api/sweets should let ADMIN create sweet", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Ladoo",
        category: "Test",
        price: 100,
        quantity: 50,
        description: "Tasty",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    testSweetId = res.body.id;
  });

  test("POST /api/sweets should deny USER", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Forbidden Ladoo",
        category: "Test",
        price: 100,
        quantity: 50,
      });

    expect(res.statusCode).toBe(403);
  });

  test("GET /api/sweets should list sweets", async () => {
    const res = await request(app).get("/api/sweets");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    const sweet = res.body.find((s: any) => s.id === testSweetId);
    expect(sweet).toBeTruthy();
  });

  test("GET /api/sweets/search should filter sweets", async () => {
    const res = await request(app).get("/api/sweets/search?name=Test Ladoo");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toBe("Test Ladoo");
  });
});
