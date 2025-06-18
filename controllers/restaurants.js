const { StatusCodes } = require("http-status-codes");
const Restaurant = require("../models/Restaurant");

const getAllrestaurant = async (req, res) => {
  const restaurant = await Restaurant.find();
  res.status(StatusCodes.OK).json(restaurant);
};

const getSinglerestaurant = async (req, res) => {
  const restaurant = await Restaurant.findOne();
  res.status(StatusCodes.OK).json(restaurant);
};

module.exports = { getAllrestaurant, getSinglerestaurant };
