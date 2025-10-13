import { Request, Response } from "express";
import UserRepository from "./user.repository";
import { errorResponse, successResponse } from "../../utils/response.util";

export class UsersController {
  private userRepo = new UserRepository();
  async me(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const user = await this.userRepo.findCurrentUser(userId);
      if (!user) return errorResponse(res, 404, "User not found");

      return successResponse(res, user, 200, "Current User fetched");
    } catch (err: any) {
      return res.status(500).json({ error: err.message || err });
    }
  }
}
