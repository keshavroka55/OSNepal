import * as CommentService from "./postComment.service.js";

export const ListComments = async (req, res) => {
  res.json(await CommentService.listComments(req.params.postId, req.validQuery, req.user?.id));
};

export const ListReplies = async (req, res) => {
  res.json(await CommentService.listReplies(req.params.id, req.validQuery, req.user?.id));
};

export const CreateComment = async (req, res) => {
  res.status(201).json(await CommentService.createComment(req.user, req.params.postId, req.body));
};

export const EditComment = async (req, res) => {
  res.json(await CommentService.editComment(req.user, req.params.id, req.body));
};

export const DeleteComment = async (req, res) => {
  res.json(await CommentService.deleteComment(req.user, req.params.id));
};

export const VoteComment = async (req, res) => {
  res.json(await CommentService.voteComment(req.user.id, req.params.id, req.body.value));
};
