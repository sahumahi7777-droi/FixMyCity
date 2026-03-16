import { Router } from "express";
import { Issue } from "../db/IssueModel";

const router = Router();

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
    submittedAt:
      issue.submittedAt instanceof Date
        ? issue.submittedAt.toISOString()
        : issue.submittedAt,
    resolvedAt:
      issue.resolvedAt instanceof Date
        ? issue.resolvedAt.toISOString()
        : issue.resolvedAt ?? null,
  };
}

// GET /api/issues
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

    return res.json({ issues: issues.map(formatIssue), total });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to fetch issues" });
  }
});

// POST /api/issues
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

    if (
      !title ||
      !category ||
      !description ||
      !digiPin ||
      !reporterName ||
      !reporterEmail ||
      !reporterContact
    ) {
      return res
        .status(400)
        .json({ error: "validation_error", message: "Missing required fields" });
    }

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

    return res.status(201).json({ issue: formatIssue(newIssue) });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to create issue" });
  }
});

// GET issue by id
router.get("/issues/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).lean();

    if (!issue) {
      return res
        .status(404)
        .json({ error: "not_found", message: "Issue not found" });
    }

    return res.json({ issue: formatIssue(issue) });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to fetch issue" });
  }
});

// UPVOTE
router.post("/issues/:id/upvote", async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $inc: { reportCount: 1 } },
      { new: true }
    ).lean();

    if (!issue) {
      return res
        .status(404)
        .json({ error: "not_found", message: "Issue not found" });
    }

    return res.json({ issue: formatIssue(issue) });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to upvote issue" });
  }
});

// UPDATE STATUS
router.patch("/issues/:id/status", async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status || !["reported", "in-progress", "resolved"].includes(status)) {
      return res
        .status(400)
        .json({ error: "validation_error", message: "Invalid status" });
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
      return res
        .status(404)
        .json({ error: "not_found", message: "Issue not found" });
    }

    return res.json({ issue: formatIssue(issue) });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to update status" });
  }
});

// DELETE ISSUE
router.delete("/issues/:id", async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id).lean();

    if (!issue) {
      return res
        .status(404)
        .json({ error: "not_found", message: "Issue not found" });
    }

    return res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to delete issue" });
  }
});

// ADMIN LOGIN
router.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    return res.json({ success: true, token: "admin-token-civic-2024" });
  }

  return res
    .status(401)
    .json({ error: "unauthorized", message: "Invalid credentials" });
});

export default router;
