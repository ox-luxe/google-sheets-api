import request from "supertest";

import app from "../index";

describe("Test app.ts", () => {
  test("index get request response", async () => {
    const res = await request(app).get("/healthcheck");
    expect(res.body).toEqual({ message: "Server Active." });
  });
});
