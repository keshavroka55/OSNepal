import * as VoteService from './vote.service.js';

export const GetMyVotedStartups = async (req, res) => {
  try {
    const votes = await VoteService.getMyVotedStartups(req.user.id);
    res.json(votes.map(v => v.startup));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const ToggleVote = async (req, res) => {
  try {
    const result = await VoteService.toggleVote(req.user.id, req.params.startupId);
    res.json(result);
  } catch (error) {
    const status = error.message === 'Startup not found' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const GetVoteCount = async (req, res) => {
  try {
    const count = await VoteService.getVoteCount(req.params.startupId);
    const isVoted = await VoteService.checkIsVoted(req.user.id, req.params.startupId);
    res.json({ count, isVoted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
