import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js"; 
describe("Authentication API", () => { 
  const email = `test-${Date.now()}@example.com`; 
  const password = "TestPassword123"; 
  it("should register a new customer", async () => { 
    const response = await request(app)
      .post("/api/auth/register")
      .send({ 
        name: "Test User", 
        email, password, 
      }); 
    expect(response.status).toBe(201); 
    expect(response.body.success).toBe(true); 
    expect(response.body.user.email).toBe(email); 
    expect(response.body.user.role).toBe("CUSTOMER"); 
    expect(response.body.user.password).toBeUndefined(); 
  }); 
  it("should login the registered customer", async () => { 
    const response = await request(app)
      .post("/api/auth/login")
      .send({ 
        email, 
        password, 
      }); 
    expect(response.status).toBe(200); 
    expect(response.body.success).toBe(true); 
    expect(response.body.token).toBeDefined(); 
    expect(response.body.user.email).toBe(email); 
  }); 
  it("should reject an incorrect password", async () => { 
    const response = await request(app)
      .post("/api/auth/login")
      .send({ 
        email, 
        password: "WrongPassword123", 
      }); 
    expect(response.status).toBe(401); 
    expect(response.body.success).toBe(false); 
  }); 
  it("should reject an unauthenticated request", async () => { 
    const response = await request(app).get("/api/cart"); 
    expect(response.status).toBe(401); 
    expect(response.body.success).toBe(false); 
    expect(response.body.message).toBe("Authentication required"); }); 
  });