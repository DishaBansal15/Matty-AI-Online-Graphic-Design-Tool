import express from "express";
import { createProject, getUserProjects, getProjectById, updateProject } from "../controller/projectController.js";
import { isAuthenticated } from "../middleware/authUser.js";

const router = express.Router();

router.post("/create", isAuthenticated, createProject);
router.get("/user", isAuthenticated, getUserProjects);
router.put("/:id", isAuthenticated, updateProject);
router.get("/:id", isAuthenticated, getProjectById);

export default router;
