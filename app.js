require("dotenv").config();
require("express-async-errors");

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const ratelimit = require("express-rate-limit");

const express = require("express");
const app = express();
const authRouter = require("./routes/auth");
const RestaurantRouter = require("./routes/restaurant");
const ReviewRouter = require("./routes/review");
const connectDB = require("./db/connect");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authenticateUser = require("./middleware/authentication");

app.use(express.json());
// extra packages
app.use(
  ratelimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());

app.use(express.static("public"));
// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/restaurant", RestaurantRouter);
app.use("/api/v1/review", authenticateUser, ReviewRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
