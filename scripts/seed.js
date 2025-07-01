const mongoose = require("mongoose");
require("dotenv").config();

const { seed_db } = require("../util/seed_db"); 

seed_db()
  .then(() => {
    console.log("✅ Seeding done!");
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding failed:", err.message);
    mongoose.connection.close();
    process.exit(1);
  });
