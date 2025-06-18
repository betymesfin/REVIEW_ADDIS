const express = require("express");
const router = express.Router();
const {
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  getReview,
  getReviewByRestaurantId,
} = require("../controllers/reviews");

router.route("/").post(createReview).get(getAllReviews);
router.get("/restaurant/:id", getReviewByRestaurantId);
router.route("/:id").patch(updateReview).delete(deleteReview).get(getReview);

module.exports = router;
