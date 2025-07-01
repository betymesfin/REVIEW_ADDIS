const { app } = require("../app");
const get_chai = require("../util/get_chai");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;

describe("API Registration Test", function () {
  it("should register a new user", async () => {
    const { expect, request } = await get_chai();

    const password = faker.internet.password();
    const userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password,
    };

    const res = await request
      .execute(app)
      .post("/api/v1/auth/register")
      .set("Content-Type", "application/json")
      .send({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password1: userData.password,
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("user");
    expect(res.body.user).to.have.property("name", userData.name);
    expect(res.body.user).to.have.property("userId");
    expect(res.body).to.have.property("token").that.is.a("string");

    const newUser = await User.findOne({ email: userData.email });
    expect(newUser).to.not.be.null;
  });
});
