import { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import { createResponse } from "../common/helper/response.hepler";
import { createUserTokens } from "../common/services/passport-jwt.service";

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  res.send(
    createResponse(
      { ...createUserTokens(req.user!), user: req.user },
      "Logged in sucssefully"
    )
  );
});
