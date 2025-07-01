const { app } = require("../app");
const get_chai = require("../util/get_chai");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;

describe("API Login and Access Protected Route", function () {
  let email, password, token;

  before(async () => {
    email = faker.internet.email();
    password = faker.internet.password();

    await User.create({ name: "Test User", email, password });
  });

  it("should log in the user and return a JWT", async () => {
    const { expect, request } = await get_chai();

    const res = await request
      .execute(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send({ email, password });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("token").that.is.a("string");
    expect(res.body).to.have.property("user");
    expect(res.body.user).to.have.property("name", "Test User");
    expect(res.body.user).to.have.property("userId");

    token = res.body.token;
  });

  it("should access the /api/v1/review route using the token", async () => {
    const { expect, request } = await get_chai();

    const res = await request
      .execute(app)
      .get("/api/v1/review")
      .set("Authorization", `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("reviews").that.is.an("array");
    expect(res.body).to.have.property("count").that.is.a("number");
  });
});
