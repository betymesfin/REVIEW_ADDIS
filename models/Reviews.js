const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Please provide restaurant"],
    },
    comment: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["dine-in", "takeaway", "delivery", "other"],
      default: "dine-in",
    },
    rating: {
      type: Number,
      required: true,
      default: 3,
      min: 1,
      max: 5,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
);
reviewSchema.index({ restaurant: 1, createdBy: 1 }, { unique: true });


reviewSchema.statics.calculateRestaurantStats = async function (restaurantId) {
  const stats = await this.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: '$restaurant',
        numReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
      numReviews: stats[0].numReviews,
      averageRating: stats[0].averageRating,
    });
  } else {
    await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
      numReviews: 0,
      averageRating: 0,
    });
  }
};

/** Recalculate stats after saving a review */
reviewSchema.post('save', function () {
  this.constructor.calculateRestaurantStats(this.restaurant);
});

/** Recalculate stats after removing a review */
reviewSchema.post('remove', function () {
  this.constructor.calculateRestaurantStats(this.restaurant);
});

reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await doc.constructor.calculateRestaurantStats(doc.restaurant);
  }
});
module.exports = mongoose.model("Review", reviewSchema);
