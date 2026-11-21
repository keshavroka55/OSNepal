import express from "express";
import * as CategoryController from "./category.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";

const router = express.Router();

router.get("/", CategoryController.GetAllCategories);
router.post("/", verifyToken, allowRoles("admin"), CategoryController.CreateCategory);
router.get("/:id", CategoryController.GetSinglecategory);
router.put("/:id", verifyToken, allowRoles("admin"), CategoryController.UpdateCategory);
router.delete("/:id", verifyToken, allowRoles("admin"), CategoryController.DeleteCategory);

export default router;
