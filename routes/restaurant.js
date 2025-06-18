const express = require("express");
const router = express.Router();
const {
  getAllrestaurant,
  getSinglerestaurant,
} = require("../controllers/restaurants");

router.route("/").get(getAllrestaurant);
router.route("/:id").get(getSinglerestaurant);

module.exports = router;
