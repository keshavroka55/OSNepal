import * as PostService from "./post.service.js";

export const GetFeed = async (req, res) => {
  res.json(await PostService.listFeed(req.validQuery, req.user?.id));
};

export const GetPost = async (req, res) => {
  res.json(await PostService.getPost(req.params.id, req.user?.id));
};

export const CreatePost = async (req, res) => {
  res.status(201).json(await PostService.createPost(req.user, req.body));
};

export const EditPost = async (req, res) => {
  res.json(await PostService.editPost(req.user, req.params.id, req.body));
};

export const DeletePost = async (req, res) => {
  res.json(await PostService.deletePost(req.user, req.params.id));
};

export const VotePost = async (req, res) => {
  res.json(await PostService.votePost(req.user.id, req.params.id, req.body.value));
};

export const SavePost = async (req, res) => {
  res.json(await PostService.toggleSave(req.user.id, req.params.id));
};

export const ModeratePost = async (req, res) => {
  res.json(await PostService.moderatePost(req.user, req.params.id, req.body.action));
};
