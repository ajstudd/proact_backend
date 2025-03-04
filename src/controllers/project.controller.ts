import { Request, Response } from "express";
import { gridBucket } from "../configs/gridFsConfig";
import Project from "../models/Project";
import { uploadFile } from "../services/uploadService";

export const createProject = async (req: Request, res: Response) => {
  try {
    const { description, location, associatedProfiles, budget, expenditure } = req.body;

    let bannerId = "";
    let pdfId = "";

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files["banner"]?.[0]) {
        bannerId = await uploadFile(req, files["banner"][0].originalname);
      }

      if (files["pdf"]?.[0]) {
        pdfId = await uploadFile(req, files["pdf"][0].originalname);
      }
    }

    const project = await Project.create({
      description,
      location: JSON.parse(location),
      associatedProfiles: JSON.parse(associatedProfiles),
      budget,
      expenditure,
      bannerId,
      pdfId,
      governmentId: req.user?.id, // Government Authenticated User ID
      contractorId: req.body.contractorId,
    });

    res.status(201).json({ message: "Project Created Successfully!", project });
  } catch (error) {
    console.log("❌ Project Creation Error:", error);
    res.status(500).json({ message: "Failed to Create Project" });
  }
};
