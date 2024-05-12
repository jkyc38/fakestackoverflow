const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { app, sessionStore } = require("../server");

describe("Express Routes Test", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1/fake_so", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (sessionStore) {
       sessionStore.close();
    }
  });

  afterEach(async () => {
    await User.deleteOne(); 
  });

  it("should signup a new user", async () => {
    const response = await request(app).post("/signup").send({
      username: "testuser",
      email: "pog@woggies.com",
      password: "poggywoggies",
    });
    expect(response.status).toBe(201);
    expect(response.body.email).toBe("pog@woggies.com");
  });

  it("should login an existing user", async () => {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash("password123", saltRounds);
    const user = new User({ username: "ken", email: "kendricklamar@gmail.com", passwordHash });
    await user.save();

    const response = await request(app).post("/login").send({
      email: "kendricklamar@gmail.com",
      password: "password123",
    });
    expect(response.status).toBe(200);
    expect(response.body.email).toBe("kendricklamar@gmail.com");
  });

  it("should logout a user", async () => {
    const response = await request(app).post("/logout");
    expect(response.status).toBe(200);
    expect(response.body.redirectURL).toBe("/");
  });
});
