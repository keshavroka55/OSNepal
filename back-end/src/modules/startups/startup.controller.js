import * as StartupService from './startup.service.js';

export const GetAllStartups = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, type, stage, lookingFor, backed, sort } = req.query;
    const role = req.user?.role;
    const startups = await StartupService.getAllStartups(role, {
      page: Math.max(parseInt(page) || 1, 1),
      limit: Math.min(parseInt(limit) || 20, 50),
      category,
      search: search ? String(search).slice(0, 80) : undefined,
      type,
      stage,
      lookingFor,
      backed: backed === undefined ? undefined : backed === 'true',
      sort: sort === 'top' ? 'top' : 'new',
    });
    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetSingleStartup = async (req, res) => {
  try {
    const startup = await StartupService.getStartupById(req.params.id);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetStartupBySlug = async (req, res) => {
  try {
    const startup = await StartupService.getStartupBySlug(req.params.slug);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetTrendingStartups = async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    const startups = await StartupService.getTrendingStartups(parseInt(days), parseInt(limit));
    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const CreateStartup = async (req, res) => {
  try {
    const startup = await StartupService.createStartup(req.body, req.user.id);
    res.status(201).json(startup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const UpdateStartup = async (req, res) => {
  try {
    const startup = await StartupService.updateStartup(req.params.id, req.body, req.user.id, req.user.role);
    res.json(startup);
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : error.message.includes('Not authorized') ? 403 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const DeleteStartup = async (req, res) => {
  try {
    await StartupService.deleteStartup(req.params.id, req.user.id, req.user.role);
    res.json({ message: 'Startup deleted successfully' });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : error.message.includes('Not authorized') ? 403 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const AddScreenshot = async (req, res) => {
  try {
    const screenshot = await StartupService.addScreenshot(req.params.id, req.body, req.user.id, req.user.role);
    res.status(201).json(screenshot);
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : error.message.includes('Not authorized') ? 403 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const DeleteScreenshot = async (req, res) => {
  try {
    await StartupService.deleteScreenshot(req.params.startupId, req.params.screenshotId, req.user.id, req.user.role);
    res.json({ message: 'Screenshot deleted successfully' });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : error.message.includes('Not authorized') ? 403 : 400;
    res.status(status).json({ message: error.message });
  }
};


export const GetMyStartups = async (req, res) => {
  res.json(await StartupService.getMyStartups(req.user.id));
};
