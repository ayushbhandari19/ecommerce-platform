import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("API", () => {
  it("should respond to the products endpoint", async () => {
    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});