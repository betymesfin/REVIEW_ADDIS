require("dotenv").config();
require("express-async-errors");

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const ratelimit = require("express-rate-limit");

const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

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
app.set("trust proxy", 1);
app.use(
  ratelimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());

app.use((req, res, next) => {
  if (req.path === "/multiply") {
    res.set("Content-Type", "application/json");
  }
  next();
});

app.get("/", (req, res) => {
  res.send('<h1>Reviews API</h1><a href="/api-docs">Documentation</a>');
});
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/restaurant", RestaurantRouter);
app.use("/api/v1/review", authenticateUser, ReviewRouter);

app.get("/multiply", (req, res) => {
  const result = req.query.first * req.query.second;
  if (result.isNaN) {
    result = "NaN";
  } else if (result == null) {
    result = "null";
  }
  res.json({ result: result });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV == "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}
const start = async () => {
  try {
    await connectDB(mongoURL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
module.exports = { app };
