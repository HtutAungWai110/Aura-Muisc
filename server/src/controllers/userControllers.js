import User from "../models/user";
import AppError from "../lib/appError";

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    return res.status(200).json(user);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export { getUser };
