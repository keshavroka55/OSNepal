import * as ReportService from "./report.service.js";

export const CreateReport = async (req, res) => {
  res.status(201).json(await ReportService.createReport(req.user.id, req.body));
};

export const ListQueue = async (req, res) => {
  res.json(await ReportService.listQueue(req.validQuery));
};

export const ResolveReport = async (req, res) => {
  res.json(await ReportService.resolveReport(req.user.id, req.params.id, req.body));
};
