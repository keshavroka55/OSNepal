import * as FollowService from "./follow.service.js";

export const ToggleFollow = async (req, res) => {
  try {
    const result = await FollowService.toggleFollow(
      req.user.id, req.params.userId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const GetFollowers = async (req, res) => {
  try {
    const followers = await FollowService.getFollowers(req.params.userId);
    res.json(followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const GetFollowing = async (req, res) => {
  try {
    const following = await FollowService.getFollowing(req.params.userId);
    res.json(following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const CheckIsFollowing = async (req, res) => {
  try {
    const isFollowing = await FollowService.checkIsFollowing(
      req.user.id, req.params.userId
    );
    res.json({ isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};