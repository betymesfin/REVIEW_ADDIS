const mongoose = require("mongoose");
const Reviews = require("../models/Reviews");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const { fakerEN_US: faker } = require("@faker-js/faker");
require("dotenv").config();

const testUserPassword = faker.internet.password();

const seed_db = async () => {
  let testUser = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST;
    await mongoose.connect(mongoURL);

    // Clear old test data
    await Reviews.deleteMany({});

    await User.deleteMany({});

    const restaurants = await Restaurant.find().limit(5);
    if (restaurants.length === 0) {
      throw new Error("No restaurants found. Cannot seed reviews.");
    }

    // Create a test user
    testUser = await User.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: testUserPassword,
    });

    // Create 20 random reviews
    const shuffledRestaurants = restaurants.sort(() => 0.5 - Math.random());
    const reviewPromises = shuffledRestaurants
      .slice(0, 20)
      .map((restaurant) => {
        return Reviews.create({
          restaurant: restaurant._id,
          createdBy: testUser._id,
          comment: faker.lorem.sentence(),
          rating: faker.number.int({ min: 1, max: 5 }),
          type: ["dine-in", "takeaway", "delivery", "other"][
            Math.floor(Math.random() * 4)
          ],
        });
      });

    await Promise.all(reviewPromises);

    console.log("✅ Seeding complete.");
  } catch (e) {
    console.error("❌ Database seeding error:", e.message);
    throw e;
  }

  return testUser;
};

module.exports = { testUserPassword, seed_db };
