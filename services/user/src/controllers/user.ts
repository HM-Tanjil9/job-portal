import type { AuthenticatedRequest } from "../middleware/user.js";
import { TryCatch } from "../utils/TryCatch.js";

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  res.json(user);
});
