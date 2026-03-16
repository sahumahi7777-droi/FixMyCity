import { Router, type IRouter } from "express";
import { Issue } from "../db/IssueModel";

const router: IRouter = Router();

function formatIssue(issue: any) {
  return {
    id: issue._id.toString(),
    title: issue.title,
    category: issue.category,
    description: issue.description,
    digiPin: issue.digiPin,
    location: issue.location,
    reporterName: issue.reporterName,
    reporterEmail: issue.reporterEmail,
    reporterContact: issue.reporterContact,
    status: issue.status,
    reportCount: issue.reportCount,
    adminNotes: issue.adminNotes ?? null,
    submittedAt: issue.submittedAt instanceof Date
      ? issue.submittedAt.toISOString()
      : issue.submittedAt,
    resolvedAt: issue.resolvedAt instanceof Date
      ? issue.resolvedAt.toISOString()
      : issue.resolvedAt ?? null,
  };
}

// GET /api/issues - Community feed
router.get("/issues", async (req, res) => {
  try {
    const { status, category, limit = "50", offset = "0" } = req.query as any;

    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const lim = Math.min(Number(limit) || 50, 200);
    const skip = Number(offset) || 0;

    const [issues, total] = await Promise.all([
      Issue.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(lim).lean(),
      Issue.countDocuments(filter),
    ]);

    res.json({ issues: issues.map(formatIssue), total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch issues" });
  }
});

// POST /api/issues - Report a new issue
router.post("/issues", async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      digiPin,
      location,
      reporterName,
      reporterEmail,
      reporterContact,
    } = req.body;

    if (!title || !category || !description || !digiPin || !reporterName || !reporterEmail || !reporterContact) {
      return res.status(400).json({ error: "validation_error", message: "Missing required fields" });
    }

    // Check for duplicate (same digiPin + category, not yet resolved)
    const existing = await Issue.findOne({
      digiPin,
      category,
      status: { $ne: "resolved" },
    });

    if (existing) {
      existing.reportCount += 1;
      await existing.save();
      return res.status(201).json({ issue: formatIssue(existing) });
    }

    const newIssue = await Issue.create({
      title,
      category,
      description,
      digiPin,
      location: location || "",
      reporterName,
      reporterEmail,
      reporterContact,
      status: "reported",
      reportCount: 1,
      adminNotes: null,
      submittedAt: new Date(),
    });

    res.status(201).json({ issue: formatIssue(newIssue) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create issue" });
  }
});

// GET /api/issues/:id
router.get("/issues/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).lean();
    if (!issue) {
      return res.status(404).json({ error: "not_found", message: "Issue not found" });
    }
    res.json({ issue: formatIssue(issue) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch issue" });
  }
});

// POST /api/issues/:id/upvote - Increment report count
router.post("/issues/:id/upvote", async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $inc: { reportCount: 1 } },
      { new: true }
    ).lean();

    if (!issue) {
      return res.status(404).json({ error: "not_found", message: "Issue not found" });
    }
    res.json({ issue: formatIssue(issue) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to upvote issue" });
  }
});

// PATCH /api/issues/:id/status - Admin update status
router.patch("/issues/:id/status", async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status || !["reported", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ error: "validation_error", message: "Invalid status" });
    }

    const updateData: any = { status };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (status === "resolved") updateData.resolvedAt = new Date();

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!issue) {
      return res.status(404).json({ error: "not_found", message: "Issue not found" });
    }
    res.json({ issue: formatIssue(issue) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update status" });
  }
});

// DELETE /api/issues/:id - Delete an issue (admin)
router.delete("/issues/:id", async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id).lean();
    if (!issue) {
      return res.status(404).json({ error: "not_found", message: "Issue not found" });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete issue" });
  }
});

// GET /api/leaderboard
router.get("/leaderboard", async (_req, res) => {
  try {
    const rows = await Issue.aggregate([
      {
        $group: {
          _id: { reporterEmail: "$reporterEmail", reporterName: "$reporterName" },
          reportCount: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
        },
      },
      { $sort: { reportCount: -1 } },
      { $limit: 20 },
    ]);

    const entries = rows.map((row, idx) => ({
      rank: idx + 1,
      reporterName: row._id.reporterName,
      reporterEmail: row._id.reporterEmail,
      reportCount: row.reportCount,
      resolvedCount: row.resolvedCount,
      points: row.reportCount * 50 + row.resolvedCount * 100,
    }));

    res.json({ entries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch leaderboard" });
  }
});

// GET /api/stats
router.get("/stats", async (_req, res) => {
  try {
    const [totals, categoryBreakdown] = await Promise.all([
      Issue.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
            reported: { $sum: { $cond: [{ $eq: ["$status", "reported"] }, 1, 0] } },
          },
        },
      ]),
      Issue.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, category: "$_id", count: 1 } },
      ]),
    ]);

    const stats = totals[0] ?? { total: 0, resolved: 0, inProgress: 0, reported: 0 };

    res.json({
      totalReports: stats.total,
      resolvedCount: stats.resolved,
      inProgressCount: stats.inProgress,
      reportedCount: stats.reported,
      categoryBreakdown,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch stats" });
  }
});

// POST /api/admin/login
router.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    res.json({ success: true, token: "admin-token-civic-2024" });
  } else {
    res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
  }
});

// GET /api/admin/issues
router.get("/admin/issues", async (req, res) => {
  try {
    const { status, category } = req.query as any;

    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const issues = await Issue.find(filter).sort({ submittedAt: -1 }).lean();
    res.json({ issues: issues.map(formatIssue), total: issues.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch issues" });
  }
});

export default router;
