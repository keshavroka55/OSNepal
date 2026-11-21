import * as SpaceService from "./space.service.js";

export const ListSpaces = async (req, res) => {
  res.json(await SpaceService.listSpaces(req.user?.id));
};

export const GetSpace = async (req, res) => {
  res.json(await SpaceService.getSpace(req.params.slug, req.user?.id));
};

export const CreateSpace = async (req, res) => {
  res.status(201).json(await SpaceService.createSpace(req.user.id, req.body));
};

export const JoinSpace = async (req, res) => {
  res.json(await SpaceService.joinSpace(req.user.id, req.params.slug));
};

export const LeaveSpace = async (req, res) => {
  res.json(await SpaceService.leaveSpace(req.user.id, req.params.slug));
};
