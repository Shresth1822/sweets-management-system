import request from "supertest";
import app from "../app";
import { query, pool } from "../db/index";

describe("Inventory API", () => {
  let adminToken: string;
  let userToken: string;
  let sweetId: string;

  beforeAll(async () => {
    const uniqueId = Date.now();
    // Setup users
    await request(app)
      .post("/api/auth/register")
      .send({
        email: `admin.inv.${uniqueId}@test.com`,
        password: "password123",
        role: "ADMIN",
      });
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: `admin.inv.${uniqueId}@test.com`,
        password: "password123",
      });
    adminToken = adminRes.body.token;

    await request(app)
      .post("/api/auth/register")
      .send({
        email: `user.inv.${uniqueId}@test.com`,
        password: "password123",
        role: "USER",
      });
    const userRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: `user.inv.${uniqueId}@test.com`,
        password: "password123",
      });
    userToken = userRes.body.token;

    // Create a sweet to buy
    const sweetRes = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Inventory Test Sweet",
        category: "Test",
        price: 10,
        quantity: 10,
      });
    sweetId = sweetRes.body.id;
  });

  afterAll(async () => {
    await query("DELETE FROM users WHERE email LIKE '%.inv@test.com'");
    if (sweetId) await query("DELETE FROM sweets WHERE id = $1", [sweetId]);
    await pool.end();
  });

  test("POST /api/inventory/:id/purchase should decrease stock", async () => {
    const res = await request(app)
      .post(`/api/inventory/${sweetId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantityToBuy: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.sweet.quantity).toBe(8); // 10 - 2
  });

  test("POST /api/inventory/:id/purchase should fail if out of stock", async () => {
    const res = await request(app)
      .post(`/api/inventory/${sweetId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantityToBuy: 100 }); // More than 8 available

    expect(res.statusCode).toBe(400);
  });

  test("POST /api/inventory/:id/restock should add stock (ADMIN)", async () => {
    const res = await request(app)
      .post(`/api/inventory/${sweetId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantityToAdd: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.sweet.quantity).toBe(13); // 8 + 5
  });
});
