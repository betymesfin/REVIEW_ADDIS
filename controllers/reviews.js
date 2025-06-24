const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const Review = require("../models/Reviews");
const NotFoundError = require("../errors/not-found");

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({ createdBy: req.user.userId }).populate(
    "restaurant",
    "name"
  );
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getReview = async (req, res) => {
  const {
    user: { userId },
    params: { id: reviewId },
  } = req;

  const review = await Review.findOne({
    _id: reviewId,
    createdBy: userId,
  });
  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const getReviewByRestaurantId = async (req, res) => {
  const {
    params: { id: restaurantId },
  } = req;

  const review = await Review.find({
    restaurant: restaurantId,
  }).populate("createdBy", "name");

  if (!review) {
    throw new NotFoundError(
      `No review found for restaurant ID ${restaurantId}`
    );
  }
  res.status(StatusCodes.OK).json({ review });
};

const createReview = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const updateReview = async (req, res) => {
  const {
    body: { comment, rating },
    user: { userId },
    params: { id: reviewId },
  } = req;

  if (comment === " " || rating === " ") {
    throw new BadRequestError("Comment or Rating fields cannot be empty");
  }
  const review = await Review.findByIdAndUpdate(
    { _id: reviewId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const {
    user: { userId },
    params: { id: reviewId },
  } = req;

  const review = await Review.findByIdAndRemove({
    _id: reviewId,
    createdBy: userId,
  });
  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ msg: "The entry was deleted." });
};
module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getReview,
  getAllReviews,
  getReviewByRestaurantId,
};
