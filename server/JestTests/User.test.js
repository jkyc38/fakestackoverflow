const mongoose = require("mongoose");
const User = require("../models/User");

describe("User Model Test", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1/fake_so");
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await User.deleteOne();
  });

  it("should create & save a user successfully", async () => {
    const userData = { username: "testuser", email: "drake@gmail.com", passwordHash: "BARS" };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.passwordHash).toBe(userData.passwordHash);
  });

  it("should find a user by email", async () => {
    const userData = { username: "testuser", email: "test@example.com", passwordHash: "password123" };
    await new User(userData).save();
    
    const user = await User.findOne({ email: userData.email });
    expect(user.email).toBe(userData.email);
  });

  it("should delete a user by email", async () => {
    const userData = { username: "bruh", email: "bruh@gmail.com", passwordHash: "password123" };
    await new User(userData).save();

    await User.deleteOne({ email: userData.email });
    const user = await User.findOne({ email: userData.email });
    expect(user).toBeNull();
  });
});
