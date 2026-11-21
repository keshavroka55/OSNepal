import * as BookmarkService from "./bookmark.service.js";

export const ToggleBookmark = async (req, res) => {
  try {
    const result = await BookmarkService.toggleBookmark(
      req.user.id, req.params.startupId
    );
    res.json(result);
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const GetMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await BookmarkService.getMyBookmarks(req.user.id);
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const CheckIsBookmarked = async (req, res) => {
  try {
    const isBookmarked = await BookmarkService.checkIsBookmarked(
      req.user.id, req.params.startupId
    );
    res.json({ isBookmarked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const GetBookmarkCount = async (req, res) => {
  try {
    const count = await BookmarkService.getBookmarkCount(req.params.startupId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};