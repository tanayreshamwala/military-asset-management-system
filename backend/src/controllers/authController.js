import { authService } from "../services/authService.js";
import { asyncHandler, getClientIp } from "../utils/errors.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, baseId } = req.body;

  const user = await authService.register({
    name,
    email,
    password,
    role,
    baseId,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    user,
    token,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUser(req.user.userId);

  res.status(200).json({
    success: true,
    user,
  });
});
