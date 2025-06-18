require("dotenv").config();

const connectDB = require("./db/connect");
const Restaurant = require("./models/Restaurant");

const jsonRestaurant = require("./restaurant.json");

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Restaurant.deleteMany();
    await Restaurant.create(jsonRestaurant);
    console.log("Success!!!!");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
