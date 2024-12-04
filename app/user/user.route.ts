import { Router } from "express";
import { catchError } from "../common/middleware/cath-error.middleware";
import * as userController from "./user.controller";
import * as userValidator from "./user.validation";
import { roleAuth } from "../common/middleware/role-auth.middleware";

const router = Router();

router
  .get("/", userController.getAllUser)
  .get("/:id", roleAuth("USER"), userController.getUserById)
  .delete("/:id", userController.deleteUser)
  .post("/", userValidator.createUser, catchError, userController.createUser)
  .put("/:id", userValidator.updateUser, catchError, userController.updateUser)
  .patch("/:id", roleAuth("USER"), catchError, userController.editUser);

export default router;
