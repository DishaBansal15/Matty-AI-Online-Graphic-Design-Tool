import { Project } from "../models/projectModel.js";

export const createProject = async (req, res) => {
  try {
    const { name, elements,appState, thumbnail } = req.body;

    const newProject = await Project.create({
      user: req.user._id,
      name: name || "Untitled Project",
      elements,appState,
      thumbnail,
    });

    res.status(201).json({ message: "Project created", project: newProject });
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, elements, appState,thumbnail } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, elements, appState,thumbnail },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ message: "Project updated", project });
  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    res.status(200).json({ project });
  } catch (error) {
    console.error("Get Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

