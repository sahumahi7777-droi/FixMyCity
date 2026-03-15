import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { issuesTable } from "@workspace/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import {
  CreateIssueBody,
  UpdateIssueStatusBody,
  GetIssuesQueryParams,
  AdminGetAllIssuesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /api/issues - Community feed
router.get("/issues", async (req, res) => {
  try {
    const query = GetIssuesQueryParams.parse(req.query);

    const conditions = [];
    if (query.status) {
      conditions.push(eq(issuesTable.status, query.status as any));
    }
    if (query.category) {
      conditions.push(eq(issuesTable.category, query.category));
    }

    const limit = query.limit ? Number(query.limit) : 50;
    const offset = query.offset ? Number(query.offset) : 0;

    const issues = await db
      .select()
      .from(issuesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(issuesTable.submittedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(issuesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({
      issues: issues.map(formatIssue),
      total: count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch issues" });
  }
});

// POST /api/issues - Report a new issue
router.post("/issues", async (req, res) => {
  try {
    const body = CreateIssueBody.parse(req.body);

    // Check for duplicate (same digiPin + category)
    const existing = await db
      .select()
      .from(issuesTable)
      .where(
        and(
          eq(issuesTable.digiPin, body.digiPin),
          eq(issuesTable.category, body.category)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Upvote existing instead of creating duplicate
      const [updated] = await db
        .update(issuesTable)
        .set({ reportCount: sql`${issuesTable.reportCount} + 1` })
        .where(eq(issuesTable.id, existing[0].id))
        .returning();
      return res.status(201).json(formatIssue(updated));
    }

    const [newIssue] = await db
      .insert(issuesTable)
      .values({
        title: body.title,
        category: body.category,
        description: body.description,
        digiPin: body.digiPin,
        location: body.location,
        reporterName: body.reporterName,
        reporterEmail: body.reporterEmail,
        reporterContact: body.reporterContact,
        status: "reported",
        reportCount: 1,
      })
      .returning();

    res.status(201).json(formatIssue(newIssue));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create issue" });
  }
});

// GET /api/issues/:id
router.get("/issues/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [issue] = await db.select().from(issuesTable).where(eq(issuesTable.id, id));

    if (!issue) {
      return res.status(404).json({ error: "not_found", message: "Issue not found" });
    }

    res.json(formatIssue(issue));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch issue" });
  }
});

// POST /api/issues/:id/upvote - Increment report count
router.post("/issues/:id/upvote", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [updated] = await db
      .update(issuesTable)
      .set({ reportCount: sql`${issuesTable.reportCount} + 1` })
      .where(eq(issuesTable.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "not_found", message: "Issue not found" });
    }

    res.json(formatIssue(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to upvote issue" });
  }
});

// PATCH /api/issues/:id/status - Admin update status
router.patch("/issues/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateIssueStatusBody.parse(req.body);

    const updateData: any = {
      status: body.status,
    };

    if (body.adminNotes !== undefined) {
      updateData.adminNotes = body.adminNotes;
    }

    if (body.status === "resolved") {
      updateData.resolvedAt = new Date();
    }

    const [updated] = await db
      .update(issuesTable)
      .set(updateData)
      .where(eq(issuesTable.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "not_found", message: "Issue not found" });
    }

    res.json(formatIssue(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update status" });
  }
});

// GET /api/leaderboard
router.get("/leaderboard", async (_req, res) => {
  try {
    const rows = await db
      .select({
        reporterName: issuesTable.reporterName,
        reporterEmail: issuesTable.reporterEmail,
        reportCount: sql<number>`count(*)::int`,
        resolvedCount: sql<number>`sum(case when ${issuesTable.status} = 'resolved' then 1 else 0 end)::int`,
      })
      .from(issuesTable)
      .groupBy(issuesTable.reporterName, issuesTable.reporterEmail)
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    const entries = rows.map((row, idx) => ({
      rank: idx + 1,
      reporterName: row.reporterName,
      reporterEmail: row.reporterEmail,
      reportCount: row.reportCount,
      resolvedCount: row.resolvedCount ?? 0,
      points: row.reportCount * 50 + (row.resolvedCount ?? 0) * 100,
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
    const [totals] = await db
      .select({
        total: sql<number>`count(*)::int`,
        resolved: sql<number>`sum(case when ${issuesTable.status} = 'resolved' then 1 else 0 end)::int`,
        inProgress: sql<number>`sum(case when ${issuesTable.status} = 'in-progress' then 1 else 0 end)::int`,
        reported: sql<number>`sum(case when ${issuesTable.status} = 'reported' then 1 else 0 end)::int`,
      })
      .from(issuesTable);

    const categoryBreakdown = await db
      .select({
        category: issuesTable.category,
        count: sql<number>`count(*)::int`,
      })
      .from(issuesTable)
      .groupBy(issuesTable.category)
      .orderBy(desc(sql`count(*)`));

    res.json({
      totalReports: totals.total ?? 0,
      resolvedCount: totals.resolved ?? 0,
      inProgressCount: totals.inProgress ?? 0,
      reportedCount: totals.reported ?? 0,
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
    const query = AdminGetAllIssuesQueryParams.parse(req.query);

    const conditions = [];
    if (query.status) {
      conditions.push(eq(issuesTable.status, query.status as any));
    }
    if (query.category) {
      conditions.push(eq(issuesTable.category, query.category));
    }

    const issues = await db
      .select()
      .from(issuesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(issuesTable.submittedAt));

    res.json({ issues: issues.map(formatIssue), total: issues.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch issues" });
  }
});

// DELETE /api/issues/:id - Delete an issue (admin)
router.delete("/issues/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "invalid_id", message: "Invalid issue ID" });
    }

    const [deleted] = await db
      .delete(issuesTable)
      .where(eq(issuesTable.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "not_found", message: "Issue not found" });
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete issue" });
  }
});

function formatIssue(issue: any) {
  return {
    id: issue.id,
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
    submittedAt: issue.submittedAt?.toISOString?.() ?? issue.submittedAt,
    resolvedAt: issue.resolvedAt?.toISOString?.() ?? issue.resolvedAt ?? null,
  };
}

export default router;
