const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const Register = async (req, res) => {
  try {
    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    res
      .status(StatusCodes.CREATED)
      .json({ user: { name: user.name, userId: user._id }, token });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Email is already registered" });
    }

    console.error("Registration error:", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong. Please try again." });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new UnauthenticatedError("Invalid Credential");
  }

  const token = user.createJWT();
  res
    .status(StatusCodes.OK)
    .json({ user: { name: user.name, userId: user._id }, token });
};

module.exports = { Register, Login };
