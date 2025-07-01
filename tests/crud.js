const { app } = require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const get_chai = require("../util/get_chai");
const Review = require("../models/Reviews");
const Restaurant = require("../models/Restaurant");
describe("API Review CRUD Tests", function () {
  before(async function () {
    const { request } = await get_chai();

    this.testUser = await seed_db();

    const res = await request
      .execute(app)
      .post("/api/v1/auth/login")
      .send({ email: this.testUser.email, password: testUserPassword });

    this.token = res.body.token;

    const reviewedRestaurantIds = await Review.find({
      createdBy: this.testUser._id,
    }).distinct("restaurant");

    const availableRestaurant = await Restaurant.findOne({
      _id: { $nin: reviewedRestaurantIds },
    });

    if (!availableRestaurant) {
      throw new Error("No available restaurants left for new reviews");
    }

    this.availableRestaurantId = availableRestaurant._id.toString();
  });

  it("should get list of reviews", async function () {
    const { expect, request } = await get_chai();

    const res = await request
      .execute(app)
      .get("/api/v1/review")
      .set("Authorization", `Bearer ${this.token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("reviews");
    expect(res.body.reviews).to.be.an("array");
  });

  it("should create a new review", async function () {
    const { expect, request } = await get_chai();

    const newReview = {
      restaurant: this.availableRestaurantId,
      comment: "This place is awesome!",
      rating: 5,
      type: "dine-in",
    };

    const res = await request
      .execute(app)
      .post("/api/v1/review")
      .set("Authorization", `Bearer ${this.token}`)
      .send(newReview);

    console.log("Response status:", res.status);
    console.log("Response body:", res.body);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("review");
    expect(res.body.review).to.include({
      comment: newReview.comment,
      rating: newReview.rating,
      type: newReview.type,
    });

    const reviewInDb = await Review.findOne({ comment: newReview.comment });
    expect(reviewInDb).to.not.be.null;
  });
});
