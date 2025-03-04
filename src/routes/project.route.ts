import express from "express";
import {createProject} from '@/controllers/file.controller';
import { createProject } from "../controllers/projectController";
import upload from "../middlewares/uploadMiddleware";

const router = express.Router();

router.post("/", upload.fields([{ name: "banner" }, { name: "pdf" }]), createProject);

export default router;
