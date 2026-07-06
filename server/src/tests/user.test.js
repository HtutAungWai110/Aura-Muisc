jest.mock("../models/user", () => {
  return {
    __esModule: true,
    default: {
      findById: jest.fn(),
    },
  };
});

import { getUser } from "../controllers/userControllers.js";
import User from "../models/user.js";

describe("User Controllers - getUser", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should return user data when user is found", async () => {
    req.userId = "6a11557f819a3493e4a9efef";
    const mockData = {
      _id: "6a11557f819a3493e4a9efef",
      email: "lmaohtutaungwai@gmail.com",
      displayName: "HtutAungWai",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKFI0B1ATLHsdUPi_un5CepHbEUIuL6yZTlY7EbE0Y9PEGx8dw=s96-c",
      provider: "google",
      providerId: "104924534884527774682",
      createdAt: "2026-05-23T07:21:35.458Z",
      __v: 0,
    };

    User.findById.mockResolvedValue(mockData);

    await getUser(req, res);

    expect(User.findById).toHaveBeenCalledWith("6a11557f819a3493e4a9efef");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("should return 500 error when user lookup fails", async () => {
    req.userId = null;
    const errorMessage = "Database error";

    User.findById.mockRejectedValue(new Error(errorMessage));

    await getUser(req, res);

    expect(User.findById).toHaveBeenCalledWith(null);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});
