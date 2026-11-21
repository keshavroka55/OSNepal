import * as CommentService from "./comment.service.js";
import prisma from "../../prisma.js";


export const GetComments = async (req, res) => {
  try {
    const comments = await CommentService.getCommentsByStartup(req.params.startupId);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const GetComment = async (req, res) => {
  try {
    const comment = await CommentService.getCommentById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const CreateComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent) throw new Error("Parent comment not found");
      if (parent.parentId) return res.status(400).json({ message: "Cannot reply to a reply" });

    }
    const comment = await CommentService.createComment(
      req.user.id, req.params.startupId, content, parentId
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const UpdateComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });
    const comment = await CommentService.updateComment(
      req.params.id, req.user.id, req.user.role, content
    );
    res.json(comment);
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : err.message.includes('Not authorized') ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const DeleteComment = async (req, res) => {
  try {
    const result = await CommentService.deleteComment(
      req.params.id, req.user.id, req.user.role
    );
    res.json(result);
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : err.message.includes('Not authorized') ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const GetMyComments = async (req, res) => {
  try {
    const comments = await CommentService.getMyComments(req.user.id);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};